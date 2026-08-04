"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";


import { useEffect, useRef, useState, type FormEvent } from "react";

import BookingItem from "@/components/booking/BookingItem";
import Container from "@/components/ui/Container";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useBooking } from "@/context/BookingContext";
import {
  createWhatsAppBooking,
  getApiErrorMessage,
  isApiError,
} from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { WhatsAppBookingResponse } from "@/types/booking";

type CustomerDetails = {
  customerName: string;
  phone: string;
  deliveryLocation: string;
  notes: string;
};

const initialCustomerDetails: CustomerDetails = {
  customerName: "",
  phone: "",
  deliveryLocation: "",
  notes: "",
};

function getValidationMessage(
  data: Record<string, unknown> | undefined,
): string | null {
  if (!data) {
    return null;
  }

  const fields = [
    "detail",
    "customer_name",
    "phone",
    "delivery_location",
    "notes",
    "items",
  ];

  for (const field of fields) {
    const value = data[field];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (Array.isArray(value)) {
      const message = value.find(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );

      if (message) {
        return message;
      }
    }
  }

  return null;
}

export default function BookingPage() {
  const {
    items,
    totalItems,
    totalPrice,
    isHydrated,
    removeItem,
    updateQuantity,
    clearBooking,
  } = useBooking();

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(
    initialCustomerDetails,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [unavailableProductIds, setUnavailableProductIds] = useState<number[]>(
    [],
  );

  const [bookingResponse, setBookingResponse] =
    useState<WhatsAppBookingResponse | null>(null);


    const [isClearConfirmationOpen, setIsClearConfirmationOpen] =
      useState(false);

    const [isClearing, setIsClearing] = useState(false);

    const clearTimerRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (clearTimerRef.current !== null) {
          window.clearTimeout(clearTimerRef.current);
        }
      };
    }, []);

    function requestClearBooking(): void {
      if (isClearing || isSubmitting) {
        return;
      }

      setIsClearConfirmationOpen(true);
    }

    function cancelClearBooking(): void {
      if (isClearing) {
        return;
      }

      setIsClearConfirmationOpen(false);
    }

    function confirmClearBooking(): void {
      if (isClearing || isSubmitting) {
        return;
      }

      setIsClearing(true);

      clearTimerRef.current = window.setTimeout(() => {
        clearBooking();
        setErrorMessage("");
        setUnavailableProductIds([]);
        setIsClearing(false);
        setIsClearConfirmationOpen(false);

        clearTimerRef.current = null;
      }, 550);
    }

  function updateCustomerField(
    field: keyof CustomerDetails,
    value: string,
  ): void {
    setCustomerDetails((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function handleRemove(productId: number): void {
    removeItem(productId);

    setUnavailableProductIds((currentIds) =>
      currentIds.filter((id) => id !== productId),
    );

    setErrorMessage("");
  }

  function handleUpdateQuantity(productId: number, quantity: number): void {
    updateQuantity(productId, quantity);
    setErrorMessage("");
  }

  function validateBooking(): string | null {
    if (items.length === 0) {
      return "Your booking is empty.";
    }

    if (!customerDetails.customerName.trim()) {
      return "Please enter your full name.";
    }

    if (!customerDetails.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!customerDetails.deliveryLocation.trim()) {
      return "Please enter your delivery location.";
    }

    const phoneDigits = customerDetails.phone.replace(/\D/g, "");

    if (phoneDigits.length < 9) {
      return "Please enter a valid phone number.";
    }

    return null;
  }

  async function handleWhatsAppBooking(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validateBooking();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setUnavailableProductIds([]);
    setBookingResponse(null);

    const whatsappWindow = window.open("about:blank", "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;

      whatsappWindow.document.title = "Preparing your SamWest booking...";

      whatsappWindow.document.body.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 20px;
          background: #f8fafc;
          color: #0f172a;
          font-family: Arial, sans-serif;
          text-align: center;
        ">
          <div style="max-width: 320px;">
            <div style="
              width: 44px;
              height: 44px;
              margin: 0 auto 18px;
              border: 4px solid #fde68a;
              border-top-color: #d97706;
              border-radius: 999px;
              animation: samwest-spin 0.8s linear infinite;
            "></div>

            <h1 style="
              margin: 0;
              font-size: 18px;
            ">
              Preparing your booking
            </h1>

            <p style="
              margin: 10px 0 0;
              color: #64748b;
              font-size: 13px;
              line-height: 1.6;
            ">
              SamWest is checking the selected products.
            </p>
          </div>

          <style>
            @keyframes samwest-spin {
              to {
                transform: rotate(360deg);
              }
            }
          </style>
        </div>
      `;
    }

    try {
      const response = await createWhatsAppBooking({
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        customer_name: customerDetails.customerName.trim(),
        phone: customerDetails.phone.trim(),
        delivery_location: customerDetails.deliveryLocation.trim(),
        notes: customerDetails.notes.trim(),
      });

      setBookingResponse(response);

      /*
       * Clear only after Django successfully creates
       * the booking. The success screen remains visible.
       */
      clearBooking();

      if (whatsappWindow) {
        whatsappWindow.location.href = response.whatsapp_url;
      } else {
        window.location.href = response.whatsapp_url;
      }
    } catch (error) {
      if (whatsappWindow) {
        whatsappWindow.close();
      }

      if (isApiError(error)) {
        const responseData = error.response?.data as
          | Record<string, unknown>
          | undefined;

        const unavailableIds = Array.isArray(
          responseData?.unavailable_product_ids,
        )
          ? responseData.unavailable_product_ids.filter(
              (value): value is number => typeof value === "number",
            )
          : [];

        setUnavailableProductIds(unavailableIds);

        if (unavailableIds.length > 0) {
          setErrorMessage(
            "Some selected products are no longer available. Remove the highlighted products before continuing.",
          );

          return;
        }

        const validationMessage = getValidationMessage(responseData);

        if (validationMessage) {
          setErrorMessage(validationMessage);
          return;
        }
      }

      setErrorMessage(
        getApiErrorMessage(
          error,
          "We could not prepare your WhatsApp booking. Please check your details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isHydrated) {
    return (
      <LoadingSpinner label="Loading your booking..." size="large" fullPage />
    );
  }

  /*
   * This check must come before the empty-cart check.
   * The cart is cleared after success, but customers
   * still need to see their reference and tracking link.
   */
  if (bookingResponse) {
    return (
      <div className="min-w-0 overflow-x-clip py-6 sm:py-10">
        <Container>
          <div className="mx-auto w-full min-w-0 max-w-2xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm sm:rounded-3xl">
            <div className="bg-emerald-600 px-4 py-7 text-center text-white min-[380px]:px-6 sm:py-9">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 min-[380px]:h-16 min-[380px]:w-16">
                <CheckCircle2
                  className="h-7 w-7 min-[380px]:h-8 min-[380px]:w-8"
                  aria-hidden="true"
                />
              </span>

              <h1 className="mt-4 wrap-break-word text-xl font-black min-[380px]:text-2xl sm:text-3xl">
                Booking created successfully
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-emerald-50 min-[380px]:text-sm min-[380px]:leading-6">
                {bookingResponse.message}
              </p>
            </div>

            <div className="min-w-0 p-4 min-[380px]:p-5 sm:p-7">
              {bookingResponse.booking_reference ? (
                <div className="rounded-xl bg-slate-50 p-3 text-center sm:p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                    Booking reference
                  </p>

                  <p className="mt-1 wrap-break-word font-mono text-lg font-black tracking-tight text-slate-950 min-[380px]:text-xl sm:text-2xl">
                    {bookingResponse.booking_reference}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    Keep this reference for tracking and support.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid min-w-0 gap-2.5 min-[420px]:grid-cols-2">
                {bookingResponse.tracking_url ? (
                  <a
                    href={bookingResponse.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-extrabold text-white transition hover:bg-slate-800 sm:text-sm"
                  >
                    <span className="wrap-break-word">Track your booking</span>

                    <ExternalLink
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ) : null}

                <a
                  href={bookingResponse.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-extrabold text-white transition hover:bg-emerald-700 sm:text-sm"
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="wrap-break-word">Open WhatsApp</span>
                </a>
              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950 sm:p-4">
                <div className="flex min-w-0 items-start gap-2.5">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <p className="min-w-0 wrap-break-word text-[11px] leading-5 sm:text-xs">
                    SamWest will confirm product availability, delivery details
                    and the final total before fulfilment.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex min-w-0 flex-col gap-2 min-[420px]:flex-row">
                <Link
                  href="/products"
                  className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-600 sm:text-sm"
                >
                  <ShoppingBasket
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  Continue shopping
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setBookingResponse(null);
                    setCustomerDetails(initialCustomerDetails);
                  }}
                  className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                >
                  Start another booking
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-w-0 overflow-x-clip py-6 sm:py-12">
        <Container>
          <div className="mx-auto flex min-h-90 w-full min-w-0 max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-9 text-center min-[380px]:min-h-105 min-[380px]:px-6 sm:min-h-115 sm:rounded-3xl sm:py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700 min-[380px]:h-20 min-[380px]:w-20 sm:h-24 sm:w-24">
              <PackageOpen
                className="h-7 w-7 min-[380px]:h-9 min-[380px]:w-9 sm:h-11 sm:w-11"
                aria-hidden="true"
              />
            </div>

            <h1 className="mt-4 wrap-break-word text-xl font-black tracking-tight text-slate-950 min-[380px]:mt-5 min-[380px]:text-2xl sm:mt-6 sm:text-3xl">
              Your booking is empty
            </h1>

            <p className="mt-2 max-w-md wrap-break-word text-xs leading-5 text-slate-600 min-[380px]:text-sm min-[380px]:leading-6 sm:mt-3 sm:text-base sm:leading-7">
              Browse available products and add the items you would like SamWest
              to confirm.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-amber-700 min-[380px]:h-12 min-[380px]:px-6 min-[380px]:text-sm sm:mt-8"
            >
              <ShoppingBasket
                className="h-4 w-4 shrink-0 min-[380px]:h-5 min-[380px]:w-5"
                aria-hidden="true"
              />
              Browse products
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip py-5 sm:py-10">
      <Container>
        <Link
          href="/products"
          className="mb-4 inline-flex max-w-full items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-amber-700 sm:mb-6 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />

          <span className="wrap-break-word">Continue browsing</span>
        </Link>

        <header className="mb-5 min-w-0 sm:mb-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700 min-[380px]:text-xs sm:text-sm sm:tracking-[0.16em]">
            Review your selection
          </p>

          <h1 className="mt-1.5 wrap-break-word text-2xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-4xl">
            Your booking
          </h1>

          <p className="mt-2 max-w-2xl wrap-break-word text-xs leading-5 text-slate-600 min-[380px]:text-sm min-[380px]:leading-6 sm:mt-3 sm:text-base">
            Enter your contact and delivery details, then send the booking
            through WhatsApp for confirmation.
          </p>
        </header>

        {errorMessage ? (
          <div
            className="mb-5 flex min-w-0 items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 sm:mb-6 sm:gap-3 sm:rounded-2xl sm:p-4"
            role="alert"
          >
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="wrap-break-word text-xs font-extrabold sm:text-sm">
                Booking could not be prepared
              </p>

              <p className="mt-1 wrap-break-word text-[11px] leading-5 sm:text-sm sm:leading-6">
                {errorMessage}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7">
          <section className="min-w-0">
            <div className="mb-3 min-w-0 sm:mb-4">
              <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
                <h2 className="min-w-0 wrap-break-word text-sm font-black text-slate-950 min-[380px]:text-base sm:text-lg">
                  Selected products
                </h2>

                {!isClearConfirmationOpen ? (
                  <button
                    type="button"
                    onClick={requestClearBooking}
                    disabled={isSubmitting}
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-red-600 transition hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:gap-1.5 min-[380px]:text-xs"
                  >
                    <Trash2
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />

                    <span>Clear booking</span>
                  </button>
                ) : null}
              </div>

              {isClearConfirmationOpen ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:rounded-2xl sm:p-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <TriangleAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-black text-red-900 sm:text-sm">
                        Clear the entire booking?
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-red-700 sm:text-xs sm:leading-5">
                        All selected products will be removed. This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={cancelClearBooking}
                      disabled={isClearing}
                      className="flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-[10px] font-extrabold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:cursor-wait disabled:opacity-50 sm:text-xs"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={confirmClearBooking}
                      disabled={isClearing}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2 text-[10px] font-extrabold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-red-500 sm:text-xs"
                      aria-live="polite"
                    >
                      {isClearing ? (
                        <>
                          <LoaderCircle
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Clear all
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="min-w-0 space-y-2.5 sm:space-y-4">
              {items.map((item) => {
                const isUnavailable = unavailableProductIds.includes(
                  item.product.id,
                );

                return (
                  <div
                    key={item.product.id}
                    className={
                      isUnavailable
                        ? "min-w-0 rounded-xl border-2 border-red-400 bg-red-50 p-1 sm:rounded-2xl"
                        : "min-w-0"
                    }
                  >
                    {isUnavailable ? (
                      <p className="wrap-break-word px-2 pb-1 pt-1.5 text-[10px] font-extrabold text-red-700 sm:px-3 sm:pt-2 sm:text-xs">
                        This product is no longer available
                      </p>
                    ) : null}

                    <BookingItem
                      item={item}
                      onRemove={handleRemove}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="min-w-0 xl:sticky xl:top-32">
            <form
              onSubmit={handleWhatsAppBooking}
              className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
            >
              <div className="border-b border-slate-200 p-3 min-[380px]:p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 min-[380px]:h-10 min-[380px]:w-10 sm:h-11 sm:w-11 sm:rounded-2xl">
                    <ShoppingBasket
                      className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-slate-950 min-[380px]:text-base">
                      Booking details
                    </h2>

                    <p className="truncate text-[10px] text-slate-500 min-[380px]:text-xs sm:text-sm">
                      {totalItems === 1
                        ? "1 selected item"
                        : `${totalItems} selected items`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-3.5 p-3 min-[380px]:p-4 sm:space-y-4 sm:p-6">
                <div className="min-w-0">
                  <label
                    htmlFor="customer-name"
                    className="mb-1.5 block text-[11px] font-extrabold text-slate-700 sm:text-xs"
                  >
                    Full name
                  </label>

                  <div className="relative min-w-0">
                    <UserRound
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      id="customer-name"
                      type="text"
                      value={customerDetails.customerName}
                      onChange={(event) =>
                        updateCustomerField("customerName", event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      maxLength={150}
                      required
                      className="h-10 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 sm:h-11 sm:pl-10 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="customer-phone"
                    className="mb-1.5 block text-[11px] font-extrabold text-slate-700 sm:text-xs"
                  >
                    Phone number
                  </label>

                  <div className="relative min-w-0">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(event) =>
                        updateCustomerField("phone", event.target.value)
                      }
                      placeholder="e.g. 0712 345 678"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={30}
                      required
                      className="h-10 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 sm:h-11 sm:pl-10 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="delivery-location"
                    className="mb-1.5 block text-[11px] font-extrabold text-slate-700 sm:text-xs"
                  >
                    Delivery location
                  </label>

                  <div className="relative min-w-0">
                    <MapPin
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400 sm:top-3.5"
                      aria-hidden="true"
                    />

                    <textarea
                      id="delivery-location"
                      value={customerDetails.deliveryLocation}
                      onChange={(event) =>
                        updateCustomerField(
                          "deliveryLocation",
                          event.target.value,
                        )
                      }
                      placeholder="Estate, street, building or landmark"
                      autoComplete="street-address"
                      maxLength={255}
                      rows={3}
                      required
                      className="w-full min-w-0 max-w-full resize-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 sm:py-3 sm:pl-10 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="booking-notes"
                    className="mb-1.5 block wrap-break-word text-[11px] font-extrabold text-slate-700 sm:text-xs"
                  >
                    Additional notes{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <div className="relative min-w-0">
                    <FileText
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400 sm:top-3.5"
                      aria-hidden="true"
                    />

                    <textarea
                      id="booking-notes"
                      value={customerDetails.notes}
                      onChange={(event) =>
                        updateCustomerField("notes", event.target.value)
                      }
                      placeholder="Booking or delivery instructions"
                      maxLength={1000}
                      rows={3}
                      className="w-full min-w-0 max-w-full resize-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 sm:py-3 sm:pl-10 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3.5 sm:pt-4">
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs sm:gap-4 sm:text-sm">
                    <span className="min-w-0 text-slate-600">Total items</span>

                    <span className="shrink-0 font-extrabold text-slate-950">
                      {totalItems}
                    </span>
                  </div>

                  <div className="mt-3 flex min-w-0 items-end justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 sm:text-sm">
                        Estimated total
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400 sm:text-xs">
                        Before confirmation
                      </p>
                    </div>

                    <p className="max-w-[55%] shrink-0 truncate whitespace-nowrap text-base font-black text-slate-950 min-[380px]:text-lg sm:text-2xl">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || unavailableProductIds.length > 0}
                  className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-2.5 py-2 text-center text-[11px] font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 min-[380px]:px-4 min-[380px]:text-xs sm:h-13 sm:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />

                      <span className="wrap-break-word">
                        Preparing booking...
                      </span>
                    </>
                  ) : (
                    <>
                      <MessageCircle
                        className="h-4.5 w-4.5 shrink-0 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />

                      <span className="wrap-break-word">
                        Send booking via WhatsApp
                      </span>
                    </>
                  )}
                </button>

                <div className="flex min-w-0 items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-950 sm:gap-2.5 sm:rounded-2xl sm:p-3.5">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <p className="min-w-0 wrap-break-word text-[10px] leading-4.5 sm:text-xs sm:leading-5">
                    This is a booking request, not a completed purchase. SamWest
                    will confirm availability and final details.
                  </p>
                </div>
              </div>
            </form>
          </aside>
        </div>
      </Container>
    </div>
  );
}
