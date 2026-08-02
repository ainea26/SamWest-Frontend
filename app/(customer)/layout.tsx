import Link from "next/link";
import type { ReactNode } from "react";

import BookingDrawer from "@/components/booking/BookingDrawer";
import CompactHeader from "@/components/layout/CompactHeader";

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full min-w-0 max-w-full flex-col overflow-x-clip bg-slate-50">
      <CompactHeader />

      <main className="w-full min-w-0 max-w-full flex-1">{children}</main>

      <footer className="w-full max-w-full border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col items-center justify-between gap-2 px-3 py-4 text-center text-[10px] text-slate-500 min-[380px]:px-4 min-[380px]:text-xs sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="wrap-break-word">
            Copyright {new Date().getFullYear()} SamWest
          </p>

          <nav
            className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-1"
            aria-label="Customer footer navigation"
          >
            <Link
              href="/"
              className="font-bold transition hover:text-amber-700"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="font-bold transition hover:text-amber-700"
            >
              Products
            </Link>
          </nav>
        </div>
      </footer>

      <BookingDrawer />
    </div>
  );
}
