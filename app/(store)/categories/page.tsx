import type { Metadata } from "next";

import CategoryBrowser from "@/components/categories/CategoryBrowser";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { getCategories, unwrapResults } from "@/lib/api";
import type { Category } from "@/types/category";

export const metadata: Metadata = {
  title: "Product Categories",

  description:
    "Browse SamWest product categories including groceries, household products, personal care, food, drinks and other selected products in Kenya.",

  alternates: {
    canonical: "/categories",
  },

  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "SamWest",
    url: "/categories",
    title: "Product Categories | SamWest",
    description:
      "Browse SamWest products by category and find groceries, household essentials and more.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Product Categories | SamWest",
    description:
      "Browse SamWest products by category and find groceries, household essentials and more.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const response = await getCategories();

    categories = unwrapResults(response);
  } catch {
    categories = [];
  }

  return (
    <main className="w-full min-w-0 max-w-full overflow-x-clip bg-slate-50 py-5 sm:py-8 lg:py-10">
      <Container>
        <header className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 sm:text-xs">
            Shop your way
          </p>

          <h1 className="mt-1.5 wrap-break-word text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Product categories
          </h1>

          <p className="mt-2 max-w-2xl wrap-break-word text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            Browse groceries, household products, electronics, personal care and
            other selected products available through SamWest.
          </p>
        </header>

        <div className="mt-5 min-w-0 sm:mt-7">
          {categories.length > 0 ? (
            <CategoryBrowser categories={categories} />
          ) : (
            <EmptyState
              title="No categories available"
              description="Product categories will appear here once they are available."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
