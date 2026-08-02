"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/formatters";
import type { BookingItem as BookingItemType } from "@/types/booking";

type BookingItemProps = {
  item: BookingItemType;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
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

export default function BookingItem({
  item,
  onRemove,
  onUpdateQuantity,
}: BookingItemProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const { product, quantity } = item;

  const imageUrl = getImageUrl(product.image_url || product.image);

  const parsedPrice = Number.parseFloat(product.price);

  const unitPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

  const lineTotal = unitPrice * quantity;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <article className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 min-[380px]:rounded-2xl min-[380px]:p-3">
      <div className="flex min-w-0 gap-2 min-[380px]:gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 min-[380px]:h-22 min-[380px]:w-22 min-[380px]:rounded-xl sm:h-24 sm:w-24"
          aria-label={`View ${product.name}`}
        >
          {imageUrl && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full max-w-full object-contain p-1.5 min-[380px]:p-2"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="px-1.5 text-center text-[9px] font-bold leading-3 text-slate-400 min-[380px]:text-[10px]">
              No image
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 wrap-break-word text-[11px] font-bold leading-4 text-slate-900 transition hover:text-amber-700 min-[380px]:text-xs min-[380px]:leading-5 sm:text-sm"
              >
                {product.name}
              </Link>

              {product.quantity ? (
                <p
                  className="mt-0.5 max-w-full truncate text-[9px] text-slate-500 min-[380px]:text-[10px] sm:text-xs"
                  title={product.quantity}
                >
                  {product.quantity}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 min-[380px]:h-8 min-[380px]:w-8"
              aria-label={`Remove ${product.name}`}
            >
              <Trash2
                className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4"
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-auto flex min-w-0 items-end justify-between gap-1.5 pt-2 min-[380px]:gap-2">
            <div
              className="flex h-8 shrink-0 items-center overflow-hidden rounded-lg border border-slate-200 min-[380px]:h-9"
              aria-label={`Quantity for ${product.name}`}
            >
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 min-[380px]:w-9"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus
                  className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5"
                  aria-hidden="true"
                />
              </button>

              <span className="flex h-full min-w-7 items-center justify-center border-x border-slate-200 px-1 text-[11px] font-extrabold text-slate-900 min-[380px]:min-w-8 min-[380px]:px-1.5 min-[380px]:text-xs">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                disabled={quantity >= 99}
                className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 min-[380px]:w-9"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus
                  className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden text-right">
              {quantity > 1 ? (
                <p className="truncate whitespace-nowrap text-[8px] text-slate-400 min-[380px]:text-[9px] sm:text-[11px]">
                  {formatCurrency(unitPrice)} each
                </p>
              ) : null}

              <p className="truncate whitespace-nowrap text-[11px] font-black text-slate-950 min-[380px]:text-xs sm:text-sm">
                {formatCurrency(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
