"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  BadgePercent,
  Clock3,
  Flame,
  Grid2X2,
  Mail,
  MapPin,
  MessageCircle,
  PackageSearch,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa6";

import Container from "@/components/ui/Container";

const sectionLinks = [
  {
    label: "Categories",
    href: "/#categories",
    icon: Grid2X2,
  },
  {
    label: "Featured",
    href: "/#featured",
    icon: Star,
  },
  {
    label: "Deals",
    href: "/#deals",
    icon: BadgePercent,
  },
  {
    label: "Popular",
    href: "/#popular",
    icon: Flame,
  },
  {
    label: "New arrivals",
    href: "/#new-arrivals",
    icon: Sparkles,
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    icon: MessageCircle,
  },
];

const shopLinks = [
  {
    label: "All products",
    href: "/products",
  },
  {
    label: "Product categories",
    href: "/categories",
  },
  {
    label: "Your booking",
    href: "/booking",
  },
  {
    label: "Latest products",
    href: "/products?ordering=-created_at",
  },
  {
    label: "Popular products",
    href: "/products?ordering=-views",
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: FaInstagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/254756348344",
    icon: FaWhatsapp,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
    icon: FaTiktok,
  },
  {
    label: "Call",
    href: "tel:+254756348344",
    icon: Phone,
  },
  
];

export default function Footer() {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <footer id="contact" className="mt-14 bg-slate-950 text-slate-300">
      <div className="border-b border-white/10 bg-slate-900">
        <Container className="flex items-center gap-3 py-4">
          <div className="hidden shrink-0 sm:block">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-400">
              Quick navigation
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Jump to a homepage section
            </p>
          </div>

          <nav
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 py-1 sm:ml-5"
            aria-label="Jump to homepage section"
          >
            {sectionLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-extrabold text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500 hover:text-slate-950"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />

                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 transition hover:bg-amber-400"
            aria-label="Scroll back to the top"
            title="Back to top"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </Container>
      </div>

      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.9fr_1fr] lg:py-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="SamWest home"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-slate-950">
              S
            </span>

            <span className="leading-none">
              <span className="block text-2xl font-black tracking-tight text-white">
                Sam
                <span className="text-amber-500">West</span>
              </span>

              <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                Smart savings
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            Browse selected products, add what you need to your booking and send
            it through WhatsApp. SamWest will confirm availability and the final
            details.
          </p>

          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-white">
              Follow SamWest
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:-translate-y-0.5 hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950"
                    aria-label={`Follow SamWest on ${social.label}`}
                    title={social.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-white">
            Shop
          </h2>

          <ul className="mt-5 space-y-3">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />

                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-white">
            Explore
          </h2>

          <ul className="mt-5 space-y-3">
            {sectionLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />

                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-white">
            Contact
          </h2>

          <ul className="mt-5 space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />

              <span>Serving customers across Kenya</span>
            </li>

            <li className="flex items-start gap-3">
              <MessageCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />

              <span>WhatsApp booking confirmation</span>
            </li>

            <li className="flex items-start gap-3">
              <Phone
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />

              <span>Telephone confirmation available</span>
            </li>

            <li className="flex items-start gap-3">
              <Mail
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />

              <span>Customer support</span>
            </li>

            <li className="flex items-start gap-3">
              <Clock3
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />

              <span>Confirmation during business hours</span>
            </li>
          </ul>

          <Link
            href="/products"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-black text-slate-950 transition hover:bg-amber-400"
          >
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
            Browse products
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} SamWest. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 font-bold text-slate-400 transition hover:text-amber-400"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </Container>
      </div>
    </footer>
  );
}
