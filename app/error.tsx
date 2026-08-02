"use client";

import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      "SamWest application error:",
      error,
    );
  }, [error]);

  return (
    <main className="relative flex min-h-[75dvh] items-center overflow-hidden bg-slate-50 px-3 py-10 min-[360px]:px-4 sm:px-6">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

      <section className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl min-[360px]:rounded-3xl">
        <div className="bg-slate-950 px-4 py-5 text-white min-[360px]:px-6 min-[360px]:py-7 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 min-[360px]:h-12 min-[360px]:w-12">
              <TriangleAlert
                className="h-5 w-5 min-[360px]:h-6 min-[360px]:w-6"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-amber-400 min-[360px]:text-[10px] min-[360px]:tracking-[0.16em]">
                SamWest encountered a problem
              </p>

              <h1 className="mt-1 wrap-break-word text-lg font-black leading-tight min-[360px]:text-2xl">
                Something went wrong
              </h1>
            </div>
          </div>
        </div>

        <div className="p-4 min-[360px]:p-6 sm:p-8">
          <p className="text-xs leading-6 text-slate-600 min-[360px]:text-sm min-[360px]:leading-7">
            We could not complete this request. Your booking items have not
            been removed, so you can safely try again.
          </p>

          {error.digest ? (
            <div className="mt-4 min-w-0 rounded-xl bg-slate-100 p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 min-[360px]:text-[10px]">
                Error reference
              </p>

              <p className="mt-1 wrap-break-word font-mono text-[10px] font-bold text-slate-600 min-[360px]:text-xs">
                {error.digest}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-2 min-[300px]:grid-cols-2 min-[360px]:gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-extrabold text-white transition hover:bg-amber-700 min-[360px]:h-12 min-[360px]:text-sm"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />
              Try again
            </button>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 min-[360px]:h-12 min-[360px]:text-sm"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
              Return home
            </Link>
          </div>

          <p className="mt-5 text-center text-[9px] leading-5 text-slate-400 min-[360px]:text-[10px]">
            If the problem continues, contact SamWest and include the error
            reference shown above.
          </p>
        </div>
      </section>
    </main>
  );
}
