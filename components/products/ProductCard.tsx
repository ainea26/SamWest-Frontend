"use client";

import Link from "next/link";
import { Star } from "lucide-react";
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api";

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
    }, 1200);
  }

  return (
    <article className="group flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="relative min-w-0 overflow-hidden bg-white">
        <Link
          href={`/products/${product.slug}`}
          className="flex aspect-square min-w-0 items-center justify-center overflow-hidden bg-slate-50"
          aria-label={`View ${product.name}`}
        >
          {imageUrl && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full max-w-full object-contain p-2 transition duration-300 group-hover:scale-105 min-[380px]:p-2.5 sm:p-4"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="px-2 text-center text-[9px] font-bold leading-4 text-slate-400 min-[380px]:text-[10px] sm:text-xs">
              No image
            </span>
          )}
        </Link>

        {discountPercentage > 0 ? (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm min-[380px]:left-2 min-[380px]:top-2 min-[380px]:px-2 min-[380px]:py-1 min-[380px]:text-[9px] sm:left-3 sm:top-3 sm:text-[10px]">
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
          </span>
        ) : null}

        {!product.is_available ? (
          <div className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-slate-950/90 px-1.5 py-1 text-center text-[8px] font-extrabold leading-3 text-white min-[380px]:inset-x-2 min-[380px]:bottom-2 min-[380px]:text-[9px] sm:inset-x-3 sm:bottom-3 sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-xs">
            Currently unavailable
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2 min-[380px]:p-2.5 sm:p-4">
        {product.category_name ? (
          <Link
            href={
              product.category_slug
                ? `/categories/${product.category_slug}`
                : "/categories"
            }
            className="mb-1 block max-w-full truncate text-[8px] font-extrabold uppercase tracking-[0.08em] text-amber-700 transition hover:text-amber-800 min-[380px]:text-[9px] sm:text-[10px] sm:tracking-[0.12em]"
            title={product.category_name}
          >
            {product.category_name}
          </Link>
        ) : null}

        <Link href={`/products/${product.slug}`} className="block min-w-0">
          <h2 className="line-clamp-2 min-h-8 wrap-break-word text-[10px] font-bold leading-4 text-slate-900 transition group-hover:text-amber-700 min-[380px]:text-[11px] sm:min-h-10 sm:text-sm sm:leading-5">
            {product.name}
          </h2>
        </Link>

        {product.quantity ? (
          <p
            className="mt-0.5 max-w-full truncate text-[8px] font-medium text-slate-500 min-[380px]:text-[9px] sm:mt-1 sm:text-xs"
            title={product.quantity}
          >
            {product.quantity}
          </p>
        ) : null}

        <div className="mt-auto min-w-0 pt-2 sm:pt-3">
          <div className="flex min-h-5 min-w-0 max-w-full items-baseline gap-1 overflow-hidden sm:min-h-7 sm:gap-1.5">
            <p className="shrink-0 whitespace-nowrap text-[12px] font-black leading-5 text-slate-950 min-[360px]:text-[13px] sm:text-base xl:text-lg">
              {formatCurrency(product.price)}
            </p>

            {hasOldPrice ? (
              <p
                className="min-w-0 flex-1 truncate whitespace-nowrap text-[8px] font-semibold text-slate-400 line-through min-[380px]:text-[9px] sm:text-xs"
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
              "mt-2 flex h-8 w-full min-w-0 items-center justify-center rounded-lg px-1.5 text-center text-[9px] font-extrabold leading-3 transition min-[380px]:h-9 min-[380px]:px-2 min-[380px]:text-[10px] sm:mt-3 sm:h-10 sm:text-xs",
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-slate-950 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400",
            ].join(" ")}
            aria-label={`Add ${product.name} to booking`}
          >
            <span className="max-w-full wrap-break-word">
              {!product.is_available
                ? "Unavailable"
                : justAdded
                  ? "Added"
                  : "Add to booking"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
