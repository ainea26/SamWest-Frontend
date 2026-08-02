import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";

import ProductGrid from "@/components/products/ProductGrid";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Product } from "@/types/product";

type DealsSectionProps = {
  products: Product[];
};

export default function DealsSection({ products }: DealsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="deals" className="scroll-mt-40 bg-amber-50/70 py-12 sm:py-16">
      <Container>
        <div className="mb-5 flex items-center gap-2 text-amber-700">
          <BadgePercent className="h-5 w-5" aria-hidden="true" />

          <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
            Save more
          </span>
        </div>

        <SectionHeader
          title="Deals you’ll love"
          description="Discover selected products with excellent value."
          action={
            <Link
              href="/products?ordering=price"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-700 transition hover:text-amber-800"
            >
              Shop deals
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <ProductGrid products={products.slice(0, 8)} variant="home" />
      </Container>
    </section>
  );
}
