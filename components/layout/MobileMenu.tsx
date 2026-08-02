"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Home, PackageSearch, ShoppingBasket, X } from "lucide-react";

import { cn } from "@/lib/utils";

type MobileMenuProps = {
  isOpen: boolean;
  totalItems: number;
  onClose: () => void;
  onOpenBooking: () => void;
};

const navigation = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Products",
    href: "/products",
    icon: PackageSearch,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Grid2X2,
  },
];

export default function MobileMenu({
  isOpen,
  totalItems,
  onClose,
  onOpenBooking,
}: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-90 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close navigation"
      />

      <aside className="absolute inset-y-0 left-0 flex h-dvh w-[88%] max-w-sm flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex items-center gap-2.5"
            aria-label="SamWest home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 text-sm font-black text-white shadow-sm">
              SW
            </span>

            <span className="text-xl font-black tracking-tight text-slate-950">
              Sam<span className="text-amber-600">West</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Navigation
          </p>

          <div className="mt-3 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition",
                    isActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      isActive ? "bg-amber-100" : "bg-slate-100",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-6 border-t border-slate-200" />

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-left text-white transition hover:bg-slate-800"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              </span>

              <span>
                <span className="block text-sm font-extrabold">
                  Your booking
                </span>

                <span className="block text-xs text-slate-300">
                  Review selected products
                </span>
              </span>
            </span>

            {totalItems > 0 ? (
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-500 px-2 text-xs font-black text-slate-950">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            ) : null}
          </button>
        </nav>

        <footer className="border-t border-slate-200 px-5 py-4">
          <p className="text-center text-xs leading-5 text-slate-500">
            Select products and send your booking through WhatsApp for
            confirmation.
          </p>
        </footer>
      </aside>
    </div>
  );
}
