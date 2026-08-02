"use client";

import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Baby,
  BadgePercent,
  ChevronDown,
  Grid2X2,
  LoaderCircle,
  Monitor,
  PackageOpen,
  ShoppingBag,
  SprayCan,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Container from "@/components/ui/Container";
import { getCategories, getProducts, unwrapResults } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

function getImageUrl(image: string | null | undefined): string | null {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/${image.replace(/^\/+/, "")}`;
}

function collectCategorySlugs(category: Category): string[] {
  return [
    category.slug,
    ...(category.children ?? []).flatMap(collectCategorySlugs),
  ];
}

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

export default function CategoryMegaMenu() {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});

  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response = await getCategories();
        const allCategories = unwrapResults(response);

        const rootCategories = allCategories.filter(
          (category) => category.parent === null,
        );

        if (isMounted) {
          setCategories(
            rootCategories.length > 0 ? rootCategories : allCategories,
          );
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;

      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  async function loadCategoryProducts(category: Category) {
    if (
      productsByCategory[category.slug] ||
      loadingCategory === category.slug
    ) {
      return;
    }

    setLoadingCategory(category.slug);

    try {
      const categorySlugs = collectCategorySlugs(category).slice(0, 8);

      const results = await Promise.allSettled(
        categorySlugs.map((slug) =>
          getProducts({
            category: slug,
            page: 1,
            page_size: 5,
            is_available: true,
          }),
        ),
      );

      const products = results.flatMap((result) =>
        result.status === "fulfilled" ? unwrapResults(result.value) : [],
      );

      const uniqueProducts = Array.from(
        new Map(products.map((product) => [product.id, product])).values(),
      ).slice(0, 5);

      setProductsByCategory((currentProducts) => ({
        ...currentProducts,
        [category.slug]: uniqueProducts,
      }));
    } catch {
      setProductsByCategory((currentProducts) => ({
        ...currentProducts,
        [category.slug]: [],
      }));
    } finally {
      setLoadingCategory(null);
    }
  }

  function openCategory(category: Category) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setActiveCategory(category);
    void loadCategoryProducts(category);
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => {
      setActiveCategory(null);
    }, 140);
  }

  function closeMenu() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setActiveCategory(null);
  }

  const activeProducts = activeCategory
    ? (productsByCategory[activeCategory.slug] ?? [])
    : [];

  return (
    <div
      className="relative border-b border-slate-200 bg-white"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <Container>
        <nav
          className="flex h-10 items-stretch"
          aria-label="Product categories"
        >
          <Link
            href="/categories"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-1 bg-amber-500 px-2.5 text-[9px] font-extrabold uppercase tracking-normal text-slate-950 transition hover:bg-amber-600"
          >
            <Grid2X2 className="h-3 w-3" aria-hidden="true" />
            Categories
            <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
          </Link>

          <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
            {categories.slice(0, 7).map((category) => {
              const isActive = activeCategory?.id === category.id;

              const CategoryIcon = getCategoryIcon(category.name);

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onMouseEnter={() => openCategory(category)}
                  onFocus={() => openCategory(category)}
                  onClick={closeMenu}
                  className={
                    isActive
                      ? "flex shrink-0 items-center gap-1 border-b-2 border-amber-500 bg-amber-50 px-2 text-[9px] font-bold uppercase tracking-normal text-amber-800"
                      : "flex shrink-0 items-center gap-1 border-b-2 border-transparent px-2 text-[9px] font-bold uppercase tracking-normal text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                  }
                >
                  <CategoryIcon
                    className="h-3 w-3 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />

                  <span className="whitespace-nowrap">{category.name}</span>

                  <ChevronDown
                    className="h-2 w-2 shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}

            <Link
              href="/categories"
              onClick={closeMenu}
              className="ml-auto flex shrink-0 items-center gap-1 px-2 text-[9px] font-bold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
            >
              More
              <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </Container>

      {activeCategory ? (
        <div
          className="absolute inset-x-0 top-full z-70 border-t border-slate-200 bg-white shadow-xl"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <Container className="py-3">
            <div className="grid gap-4 lg:grid-cols-[150px_165px_minmax(0,1fr)]">
              <div className="border-r border-slate-200 pr-3">
                {(() => {
                  const CategoryIcon = getCategoryIcon(activeCategory.name);

                  return (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                      <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  );
                })()}

                <h2 className="mt-2 text-sm font-black text-slate-950">
                  {activeCategory.name}
                </h2>

                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                  {activeCategory.description ||
                    `Explore available ${activeCategory.name.toLowerCase()} products.`}
                </p>

                <Link
                  href={`/categories/${activeCategory.slug}`}
                  onClick={closeMenu}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 hover:text-amber-800"
                >
                  View all
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>

              <div className="border-r border-slate-200 pr-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Subcategories
                </h3>

                {activeCategory.children?.length > 0 ? (
                  <ul className="mt-1.5 space-y-0.5">
                    {activeCategory.children.slice(0, 6).map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/categories/${child.slug}`}
                          onClick={closeMenu}
                          className="group flex items-center justify-between rounded px-1.5 py-1 text-[10px] font-bold text-slate-700 transition hover:bg-amber-50 hover:text-amber-700"
                        >
                          <span>{child.name}</span>

                          <ArrowRight
                            className="h-2.5 w-2.5 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    Browse the available products in this category.
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Products
                  </h3>

                  <Link
                    href={`/categories/${activeCategory.slug}`}
                    onClick={closeMenu}
                    className="text-[10px] font-extrabold text-amber-700 hover:text-amber-800"
                  >
                    See all
                  </Link>
                </div>

                {loadingCategory === activeCategory.slug ? (
                  <div className="flex min-h-28 items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <LoaderCircle
                      className="h-3.5 w-3.5 animate-spin text-amber-600"
                      aria-hidden="true"
                    />
                    Loading...
                  </div>
                ) : activeProducts.length > 0 ? (
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {activeProducts.map((product) => {
                      const imageUrl = getImageUrl(
                        product.image_url || product.image,
                      );

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={closeMenu}
                          className="group/product min-w-0 rounded-md border border-slate-200 bg-white p-1.5 transition hover:border-amber-300 hover:shadow-sm"
                        >
                          <div className="flex h-18 items-center justify-center overflow-hidden rounded bg-slate-50">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-contain p-1 transition group-hover/product:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <PackageOpen
                                className="h-5 w-5 text-slate-300"
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <p className="mt-1 truncate text-[10px] font-bold text-slate-800 group-hover/product:text-amber-700">
                            {product.name}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] font-black text-slate-950">
                            {formatCurrency(product.price)}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-28 flex-col items-center justify-center rounded-md bg-slate-50 px-3 text-center">
                    <PackageOpen
                      className="h-6 w-6 text-slate-300"
                      aria-hidden="true"
                    />

                    <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                      No available products found
                    </p>

                    <Link
                      href={`/categories/${activeCategory.slug}`}
                      onClick={closeMenu}
                      className="mt-1 text-[10px] font-extrabold text-amber-700"
                    >
                      Open category
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      ) : null}
    </div>
  );
}
