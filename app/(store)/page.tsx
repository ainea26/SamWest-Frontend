import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  PhoneCall,
  ShoppingBasket,
  TriangleAlert,
} from "lucide-react";

import DealsSection from "@/components/home/DealsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import PopularProducts from "@/components/home/PopularProducts";
import PromoCarousel from "@/components/home/PromoCarousel";
import Container from "@/components/ui/Container";
import { getHomepageProducts, getProducts, unwrapResults } from "@/lib/api";
import type { HomepageProducts } from "@/types/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://samwestonline.com";

export const metadata: Metadata = {
  title: "Online Supermarket in Kenya",
  description:
    "Shop groceries, household essentials, food, drinks, personal care products and more online from SamWest in Kenya.",

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "SamWest",
    title: "SamWest | Online Supermarket in Kenya",
    description:
      "Shop groceries, household essentials, food, drinks and more online from SamWest in Kenya.",
  },

  twitter: {
    card: "summary_large_image",
    title: "SamWest | Online Supermarket in Kenya",
    description:
      "Shop groceries, household essentials, food, drinks and more online from SamWest in Kenya.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "SamWest",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "SamWest",
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const emptyHomepage: HomepageProducts = {
  featured: [],
  deals: [],
  popular: [],
  new_arrivals: [],
};

export default async function HomePage() {
  const [homepageResult, fallbackProductsResult] = await Promise.allSettled([
    getHomepageProducts(8),

    getProducts({
      page: 1,
      page_size: 24,
      is_available: true,
      ordering: "-created_at",
    }),
  ]);

  const homepage =
    homepageResult.status === "fulfilled"
      ? homepageResult.value
      : emptyHomepage;

  const fallbackProducts =
    fallbackProductsResult.status === "fulfilled"
      ? unwrapResults(fallbackProductsResult.value)
      : [];

  const allHomepageProducts = [
    ...homepage.featured,
    ...homepage.deals,
    ...homepage.popular,
    ...homepage.new_arrivals,
    ...fallbackProducts,
  ];

  const uniqueProducts = Array.from(
    new Map(
      allHomepageProducts.map((product) => [product.id, product]),
    ).values(),
  );

  const advertProducts = uniqueProducts.slice(0, 5);

  const featuredProducts =
    homepage.featured.length > 0
      ? homepage.featured
      : uniqueProducts.slice(0, 8);

  const dealProducts =
    homepage.deals.length > 0 ? homepage.deals : uniqueProducts.slice(0, 8);

  const popularProducts =
    homepage.popular.length > 0
      ? homepage.popular
      : uniqueProducts.slice(8, 16).length > 0
        ? uniqueProducts.slice(8, 16)
        : uniqueProducts.slice(0, 8);

  const newArrivalProducts =
    homepage.new_arrivals.length > 0
      ? homepage.new_arrivals
      : fallbackProducts.slice(0, 8);

  const productsCouldNotLoad =
    homepageResult.status === "rejected" &&
    fallbackProductsResult.status === "rejected";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(websiteJsonLd),
        }}
      />

      <PromoCarousel products={advertProducts} />

      {productsCouldNotLoad ? (
        <section className="py-10">
          <Container>
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <TriangleAlert
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              <div>
                <h2 className="font-black">Products could not be loaded</h2>

                <p className="mt-1 text-sm leading-6">
                  We could not connect to the SamWest product service. Please
                  refresh the page or try again shortly.
                </p>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <>
          <FeaturedProducts products={featuredProducts} />

          <DealsSection products={dealProducts} />

          <PopularProducts products={popularProducts} />

          <NewArrivals products={newArrivalProducts} />
        </>
      )}

      <section
        id="how-it-works"
        className="bg-slate-950 py-14 text-white sm:py-20"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-400">
              Simple and convenient
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              How your SamWest booking works
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Choose the products you need and let our team handle the
              confirmation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: ShoppingBasket,
                title: "Select your products",
                description:
                  "Browse the catalogue and add your preferred products and quantities.",
              },
              {
                number: "02",
                icon: MessageCircle,
                title: "Send through WhatsApp",
                description:
                  "Review your list and send the prepared booking message to SamWest.",
              },
              {
                number: "03",
                icon: PhoneCall,
                title: "Receive confirmation",
                description:
                  "Our team checks availability and calls you to confirm the final details.",
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>

                    <span className="text-4xl font-black text-white/10">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black">{step.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400"
            >
              Start browsing
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
