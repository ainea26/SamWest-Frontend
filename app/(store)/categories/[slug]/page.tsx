import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";

import CategoryCard from "@/components/categories/CategoryCard";
import ProductGrid from "@/components/products/ProductGrid";
import Container from "@/components/ui/Container";
import { getCategory, getProducts, isApiError, unwrapResults } from "@/lib/api";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getCategory(slug);

    return {
      title: category.name,
      description:
        category.description ||
        `Browse ${category.name} products available from SamWest.`,
    };
  } catch {
    return {
      title: "Category",
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const requestedPage = Number.parseInt(query.page ?? "1", 10);

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const pageSize = 24;

  try {
    const [category, productResponse] = await Promise.all([
      getCategory(slug),
      getProducts({
        category: slug,
        page: currentPage,
        page_size: pageSize,
        is_available: true,
      }),
    ]);

    const products = unwrapResults(productResponse);

    const totalProducts = Array.isArray(productResponse)
      ? productResponse.length
      : productResponse.count;

    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

    return (
      <div className="py-8 sm:py-10">
        <Container>
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-amber-700">
              Home
            </Link>

            <ChevronRight className="h-4 w-4" aria-hidden="true" />

            <Link
              href="/categories"
              className="transition hover:text-amber-700"
            >
              Categories
            </Link>

            <ChevronRight className="h-4 w-4" aria-hidden="true" />

            <span className="font-semibold text-slate-700">
              {category.name}
            </span>
          </nav>

          <section className="overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-9 text-white sm:px-10 sm:py-12">
            <div className="flex max-w-3xl items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 sm:flex">
                <Grid2X2 className="h-7 w-7" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-400">
                  SamWest category
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {category.name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {category.description ||
                    `Browse available ${category.name.toLowerCase()} products and add what you need to your booking.`}
                </p>

                <p className="mt-5 text-sm font-bold text-amber-300">
                  {totalProducts === 1
                    ? "1 available product"
                    : `${totalProducts.toLocaleString()} available products`}
                </p>
              </div>
            </div>
          </section>

          {category.children?.length > 0 ? (
            <section className="mt-10">
              <h2 className="mb-5 text-xl font-black text-slate-950 sm:text-2xl">
                Subcategories
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {category.children.map((child) => (
                  <CategoryCard key={child.id} category={child} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                Products in {category.name}
              </h2>

              {totalPages > 1 ? (
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
              ) : null}
            </div>

            <ProductGrid
              products={products}
              emptyTitle={`No ${category.name} products found`}
              emptyDescription="There are currently no available products in this category."
            />

            {totalPages > 1 ? (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Category product pagination"
              >
                {currentPage > 1 ? (
                  <Link
                    href={`/categories/${slug}?page=${currentPage - 1}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400">
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </span>
                )}

                <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-black text-white">
                  {currentPage}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/categories/${slug}?page=${currentPage + 1}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400">
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </nav>
            ) : null}
          </section>
        </Container>
      </div>
    );
  } catch (error) {
    if (isApiError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }
}
