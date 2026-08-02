"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  PackageOpen,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import BookingItem from "@/components/booking/BookingItem";
import { useBooking } from "@/context/BookingContext";
import { formatCurrency } from "@/lib/formatters";

export default function BookingDrawer() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  const {
    items,
    totalItems,
    totalPrice,
    isDrawerOpen,
    isHydrated,
    removeItem,
    updateQuantity,
    clearBooking,
    closeDrawer,
  } = useBooking();

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      closeDrawer();
    }
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isHydrated || !isDrawerOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 max-w-full overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-drawer-title"
    >
      <button
        type="button"
        onClick={closeDrawer}
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Close booking drawer"
      />

      <aside className="absolute inset-y-0 right-0 flex h-dvh w-full min-w-0 max-w-105 flex-col overflow-hidden bg-white shadow-2xl">
        <header className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] min-[380px]:px-4 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 min-[380px]:h-10 min-[380px]:w-10 sm:h-11 sm:w-11 sm:rounded-2xl">
              <ShoppingBasket
                className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2
                id="booking-drawer-title"
                className="truncate text-base font-black text-slate-950 min-[380px]:text-lg"
              >
                Your booking
              </h2>

              <p className="truncate text-[10px] text-slate-500 min-[380px]:text-xs sm:text-sm">
                {totalItems === 1
                  ? "1 product selected"
                  : `${totalItems} products selected`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 sm:h-10 sm:w-10"
            aria-label="Close booking drawer"
          >
            <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10 text-center min-[380px]:px-6 sm:py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700 min-[380px]:h-20 min-[380px]:w-20">
              <PackageOpen
                className="h-7 w-7 min-[380px]:h-9 min-[380px]:w-9"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 wrap-break-word text-lg font-black text-slate-950 min-[380px]:mt-5 min-[380px]:text-xl">
              Your booking is empty
            </h3>

            <p className="mt-2 max-w-xs wrap-break-word text-xs leading-5 text-slate-600 min-[380px]:text-sm min-[380px]:leading-6">
              Browse products and add the items you would like SamWest to
              confirm.
            </p>

            <Link
              href="/products"
              onClick={closeDrawer}
              className="mt-6 inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700 min-[380px]:mt-7 min-[380px]:h-11 min-[380px]:px-6 min-[380px]:text-sm"
            >
              <span>Browse products</span>

              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2.5 py-3 min-[380px]:px-4 min-[380px]:py-4 sm:px-6">
              <div className="min-w-0 space-y-2.5 min-[380px]:space-y-3">
                {items.map((item) => (
                  <BookingItem
                    key={item.product.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </div>

            <footer className="min-w-0 shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 min-[380px]:px-4 min-[380px]:py-4 sm:px-6 sm:py-5">
              <div className="mb-3 flex min-w-0 items-end justify-between gap-2 min-[380px]:mb-4 min-[380px]:gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 min-[380px]:text-sm">
                    Estimated total
                  </p>

                  <p className="truncate text-[9px] text-slate-400 min-[380px]:text-xs">
                    Final availability will be confirmed
                  </p>
                </div>

                <p className="max-w-[48%] shrink-0 truncate whitespace-nowrap text-base font-black text-slate-950 min-[380px]:text-xl">
                  {formatCurrency(totalPrice)}
                </p>
              </div>

              <Link
                href="/booking"
                onClick={closeDrawer}
                className="flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-700 min-[380px]:h-12 min-[380px]:px-5 min-[380px]:text-sm"
              >
                <span>Review booking</span>

                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={clearBooking}
                className="mt-1.5 flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 min-[380px]:mt-2 min-[380px]:h-10 min-[380px]:text-sm"
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Clear booking
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
