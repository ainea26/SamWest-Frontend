import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryCard from "@/components/categories/CategoryCard";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategory } from "@/lib/api";

const SITE_URL = "https://samwestonline.com";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type CategoryData = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  icon: string;
  is_featured: boolean;
  // additional fields expected by CategoryCard
  image_url: string;
  products_count: number;
  parent: any | null;
  children: any[];
};

// accept any shape (API Category may have nullable fields)
function normalizeCategory(category: any): CategoryData {
  return {
    id: Number(category.id || 0),
    name: String(category.name || ""),
    slug: String(category.slug || ""),
    image: String(category.image || ""),
    description: String(category.description || ""),
    icon: String(category.icon || ""),
    is_featured: Boolean(category.is_featured),
    image_url: String((category as any).image_url || category.image || ""),
    products_count: Number((category as any).products_count || 0),
    parent: (category as any).parent || null,
    children: Array.isArray((category as any).children) ? (category as any).children : [],
  };
}

function buildDescription(category: CategoryData): string {
  const description = category.description.trim();

  if (description) {
    return description.slice(0, 160);
  }

  return (
    `Shop ${category.name} products online from SamWest in Kenya. ` +
    "Browse available products, prices and offers."
  );
}

function canonicalUrl(slug: string): string {
  return `${SITE_URL}/categories/` + encodeURIComponent(slug);
}

function buildBreadcrumbJsonLd(category: CategoryData) {
  const url = canonicalUrl(category.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${SITE_URL}/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: url,
      },
    ],
  };
}

function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = normalizeCategory(await getCategory(slug));

    if (!category.name || !category.slug) {
      return {
        title: "Category Not Found",

        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const description = buildDescription(category);

    const url = canonicalUrl(category.slug);

    const images = category.image
      ? [
          {
            url: category.image,
            alt: category.name,
          },
        ]
      : [];

    return {
      title: `${category.name} Products`,

      description,

      alternates: {
        canonical: url,
      },

      openGraph: {
        type: "website",
        locale: "en_KE",
        siteName: "SamWest",
        url,
        title: `${category.name} Products | SamWest`,
        description,
        images,
      },

      twitter: {
        card: "summary_large_image",
        title: `${category.name} Products | SamWest`,
        description,
        images: category.image ? [category.image] : [],
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
  } catch {
    return {
      title: "Category",

      description: "Browse product categories available from SamWest in Kenya.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: CategoryData;

  try {
    category = normalizeCategory(await getCategory(slug));
  } catch {
    notFound();
  }

  if (!category.name || !category.slug) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <CategoryCard category={category} />

      {/* ProductGrid props typed differently; cast to any to satisfy TS here */}
      <ProductGrid {...({ slug: category.slug } as any)} />
    </>
  );
}
