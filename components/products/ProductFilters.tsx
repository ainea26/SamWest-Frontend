"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

type ProductFiltersProps = {
  categories: Category[];
};

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";

  const currentCategory = searchParams.get("category") ?? "";

  const currentOrdering = searchParams.get("ordering") ?? "";

  const [searchQuery, setSearchQuery] = useState(currentSearch);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeFilters = [
    currentSearch,
    currentCategory,
    currentOrdering,
  ].filter(Boolean).length;

  function updateParameter(name: string, value: string) {
    const parameters = new URLSearchParams(searchParams.toString());

    if (value) {
      parameters.set(name, value);
    } else {
      parameters.delete(name);
    }

    parameters.delete("page");

    const queryString = parameters.toString();

    router.push(queryString ? `/products?${queryString}` : "/products");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateParameter("search", searchQuery.trim());
    setIsMobileOpen(false);
  }

  function clearFilters() {
    setSearchQuery("");
    setIsMobileOpen(false);
    router.push("/products");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsMobileOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-800 shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal
            className="h-4 w-4 text-amber-700"
            aria-hidden="true"
          />
          Filters and sorting
          {activeFilters > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950">
              {activeFilters}
            </span>
          ) : null}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition",
            isMobileOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          "mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:mt-0 lg:block lg:p-5",
          isMobileOpen ? "block" : "hidden",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4.5 w-4.5 text-amber-700"
              aria-hidden="true"
            />

            <h2 className="text-sm font-black text-slate-950">
              Filter products
            </h2>
          </div>

          {activeFilters > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-600 transition hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-5">
          <label
            htmlFor="catalogue-search"
            className="mb-1.5 block text-xs font-extrabold text-slate-700"
          >
            Search
          </label>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              id="catalogue-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Product or brand..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-100"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-9 w-full rounded-lg bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            Search products
          </button>
        </form>

        <div className="my-5 border-t border-slate-200" />

        <div>
          <label
            htmlFor="category-filter"
            className="mb-1.5 block text-xs font-extrabold text-slate-700"
          >
            Category
          </label>

          <select
            id="category-filter"
            value={currentCategory}
            onChange={(event) =>
              updateParameter("category", event.target.value)
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-100"
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label
            htmlFor="ordering-filter"
            className="mb-1.5 block text-xs font-extrabold text-slate-700"
          >
            Sort by
          </label>

          <select
            id="ordering-filter"
            value={currentOrdering}
            onChange={(event) =>
              updateParameter("ordering", event.target.value)
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-100"
          >
            <option value="">Recommended</option>
            <option value="name">Name: A to Z</option>
            <option value="-created_at">Newest first</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
            <option value="-views">Most viewed</option>
          </select>
        </div>

        <div className="mt-5 rounded-xl bg-amber-50 p-3">
          <p className="text-[11px] leading-5 text-amber-950">
            Select products and add them to your booking. Availability will be
            confirmed through WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
