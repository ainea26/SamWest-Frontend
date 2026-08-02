import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CategoryCard from "@/components/categories/CategoryCard";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Category } from "@/types/category";

type CategorySectionProps = {
  categories: Category[];
};

export default function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="scroll-mt-40 py-12 sm:py-16">
      <Container>
        <SectionHeader
          title="Shop by category"
          description="Find what you need faster through our selected product categories."
          action={
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-700 transition hover:text-amber-800"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
