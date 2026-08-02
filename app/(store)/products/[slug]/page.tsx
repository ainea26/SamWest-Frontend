import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "@/components/products/ProductDetails";
import Container from "@/components/ui/Container";
import { getProduct, isApiError } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    return {
      title: product.name,
      description:
        product.description ||
        `View ${product.name} and add it to your SamWest booking.`,
    };
  } catch {
    return {
      title: "Product",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    return (
      <div className="py-8 sm:py-10">
        <Container>
          <ProductDetails product={product} />
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
