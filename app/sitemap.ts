import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const SITE_URL = "https://samwestonline.com";

const API_BASE_URL = (
  process.env.SITEMAP_API_URL ||
  "https://samwest-production.up.railway.app/api"
).replace(/\/$/, "");

type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

type Product = {
  slug: string;
};

type Category = {
  slug: string;
};

async function fetchAllPages<T>(
  initialUrl: string,
): Promise<T[]> {
  const items: T[] = [];

  let url: string | null = initialUrl;

  while (url) {
    try {
      const response = await fetch(url, {
        next: {
          revalidate: 3600,
        },
      });

      if (!response.ok) {
        console.error(
          `Sitemap fetch failed: ${response.status} ${url}`,
        );

        break;
      }

      const data =
        (await response.json()) as PaginatedResponse<T>;

      if (Array.isArray(data.results)) {
        items.push(...data.results);
      }

      url = data.next ?? null;
    } catch (error) {
      console.error(
        "Sitemap fetch error:",
        error,
      );

      break;
    }
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const [products, categories] =
    await Promise.all([
      fetchAllPages<Product>(
        `${API_BASE_URL}/products/?page_size=100`,
      ),

      fetchAllPages<Category>(
        `${API_BASE_URL}/categories/?page_size=100`,
      ),
    ]);

  const productPages: MetadataRoute.Sitemap =
    products
      .filter(
        (product) =>
          typeof product.slug === "string" &&
          product.slug.trim().length > 0,
      )
      .map((product) => ({
        url:
          `${SITE_URL}/products/` +
          encodeURIComponent(product.slug),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

  const categoryPages: MetadataRoute.Sitemap =
    categories
      .filter(
        (category) =>
          typeof category.slug === "string" &&
          category.slug.trim().length > 0,
      )
      .map((category) => ({
        url:
          `${SITE_URL}/categories/` +
          encodeURIComponent(category.slug),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
  ];
}