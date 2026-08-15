import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "@/components/products/ProductDetails";
import { getProduct } from "@/lib/api";

const SITE_URL = "https://samwestonline.com";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductData = {
  id: number;
  name: string;
  slug: string;
  quantity?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  image?: string | null;
  description?: string | null;
  brand_name?: string | null;
  category_name?: string | null;
  source?: string | null;
  source_url?: string | null;
  is_available?: boolean;
};

function buildProductDescription(product: ProductData): string {
  const description = product.description?.trim();

  if (description) {
    return description.slice(0, 160);
  }

  const quantity = product.quantity?.trim();

  const parts = [
    product.name,
    quantity || "",
    "available from SamWest in Kenya.",
  ].filter(Boolean);

  return parts.join(" ");
}

function productCanonicalUrl(slug: string): string {
  return `${SITE_URL}/products/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = (await getProduct(slug)) as ProductData;

    if (!product?.name || !product?.slug) {
      return {
        title: "Product Not Found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const description = buildProductDescription(product);

    const canonicalUrl = productCanonicalUrl(product.slug);

    const images = product.image
      ? [
          {
            url: product.image,
            alt: product.name,
          },
        ]
      : [];

    return {
      title: product.name,

      description,

      alternates: {
        canonical: canonicalUrl,
      },

      openGraph: {
        type: "website",
        locale: "en_KE",
        siteName: "SamWest",
        url: canonicalUrl,
        title: product.name,
        description,
        images,
      },

      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: product.image ? [product.image] : [],
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
      title: "Product",
      description: "Browse products available from SamWest in Kenya.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

function buildProductJsonLd(product: ProductData) {
  const canonicalUrl = productCanonicalUrl(product.slug);

  const description = buildProductDescription(product);

  const offer =
    product.price !== null && product.price !== undefined
      ? {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "KES",
          price: String(product.price),
          availability:
            product.is_available === false
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "SamWest",
            url: SITE_URL,
          },
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description,

    sku: product.slug,

    url: canonicalUrl,

    image: product.image ? [product.image] : undefined,

    brand: product.brand_name
      ? {
          "@type": "Brand",
          name: product.brand_name,
        }
      : undefined,

    category: product.category_name || undefined,

    offers: offer,
  };
}

function buildBreadcrumbJsonLd(product: ProductData) {
  const canonicalUrl = productCanonicalUrl(product.slug);

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
        name: "Products",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };
}

function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product: ProductData;

  try {
    product = (await getProduct(slug)) as ProductData;
  } catch {
    notFound();
  }

  if (!product?.name || !product?.slug) {
    notFound();
  }

  const productJsonLd = buildProductJsonLd(product);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <div className="overflow-x-hidden py-4 sm:py-8 lg:py-10">
        <ProductDetails product={product as any} />
      </div>
    </>
  );
}
