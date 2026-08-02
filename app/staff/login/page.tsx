"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  getStaffAccount,
  getStaffErrorMessage,
  loginStaff,
} from "@/lib/staff-api";

export default function StaffLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        await getStaffAccount();

        if (isMounted) {
          router.replace("/staff/bookings");
        }
      } catch {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");

      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");

      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await loginStaff({
        email: normalizedEmail,
        password,
      });

      router.replace("/staff/bookings");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        getStaffErrorMessage(
          error,
          "Login failed. Please check your details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <span
            className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-bold text-slate-600">
            Checking management session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-slate-950 px-4 py-10 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.2),transparent_38%)]" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to SamWest
        </Link>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          <div className="bg-amber-600 px-6 py-5 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-100">
                  Protected area
                </p>

                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  Booking manager
                </h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <p className="text-sm leading-6 text-slate-600">
              Sign in to review customer bookings and update their progress.
            </p>

            {errorMessage ? (
              <div
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800"
                role="alert"
              >
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                <p className="text-xs font-semibold leading-5">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <label
                htmlFor="staff-email"
                className="mb-1.5 block text-xs font-extrabold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    setErrorMessage("");
                  }}
                  placeholder="manager@samwest.co.ke"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="staff-password"
                className="mb-1.5 block text-xs font-extrabold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    setErrorMessage("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-extrabold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Sign in securely
                </>
              )}
            </button>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              Access is restricted to authorised SamWest booking managers.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
