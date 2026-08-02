"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBasket,
} from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";

import CategoryMegaMenu from "@/components/layout/CategoryMegaMenu";
import MobileCategoryMenu from "@/components/layout/MobileCategoryMenu";
import Container from "@/components/ui/Container";
import { useBooking } from "@/context/BookingContext";

export default function Header() {
  const router = useRouter();

  const { totalItems, openDrawer, isHydrated } = useBooking();

  const [searchQuery, setSearchQuery] = useState("");

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const closeCategoryMenu = useCallback(() => {
    setIsCategoryMenuOpen(false);
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-full overflow-x-clip bg-white shadow-sm">
        <div className="bg-amber-500 text-slate-950">
          <Container className="flex min-h-8 items-center justify-center py-1.5 text-center">
            <p className="flex min-w-0 items-center justify-center gap-1.5 text-[9px] font-extrabold min-[340px]:text-[10px] min-[390px]:text-[11px] sm:text-xs">
              <BadgePercent
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />

              <span className="wrap-break-word">
                Save 20% on selected products
              </span>
            </p>

            <div className="ml-auto hidden shrink-0 items-center gap-5 sm:flex">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Kenya
              </span>

              <a href="tel:+254756348344">
              <span className="hidden items-center gap-1.5 text-xs font-bold lg:inline-flex">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                Call confirmation available
              </span>
              </a>
            </div>
          </Container>
        </div>

        <div className="border-b border-slate-200">
          <Container className="flex min-h-14 min-w-0 items-center gap-1.5 py-2 min-[360px]:gap-2 sm:min-h-18 sm:gap-3 lg:min-h-20">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 min-[360px]:h-10 min-[360px]:w-10 lg:hidden"
              aria-label="Open product categories"
              aria-expanded={isCategoryMenuOpen}
            >
              <Menu
                className="h-4.5 w-4.5 min-[360px]:h-5 min-[360px]:w-5"
                aria-hidden="true"
              />
            </button>

            <Link
              href="/"
              className="group flex min-w-0 shrink-0 items-center gap-1.5 min-[380px]:gap-2"
              aria-label="SamWest home"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-950/10 transition group-hover:scale-[1.03] min-[360px]:h-10 min-[360px]:w-10 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Image
                  src="/samwest-logo.svg"
                  alt=""
                  fill
                  priority
                  sizes="48px"
                  className="object-cover"
                />
              </span>

              <span className="hidden min-w-0 leading-none min-[350px]:block">
                <span className="block whitespace-nowrap text-[15px] font-black tracking-tight text-slate-950 transition group-hover:text-amber-700 min-[390px]:text-base sm:text-2xl">
                  Sam
                  <span className="text-amber-600">West</span>
                </span>

                <span className="mt-1 hidden whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400 sm:block">
                  Smart savings
                </span>
              </span>
            </Link>

            <form
              onSubmit={handleSearch}
              className="relative mx-1 hidden min-w-0 flex-1 md:block lg:mx-3"
            >
              <label htmlFor="desktop-product-search" className="sr-only">
                Search products
              </label>

              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 lg:left-4 lg:h-5 lg:w-5"
                aria-hidden="true"
              />

              <input
                id="desktop-product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, brands and categories..."
                className="h-11 w-full min-w-0 rounded-xl border-2 border-amber-400 bg-white pl-11 pr-23 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 lg:h-12 lg:pl-12 lg:pr-26"
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 items-center justify-center rounded-lg bg-amber-500 px-3 text-[11px] font-black text-slate-950 transition hover:bg-amber-600 lg:h-9 lg:px-5 lg:text-xs"
              >
                Search
              </button>
            </form>

            <div className="hidden shrink-0 items-center gap-2 2xl:flex">
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-400">
                  Need assistance?
                </p>

                <p className="text-xs font-black text-slate-800">
                  Contact SamWest
                </p>
              </div>

              <a
                href="tel:+254756348344"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition hover:bg-amber-100 hover:text-amber-800"
                aria-label="Call SamWest"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>

            <button
              type="button"
              onClick={openDrawer}
              className="relative ml-auto flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-2 font-black text-slate-950 transition hover:bg-amber-600 min-[360px]:h-10 min-[360px]:min-w-10 min-[390px]:px-2.5 sm:h-11 sm:gap-2 sm:px-4 md:ml-0"
              aria-label={
                isHydrated && totalItems > 0
                  ? `Open booking with ${totalItems} items`
                  : "Open booking"
              }
            >
              <ShoppingBasket
                className="h-4.5 w-4.5 shrink-0 sm:h-5 sm:w-5"
                aria-hidden="true"
              />

              <span className="hidden whitespace-nowrap text-[11px] min-[390px]:inline sm:text-sm">
                Booking
              </span>

              {isHydrated && totalItems > 0 ? (
                <span className="absolute -right-1 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-slate-950 px-1 text-[9px] font-black text-white sm:-right-2 sm:-top-2 sm:h-6 sm:min-w-6 sm:text-[10px]">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              ) : null}
            </button>
          </Container>

          <Container className="pb-2.5 sm:pb-3 md:hidden">
            <form onSubmit={handleSearch} className="relative min-w-0">
              <label htmlFor="mobile-product-search" className="sr-only">
                Search products
              </label>

              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                id="mobile-product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="h-9 w-full min-w-0 rounded-lg border-2 border-amber-400 bg-white pl-9 pr-17 text-[11px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 min-[360px]:h-10 min-[360px]:pr-19 min-[360px]:text-xs"
              />

              <button
                type="submit"
                className="absolute right-1 top-1/2 flex h-7 -translate-y-1/2 items-center justify-center rounded-md bg-amber-500 px-2 text-[9px] font-black text-slate-950 transition hover:bg-amber-600 min-[360px]:h-8 min-[360px]:px-2.5 min-[360px]:text-[10px]"
              >
                Search
              </button>
            </form>
          </Container>
        </div>

        <div className="hidden lg:block">
          <CategoryMegaMenu />
        </div>
      </header>

      <MobileCategoryMenu
        isOpen={isCategoryMenuOpen}
        onClose={closeCategoryMenu}
      />
    </>
  );
}
