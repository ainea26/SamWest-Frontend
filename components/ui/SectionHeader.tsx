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
        "mb-5 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 sm:mb-7 sm:gap-x-5 sm:gap-y-2",
        className,
      )}
    >
      <h2 className="min-w-0 text-[clamp(1.25rem,5vw,1.875rem)] font-black leading-[1.15] tracking-tight text-slate-950">
        {title}
      </h2>

      {action ? (
        <div className="shrink-0 self-center whitespace-nowrap">{action}</div>
      ) : null}

      {description ? (
        <p className="col-span-full max-w-2xl text-pretty text-[13px] leading-[1.55] text-slate-600 sm:text-[15px] sm:leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}
