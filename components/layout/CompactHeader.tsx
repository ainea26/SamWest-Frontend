"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBasket,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function CompactHeader() {
  const {
    totalItems,
    isHydrated,
  } = useBooking();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 min-[360px]:h-16 min-[360px]:gap-4 min-[360px]:px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="SamWest home"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-sm font-black text-white min-[360px]:h-10 min-[360px]:w-10">
            SW
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-none text-slate-950 min-[360px]:text-lg">
              SamWest
            </p>

            <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700 min-[340px]:block">
              Smart shopping
            </p>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 min-[360px]:gap-2">
          <Link
            href="/products"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-extrabold text-slate-600 transition hover:bg-slate-100 hover:text-amber-700 min-[360px]:px-3 min-[360px]:text-xs sm:px-4"
          >
            <ArrowLeft
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span className="hidden min-[300px]:inline">
              Products
            </span>
          </Link>

          <Link
            href="/booking"
            className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-2.5 text-[10px] font-extrabold text-white transition hover:bg-amber-700 min-[360px]:px-3 min-[360px]:text-xs sm:px-4"
          >
            <ShoppingBasket
              className="h-4 w-4"
              aria-hidden="true"
            />

            <span className="hidden min-[340px]:inline">
              Booking
            </span>

            {isHydrated && totalItems > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[9px] font-black text-white">
                {totalItems > 99
                  ? "99+"
                  : totalItems}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
