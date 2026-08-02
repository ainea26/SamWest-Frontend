import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-end justify-between gap-4 sm:mb-7",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
