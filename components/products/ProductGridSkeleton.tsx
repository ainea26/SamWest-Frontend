import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { cn } from "@/lib/utils";

type ProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export default function ProductGridSkeleton({
  count = 10,
  className,
}: ProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid w-full min-w-0 auto-rows-fr grid-cols-2 items-stretch",
        "gap-x-2 gap-y-3",
        "min-[380px]:gap-x-3 min-[380px]:gap-y-4",
        "sm:grid-cols-3 sm:gap-4",
        "lg:grid-cols-4",
        "xl:grid-cols-5",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-full min-w-0">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
