import ProductCard from "@/components/products/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  variant?: "home" | "catalog";
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export default function ProductGrid({
  products,
  variant = "catalog",
  emptyTitle = "No products found",
  emptyDescription = "Try changing your search or selecting another category.",
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full min-w-0">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full min-w-0 auto-rows-fr grid-cols-2 items-stretch",
        "gap-x-2 gap-y-3",
        "min-[380px]:gap-x-3 min-[380px]:gap-y-4",
        "sm:grid-cols-3 sm:gap-4",
        "lg:grid-cols-4",
        "xl:grid-cols-5",
        variant === "catalog"
          ? "2xl:gap-x-5 2xl:gap-y-6"
          : "2xl:gap-x-4 2xl:gap-y-5",
        className,
      )}
      role="list"
      aria-label="Products"
    >
      {products.map((product) => (
        <div key={product.id} className="h-full min-w-0" role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
