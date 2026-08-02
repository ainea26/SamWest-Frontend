import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import ProductGrid from "@/components/products/ProductGrid";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Product } from "@/types/product";

type NewArrivalsProps = {
  products: Product[];
};

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="new-arrivals" className="scroll-mt-40 py-12 sm:py-16">
      <Container>
        <div className="mb-5 flex items-center gap-2 text-amber-700">
          <Sparkles className="h-5 w-5" aria-hidden="true" />

          <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
            Just added
          </span>
        </div>

        <SectionHeader
          title="New arrivals"
          description="Explore recently added products available from SamWest."
          action={
            <Link
              href="/products?ordering=-created_at"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-700 transition hover:text-amber-800"
            >
              View newest
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <ProductGrid products={products.slice(0, 8)} variant="home" />
      </Container>
    </section>
  );
}
