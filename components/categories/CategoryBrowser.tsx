"use client";

import Link from "next/link";
import {
  Apple,
  Baby,
  BadgePercent,
  ChevronRight,
  CupSoda,
  Grid2X2,
  HeartPulse,
  House,
  Monitor,
  Search,
  ShoppingBag,
  SprayCan,
  UtensilsCrossed,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import CategoryTree from "@/components/categories/CategoryTree";
import type { Category } from "@/types/category";

type CategoryBrowserProps = {
  categories: Category[];
};

type CategoryPresentation = {
  Icon: LucideIcon;
  iconClassName: string;
  cardClassName: string;
};

function getCategoryPresentation(name: string): CategoryPresentation {
  const value = name.toLowerCase();

  if (
    value.includes("promo") ||
    value.includes("deal") ||
    value.includes("offer")
  ) {
    return {
      Icon: BadgePercent,
      iconClassName: "bg-orange-100 text-orange-700",
      cardClassName: "hover:border-orange-300",
    };
  }

  if (
    value.includes("fresh") ||
    value.includes("fruit") ||
    value.includes("vegetable")
  ) {
    return {
      Icon: Apple,
      iconClassName: "bg-emerald-100 text-emerald-700",
      cardClassName: "hover:border-emerald-300",
    };
  }

  if (value.includes("baby") || value.includes("kid")) {
    return {
      Icon: Baby,
      iconClassName: "bg-pink-100 text-pink-700",
      cardClassName: "hover:border-pink-300",
    };
  }

  if (
    value.includes("electronic") ||
    value.includes("appliance") ||
    value.includes("phone") ||
    value.includes("computer")
  ) {
    return {
      Icon: Monitor,
      iconClassName: "bg-blue-100 text-blue-700",
      cardClassName: "hover:border-blue-300",
    };
  }

  if (value.includes("clean") || value.includes("laundry")) {
    return {
      Icon: SprayCan,
      iconClassName: "bg-cyan-100 text-cyan-700",
      cardClassName: "hover:border-cyan-300",
    };
  }

  if (
    value.includes("health") ||
    value.includes("beauty") ||
    value.includes("personal care")
  ) {
    return {
      Icon: HeartPulse,
      iconClassName: "bg-rose-100 text-rose-700",
      cardClassName: "hover:border-rose-300",
    };
  }

  if (
    value.includes("liquor") ||
    value.includes("liqour") ||
    value.includes("wine") ||
    value.includes("alcohol")
  ) {
    return {
      Icon: Wine,
      iconClassName: "bg-purple-100 text-purple-700",
      cardClassName: "hover:border-purple-300",
    };
  }

  if (
    value.includes("beverage") ||
    value.includes("drink") ||
    value.includes("juice")
  ) {
    return {
      Icon: CupSoda,
      iconClassName: "bg-sky-100 text-sky-700",
      cardClassName: "hover:border-sky-300",
    };
  }

  if (
    value.includes("food") ||
    value.includes("cupboard") ||
    value.includes("snack") ||
    value.includes("oil") ||
    value.includes("dairy")
  ) {
    return {
      Icon: UtensilsCrossed,
      iconClassName: "bg-amber-100 text-amber-700",
      cardClassName: "hover:border-amber-300",
    };
  }

  if (
    value.includes("home") ||
    value.includes("household") ||
    value.includes("office")
  ) {
    return {
      Icon: House,
      iconClassName: "bg-teal-100 text-teal-700",
      cardClassName: "hover:border-teal-300",
    };
  }

  if (
    value.includes("more") ||
    value.includes("other") ||
    value.includes("general")
  ) {
    return {
      Icon: Grid2X2,
      iconClassName: "bg-slate-200 text-slate-700",
      cardClassName: "hover:border-slate-400",
    };
  }

  return {
    Icon: ShoppingBag,
    iconClassName: "bg-amber-100 text-amber-700",
    cardClassName: "hover:border-amber-300",
  };
}

function getParentId(category: Category): number | null {
  const parent = category.parent as unknown;

  if (typeof parent === "number") {
    return parent;
  }

  if (parent && typeof parent === "object" && "id" in parent) {
    const id = Number((parent as { id: unknown }).id);

    return Number.isFinite(id) ? id : null;
  }

  return null;
}

function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<number, Category>();

  categories.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      children: Array.isArray(category.children) ? [...category.children] : [],
    });
  });

  categories.forEach((category) => {
    const parentId = getParentId(category);

    if (parentId === null) {
      return;
    }

    const parent = categoryMap.get(parentId);

    const child = categoryMap.get(category.id);

    if (!parent || !child) {
      return;
    }

    const children = Array.isArray(parent.children) ? parent.children : [];

    if (!children.some((existing) => existing.id === child.id)) {
      parent.children = [...children, child];
    }
  });

  const roots = categories
    .filter((category) => {
      const parentId = getParentId(category);

      return parentId === null || !categoryMap.has(parentId);
    })
    .map((category) => categoryMap.get(category.id))
    .filter((category): category is Category => category !== undefined);

  return roots.length > 0 ? roots : Array.from(categoryMap.values());
}

function filterCategoryTree(categories: Category[], query: string): Category[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return categories;
  }

  return categories.reduce<Category[]>((results, category) => {
    const children = filterCategoryTree(
      Array.isArray(category.children) ? category.children : [],
      normalizedQuery,
    );

    const matches =
      category.name.toLowerCase().includes(normalizedQuery) ||
      (category.description ?? "").toLowerCase().includes(normalizedQuery);

    if (matches || children.length > 0) {
      results.push({
        ...category,
        children: matches ? category.children : children,
      });
    }

    return results;
  }, []);
}

function flattenCategories(categories: Category[]): Category[] {
  const results: Category[] = [];

  categories.forEach((category) => {
    results.push(category);

    if (Array.isArray(category.children) && category.children.length > 0) {
      results.push(...flattenCategories(category.children));
    }
  });

  return results;
}

export default function CategoryBrowser({ categories }: CategoryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  );

  const filteredTree = useMemo(
    () => filterCategoryTree(categoryTree, searchQuery),
    [categoryTree, searchQuery],
  );

  const searchActive = searchQuery.trim().length > 0;

  const displayedCategories = useMemo(
    () => (searchActive ? flattenCategories(filteredTree) : categoryTree),
    [categoryTree, filteredTree, searchActive],
  );

  return (
    <div className="min-w-0">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="wrap-break-word text-base font-black text-slate-950 sm:text-lg">
              Find a category
            </h2>

            <p className="mt-0.5 wrap-break-word text-xs leading-5 text-slate-500">
              Search departments and subcategories.
            </p>
          </div>

          <div className="relative w-full min-w-0 sm:max-w-md">
            <label htmlFor="category-search" className="sr-only">
              Search categories
            </label>

            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              id="category-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories..."
              className="h-10 w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-9 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 sm:h-11 sm:text-sm"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Clear category search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-7">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <CategoryTree categories={filteredTree} expandAll={searchActive} />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">
                {searchActive ? "Search results" : "Departments"}
              </p>

              <h2 className="mt-1 wrap-break-word text-lg font-black text-slate-950 sm:text-xl">
                {searchActive
                  ? `Results for “${searchQuery.trim()}”`
                  : "Browse categories"}
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 sm:text-xs">
              {displayedCategories.length}{" "}
              {displayedCategories.length === 1 ? "category" : "categories"}
            </span>
          </div>

          {displayedCategories.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {displayedCategories.map((category) => {
                const { Icon, iconClassName, cardClassName } =
                  getCategoryPresentation(category.name);

                const hasChildren =
                  Array.isArray(category.children) &&
                  category.children.length > 0;

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className={[
                      "group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4",
                      cardClassName,
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 sm:h-11 sm:w-11",
                          iconClassName,
                        ].join(" ")}
                      >
                        <Icon
                          className="h-5 w-5 sm:h-5.5 sm:w-5.5"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>

                      <ChevronRight
                        className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-3 wrap-break-word text-xs font-black leading-5 text-slate-900 transition group-hover:text-amber-800 sm:text-sm">
                      {category.name}
                    </h3>

                    {category.description ? (
                      <p className="mt-1 line-clamp-2 wrap-break-word text-[10px] leading-4 text-slate-500 sm:text-[11px]">
                        {category.description}
                      </p>
                    ) : null}

                    <p className="mt-auto pt-3 text-[10px] font-bold text-slate-400 sm:text-[11px]">
                      {hasChildren
                        ? "Browse subcategories"
                        : "View available products"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
              <Search
                className="mx-auto h-7 w-7 text-slate-300"
                aria-hidden="true"
              />

              <h3 className="mt-3 text-sm font-black text-slate-800">
                No matching categories
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Try a different category or department name.
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-600"
              >
                View all categories
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
