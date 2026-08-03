"use client";

import Link from "next/link";
import { Check, ImageIcon, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useBooking } from "@/context/BookingContext";
import { calculateDiscountPercentage, formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

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

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useBooking();

  const [imageFailed, setImageFailed] = useState(false);

  const [justAdded, setJustAdded] = useState(false);

  const addedTimeoutRef = useRef<number | null>(null);

  const imageUrl = getImageUrl(product.image_url || product.image);

  const discountPercentage =
    product.discount_percentage ||
    calculateDiscountPercentage(product.price, product.old_price);

  const hasOldPrice =
    Boolean(product.old_price) &&
    Number(product.old_price) > Number(product.price);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current !== null) {
        window.clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  function handleAddToBooking() {
    if (!product.is_available) {
      return;
    }

    addItem(product, 1);
    setJustAdded(true);

    if (addedTimeoutRef.current !== null) {
      window.clearTimeout(addedTimeoutRef.current);
    }

    addedTimeoutRef.current = window.setTimeout(() => {
      setJustAdded(false);
      addedTimeoutRef.current = null;
    }, 1400);
  }

  const buttonText = !product.is_available
    ? "Unavailable"
    : justAdded
      ? "Added"
      : "Add to booking";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/70 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
      <div className="relative min-w-0 overflow-hidden bg-slate-50">
        <Link
          href={`/products/${product.slug}`}
          className="flex aspect-square items-center justify-center overflow-hidden rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
          aria-label={`View ${product.name}`}
        >
          {imageUrl && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-105 sm:p-4"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center text-slate-400">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />

              <span className="text-[9px] font-bold sm:text-xs">
                Image unavailable
              </span>
            </div>
          )}
        </Link>

        {discountPercentage > 0 ? (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-1 text-[8px] font-black leading-none text-white shadow-sm min-[380px]:left-2 min-[380px]:top-2 min-[380px]:text-[9px] sm:left-3 sm:top-3 sm:px-2 sm:text-[10px]">
            -{discountPercentage}%
          </span>
        ) : null}

        {product.is_featured ? (
          <span
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-sm min-[380px]:right-2 min-[380px]:top-2 sm:right-3 sm:top-3 sm:h-7 sm:w-7"
            title="Featured product"
          >
            <Star
              className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />

            <span className="sr-only">Featured product</span>
          </span>
        ) : null}

        {!product.is_available ? (
          <div className="absolute inset-x-2 bottom-2 rounded-md bg-slate-950/90 px-2 py-1.5 text-center text-[9px] font-extrabold leading-3 text-white backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:rounded-lg sm:text-xs">
            Currently unavailable
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
        <div className="h-4 min-w-0">
          {product.category_name ? (
            <Link
              href={
                product.category_slug
                  ? `/categories/${product.category_slug}`
                  : "/categories"
              }
              className="block truncate rounded-sm text-[8px] font-extrabold uppercase tracking-[0.08em] text-amber-700 transition hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-[380px]:text-[9px] sm:text-[10px] sm:tracking-[0.12em]"
              title={product.category_name}
            >
              {product.category_name}
            </Link>
          ) : null}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-1 block min-w-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <h2 className="line-clamp-2 min-h-9 wrap-break-word text-[11px] font-bold leading-[1.1rem] text-slate-900 transition group-hover:text-amber-700 min-[380px]:text-xs sm:min-h-10 sm:text-sm sm:leading-5">
            {product.name}
          </h2>
        </Link>

        <div className="mt-1 h-4 min-w-0">
          {product.quantity ? (
            <p
              className="truncate text-[9px] font-medium leading-4 text-slate-500 sm:text-xs"
              title={product.quantity}
            >
              {product.quantity}
            </p>
          ) : null}
        </div>

        <div className="mt-auto min-w-0 pt-2.5 sm:pt-3">
          <div className="flex min-h-6 min-w-0 items-baseline gap-1.5 overflow-hidden">
            <p className="shrink-0 whitespace-nowrap text-[13px] font-black leading-6 tracking-tight text-slate-950 min-[380px]:text-sm sm:text-base xl:text-lg">
              {formatCurrency(product.price)}
            </p>

            {hasOldPrice ? (
              <p
                className="min-w-0 truncate whitespace-nowrap text-[9px] font-semibold text-slate-400 line-through sm:text-xs"
                title={formatCurrency(product.old_price)}
              >
                {formatCurrency(product.old_price)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToBooking}
            disabled={!product.is_available}
            className={[
              "mt-2.5 flex min-h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-center text-[10px] font-extrabold leading-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 active:scale-[0.98] sm:mt-3 sm:min-h-10 sm:text-xs",
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-slate-950 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400",
            ].join(" ")}
            aria-label={`${buttonText}: ${product.name}`}
            aria-live="polite"
          >
            {justAdded ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : null}

            <span className="truncate">{buttonText}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
