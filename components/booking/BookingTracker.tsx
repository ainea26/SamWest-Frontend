"use client";

import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  MapPin,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  ShoppingBasket,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import Container from "@/components/ui/Container";
import { getApiErrorMessage, getBookingTracking } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { BookingStatus, BookingTracking } from "@/types/tracking";

type BookingTrackerProps = {
  reference: string;
  token: string;
};

const trackingSteps: Array<{
  status: Exclude<BookingStatus, "cancelled">;
  label: string;
  description: string;
}> = [
  {
    status: "received",
    label: "Received",
    description: "Your booking has been received by SamWest.",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    description: "Products and final details have been confirmed.",
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "Your selected products are being prepared.",
  },
  {
    status: "ready",
    label: "Ready",
    description: "Your booking is ready for the next step.",
  },
  {
    status: "out_for_delivery",
    label: "Out for delivery",
    description: "Your booking is currently on its way.",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Your booking has been completed.",
  },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClasses(status: BookingStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    case "out_for_delivery":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "ready":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "preparing":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "confirmed":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function BookingTracker({
  reference,
  token,
}: BookingTrackerProps) {
  const [booking, setBooking] = useState<BookingTracking | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [copied, setCopied] = useState(false);

  const loadBooking = useCallback(
    async (showRefreshState = false) => {
      if (!token) {
        setErrorMessage("The tracking link is missing its security token.");
        setIsLoading(false);
        return;
      }

      if (showRefreshState) {
        setIsRefreshing(true);
      }

      try {
        const response = await getBookingTracking(reference, token);

        setBooking(response);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "This booking could not be found or the tracking link is invalid.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [reference, token],
  );

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (!booking || booking.is_final) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadBooking();
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [booking, loadBooking]);

  async function copyTrackingLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 sm:py-12">
        <Container>
          <div className="animate-pulse space-y-5">
            <div className="h-40 rounded-3xl bg-slate-200" />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="h-96 rounded-3xl bg-slate-200" />
              <div className="h-80 rounded-3xl bg-slate-200" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (errorMessage || !booking) {
    return (
      <div className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
            <XCircle
              className="mx-auto h-14 w-14 text-red-500"
              aria-hidden="true"
            />

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Tracking unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {errorMessage}
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-6 text-sm font-extrabold text-slate-950 transition hover:bg-amber-600"
            >
              Return home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const currentStepIndex = trackingSteps.findIndex(
    (step) => step.status === booking.status,
  );

  const isCancelled = booking.status === "cancelled";

  return (
    <div className="py-7 sm:py-10">
      <Container>
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white sm:rounded-3xl">
          <div className="grid gap-5 px-4 py-5 sm:px-7 sm:py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:py-9">
            <div className="min-w-0">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-amber-400 min-[380px]:text-[9px] sm:text-[10px] sm:tracking-[0.18em]">
                SamWest booking tracker
              </p>

              <h1 className="mt-1.5 whitespace-nowrap text-[clamp(1rem,5vw,1.875rem)] font-black leading-tight tracking-tight text-white">
                {booking.reference}
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                {booking.status_message ||
                  "Follow your booking progress below."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <span
                className={`col-span-2 inline-flex h-9 items-center justify-center rounded-lg border px-3 text-[10px] font-black sm:col-span-1 sm:h-10 sm:rounded-xl sm:px-4 sm:text-xs ${getStatusClasses(
                  booking.status,
                )}`}
              >
                {booking.status_label}
              </span>

              <button
                type="button"
                onClick={() => void loadBooking(true)}
                disabled={isRefreshing}
                className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2 text-[10px] font-extrabold text-white transition hover:bg-white/20 disabled:opacity-50 sm:h-10 sm:rounded-xl sm:px-4 sm:text-xs"
              >
                <RefreshCw
                  className={
                    isRefreshing
                      ? "h-3.5 w-3.5 shrink-0 animate-spin"
                      : "h-3.5 w-3.5 shrink-0"
                  }
                  aria-hidden="true"
                />

                <span className="truncate">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <button
                type="button"
                onClick={copyTrackingLink}
                className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-2 text-[10px] font-black text-slate-950 transition hover:bg-amber-400 sm:h-10 sm:rounded-xl sm:px-4 sm:text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}

                <span className="truncate">
                  {copied ? "Copied" : "Copy link"}
                </span>
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-black text-slate-950">
                Booking progress
              </h2>

              {isCancelled ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-black">Booking cancelled</p>

                    <p className="mt-1 text-xs leading-5">
                      Contact SamWest if you need more information about this
                      booking.
                    </p>
                  </div>
                </div>
              ) : (
                <ol className="mt-6 space-y-0">
                  {trackingSteps.map((step, index) => {
                    const isComplete = index <= currentStepIndex;

                    const isCurrent = index === currentStepIndex;

                    return (
                      <li
                        key={step.status}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index < trackingSteps.length - 1 ? (
                          <span
                            className={
                              index < currentStepIndex
                                ? "absolute left-3.75 top-8 h-[calc(100%-16px)] w-0.5 bg-emerald-500"
                                : "absolute left-3.75 top-8 h-[calc(100%-16px)] w-0.5 bg-slate-200"
                            }
                            aria-hidden="true"
                          />
                        ) : null}

                        <span
                          className={
                            isComplete
                              ? "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                              : "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-300"
                          }
                        >
                          {isComplete ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Circle className="h-3 w-3" aria-hidden="true" />
                          )}
                        </span>

                        <div className="pt-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={
                                isComplete
                                  ? "text-sm font-black text-slate-950"
                                  : "text-sm font-bold text-slate-400"
                              }
                            >
                              {step.label}
                            </h3>

                            {isCurrent ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800">
                                Current
                              </span>
                            ) : null}
                          </div>

                          <p
                            className={
                              isComplete
                                ? "mt-1 text-xs leading-5 text-slate-600"
                                : "mt-1 text-xs leading-5 text-slate-400"
                            }
                          >
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-950">Products</h2>

                <span className="text-xs font-bold text-slate-500">
                  {booking.total_items} items
                </span>
              </div>

              <div className="mt-5 divide-y divide-slate-200">
                {booking.items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/products/${item.product_slug}`}
                      className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50"
                    >
                      {item.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <PackageOpen
                          className="h-7 w-7 text-slate-300"
                          aria-hidden="true"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="line-clamp-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
                      >
                        {item.product_name}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-black text-slate-950">
                      {formatCurrency(item.line_total)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-40">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <ReceiptText className="h-5 w-5" aria-hidden="true" />
                </div>

                <h2 className="font-black text-slate-950">Booking summary</h2>
              </div>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Reference</dt>

                  <dd className="font-extrabold text-slate-950">
                    {booking.reference}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Items</dt>

                  <dd className="font-extrabold text-slate-950">
                    {booking.total_items}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>

                  <dd className="font-extrabold text-slate-950">
                    {booking.status_label}
                  </dd>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <dt>
                      <span className="block font-bold text-slate-700">
                        {booking.confirmed_total
                          ? "Confirmed total"
                          : "Estimated total"}
                      </span>

                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        {booking.currency}
                      </span>
                    </dt>

                    <dd className="text-xl font-black text-slate-950">
                      {formatCurrency(booking.display_total)}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-950">Booking information</h2>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                      Created
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                      Last updated
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {formatDate(booking.updated_at)}
                    </p>
                  </div>
                </div>

                {booking.delivery_location ? (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {booking.delivery_location}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-start gap-3">
                <PackageCheck
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />

                <p className="text-xs leading-5">
                  This page refreshes automatically every 30 seconds until the
                  booking is completed.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
