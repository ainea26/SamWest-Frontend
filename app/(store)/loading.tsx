import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import Container from "@/components/ui/Container";

function SectionHeadingSkeleton() {
  return (
    <div
      className="mb-6 flex items-end justify-between gap-4 sm:mb-8"
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1">
        <div className="h-3 w-24 rounded-full bg-amber-200" />

        <div className="mt-3 h-7 w-48 max-w-full rounded-lg bg-slate-200 sm:h-8 sm:w-64" />

        <div className="mt-3 h-4 w-full max-w-md rounded-full bg-slate-200" />
      </div>

      <div className="hidden h-4 w-20 rounded-full bg-slate-200 sm:block" />
    </div>
  );
}

export default function StoreLoading() {
  return (
    <div
      className="min-w-0 motion-safe:animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading SamWest products</span>

      <Container className="py-4 sm:py-6">
        <div
          className="h-32 w-full rounded-2xl bg-slate-200 sm:h-44 lg:h-56"
          aria-hidden="true"
        />
      </Container>

      <section className="bg-white py-10 sm:py-14">
        <Container>
          <SectionHeadingSkeleton />

          <ProductGridSkeleton count={10} />
        </Container>
      </section>
    </div>
  );
}
