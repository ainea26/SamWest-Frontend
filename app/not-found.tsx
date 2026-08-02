import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShoppingBasket,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-slate-950 px-3 py-8 text-white min-[360px]:px-4 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_40%)]" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2"
          aria-label="SamWest home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-xs font-black text-white min-[360px]:h-10 min-[360px]:w-10 min-[360px]:text-sm">
            SW
          </span>

          <span className="text-lg font-black min-[360px]:text-xl">
            SamWest
          </span>
        </Link>

        <section className="flex flex-1 items-center justify-center py-12 sm:py-20">
          <div className="w-full max-w-2xl text-center">
            <p className="text-[clamp(5rem,28vw,11rem)] font-black leading-none tracking-tighter text-white/5">
              404
            </p>

            <div className="-mt-10 min-[360px]:-mt-14 sm:-mt-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-950/30 min-[360px]:h-16 min-[360px]:w-16">
                <Search
                  className="h-7 w-7 min-[360px]:h-8 min-[360px]:w-8"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-400 min-[360px]:text-[10px] min-[360px]:tracking-[0.18em]">
                Page not found
              </p>

              <h1 className="mx-auto mt-2 max-w-xl text-2xl font-black leading-tight tracking-tight min-[360px]:text-3xl sm:text-5xl">
                We could not find that page
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-xs leading-6 text-slate-300 min-[360px]:text-sm sm:text-base sm:leading-7">
                The page may have moved, the address may be incorrect, or the
                product may no longer be available.
              </p>

              <div className="mx-auto mt-7 grid w-full max-w-md grid-cols-1 gap-2 min-[300px]:grid-cols-2 min-[360px]:gap-3">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-extrabold text-white transition hover:bg-amber-700 min-[360px]:h-12 min-[360px]:text-sm"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Return home
                </Link>

                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-extrabold text-white transition hover:bg-white/15 min-[360px]:h-12 min-[360px]:text-sm"
                >
                  <ShoppingBasket
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Browse products
                </Link>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-[9px] font-semibold text-slate-500 min-[360px]:text-[10px]">
          SamWest smart shopping and easy booking
        </p>
      </div>
    </main>
  );
}
