import type { Metadata } from "next";

import CategoryBrowser from "@/components/categories/CategoryBrowser";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { getCategories, unwrapResults } from "@/lib/api";
import type { Category } from "@/types/category";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse SamWest products arranged by category and subcategory.",
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
    <main className="min-w-0 bg-slate-50 py-5 sm:py-8 lg:py-10">
      <Container>
        <header className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 sm:text-xs">
            Shop your way
          </p>

          <h1 className="mt-1.5 wrap-break-word text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Product categories
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            Browse groceries, household products, electronics, personal care and
            other selected products available through SamWest.
          </p>
        </header>

        <div className="mt-5 sm:mt-7">
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
