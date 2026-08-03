"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ImageIcon,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useBooking } from "@/context/BookingContext";
import { calculateDiscountPercentage, formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

type ProductDetailsProps = {
  product: Product;
};

type AddState = "idle" | "adding" | "added";

function getImageUrl(image: string | null | undefined): string | null {
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

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useBooking();

  const [quantity, setQuantity] = useState(1);

  const [imageFailed, setImageFailed] = useState(false);

  const [isChangingQuantity, setIsChangingQuantity] = useState(false);

  const [addState, setAddState] = useState<AddState>("idle");

  const quantityTimerRef = useRef<number | null>(null);

  const addTimerRef = useRef<number | null>(null);

  const confirmationTimerRef = useRef<number | null>(null);

  const imageUrl = getImageUrl(product.image_url || product.image);

  const discountPercentage =
    product.discount_percentage ||
    calculateDiscountPercentage(product.price, product.old_price);

  const hasOldPrice =
    Boolean(product.old_price) &&
    Number(product.old_price) > Number(product.price);

  const isAdding = addState === "adding";

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (quantityTimerRef.current !== null) {
        window.clearTimeout(quantityTimerRef.current);
      }

      if (addTimerRef.current !== null) {
        window.clearTimeout(addTimerRef.current);
      }

      if (confirmationTimerRef.current !== null) {
        window.clearTimeout(confirmationTimerRef.current);
      }
    };
  }, []);

  function updateQuantity(nextQuantity: number) {
    if (
      isChangingQuantity ||
      isAdding ||
      nextQuantity < 1 ||
      nextQuantity > 99
    ) {
      return;
    }

    setIsChangingQuantity(true);
    setQuantity(nextQuantity);

    if (quantityTimerRef.current !== null) {
      window.clearTimeout(quantityTimerRef.current);
    }

    quantityTimerRef.current = window.setTimeout(() => {
      setIsChangingQuantity(false);
      quantityTimerRef.current = null;
    }, 250);
  }

  function handleAddToBooking() {
    if (!product.is_available || addState === "adding") {
      return;
    }

    const selectedQuantity = quantity;

    setAddState("adding");

    if (addTimerRef.current !== null) {
      window.clearTimeout(addTimerRef.current);
    }

    addTimerRef.current = window.setTimeout(() => {
      addItem(product, selectedQuantity);

      setAddState("added");
      addTimerRef.current = null;

      if (confirmationTimerRef.current !== null) {
        window.clearTimeout(confirmationTimerRef.current);
      }

      confirmationTimerRef.current = window.setTimeout(() => {
        setAddState("idle");
        confirmationTimerRef.current = null;
      }, 1400);
    }, 400);
  }

  const addButtonText = !product.is_available
    ? "Currently unavailable"
    : addState === "adding"
      ? "Adding to booking..."
      : addState === "added"
        ? "Added to booking"
        : "Add to booking";

  return (
    <div className="w-full min-w-0">
      <nav
        className="mb-4 flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-slate-500 sm:mb-6 sm:gap-1.5 sm:text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="rounded-sm transition hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Home
        </Link>

        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
          aria-hidden="true"
        />

        <Link
          href="/products"
          className="rounded-sm transition hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Products
        </Link>

        {product.category_name ? (
          <>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
              aria-hidden="true"
            />

            <Link
              href={
                product.category_slug
                  ? `/categories/${product.category_slug}`
                  : "/categories"
              }
              className="max-w-full truncate rounded-sm transition hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {product.category_name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid min-w-0 gap-7 lg:grid-cols-2 lg:gap-12">
        <div className="relative flex min-h-72 min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:min-h-120 sm:rounded-3xl sm:p-8">
          {imageUrl && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-72 w-full max-w-full object-contain sm:max-h-115"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-slate-400">
              <ImageIcon className="h-10 w-10" aria-hidden="true" />

              <span className="text-sm font-bold">
                No product image available
              </span>
            </div>
          )}

          {discountPercentage > 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm sm:left-5 sm:top-5 sm:px-3 sm:py-1.5 sm:text-sm">
              Save {discountPercentage}%
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          {product.category_name ? (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700 sm:text-xs sm:tracking-[0.16em]">
              {product.category_name}
            </p>
          ) : null}

          <h1 className="mt-2 wrap-break-word text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 space-y-1">
            {product.brand_name ? (
              <p className="text-xs text-slate-500 sm:text-sm">
                Brand:{" "}
                <span className="font-bold text-slate-700">
                  {product.brand_name}
                </span>
              </p>
            ) : null}

            {product.quantity ? (
              <p className="text-xs text-slate-500 sm:text-sm">
                Size:{" "}
                <span className="font-bold text-slate-700">
                  {product.quantity}
                </span>
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="whitespace-nowrap text-2xl font-black text-slate-950 sm:text-3xl">
              {formatCurrency(product.price)}
            </p>

            {hasOldPrice ? (
              <p className="whitespace-nowrap text-sm font-semibold text-slate-400 line-through sm:text-lg">
                {formatCurrency(product.old_price)}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <CheckCircle2
              className={
                product.is_available
                  ? "h-5 w-5 shrink-0 text-emerald-600"
                  : "h-5 w-5 shrink-0 text-red-600"
              }
              aria-hidden="true"
            />

            <span
              className={
                product.is_available
                  ? "text-sm font-bold text-emerald-700"
                  : "text-sm font-bold text-red-700"
              }
            >
              {product.is_available
                ? "Available for booking"
                : "Currently unavailable"}
            </span>
          </div>

          {product.description ? (
            <p className="mt-5 wrap-break-word text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base">
              {product.description}
            </p>
          ) : null}

          <div className="mt-7 flex min-w-0 flex-col gap-3 sm:mt-8 sm:flex-row">
            <div
              className="flex h-12 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-fit"
              aria-label="Select quantity"
            >
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1 || isChangingQuantity || isAdding}
                className="flex h-full flex-1 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-90 sm:w-12 sm:flex-none"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>

              <span
                className="flex h-full min-w-14 items-center justify-center border-x border-slate-200 px-3 text-sm font-black text-slate-950 sm:min-w-12"
                aria-live="polite"
              >
                {isChangingQuantity ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin text-amber-700"
                    aria-label="Updating quantity"
                  />
                ) : (
                  quantity
                )}
              </span>

              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= 99 || isChangingQuantity || isAdding}
                className="flex h-full flex-1 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-90 sm:w-12 sm:flex-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToBooking}
              disabled={!product.is_available || isAdding}
              className={[
                "flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] sm:px-6",
                addState === "added"
                  ? "bg-emerald-600 text-white focus-visible:ring-emerald-600"
                  : "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300",
              ].join(" ")}
              aria-live="polite"
            >
              {addState === "adding" ? (
                <LoaderCircle
                  className="h-5 w-5 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : addState === "added" ? (
                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <ShoppingBasket
                  className="h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
              )}

              <span className="truncate">{addButtonText}</span>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-950">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <p className="text-xs leading-6 sm:text-sm">
              Adding this item does not complete a purchase. SamWest will
              confirm availability, quantity and the final booking details with
              you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
