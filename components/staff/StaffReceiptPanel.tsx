"use client";

import {
  BadgeCheck,
  Banknote,
  Copy,
  ExternalLink,
  MessageCircle,
  ReceiptText,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getStaffBookingReceipt,
  getStaffErrorMessage,
  issueStaffBookingReceipt,
} from "@/lib/staff-api";
import type { PaymentMethod, StaffBooking, StaffReceipt } from "@/types/staff";

type StaffReceiptPanelProps = {
  booking: StaffBooking;
};

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "mpesa",
    label: "M-Pesa",
  },
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
  },
  {
    value: "card",
    label: "Card",
  },
  {
    value: "other",
    label: "Other",
  },
];

const REFERENCE_REQUIRED_METHODS: PaymentMethod[] = [
  "mpesa",
  "bank_transfer",
  "card",
];

function normalizeWhatsAppNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");

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

function getReceiptWhatsAppUrl(
  booking: StaffBooking,
  receipt: StaffReceipt,
): string | null {
  const phoneNumber = normalizeWhatsAppNumber(booking.phone_number);

  if (phoneNumber.length < 9) {
    return null;
  }

  const customerName = booking.customer_name.trim() || "Customer";

  const balance = Number(receipt.balance ?? 0);

  const message = [
    `Hello ${customerName},`,
    "",
    balance > 0
      ? "Your payment has been recorded by SamWest."
      : "Your payment has been confirmed by SamWest.",
    "",
    `*Booking:* ${booking.reference}`,
    `*Receipt:* ${receipt.receipt_number}`,
    `*Amount paid:* ${receipt.currency} ${receipt.total_paid}`,
    ...(balance > 0
      ? [`*Balance:* ${receipt.currency} ${receipt.balance}`]
      : []),
    "",
    "*View and print your receipt:*",
    receipt.receipt_url,
    "",
    "Thank you for choosing SamWest.",
  ].join("\n");

  return (
    `https://wa.me/${phoneNumber}` + `?text=${encodeURIComponent(message)}`
  );
}

export default function StaffReceiptPanel({ booking }: StaffReceiptPanelProps) {
  const [receipt, setReceipt] = useState<StaffReceipt | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");

  const [transactionReference, setTransactionReference] = useState("");

  const [paymentNote, setPaymentNote] = useState("");

  const [amountPaid, setAmountPaid] = useState(booking.confirmed_total ?? "");

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isIssuing, setIsIssuing] = useState(false);

  const [wasCopied, setWasCopied] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReceipt() {
      try {
        const result = await getStaffBookingReceipt(booking.reference);

        if (isMounted) {
          setReceipt(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getStaffErrorMessage(
              error,
              "Receipt information could not be loaded.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReceipt();

    return () => {
      isMounted = false;
    };
  }, [booking.reference]);

  useEffect(() => {
    if (booking.confirmed_total) {
      setAmountPaid(booking.confirmed_total);
    }
  }, [booking.confirmed_total]);

  const referenceRequired = REFERENCE_REQUIRED_METHODS.includes(paymentMethod);

  const confirmedTotal = Number(booking.confirmed_total ?? 0);

  const parsedAmountPaid = Number(amountPaid);

  const amountPaidIsValid =
    Number.isFinite(parsedAmountPaid) &&
    parsedAmountPaid > 0 &&
    parsedAmountPaid <= confirmedTotal;

  const remainingBalance = amountPaidIsValid
    ? Math.max(confirmedTotal - parsedAmountPaid, 0)
    : confirmedTotal;

  const canIssue =
    !isIssuing &&
    paymentConfirmed &&
    booking.status !== "cancelled" &&
    confirmedTotal > 0 &&
    amountPaidIsValid &&
    (!referenceRequired || Boolean(transactionReference.trim()));

  async function handleIssueReceipt() {
    if (!canIssue) {
      return;
    }

    setIsIssuing(true);
    setErrorMessage("");

    try {
      const response = await issueStaffBookingReceipt(booking.reference, {
        payment_method: paymentMethod,

        amount_paid: parsedAmountPaid.toFixed(2),

        transaction_reference: transactionReference.trim(),

        payment_note: paymentNote.trim(),
      });

      setReceipt(response.receipt);

      setPaymentConfirmed(false);
    } catch (error) {
      setErrorMessage(
        getStaffErrorMessage(error, "Payment could not be confirmed."),
      );
    } finally {
      setIsIssuing(false);
    }
  }

  async function handleCopyReceiptLink() {
    if (!receipt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(receipt.receipt_url);

      setWasCopied(true);

      window.setTimeout(() => {
        setWasCopied(false);
      }, 2000);
    } catch {
      setErrorMessage("The receipt link could not be copied.");
    }
  }

  if (isLoading) {
    return (
      <div className="border-t border-slate-200 bg-white p-3 min-[360px]:p-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600"
            aria-hidden="true"
          />
          Checking payment receipt...
        </div>
      </div>
    );
  }

  if (receipt) {
    const whatsappUrl = getReceiptWhatsAppUrl(booking, receipt);

    const hasBalance = Number(receipt.balance ?? 0) > 0;

    return (
      <section
        className={[
          "min-w-0 border-t p-3 min-[360px]:p-4 sm:px-6 sm:py-5",
          hasBalance
            ? "border-amber-200 bg-amber-50/70"
            : "border-emerald-200 bg-emerald-50/70",
        ].join(" ")}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
                hasBalance ? "bg-amber-600" : "bg-emerald-600",
              ].join(" ")}
            >
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p
                className={[
                  "text-[10px] font-black uppercase tracking-widest",
                  hasBalance ? "text-amber-700" : "text-emerald-700",
                ].join(" ")}
              >
                {hasBalance ? "Partial payment recorded" : "Payment confirmed"}
              </p>

              <h3 className="mt-1 wrap-break-word text-sm font-black text-slate-950 min-[360px]:text-base">
                Receipt {receipt.receipt_number}
              </h3>

              <p className="mt-1 text-xs font-semibold text-slate-600">
                {receipt.payment_method_label}

                {receipt.transaction_reference
                  ? ` · ${receipt.transaction_reference}`
                  : ""}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                <span className="text-emerald-700">
                  Paid: {receipt.currency} {receipt.total_paid}
                </span>

                {hasBalance ? (
                  <span className="text-amber-800">
                    Balance: {receipt.currency} {receipt.balance}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2 min-[350px]:grid-cols-2 lg:flex">
            <a
              href={receipt.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              View receipt
            </a>

            <button
              type="button"
              onClick={() => void handleCopyReceiptLink()}
              className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />

              {wasCopied ? "Copied" : "Copy link"}
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-700 min-[350px]:col-span-2"
              >
                <MessageCircle
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Send receipt on WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-xs font-bold text-red-700">{errorMessage}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="min-w-0 border-t border-slate-200 bg-amber-50/50 p-3 min-[360px]:p-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-2">
        <ReceiptText
          className="h-5 w-5 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <div>
          <h3 className="text-sm font-black text-slate-950">
            Confirm payment and issue receipt
          </h3>

          <p className="mt-0.5 text-[10px] leading-4 text-slate-500 min-[360px]:text-xs">
            A receipt can only be issued once.
          </p>
        </div>
      </div>

      {!booking.confirmed_total ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-xs font-semibold leading-5 text-amber-900">
          Enter the confirmed total above and save the booking before issuing
          its receipt.
        </div>
      ) : booking.status === "cancelled" ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
          Receipts cannot be issued for cancelled bookings.
        </div>
      ) : (
        <>
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0">
              <label
                htmlFor={`amount-paid-${booking.reference}`}
                className="mb-1.5 block text-[10px] font-extrabold text-slate-600"
              >
                Amount paid
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-black text-slate-400">
                  {booking.currency}
                </span>

                <input
                  id={`amount-paid-${booking.reference}`}
                  type="number"
                  min="0.01"
                  max={booking.confirmed_total ?? undefined}
                  step="0.01"
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-12 pr-3 text-xs font-black text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor={`payment-method-${booking.reference}`}
                className="mb-1.5 block text-[10px] font-extrabold text-slate-600"
              >
                Payment method
              </label>

              <select
                id={`payment-method-${booking.reference}`}
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
                className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor={`transaction-${booking.reference}`}
                className="mb-1.5 block text-[10px] font-extrabold text-slate-600"
              >
                Transaction reference
                {referenceRequired ? " *" : ""}
              </label>

              <input
                id={`transaction-${booking.reference}`}
                type="text"
                value={transactionReference}
                onChange={(event) =>
                  setTransactionReference(event.target.value)
                }
                placeholder={
                  paymentMethod === "mpesa"
                    ? "Example: QH12ABC345"
                    : "Payment reference"
                }
                className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold uppercase text-slate-800 outline-none placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                Confirmed total
              </p>

              <p className="mt-1 text-sm font-black text-slate-950">
                {booking.currency} {confirmedTotal.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                Amount paid
              </p>

              <p className="mt-1 text-sm font-black text-emerald-700">
                {booking.currency}{" "}
                {amountPaidIsValid ? parsedAmountPaid.toFixed(2) : "0.00"}
              </p>
            </div>

            <div
              className={[
                "rounded-xl border p-3",
                remainingBalance > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50",
              ].join(" ")}
            >
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-500">
                Remaining balance
              </p>

              <p
                className={[
                  "mt-1 text-sm font-black",
                  remainingBalance > 0 ? "text-amber-800" : "text-emerald-700",
                ].join(" ")}
              >
                {booking.currency} {remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {amountPaid && !amountPaidIsValid ? (
            <p className="mt-2 text-xs font-bold text-red-700">
              Amount paid must be greater than zero and cannot exceed the
              confirmed total.
            </p>
          ) : null}

          <div className="mt-3">
            <label
              htmlFor={`payment-note-${booking.reference}`}
              className="mb-1.5 block text-[10px] font-extrabold text-slate-600"
            >
              Payment note
            </label>

            <input
              id={`payment-note-${booking.reference}`}
              type="text"
              value={paymentNote}
              onChange={(event) => setPaymentNote(event.target.value)}
              placeholder="Optional internal note"
              className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-white p-3">
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={(event) => setPaymentConfirmed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
            />

            <span className="text-xs font-bold leading-5 text-slate-700">
              I confirm that SamWest has received{" "}
              <strong className="text-slate-950">
                {booking.currency}{" "}
                {amountPaidIsValid ? parsedAmountPaid.toFixed(2) : "0.00"}
              </strong>{" "}
              for this booking.
              {amountPaidIsValid && remainingBalance > 0 ? (
                <>
                  {" "}
                  A balance of{" "}
                  <strong className="text-amber-800">
                    {booking.currency} {remainingBalance.toFixed(2)}
                  </strong>{" "}
                  remains outstanding.
                </>
              ) : null}
            </span>
          </label>

          <button
            type="button"
            onClick={() => void handleIssueReceipt()}
            disabled={!canIssue}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
          >
            {isIssuing ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                Issuing receipt...
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4" aria-hidden="true" />

                {remainingBalance > 0
                  ? "Record payment and issue receipt"
                  : "Confirm paid and issue receipt"}
              </>
            )}
          </button>
        </>
      )}

      {errorMessage ? (
        <p className="mt-3 text-xs font-bold text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
