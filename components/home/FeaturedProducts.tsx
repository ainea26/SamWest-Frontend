import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductGrid from "@/components/products/ProductGrid";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Product } from "@/types/product";

type FeaturedProductsProps = {
  products: Product[];
};

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="featured" className="scroll-mt-40 bg-white py-12 sm:py-16">
      <Container>
        <SectionHeader
          title="Featured products"
          description="A hand-picked selection of products worth checking out."
          action={
            <Link
              href="/products?is_featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-700 transition hover:text-amber-800"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <ProductGrid products={products.slice(0, 8)} variant="home" />
      </Container>
    </section>
  );
}
