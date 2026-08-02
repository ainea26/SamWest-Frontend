"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Printer,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getPublicReceipt, getStaffErrorMessage } from "@/lib/staff-api";
import type { ReceiptItemSnapshot, StaffReceipt } from "@/types/staff";

function formatMoney(value: string, currency: string): string {
  const amount = Number.parseFloat(value);

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function ReceiptItemCard({
  item,
  receipt,
}: {
  item: ReceiptItemSnapshot;
  receipt: StaffReceipt;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="wrap-break-word text-xs font-black leading-5 text-slate-950">
        {item.product_name}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
            Quantity
          </p>

          <p className="mt-1 font-bold text-slate-700">{item.quantity}</p>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
            Unit price
          </p>

          <p className="mt-1 font-bold text-slate-700">
            {formatMoney(item.unit_price, receipt.currency)}
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 text-right">
        <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
          Line total
        </p>

        <p className="mt-1 text-sm font-black text-slate-950">
          {formatMoney(item.line_total, receipt.currency)}
        </p>
      </div>
    </article>
  );
}

export default function PublicReceiptPage() {
  const params = useParams<{
    receiptNumber: string;
  }>();

  const searchParams = useSearchParams();

  const receiptNumber = params.receiptNumber ?? "";

  const token = searchParams.get("token") ?? "";

  const [receipt, setReceipt] = useState<StaffReceipt | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReceipt() {
      if (!receiptNumber || !token) {
        if (isMounted) {
          setErrorMessage("This receipt link is incomplete or invalid.");

          setIsLoading(false);
        }

        return;
      }

      try {
        const result = await getPublicReceipt(receiptNumber, token);

        if (isMounted) {
          setReceipt(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getStaffErrorMessage(
              error,
              "The receipt could not be found or the secure link has expired.",
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
  }, [receiptNumber, token]);

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto h-10 w-10 animate-spin text-amber-600"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-bold text-slate-600">
            Loading your receipt...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !receipt) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-3 py-10">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-5 text-center shadow-xl sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <TriangleAlert className="h-7 w-7" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Receipt unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {errorMessage}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to SamWest
          </Link>
        </section>
      </main>
    );
  }

  const issuedDate = formatDate(receipt.issued_at);

  return (
    <main className="min-h-dvh min-w-0 px-2 py-3 min-[360px]:px-3 min-[360px]:py-5 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-4xl min-w-0">
        <div className="mb-4 flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to SamWest
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print or save PDF
          </button>
        </div>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:rounded-3xl print:rounded-none print:border-0 print:shadow-none">
          <header className="relative overflow-hidden bg-slate-950 p-4 text-white min-[360px]:p-5 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-16 -translate-y-16 rounded-full bg-amber-500/20" />

            <div className="relative flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-base font-black text-slate-950">
                  SW
                </span>

                <div className="min-w-0">
                  <p className="text-xl font-black tracking-tight">
                    Sam
                    <span className="text-amber-400">West</span>
                  </p>

                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Smart shopping, easy booking
                  </p>
                </div>
              </div>

              <div className="min-w-0 sm:text-right">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                  <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
                  Payment receipt
                </div>

                <p className="mt-3 wrap-break-word text-sm font-black min-[360px]:text-base">
                  {receipt.receipt_number}
                </p>
              </div>
            </div>
          </header>

          <div className="min-w-0 p-3 min-[360px]:p-4 sm:p-8">
            <section className="grid min-w-0 gap-4 border-b border-slate-200 pb-6 md:grid-cols-[minmax(0,1fr)_160px] md:items-start">
              <div className="grid min-w-0 grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    Receipt issued to
                  </p>

                  <p className="mt-2 wrap-break-word text-sm font-black text-slate-950">
                    {receipt.customer_name || "Customer"}
                  </p>

                  <p className="mt-1 wrap-break-word text-xs text-slate-600">
                    {receipt.phone_number}
                  </p>

                  <p className="mt-1 wrap-break-word text-xs leading-5 text-slate-600">
                    {receipt.delivery_location}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    Payment details
                  </p>

                  <dl className="mt-2 space-y-2 text-xs">
                    <div>
                      <dt className="text-slate-400">Booking reference</dt>

                      <dd className="mt-0.5 wrap-break-word font-black text-slate-800">
                        {receipt.booking_reference}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-400">Payment method</dt>

                      <dd className="mt-0.5 font-bold text-slate-800">
                        {receipt.payment_method_label}
                      </dd>
                    </div>

                    {receipt.transaction_reference ? (
                      <div>
                        <dt className="text-slate-400">
                          Transaction reference
                        </dt>

                        <dd className="mt-0.5 wrap-break-word font-bold uppercase text-slate-800">
                          {receipt.transaction_reference}
                        </dd>
                      </div>
                    ) : null}

                    <div>
                      <dt className="text-slate-400">Date issued</dt>

                      <dd className="mt-0.5 font-bold leading-5 text-slate-800">
                        {issuedDate}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mx-auto flex h-32 w-32 rotate-[-7deg] flex-col items-center justify-center rounded-full border-4 border-double border-emerald-600 text-center text-emerald-700 md:mx-0 md:ml-auto">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />

                <span className="mt-1 text-xl font-black tracking-widest">
                  PAID
                </span>

                <span className="mt-1 text-[8px] font-extrabold uppercase tracking-wider">
                  SamWest verified
                </span>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-black text-slate-950">
                Purchased products
              </h2>

              <div className="mt-3 space-y-3 sm:hidden">
                {receipt.items_snapshot.map((item, index) => (
                  <ReceiptItemCard
                    key={`${item.product_id}-${index}`}
                    item={item}
                    receipt={receipt}
                  />
                ))}
              </div>

              <div className="mt-3 hidden overflow-hidden rounded-2xl border border-slate-200 sm:block">
                <table className="w-full table-fixed text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-[46%] px-4 py-3">Product</th>

                      <th className="w-[14%] px-3 py-3 text-center">Qty</th>

                      <th className="w-[20%] px-3 py-3 text-right">
                        Unit price
                      </th>

                      <th className="w-[20%] px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {receipt.items_snapshot.map((item, index) => (
                      <tr
                        key={`${item.product_id}-${index}`}
                        className="text-xs"
                      >
                        <td className="wrap-break-word px-4 py-3 font-bold text-slate-800">
                          {item.product_name}
                        </td>

                        <td className="px-3 py-3 text-center text-slate-600">
                          {item.quantity}
                        </td>

                        <td className="px-3 py-3 text-right text-slate-600">
                          {formatMoney(item.unit_price, receipt.currency)}
                        </td>

                        <td className="px-4 py-3 text-right font-black text-slate-950">
                          {formatMoney(item.line_total, receipt.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 ml-auto w-full max-w-sm rounded-2xl bg-slate-50 p-4">
              <dl className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Subtotal</dt>

                  <dd className="font-bold text-slate-800">
                    {formatMoney(receipt.subtotal, receipt.currency)}
                  </dd>
                </div>

                {Number(receipt.delivery_fee) !== 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Delivery fee</dt>

                    <dd className="font-bold text-slate-800">
                      {formatMoney(receipt.delivery_fee, receipt.currency)}
                    </dd>
                  </div>
                ) : null}

                {Number(receipt.discount) !== 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Discount</dt>

                    <dd className="font-bold text-emerald-700">
                      -{formatMoney(receipt.discount, receipt.currency)}
                    </dd>
                  </div>
                ) : null}

                {Number(receipt.price_adjustment) !== 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Price adjustment</dt>

                    <dd className="font-bold text-slate-800">
                      {formatMoney(receipt.price_adjustment, receipt.currency)}
                    </dd>
                  </div>
                ) : null}

                <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-3">
                  <dt className="font-black text-slate-950">Total paid</dt>

                  <dd className="text-lg font-black text-emerald-700">
                    {formatMoney(receipt.total_paid, receipt.currency)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-slate-500">Balance</dt>

                  <dd className="font-black text-slate-950">
                    {formatMoney(receipt.balance, receipt.currency)}
                  </dd>
                </div>
              </dl>
            </section>

            <footer className="mt-8 border-t border-slate-200 pt-5 text-center">
              <div className="inline-flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />

                <p className="text-xs font-black">
                  Payment confirmed by SamWest
                </p>
              </div>

              <p className="mx-auto mt-2 max-w-xl text-[10px] leading-5 text-slate-500">
                This is a SamWest payment receipt confirming payment for the
                referenced booking.
              </p>

              <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Thank you for shopping with SamWest
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
