"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  LogOut,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBasket,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  getStaffAccount,
  getStaffBookings,
  getStaffErrorMessage,
  logoutStaff,
  updateStaffBooking,
} from "@/lib/staff-api";
import type { BookingStatus, StaffBooking, StaffUser } from "@/types/staff";
import StaffReceiptPanel from "@/components/staff/StaffReceiptPanel";

const STATUS_OPTIONS: Array<{
  value: BookingStatus;
  label: string;
}> = [
  {
    value: "received",
    label: "Received",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "preparing",
    label: "Preparing",
  },
  {
    value: "ready",
    label: "Ready",
  },
  {
    value: "out_for_delivery",
    label: "Out for delivery",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

type BookingEditor = {
  status: BookingStatus;
  confirmedTotal: string;
  statusMessage: string;
  adminNotes: string;
};

function createBookingEditor(booking: StaffBooking): BookingEditor {
  return {
    status: booking.status,
    confirmedTotal: booking.confirmed_total ?? "",
    statusMessage: booking.status_message,
    adminNotes: booking.admin_notes,
  };
}

function getStatusClasses(status: BookingStatus): string {
  switch (status) {
    case "received":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "preparing":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "ready":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "out_for_delivery":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "completed":
      return "border-green-200 bg-green-50 text-green-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: string, currency = "KES"): string {
  const amount = Number.parseFloat(value);

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeWhatsAppNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("254")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }

  if (
    digits.length === 9 &&
    (digits.startsWith("7") || digits.startsWith("1"))
  ) {
    return `254${digits}`;
  }

  return digits;
}

function getCustomerWhatsAppUrl(booking: StaffBooking): string | null {
  const phoneNumber = normalizeWhatsAppNumber(booking.phone_number);

  if (phoneNumber.length < 9) {
    return null;
  }

  const customerName = booking.customer_name.trim() || "Customer";

  const messageLines = [
    `Hello ${customerName},`,
    "",
    `Your SamWest booking *${booking.reference}* ` +
      `is currently marked as *${booking.status_label}*.`,
  ];

  if (booking.status_message) {
    messageLines.push("", booking.status_message);
  }

  messageLines.push("", "Thank you for choosing SamWest.");

  const message = messageLines.join("\n");

  return (
    `https://wa.me/${phoneNumber}` + `?text=${encodeURIComponent(message)}`
  );
}

export default function StaffBookingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);

  const [bookings, setBookings] = useState<StaffBooking[]>([]);

  const [editors, setEditors] = useState<Record<string, BookingEditor>>({});

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");

  const [expandedReference, setExpandedReference] = useState<string | null>(
    null,
  );

  const [updatingReference, setUpdatingReference] = useState<string | null>(
    null,
  );

  const [successReference, setSuccessReference] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const receivedCount = useMemo(
    () => bookings.filter((booking) => booking.status === "received").length,
    [bookings],
  );

  const activeCount = useMemo(
    () =>
      bookings.filter((booking) =>
        ["confirmed", "preparing", "ready", "out_for_delivery"].includes(
          booking.status,
        ),
      ).length,
    [bookings],
  );

  const completedCount = useMemo(
    () => bookings.filter((booking) => booking.status === "completed").length,
    [bookings],
  );

  const cancelledCount = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled").length,
    [bookings],
  );

  function saveBookingEditors(bookingResults: StaffBooking[]): void {
    setEditors(
      Object.fromEntries(
        bookingResults.map((booking) => [
          booking.reference,
          createBookingEditor(booking),
        ]),
      ),
    );
  }

  const loadBookings = useCallback(
    async (
      options: {
        search?: string;
        status?: BookingStatus | "";
        showRefresh?: boolean;
      } = {},
    ): Promise<void> => {
      if (options.showRefresh) {
        setIsRefreshing(true);
      }

      setErrorMessage("");
      setSuccessReference(null);

      try {
        const bookingResults = await getStaffBookings({
          search: options.search ?? searchQuery.trim(),
          status: options.status ?? statusFilter,
        });

        setBookings(bookingResults);
        saveBookingEditors(bookingResults);
      } catch (error) {
        setErrorMessage(
          getStaffErrorMessage(
            error,
            "Bookings could not be loaded. Please try again.",
          ),
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [searchQuery, statusFilter],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [account, bookingResults] = await Promise.all([
          getStaffAccount(),
          getStaffBookings(),
        ]);

        if (!isMounted) {
          return;
        }

        setUser(account);
        setBookings(bookingResults);
        saveBookingEditors(bookingResults);
        setIsLoading(false);
      } catch {
        if (isMounted) {
          router.replace("/staff/login");
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function updateEditor(
    reference: string,
    updates: Partial<BookingEditor>,
  ): void {
    setEditors((currentEditors) => {
      const currentEditor = currentEditors[reference];

      if (!currentEditor) {
        return currentEditors;
      }

      return {
        ...currentEditors,
        [reference]: {
          ...currentEditor,
          ...updates,
        },
      };
    });

    setSuccessReference(null);
    setErrorMessage("");
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await loadBookings({
      search: searchQuery.trim(),
      status: statusFilter,
      showRefresh: true,
    });
  }

  async function handleStatusFilter(value: BookingStatus | ""): Promise<void> {
    setStatusFilter(value);

    await loadBookings({
      search: searchQuery.trim(),
      status: value,
      showRefresh: true,
    });
  }

  async function handleUpdateBooking(booking: StaffBooking): Promise<void> {
    const editor = editors[booking.reference];

    if (!editor || updatingReference) {
      return;
    }

    setUpdatingReference(booking.reference);

    setErrorMessage("");
    setSuccessReference(null);

    try {
      const response = await updateStaffBooking(booking.reference, {
        status: editor.status,
        confirmed_total: editor.confirmedTotal,
        status_message: editor.statusMessage,
        admin_notes: editor.adminNotes,
      });

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.reference === response.booking.reference
            ? response.booking
            : currentBooking,
        ),
      );

      setEditors((currentEditors) => ({
        ...currentEditors,
        [response.booking.reference]: createBookingEditor(response.booking),
      }));

      setSuccessReference(response.booking.reference);
    } catch (error) {
      setErrorMessage(
        getStaffErrorMessage(
          error,
          "The booking could not be updated. Please try again.",
        ),
      );
    } finally {
      setUpdatingReference(null);
    }
  }

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutStaff();
    } finally {
      router.replace("/staff/login");
      router.refresh();
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-3">
        <div className="text-center">
          <span
            className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"
            aria-hidden="true"
          />

          <p className="mt-4 text-xs font-bold text-slate-600 min-[360px]:text-sm">
            Loading customer bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-slate-50 px-2 py-3 min-[360px]:px-3 min-[360px]:py-5 sm:px-5 sm:py-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="overflow-hidden rounded-2xl bg-slate-950 p-3 text-white shadow-xl min-[360px]:p-4 sm:rounded-3xl sm:p-7">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 min-[360px]:h-11 min-[360px]:w-11 min-[360px]:rounded-2xl">
                <ShieldCheck
                  className="h-5 w-5 min-[360px]:h-6 min-[360px]:w-6"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-amber-400 min-[360px]:text-[9px] min-[360px]:tracking-[0.14em] sm:text-[10px]">
                  SamWest management
                </p>

                <h1 className="mt-0.5 text-base font-black leading-tight min-[360px]:mt-1 min-[360px]:text-xl sm:text-2xl">
                  Customer bookings
                </h1>

                <p className="mt-1 max-w-full truncate text-[10px] text-slate-400 min-[360px]:text-xs">
                  Signed in as {user?.email}
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 min-[300px]:grid-cols-2 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  void loadBookings({
                    showRefresh: true,
                  })
                }
                disabled={isRefreshing}
                className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-white/15 px-2 text-[10px] font-extrabold transition hover:bg-white/10 disabled:opacity-50 min-[360px]:h-10 min-[360px]:gap-2 min-[360px]:px-4 min-[360px]:text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-white px-2 text-[10px] font-extrabold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50 min-[360px]:h-10 min-[360px]:gap-2 min-[360px]:px-4 min-[360px]:text-xs"
              >
                <LogOut
                  className="h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4"
                  aria-hidden="true"
                />

                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </header>

        <section className="mt-3 grid min-w-0 grid-cols-1 gap-2 min-[280px]:grid-cols-2 min-[360px]:gap-3 sm:mt-5 lg:grid-cols-5">
          {[
            {
              label: "Showing",
              value: bookings.length,
              color: "text-slate-950",
            },
            {
              label: "Received",
              value: receivedCount,
              color: "text-blue-700",
            },
            {
              label: "In progress",
              value: activeCount,
              color: "text-amber-700",
            },
            {
              label: "Completed",
              value: completedCount,
              color: "text-emerald-700",
            },
            {
              label: "Cancelled",
              value: cancelledCount,
              color: "text-red-700",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm min-[360px]:rounded-2xl min-[360px]:p-4 sm:p-5"
            >
              <p className="wrap-break-word text-[9px] font-extrabold uppercase tracking-widest text-slate-400 min-[360px]:text-[10px] min-[360px]:tracking-[0.12em]">
                {item.label}
              </p>

              <p
                className={`mt-1.5 wrap-break-word text-xl font-black min-[360px]:mt-2 min-[360px]:text-2xl sm:text-3xl ${item.color}`}
              >
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-3 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm min-[360px]:rounded-2xl min-[360px]:p-4 sm:mt-5">
          <form
            onSubmit={handleSearch}
            className="grid min-w-0 grid-cols-1 gap-2 min-[360px]:gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto] lg:grid-cols-[minmax(0,1fr)_220px_auto]"
          >
            <div className="relative min-w-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 min-[360px]:left-3.5"
                aria-hidden="true"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Reference, customer, phone or location"
                className="h-10 min-w-0 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:h-11 min-[360px]:pl-10 min-[360px]:pr-4 min-[360px]:text-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                void handleStatusFilter(
                  event.target.value as BookingStatus | "",
                )
              }
              className="h-10 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:h-11 min-[360px]:px-3 min-[360px]:text-sm"
            >
              <option value="">All statuses</option>

              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="h-10 min-w-0 rounded-xl bg-amber-600 px-3 text-xs font-extrabold text-white transition hover:bg-amber-700 min-[360px]:h-11 min-[360px]:px-6 min-[360px]:text-sm"
            >
              Search
            </button>
          </form>
        </section>

        {errorMessage ? (
          <div
            className="mt-3 flex min-w-0 items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 min-[360px]:mt-5 min-[360px]:rounded-2xl min-[360px]:p-4"
            role="alert"
          >
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 min-[360px]:h-5 min-[360px]:w-5"
              aria-hidden="true"
            />

            <p className="min-w-0 wrap-break-word text-xs font-semibold leading-5 min-[360px]:text-sm min-[360px]:leading-6">
              {errorMessage}
            </p>
          </div>
        ) : null}

        {bookings.length === 0 ? (
          <section className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-12 text-center min-[360px]:mt-5 min-[360px]:rounded-3xl min-[360px]:px-5 min-[360px]:py-16">
            <PackageOpen
              className="mx-auto h-10 w-10 text-slate-300 min-[360px]:h-12 min-[360px]:w-12"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-lg font-black text-slate-950 min-[360px]:text-xl">
              No bookings found
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500 min-[360px]:text-sm">
              Try changing the search or status filter.
            </p>
          </section>
        ) : (
          <section className="mt-3 min-w-0 space-y-3 min-[360px]:mt-5 min-[360px]:space-y-4">
            {bookings.map((booking) => {
              const editor = editors[booking.reference];

              const isExpanded = expandedReference === booking.reference;

              const isUpdating = updatingReference === booking.reference;

              const wasUpdated = successReference === booking.reference;
              const customerWhatsAppUrl = getCustomerWhatsAppUrl(booking);

              return (
                <article
                  key={booking.reference}
                  className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
                >
                  <div className="grid min-w-0 gap-4 p-3 min-[360px]:p-4 sm:gap-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="wrap-break-word text-sm font-black leading-tight text-slate-950 min-[360px]:text-base sm:text-lg">
                          {booking.reference}
                        </h2>

                        <span
                          className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-[9px] font-black min-[360px]:px-2.5 min-[360px]:text-[10px] ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          {booking.status_label}
                        </span>
                      </div>

                      <p className="mt-1.5 flex min-w-0 items-start gap-1.5 text-[10px] leading-4 text-slate-500 min-[360px]:items-center min-[360px]:gap-2 min-[360px]:text-xs">
                        <Clock3
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 min-[360px]:mt-0"
                          aria-hidden="true"
                        />

                        <span className="wrap-break-word">
                          {formatDate(booking.created_at)}
                        </span>
                      </p>

                      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 min-[460px]:grid-cols-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <UserRound
                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                            aria-hidden="true"
                          />

                          <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                              Customer
                            </p>

                            <p className="mt-0.5 wrap-break-word text-xs font-bold text-slate-800 min-[360px]:text-sm">
                              {booking.customer_name || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-2.5">
                          <Phone
                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                            aria-hidden="true"
                          />

                          <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                              Phone
                            </p>

                            <a
                              href={`tel:${booking.phone_number}`}
                              className="mt-0.5 block wrap-break-word text-xs font-bold text-slate-800 hover:text-amber-700 min-[360px]:text-sm"
                            >
                              {booking.phone_number || "Not provided"}
                            </a>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-2.5 min-[460px]:col-span-2">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                            aria-hidden="true"
                          />

                          <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                              Delivery location
                            </p>

                            <p className="mt-0.5 wrap-break-word text-xs font-bold text-slate-800 min-[360px]:text-sm">
                              {booking.delivery_location || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 min-[300px]:grid-cols-2 min-[360px]:rounded-2xl min-[360px]:p-4">
                        <div className="min-w-0">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                            Total items
                          </p>

                          <p className="mt-1 text-base font-black text-slate-950 min-[360px]:text-lg">
                            {booking.total_items}
                          </p>
                        </div>

                        <div className="min-w-0 min-[300px]:text-right">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                            Booking total
                          </p>

                          <p className="mt-1 wrap-break-word text-base font-black text-slate-950 min-[360px]:text-lg">
                            {formatMoney(
                              booking.display_total,
                              booking.currency,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 min-[360px]:rounded-2xl min-[360px]:p-4">
                      <h3 className="text-xs font-black text-slate-950 min-[360px]:text-sm">
                        Update booking
                      </h3>

                      <div className="mt-3 min-[360px]:mt-4">
                        <label
                          htmlFor={`status-${booking.reference}`}
                          className="mb-1.5 block text-[10px] font-extrabold text-slate-600 min-[360px]:text-[11px]"
                        >
                          Booking status
                        </label>

                        <select
                          id={`status-${booking.reference}`}
                          value={editor?.status ?? booking.status}
                          onChange={(event) =>
                            updateEditor(booking.reference, {
                              status: event.target.value as BookingStatus,
                              statusMessage: "",
                            })
                          }
                          className="h-10 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:px-3 min-[360px]:text-xs"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3">
                        <label
                          htmlFor={`total-${booking.reference}`}
                          className="mb-1.5 block text-[10px] font-extrabold text-slate-600 min-[360px]:text-[11px]"
                        >
                          Confirmed total
                        </label>

                        <input
                          id={`total-${booking.reference}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editor?.confirmedTotal ?? ""}
                          onChange={(event) =>
                            updateEditor(booking.reference, {
                              confirmedTotal: event.target.value,
                            })
                          }
                          placeholder={booking.estimated_total}
                          className="h-10 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:px-3 min-[360px]:text-xs"
                        />
                      </div>

                      <div className="mt-3">
                        <label
                          htmlFor={`message-${booking.reference}`}
                          className="mb-1.5 block text-[10px] font-extrabold text-slate-600 min-[360px]:text-[11px]"
                        >
                          Customer status message
                        </label>

                        <textarea
                          id={`message-${booking.reference}`}
                          rows={2}
                          value={editor?.statusMessage ?? ""}
                          onChange={(event) =>
                            updateEditor(booking.reference, {
                              statusMessage: event.target.value,
                            })
                          }
                          placeholder="Leave empty to use the default status message"
                          className="min-w-0 w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:p-3 min-[360px]:text-xs"
                        />
                      </div>

                      <div className="mt-3">
                        <label
                          htmlFor={`notes-${booking.reference}`}
                          className="mb-1.5 block text-[10px] font-extrabold text-slate-600 min-[360px]:text-[11px]"
                        >
                          Internal notes
                        </label>

                        <textarea
                          id={`notes-${booking.reference}`}
                          rows={2}
                          value={editor?.adminNotes ?? ""}
                          onChange={(event) =>
                            updateEditor(booking.reference, {
                              adminNotes: event.target.value,
                            })
                          }
                          placeholder="Only management can see these notes"
                          className="min-w-0 w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 min-[360px]:p-3 min-[360px]:text-xs"
                        />
                      </div>

                      <div className="mt-4 grid min-w-0 grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => void handleUpdateBooking(booking)}
                          disabled={isUpdating}
                          className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        >
                          {isUpdating ? (
                            <>
                              <span
                                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                aria-hidden="true"
                              />

                              <span className="whitespace-nowrap">
                                Saving status...
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                              />

                              <span className="whitespace-nowrap">
                                Save booking status
                              </span>
                            </>
                          )}
                        </button>

                        {customerWhatsAppUrl ? (
                          <a
                            href={customerWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-3 text-xs font-extrabold text-white shadow-sm shadow-emerald-200/60 transition hover:border-emerald-800 hover:bg-emerald-700 hover:shadow-md"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15 transition group-hover:bg-white/20">
                              <MessageCircle
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </span>

                            <span className="whitespace-nowrap">
                              WhatsApp customer
                            </span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title="This booking has no valid phone number"
                            className="flex h-11 min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-3 text-xs font-extrabold text-slate-500"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-300">
                              <MessageCircle
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </span>

                            <span className="whitespace-nowrap">
                              WhatsApp unavailable
                            </span>
                          </button>
                        )}
                      </div>

                      {wasUpdated ? (
                        <p className="mt-3 wrap-break-word text-center text-[10px] font-extrabold text-emerald-700 min-[360px]:text-xs">
                          Booking updated successfully
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <StaffReceiptPanel booking={booking} />

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedReference(
                        isExpanded ? null : booking.reference,
                      )
                    }
                    className="flex min-w-0 w-full items-center justify-between gap-2 border-t border-slate-200 px-3 py-3 text-[10px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-amber-700 min-[360px]:px-4 min-[360px]:text-xs sm:px-6"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5 min-[360px]:gap-2">
                      <ShoppingBasket
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />

                      <span className="wrap-break-word text-left">
                        {isExpanded
                          ? "Hide products"
                          : `View ${booking.total_items} selected ${
                              booking.total_items === 1 ? "item" : "items"
                            }`}
                      </span>
                    </span>

                    {isExpanded ? (
                      <ChevronUp
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {isExpanded ? (
                    <div className="min-w-0 border-t border-slate-200 bg-slate-50 p-3 min-[360px]:p-4 sm:p-6">
                      <div className="min-w-0 space-y-2.5 min-[360px]:space-y-3">
                        {booking.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 min-[340px]:flex-row min-[340px]:items-center min-[340px]:justify-between min-[340px]:gap-4"
                          >
                            <div className="min-w-0">
                              <p className="wrap-break-word text-xs font-bold leading-5 text-slate-900 min-[360px]:text-sm">
                                {item.product_name}
                              </p>

                              <p className="mt-1 wrap-break-word text-[10px] text-slate-500 min-[360px]:text-xs">
                                {formatMoney(item.unit_price, booking.currency)}{" "}
                                × {item.quantity}
                              </p>
                            </div>

                            <p className="wrap-break-word text-xs font-black text-slate-950 min-[340px]:shrink-0 min-[340px]:text-right min-[360px]:text-sm">
                              {formatMoney(item.line_total, booking.currency)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {booking.customer_note ? (
                        <div className="mt-3 min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-3 min-[360px]:mt-4 min-[360px]:p-4">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-amber-700 min-[360px]:text-[10px]">
                            Customer notes
                          </p>

                          <p className="mt-1 wrap-break-word text-xs leading-5 text-amber-950 min-[360px]:text-sm min-[360px]:leading-6">
                            {booking.customer_note}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
