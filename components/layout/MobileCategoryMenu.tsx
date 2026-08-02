"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Apple,
  Baby,
  BadgePercent,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  LoaderCircle,
  Monitor,
  Search,
  ShoppingBag,
  SprayCan,
  UtensilsCrossed,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getCategories, unwrapResults } from "@/lib/api";
import type { Category } from "@/types/category";

type MobileCategoryMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CategoryMenuItemProps = {
  category: Category;
  level?: number;
  searchActive: boolean;
  expandedIds: Set<number>;
  onToggle: (categoryId: number) => void;
  onNavigate: () => void;
};

function getCategoryIcon(name: string): LucideIcon {
  const value = name.toLowerCase();

  if (
    value.includes("promo") ||
    value.includes("deal") ||
    value.includes("offer")
  ) {
    return BadgePercent;
  }

  if (
    value.includes("fruit") ||
    value.includes("vegetable") ||
    value.includes("fresh")
  ) {
    return Apple;
  }

  if (value.includes("baby") || value.includes("kid")) {
    return Baby;
  }

  if (
    value.includes("electronic") ||
    value.includes("appliance") ||
    value.includes("phone")
  ) {
    return Monitor;
  }

  if (
    value.includes("clean") ||
    value.includes("laundry") ||
    value.includes("household")
  ) {
    return SprayCan;
  }

  if (
    value.includes("beverage") ||
    value.includes("drink") ||
    value.includes("liquor") ||
    value.includes("wine")
  ) {
    return Wine;
  }

  if (
    value.includes("food") ||
    value.includes("snack") ||
    value.includes("oil") ||
    value.includes("cupboard")
  ) {
    return UtensilsCrossed;
  }

  return ShoppingBag;
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

    const existingChildren = Array.isArray(parent.children)
      ? parent.children
      : [];

    if (!existingChildren.some((item) => item.id === child.id)) {
      parent.children = [...existingChildren, child];
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

function CategoryMenuItem({
  category,
  level = 0,
  searchActive,
  expandedIds,
  onToggle,
  onNavigate,
}: CategoryMenuItemProps) {
  const children = Array.isArray(category.children) ? category.children : [];

  const hasChildren = children.length > 0;

  const isExpanded = searchActive || expandedIds.has(category.id);

  const Icon = level === 0 ? getCategoryIcon(category.name) : ShoppingBag;

  return (
    <li className="min-w-0">
      <div
        className={[
          "flex min-w-0 items-stretch border-b border-slate-100",
          level === 0 ? "bg-white" : "bg-slate-50/80",
        ].join(" ")}
      >
        <Link
          href={`/categories/${category.slug}`}
          onClick={onNavigate}
          className="group flex min-w-0 flex-1 items-center gap-2.5 py-3 pr-2 transition hover:bg-amber-50"
          style={{
            paddingLeft: `${12 + level * 14}px`,
          }}
        >
          <span
            className={[
              "flex shrink-0 items-center justify-center rounded-lg",
              level === 0
                ? "h-8 w-8 bg-amber-50 text-amber-700"
                : "h-6 w-6 text-slate-400",
            ].join(" ")}
          >
            <Icon
              className={level === 0 ? "h-4 w-4" : "h-3.5 w-3.5"}
              aria-hidden="true"
            />
          </span>

          <span className="min-w-0 flex-1">
            <span
              className={[
                "block wrap-break-word leading-5 transition",
                level === 0
                  ? "text-[13px] font-extrabold text-slate-800 group-hover:text-amber-800"
                  : "text-xs font-semibold text-slate-600 group-hover:text-amber-700",
              ].join(" ")}
            >
              {category.name}
            </span>

            {level === 0 && hasChildren ? (
              <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
                {children.length} subcategories
              </span>
            ) : null}
          </span>
        </Link>

        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            className="flex w-11 shrink-0 items-center justify-center border-l border-slate-100 text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
            aria-label={
              isExpanded
                ? `Collapse ${category.name}`
                : `Expand ${category.name}`
            }
            aria-expanded={isExpanded}
          >
            <ChevronDown
              className={[
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="flex w-9 shrink-0 items-center justify-center">
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-300"
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      {hasChildren && isExpanded ? (
        <ul>
          {children.map((child) => (
            <CategoryMenuItem
              key={child.id}
              category={child}
              level={level + 1}
              searchActive={searchActive}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function MobileCategoryMenu({
  isOpen,
  onClose,
}: MobileCategoryMenuProps) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [hasError, setHasError] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getCategories();
        const allCategories = unwrapResults(response);

        if (isMounted) {
          setCategories(buildCategoryTree(allCategories));
        }
      } catch {
        if (isMounted) {
          setCategories([]);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setExpandedIds(new Set());
    }
  }, [isOpen]);

  const filteredCategories = useMemo(
    () => filterCategoryTree(categories, searchQuery),
    [categories, searchQuery],
  );

  function toggleCategory(categoryId: number) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  if (!isOpen) {
    return null;
  }

  const searchActive = searchQuery.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-110 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-categories-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-[1px]"
        aria-label="Close categories"
      />

      <aside className="absolute inset-y-0 left-0 flex h-dvh w-[92vw] max-w-90 flex-col overflow-hidden bg-white shadow-2xl">
        <header className="shrink-0 bg-amber-500 px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] text-slate-950 sm:px-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/10">
                <Grid2X2 className="h-4 w-4" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h2 id="mobile-categories-title" className="text-sm font-black">
                  Categories
                </h2>

                <p className="text-[10px] font-semibold text-slate-800/70">
                  Find products by department
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/10"
              aria-label="Close categories"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative mt-3">
            <label htmlFor="mobile-category-search" className="sr-only">
              Search categories
            </label>

            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              id="mobile-category-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories..."
              className="h-10 w-full min-w-0 rounded-lg border border-amber-700/20 bg-white pl-9 pr-9 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear category search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-2.5 sm:p-3">
          {isLoading ? (
            <div className="flex min-h-44 items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold text-slate-500">
              <LoaderCircle
                className="h-4 w-4 animate-spin text-amber-600"
                aria-hidden="true"
              />
              Loading categories...
            </div>
          ) : hasError ? (
            <div className="rounded-xl border border-red-100 bg-white px-4 py-8 text-center">
              <p className="text-sm font-extrabold text-slate-800">
                Categories could not be loaded
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-600"
              >
                Try again
              </button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <nav
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              aria-label="Mobile product categories"
            >
              <ul>
                {filteredCategories.map((category) => (
                  <CategoryMenuItem
                    key={category.id}
                    category={category}
                    searchActive={searchActive}
                    expandedIds={expandedIds}
                    onToggle={toggleCategory}
                    onNavigate={onClose}
                  />
                ))}
              </ul>
            </nav>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center">
              <Search
                className="mx-auto h-6 w-6 text-slate-300"
                aria-hidden="true"
              />

              <p className="mt-3 text-sm font-extrabold text-slate-800">
                No matching categories
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Try another category name.
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-black text-amber-700"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          <Link
            href="/categories"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Grid2X2
                className="h-4 w-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />

              <span className="wrap-break-word">Browse all categories</span>
            </span>

            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </footer>
      </aside>
    </div>
  );
}
