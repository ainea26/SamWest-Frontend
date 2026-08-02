import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Home, PackageSearch } from "lucide-react";

import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import Container from "@/components/ui/Container";
import { getCategories, getProducts, unwrapResults } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse the full range of selected SamWest products.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    ordering?: string;
  }>;
};

function createPageUrl(
  currentParameters: Record<string, string | undefined>,
  page: number,
): string {
  const parameters = new URLSearchParams();

  Object.entries(currentParameters).forEach(([key, value]) => {
    if (value && key !== "page") {
      parameters.set(key, value);
    }
  });

  parameters.set("page", String(page));

  return `/products?${parameters.toString()}`;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const parameters = await searchParams;

  const requestedPage = Number.parseInt(parameters.page ?? "1", 10);

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const pageSize = 24;

  const [productResponse, categoryResponse] = await Promise.all([
    getProducts({
      page: currentPage,
      page_size: pageSize,
      search: parameters.search,
      category: parameters.category,
      ordering: parameters.ordering,
      is_available: true,
    }),

    getCategories(),
  ]);

  const products = unwrapResults(productResponse);

  const unsortedCategories = unwrapResults(categoryResponse);

  const categories = [...unsortedCategories].sort(
    (firstCategory, secondCategory) =>
      firstCategory.name.localeCompare(secondCategory.name),
  );

  const totalProducts = Array.isArray(productResponse)
    ? productResponse.length
    : productResponse.count;

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const hasSearchOrCategory = Boolean(parameters.search || parameters.category);

  return (
    <div className="pb-12">
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-5 sm:py-7">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition hover:text-amber-700"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />

            <span className="text-slate-700">Products</span>
          </nav>

          <div className="mt-4 flex items-start gap-3 sm:items-center">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 sm:flex">
              <PackageSearch className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                SamWest catalogue
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Browse all products
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm">
                Search, filter and add the products you need to your booking.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-40">
            <Suspense
              fallback={
                <div className="h-11 animate-pulse rounded-xl bg-slate-200 lg:h-80" />
              }
            >
              <ProductFilters categories={categories} />
            </Suspense>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  {hasSearchOrCategory
                    ? "Search results"
                    : "Available products"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {totalProducts === 1
                    ? "1 product found"
                    : `${totalProducts.toLocaleString()} products found`}
                </p>
              </div>

              {totalPages > 1 ? (
                <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
              ) : null}
            </div>

            <ProductGrid products={products} variant="catalog" />

            {totalPages > 1 ? (
              <nav
                className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3"
                aria-label="Product pagination"
              >
                {currentPage > 1 ? (
                  <Link
                    href={createPageUrl(parameters, currentPage - 1)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                  </Link>
                ) : (
                  <span className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-extrabold text-slate-300">
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                  </span>
                )}

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-amber-500 px-2 text-xs font-black text-slate-950">
                  {currentPage}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={createPageUrl(parameters, currentPage + 1)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-extrabold text-slate-300">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </nav>
            ) : null}
          </main>
        </div>
      </Container>
    </div>
  );
}
