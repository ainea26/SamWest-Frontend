import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  label?: string;
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  className?: string;
};

const spinnerSizes = {
  small: "h-4 w-4",
  medium: "h-7 w-7",
  large: "h-10 w-10",
};

export default function LoadingSpinner({
  label = "Loading...",
  size = "medium",
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3",
        fullPage && "min-h-[50vh]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className={cn("animate-spin text-amber-600", spinnerSizes[size])}
        aria-hidden="true"
      />

      {label ? (
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      ) : null}
    </div>
  );
}
