"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { calculateDiscountPercentage, formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

type ProductDetailsProps = {
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

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useBooking();

  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = getImageUrl(product.image_url || product.image);

  const discountPercentage =
    product.discount_percentage ||
    calculateDiscountPercentage(product.price, product.old_price);

  return (
    <div>
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-amber-700">
          Home
        </Link>

        <ChevronRight className="h-4 w-4" aria-hidden="true" />

        <Link href="/products" className="hover:text-amber-700">
          Products
        </Link>

        {product.category_name ? (
          <>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />

            <Link
              href={
                product.category_slug
                  ? `/categories/${product.category_slug}`
                  : "/categories"
              }
              className="hover:text-amber-700"
            >
              {product.category_name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:min-h-130">
          {imageUrl && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-115 w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="text-sm font-bold text-slate-400">
              No product image available
            </span>
          )}

          {discountPercentage > 0 ? (
            <span className="absolute left-5 top-5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-black text-white">
              Save {discountPercentage}%
            </span>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          {product.category_name ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
              {product.category_name}
            </p>
          ) : null}

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {product.name}
          </h1>

          {product.brand_name ? (
            <p className="mt-3 text-sm text-slate-500">
              Brand:{" "}
              <span className="font-bold text-slate-700">
                {product.brand_name}
              </span>
            </p>
          ) : null}

          {product.quantity ? (
            <p className="mt-1 text-sm text-slate-500">
              Size:{" "}
              <span className="font-bold text-slate-700">
                {product.quantity}
              </span>
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-black text-slate-950">
              {formatCurrency(product.price)}
            </p>

            {product.old_price &&
            Number(product.old_price) > Number(product.price) ? (
              <p className="pb-1 text-lg font-semibold text-slate-400 line-through">
                {formatCurrency(product.old_price)}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <CheckCircle2
              className={
                product.is_available
                  ? "h-5 w-5 text-emerald-600"
                  : "h-5 w-5 text-red-600"
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
            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              {product.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>

              <span className="flex h-full min-w-12 items-center justify-center border-x border-slate-200 px-3 text-sm font-black text-slate-950">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                disabled={quantity >= 99}
                className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addItem(product, quantity)}
              disabled={!product.is_available}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-sm font-extrabold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              Add to booking
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-950">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <p className="text-sm leading-6">
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
