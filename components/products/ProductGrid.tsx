import ProductCard from "@/components/products/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  variant?: "home" | "catalog";
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function ProductGrid({
  products,
  variant = "catalog",
  emptyTitle = "No products found",
  emptyDescription = "Try changing your search or selecting another category.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className={cn(
        "grid w-full min-w-0 grid-cols-2 gap-2 min-[380px]:gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
        variant === "home" ? "xl:grid-cols-5" : "xl:grid-cols-5",
      )}
    >
      {products.map((product) => (
        <div key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
