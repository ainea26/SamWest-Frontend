"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";

import Container from "@/components/ui/Container";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

type PromoCarouselProps = {
  products: Product[];
};

const AUTO_PLAY_DELAY = 4500;
const TRANSITION_DURATION = 650;
const RESET_FALLBACK_DELAY = TRANSITION_DURATION + 250;

const campaigns = [
  {
    eyebrow: "Need it fast?",
    title: "Get it in 90 minutes",
    description:
      "Select what you need and let SamWest handle the confirmation.",
    icon: Clock3,
    background: "from-amber-500 via-orange-500 to-orange-600",
  },
  {
    eyebrow: "Smart savings",
    title: "Save 20% on selected products",
    description: "Enjoy better prices across selected everyday essentials.",
    icon: Tag,
    background: "from-slate-950 via-slate-900 to-amber-950",
  },
  {
    eyebrow: "Easy booking",
    title: "Book directly through WhatsApp",
    description:
      "Build your list and send it to SamWest in a few simple steps.",
    icon: MessageCircle,
    background: "from-emerald-700 via-emerald-700 to-teal-800",
  },
  {
    eyebrow: "Selected for you",
    title: "Fresh offers every day",
    description: "Discover popular products and recently added deals.",
    icon: Sparkles,
    background: "from-blue-700 via-blue-600 to-sky-500",
  },
  {
    eyebrow: "Shop confidently",
    title: "Availability confirmed first",
    description:
      "We confirm products, quantities and final details before fulfilment.",
    icon: ShieldCheck,
    background: "from-fuchsia-800 via-purple-700 to-rose-600",
  },
];

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

export default function PromoCarousel({ products }: PromoCarouselProps) {
  const slides = useMemo(
    () =>
      products.slice(0, 5).map((product, index) => ({
        product,
        campaign: campaigns[index % campaigns.length],
      })),
    [products],
  );

  const extendedSlides = useMemo(() => {
    if (slides.length <= 1) {
      return slides;
    }

    return [slides[slides.length - 1], ...slides, slides[0]];
  }, [slides]);

  const initialPosition = slides.length > 1 ? 1 : 0;

  const [slidePosition, setSlidePosition] = useState(initialPosition);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  const positionRef = useRef(initialPosition);
  const isAnimatingRef = useRef(false);
  const resetTimeoutRef = useRef<number | null>(null);
  const firstFrameRef = useRef<number | null>(null);
  const secondFrameRef = useRef<number | null>(null);

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const clearAnimationFrames = useCallback(() => {
    if (firstFrameRef.current !== null) {
      window.cancelAnimationFrame(firstFrameRef.current);
      firstFrameRef.current = null;
    }

    if (secondFrameRef.current !== null) {
      window.cancelAnimationFrame(secondFrameRef.current);
      secondFrameRef.current = null;
    }
  }, []);

  const enableTransitionAfterJump = useCallback(() => {
    clearAnimationFrames();

    firstFrameRef.current = window.requestAnimationFrame(() => {
      secondFrameRef.current = window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        isAnimatingRef.current = false;
        firstFrameRef.current = null;
        secondFrameRef.current = null;
      });
    });
  }, [clearAnimationFrames]);

  const normalizePosition = useCallback(
    (force = false) => {
      if (slides.length <= 1) {
        positionRef.current = 0;
        setSlidePosition(0);
        setTransitionEnabled(false);
        isAnimatingRef.current = false;
        return;
      }

      const currentPosition = positionRef.current;
      let normalizedPosition = currentPosition;

      if (currentPosition <= 0) {
        normalizedPosition = slides.length;
      } else if (currentPosition >= slides.length + 1) {
        normalizedPosition = 1;
      }

      if (normalizedPosition !== currentPosition || force) {
        setTransitionEnabled(false);
        positionRef.current = normalizedPosition;
        setSlidePosition(normalizedPosition);
        enableTransitionAfterJump();
        return;
      }

      isAnimatingRef.current = false;
    },
    [enableTransitionAfterJump, slides.length],
  );

  const scheduleMovementFallback = useCallback(() => {
    clearResetTimeout();

    resetTimeoutRef.current = window.setTimeout(() => {
      normalizePosition();
    }, RESET_FALLBACK_DELAY);
  }, [clearResetTimeout, normalizePosition]);

  const moveBy = useCallback(
    (direction: 1 | -1) => {
      if (slides.length <= 1 || isAnimatingRef.current) {
        return;
      }

      let currentPosition = positionRef.current;

      if (currentPosition <= 0 || currentPosition >= slides.length + 1) {
        currentPosition =
          ((((currentPosition - 1) % slides.length) + slides.length) %
            slides.length) +
          1;

        positionRef.current = currentPosition;
        setTransitionEnabled(false);
        setSlidePosition(currentPosition);
      }

      const nextPosition = currentPosition + direction;

      isAnimatingRef.current = true;
      positionRef.current = nextPosition;
      setTransitionEnabled(true);
      setSlidePosition(nextPosition);
      scheduleMovementFallback();
    },
    [scheduleMovementFallback, slides.length],
  );

  const showPrevious = useCallback(() => moveBy(-1), [moveBy]);
  const showNext = useCallback(() => moveBy(1), [moveBy]);

  const showSlide = useCallback(
    (index: number) => {
      if (
        slides.length <= 1 ||
        index < 0 ||
        index >= slides.length ||
        isAnimatingRef.current
      ) {
        return;
      }

      clearResetTimeout();
      clearAnimationFrames();

      const nextPosition = index + 1;

      isAnimatingRef.current = true;
      positionRef.current = nextPosition;
      setTransitionEnabled(true);
      setSlidePosition(nextPosition);
      scheduleMovementFallback();
    },
    [
      clearAnimationFrames,
      clearResetTimeout,
      scheduleMovementFallback,
      slides.length,
    ],
  );

  useEffect(() => {
    clearResetTimeout();
    clearAnimationFrames();

    const nextPosition = slides.length > 1 ? 1 : 0;

    positionRef.current = nextPosition;
    isAnimatingRef.current = false;
    setTransitionEnabled(false);
    setSlidePosition(nextPosition);

    if (slides.length > 1) {
      enableTransitionAfterJump();
    }

    return () => {
      clearResetTimeout();
      clearAnimationFrames();
    };
  }, [
    clearAnimationFrames,
    clearResetTimeout,
    enableTransitionAfterJump,
    slides.length,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      const hidden = document.hidden;

      setIsDocumentHidden(hidden);

      if (!hidden && slides.length > 1) {
        clearResetTimeout();
        normalizePosition(true);
      }
    }

    setIsDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearResetTimeout, normalizePosition, slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || isDocumentHidden) {
      return;
    }

    const timeoutId = window.setTimeout(showNext, AUTO_PLAY_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [isDocumentHidden, isPaused, showNext, slidePosition, slides.length]);

  useEffect(() => {
    return () => {
      clearResetTimeout();
      clearAnimationFrames();
    };
  }, [clearAnimationFrames, clearResetTimeout]);

  if (slides.length === 0) {
    return null;
  }

  const activeIndex =
    slides.length === 1
      ? 0
      : (((slidePosition - 1) % slides.length) + slides.length) % slides.length;

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform"
    ) {
      return;
    }

    clearResetTimeout();
    normalizePosition();
  }

  return (
    <section
      className="py-[clamp(0.75rem,3vw,1.25rem)]"
      aria-label="SamWest promotions"
    >
      <Container>
        <div
          className="group relative isolate min-w-0 overflow-hidden rounded-2xl bg-slate-950 shadow-lg"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsPaused(false);
            }
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured SamWest promotions"
        >
          <div
            className={
              transitionEnabled
                ? "flex transition-transform ease-in-out"
                : "flex"
            }
            style={{
              transform: `translate3d(-${slidePosition * 100}%, 0, 0)`,
              transitionDuration: transitionEnabled
                ? `${TRANSITION_DURATION}ms`
                : "0ms",
              willChange: "transform",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedSlides.map(({ product, campaign }, index) => {
              const CampaignIcon = campaign.icon;
              const imageUrl = getImageUrl(product.image_url || product.image);

              return (
                <article
                  key={`${product.id}-${index}`}
                  className={`relative flex h-[clamp(13.5rem,58vw,16rem)] w-full shrink-0 overflow-hidden bg-linear-to-r ${campaign.background} text-white sm:h-68 lg:h-72`}
                  aria-hidden={slides.length > 1 && index !== slidePosition}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.2),transparent_36%)]" />

                  <div className="relative grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_minmax(5.75rem,32%)] items-center gap-[clamp(0.5rem,2.5vw,1.25rem)] px-[clamp(1rem,4vw,2.5rem)] py-4 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,27%)] sm:py-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-14">
                    <div className="min-w-0 pb-5 sm:pb-0">
                      <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] backdrop-blur-sm sm:text-[10px]">
                        <CampaignIcon
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{campaign.eyebrow}</span>
                      </div>

                      <h2 className="mt-2.5 max-w-2xl text-balance text-[clamp(1.15rem,5.4vw,2.5rem)] font-black leading-[1.08] tracking-tight sm:mt-3">
                        {campaign.title}
                      </h2>

                      <p className="mt-2 hidden max-w-xl text-pretty text-sm leading-6 text-white/80 min-[430px]:block">
                        {campaign.description}
                      </p>

                      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-2.5 text-[9px] font-black text-slate-950 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:gap-1.5 sm:px-4 sm:text-xs"
                        >
                          View product
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>

                        <span className="max-w-full truncate rounded-lg bg-black/20 px-2 py-2 text-[9px] font-black backdrop-blur-sm sm:px-3 sm:text-xs">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="relative flex h-[clamp(8rem,40vw,11rem)] min-w-0 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white/95 p-2 shadow-xl sm:h-52 sm:rounded-2xl sm:p-4 lg:h-60"
                      aria-label={`View ${product.name}`}
                      tabIndex={
                        slides.length > 1 && index !== slidePosition ? -1 : 0
                      }
                    >
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full max-w-full object-contain"
                          loading={index <= 2 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      ) : (
                        <span className="text-center text-[10px] font-bold text-slate-400 sm:text-xs">
                          No image
                        </span>
                      )}

                      <span className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 rounded-md bg-slate-950/85 px-1.5 py-1 text-center text-[8px] font-bold leading-3 text-white backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-2 sm:py-1.5 sm:text-[10px] sm:leading-4">
                        {product.name}
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                disabled={isAnimatingRef.current}
                className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-3 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={showNext}
                disabled={isAnimatingRef.current}
                className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-3 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm sm:bottom-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.product.id}
                    type="button"
                    onClick={() => showSlide(index)}
                    className={
                      activeIndex === index
                        ? "h-2 w-5 rounded-full bg-white transition-all"
                        : "h-2 w-2 rounded-full bg-white/50 transition-all hover:bg-white/80"
                    }
                    aria-label={`Show promotion ${index + 1}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
