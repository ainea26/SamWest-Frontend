import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export default function Container({
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto box-border w-full min-w-0 max-w-360 px-[clamp(0.75rem,3.5vw,1.5rem)] lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
