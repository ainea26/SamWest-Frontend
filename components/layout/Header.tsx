"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBasket,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import CategoryMegaMenu from "@/components/layout/CategoryMegaMenu";
import MobileCategoryMenu from "@/components/layout/MobileCategoryMenu";
import Container from "@/components/ui/Container";
import { useBooking } from "@/context/BookingContext";
import { getProducts, unwrapResults } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

type HeaderSearchProps = {
  mobile?: boolean;
};

function getProductImageUrl(image: string | null | undefined): string | null {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const developmentApiUrl = "http://127.0.0.1:8001/api";

  const productionApiUrl = "https://samwest-production.up.railway.app/api";

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? productionApiUrl
      : developmentApiUrl);

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/${image.replace(/^\/+/, "")}`;
}

function HeaderSearch({ mobile = false }: HeaderSearchProps) {
  const router = useRouter();

  const searchRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const normalizedQuery = searchQuery.trim();

  const searchId = mobile ? "mobile-product-search" : "desktop-product-search";

  const suggestionsId = mobile
    ? "mobile-product-suggestions"
    : "desktop-product-suggestions";

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();

    setIsSearching(true);
    setIsSuggestionsOpen(true);
    setActiveSuggestionIndex(-1);

    const debounceTimer = window.setTimeout(async () => {
      try {
        const response = await getProducts(
          {
            search: normalizedQuery,
            page: 1,
            page_size: 6,
            is_available: true,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setSuggestions(unwrapResults(response).slice(0, 6));
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [normalizedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function closeSuggestions() {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }

  function navigateToProduct(product: Product) {
    closeSuggestions();

    router.push(`/products/${product.slug}`);
  }

  function navigateToResults() {
    closeSuggestions();

    if (!normalizedQuery) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(normalizedQuery)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      navigateToProduct(suggestions[activeSuggestionIndex]);
      return;
    }

    navigateToResults();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSuggestions();
      return;
    }

    if (!isSuggestionsOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveSuggestionIndex((currentIndex) =>
        currentIndex >= suggestions.length - 1 ? 0 : currentIndex + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveSuggestionIndex((currentIndex) =>
        currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();

      const selectedProduct = suggestions[activeSuggestionIndex];

      if (selectedProduct) {
        navigateToProduct(selectedProduct);
      }
    }
  }

  const showSuggestions = isSuggestionsOpen && normalizedQuery.length >= 2;

  return (
    <div
      ref={searchRef}
      className={
        mobile
          ? "relative min-w-0"
          : "relative mx-1 hidden min-w-0 flex-1 md:block lg:mx-3"
      }
    >
      <form onSubmit={handleSubmit} className="relative min-w-0" role="search">
        <label htmlFor={searchId} className="sr-only">
          Search products
        </label>

        {isSearching ? (
          <LoaderCircle
            className={[
              "pointer-events-none absolute top-1/2 -translate-y-1/2 animate-spin text-amber-700",
              mobile
                ? "left-3 h-4 w-4"
                : "left-3.5 h-4.5 w-4.5 lg:left-4 lg:h-5 lg:w-5",
            ].join(" ")}
            aria-hidden="true"
          />
        ) : (
          <Search
            className={[
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400",
              mobile
                ? "left-3 h-4 w-4"
                : "left-3.5 h-4.5 w-4.5 lg:left-4 lg:h-5 lg:w-5",
            ].join(" ")}
            aria-hidden="true"
          />
        )}

        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setActiveSuggestionIndex(-1);
          }}
          onFocus={() => {
            if (normalizedQuery.length >= 2) {
              setIsSuggestionsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            mobile
              ? "Search products..."
              : "Search products, brands and categories..."
          }
          className={
            mobile
              ? "h-9 w-full min-w-0 rounded-lg border-2 border-amber-400 bg-white pl-9 pr-17 text-[11px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 min-[360px]:h-10 min-[360px]:pr-19 min-[360px]:text-xs"
              : "h-11 w-full min-w-0 rounded-xl border-2 border-amber-400 bg-white pl-11 pr-23 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 lg:h-12 lg:pl-12 lg:pr-26"
          }
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={suggestionsId}
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `${suggestionsId}-${activeSuggestionIndex}`
              : undefined
          }
        />

        <button
          type="submit"
          className={
            mobile
              ? "absolute right-1 top-1/2 flex h-7 -translate-y-1/2 items-center justify-center rounded-md bg-amber-500 px-2 text-[9px] font-black text-slate-950 transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 min-[360px]:h-8 min-[360px]:px-2.5 min-[360px]:text-[10px]"
              : "absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 items-center justify-center rounded-lg bg-amber-500 px-3 text-[11px] font-black text-slate-950 transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 lg:h-9 lg:px-5 lg:text-xs"
          }
        >
          Search
        </button>
      </form>

      {showSuggestions ? (
        <div
          id={suggestionsId}
          className="absolute inset-x-0 top-full z-80 mt-2 max-h-[min(65vh,28rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/15 sm:rounded-2xl sm:p-2"
          role="listbox"
          aria-label="Product suggestions"
        >
          {isSearching && suggestions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-xs font-semibold text-slate-500 sm:text-sm">
              <LoaderCircle
                className="h-4 w-4 animate-spin text-amber-700"
                aria-hidden="true"
              />
              Searching products...
            </div>
          ) : null}

          {!isSearching && suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold text-slate-700 sm:text-sm">
                No matching products
              </p>

              <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                Try another product name or brand.
              </p>
            </div>
          ) : null}

          {suggestions.map((product, index) => {
            const productImage = getProductImageUrl(
              product.image_url || product.image,
            );

            const isActive = activeSuggestionIndex === index;

            return (
              <Link
                id={`${suggestionsId}-${index}`}
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={closeSuggestions}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
                className={[
                  "flex min-w-0 items-center gap-2 rounded-lg p-2 transition sm:gap-3 sm:rounded-xl",
                  isActive ? "bg-amber-50" : "hover:bg-slate-50",
                ].join(" ")}
                role="option"
                aria-selected={isActive}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  {productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImage}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[11px] font-bold leading-4 text-slate-900 sm:text-sm sm:leading-5">
                    {product.name}
                  </span>

                  <span className="mt-0.5 block text-[10px] font-black text-amber-700 sm:text-xs">
                    {formatCurrency(product.price)}
                  </span>
                </span>
              </Link>
            );
          })}

          {suggestions.length > 0 ? (
            <button
              type="button"
              onClick={navigateToResults}
              className="mt-1 flex w-full items-center justify-center rounded-lg border-t border-slate-100 px-3 py-2.5 text-[11px] font-extrabold text-amber-700 transition hover:bg-amber-50 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:rounded-xl sm:text-xs"
            >
              View all results for “{normalizedQuery}”
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Header() {
  const { totalItems, openDrawer, isHydrated } = useBooking();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const closeCategoryMenu = useCallback(() => {
    setIsCategoryMenuOpen(false);
  }, []);

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

              <a
                href="tel:+254756348344"
                className="hidden items-center gap-1.5 text-xs font-bold lg:inline-flex"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                Call confirmation available
              </a>
            </div>
          </Container>
        </div>

        <div className="border-b border-slate-200">
          <Container className="flex min-h-14 min-w-0 items-center gap-1.5 py-2 min-[360px]:gap-2 sm:min-h-18 sm:gap-3 lg:min-h-20">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-[360px]:h-10 min-[360px]:w-10 lg:hidden"
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
              className="group flex min-w-0 shrink-0 items-center gap-1.5 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-[380px]:gap-2"
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

            <HeaderSearch />

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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Call SamWest"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>

            <button
              type="button"
              onClick={openDrawer}
              className="relative ml-auto flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-2 font-black text-slate-950 transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 min-[360px]:h-10 min-[360px]:min-w-10 min-[390px]:px-2.5 sm:h-11 sm:gap-2 sm:px-4 md:ml-0"
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
            <HeaderSearch mobile />
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
