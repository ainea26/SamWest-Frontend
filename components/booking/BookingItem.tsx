"use client";

import Link from "next/link";
import { ImageIcon, LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatCurrency } from "@/lib/formatters";
import type { BookingItem as BookingItemType } from "@/types/booking";

type BookingItemProps = {
  item: BookingItemType;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
};

type PendingAction = "increase" | "decrease" | "remove" | null;

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

export default function BookingItem({
  item,
  onRemove,
  onUpdateQuantity,
}: BookingItemProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const feedbackTimerRef = useRef<number | null>(null);

  const removeTimerRef = useRef<number | null>(null);

  const { product, quantity } = item;

  const imageUrl = getImageUrl(product.image_url || product.image);

  const parsedPrice = Number.parseFloat(product.price);

  const unitPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

  const lineTotal = unitPrice * quantity;

  const isProcessing = pendingAction !== null;

  const isChangingQuantity =
    pendingAction === "increase" || pendingAction === "decrease";

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }

      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, []);

  function finishFeedbackAfter(milliseconds: number) {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setPendingAction(null);
      feedbackTimerRef.current = null;
    }, milliseconds);
  }

  function handleQuantityChange(
    nextQuantity: number,
    action: "increase" | "decrease",
  ) {
    if (isProcessing) {
      return;
    }

    if (nextQuantity < 1) {
      handleRemove();
      return;
    }

    if (nextQuantity > 99) {
      return;
    }

    setPendingAction(action);

    onUpdateQuantity(product.id, nextQuantity);

    finishFeedbackAfter(300);
  }

  function handleRemove() {
    if (isProcessing) {
      return;
    }

    setPendingAction("remove");

    removeTimerRef.current = window.setTimeout(() => {
      onRemove(product.id);
      removeTimerRef.current = null;
    }, 350);
  }

  return (
    <article
      className={[
        "w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-white p-2.5 transition min-[380px]:rounded-2xl min-[380px]:p-3",
        pendingAction === "remove"
          ? "border-red-200 opacity-70"
          : "border-slate-200",
      ].join(" ")}
      aria-busy={isProcessing}
    >
      <div className="flex min-w-0 gap-2 min-[380px]:gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-[380px]:h-22 min-[380px]:w-22 min-[380px]:rounded-xl sm:h-24 sm:w-24"
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
            <div className="flex flex-col items-center gap-1 px-1.5 text-center text-slate-400">
              <ImageIcon
                className="h-4 w-4 min-[380px]:h-5 min-[380px]:w-5"
                aria-hidden="true"
              />

              <span className="text-[8px] font-bold leading-3 min-[380px]:text-[9px]">
                No image
              </span>
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 wrap-break-word rounded-sm text-[11px] font-bold leading-4 text-slate-900 transition hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-[380px]:text-xs min-[380px]:leading-5 sm:text-sm"
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
              onClick={handleRemove}
              disabled={isProcessing}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 active:scale-90 min-[380px]:h-8 min-[380px]:w-8"
              aria-label={
                pendingAction === "remove"
                  ? `Removing ${product.name}`
                  : `Remove ${product.name}`
              }
            >
              {pendingAction === "remove" ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin text-red-600"
                  aria-hidden="true"
                />
              ) : (
                <Trash2
                  className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <div className="mt-auto flex min-w-0 items-end justify-between gap-1.5 pt-2 min-[380px]:gap-2">
            <div
              className="flex h-8 shrink-0 items-center overflow-hidden rounded-lg border border-slate-200 bg-white min-[380px]:h-9"
              aria-label={`Quantity for ${product.name}`}
            >
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1, "decrease")}
                disabled={isProcessing}
                className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:bg-amber-100 disabled:cursor-wait disabled:opacity-40 active:scale-90 min-[380px]:w-9"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus
                  className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5"
                  aria-hidden="true"
                />
              </button>

              <span
                className="flex h-full min-w-8 items-center justify-center border-x border-slate-200 px-1 text-[11px] font-extrabold text-slate-900 min-[380px]:min-w-9 min-[380px]:px-1.5 min-[380px]:text-xs"
                aria-live="polite"
              >
                {isChangingQuantity ? (
                  <LoaderCircle
                    className="h-3.5 w-3.5 animate-spin text-amber-700"
                    aria-label="Updating quantity"
                  />
                ) : (
                  quantity
                )}
              </span>

              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1, "increase")}
                disabled={isProcessing || quantity >= 99}
                className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-90 min-[380px]:w-9"
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
