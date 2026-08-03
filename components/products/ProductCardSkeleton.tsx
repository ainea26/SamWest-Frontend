export default function ProductCardSkeleton() {
  return (
    <article
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-square bg-slate-100 p-3">
        <div className="h-full w-full rounded-lg bg-slate-200" />
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="h-3 w-1/2 rounded-full bg-slate-200" />

        <div className="mt-2 space-y-1.5">
          <div className="h-3.5 w-full rounded-full bg-slate-200" />
          <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
        </div>

        <div className="mt-2 h-3 w-1/3 rounded-full bg-slate-200" />

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-2/5 rounded-full bg-slate-300" />
            <div className="h-3 w-1/4 rounded-full bg-slate-200" />
          </div>

          <div className="mt-2.5 h-9 w-full rounded-lg bg-amber-200 sm:mt-3 sm:h-10" />
        </div>
      </div>
    </article>
  );
}
