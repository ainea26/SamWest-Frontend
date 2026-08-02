import Link from "next/link";
import {
  Apple,
  Baby,
  BadgePercent,
  ChevronRight,
  CupSoda,
  Grid2X2,
  HeartPulse,
  House,
  Monitor,
  ShoppingBag,
  SprayCan,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types/category";

type CategoryCardProps = {
  category: Category;
};

type CategoryStyle = {
  Icon: LucideIcon;
  iconClassName: string;
  hoverClassName: string;
};

function getCategoryStyle(name: string): CategoryStyle {
  const value = name.toLowerCase();

  if (
    value.includes("promo") ||
    value.includes("deal") ||
    value.includes("offer")
  ) {
    return {
      Icon: BadgePercent,
      iconClassName: "bg-orange-100 text-orange-700",
      hoverClassName: "hover:border-orange-300",
    };
  }

  if (
    value.includes("fresh") ||
    value.includes("fruit") ||
    value.includes("vegetable")
  ) {
    return {
      Icon: Apple,
      iconClassName: "bg-emerald-100 text-emerald-700",
      hoverClassName: "hover:border-emerald-300",
    };
  }

  if (value.includes("baby") || value.includes("kid")) {
    return {
      Icon: Baby,
      iconClassName: "bg-pink-100 text-pink-700",
      hoverClassName: "hover:border-pink-300",
    };
  }

  if (
    value.includes("electronic") ||
    value.includes("appliance") ||
    value.includes("phone") ||
    value.includes("computer")
  ) {
    return {
      Icon: Monitor,
      iconClassName: "bg-blue-100 text-blue-700",
      hoverClassName: "hover:border-blue-300",
    };
  }

  if (value.includes("clean") || value.includes("laundry")) {
    return {
      Icon: SprayCan,
      iconClassName: "bg-cyan-100 text-cyan-700",
      hoverClassName: "hover:border-cyan-300",
    };
  }

  if (
    value.includes("health") ||
    value.includes("beauty") ||
    value.includes("personal")
  ) {
    return {
      Icon: HeartPulse,
      iconClassName: "bg-rose-100 text-rose-700",
      hoverClassName: "hover:border-rose-300",
    };
  }

  if (
    value.includes("liquor") ||
    value.includes("liqour") ||
    value.includes("wine") ||
    value.includes("alcohol")
  ) {
    return {
      Icon: Wine,
      iconClassName: "bg-purple-100 text-purple-700",
      hoverClassName: "hover:border-purple-300",
    };
  }

  if (
    value.includes("beverage") ||
    value.includes("drink") ||
    value.includes("juice")
  ) {
    return {
      Icon: CupSoda,
      iconClassName: "bg-sky-100 text-sky-700",
      hoverClassName: "hover:border-sky-300",
    };
  }

  if (
    value.includes("food") ||
    value.includes("cupboard") ||
    value.includes("snack") ||
    value.includes("oil") ||
    value.includes("dairy")
  ) {
    return {
      Icon: UtensilsCrossed,
      iconClassName: "bg-amber-100 text-amber-700",
      hoverClassName: "hover:border-amber-300",
    };
  }

  if (
    value.includes("home") ||
    value.includes("household") ||
    value.includes("office")
  ) {
    return {
      Icon: House,
      iconClassName: "bg-teal-100 text-teal-700",
      hoverClassName: "hover:border-teal-300",
    };
  }

  if (value.includes("more") || value.includes("other")) {
    return {
      Icon: Grid2X2,
      iconClassName: "bg-slate-200 text-slate-700",
      hoverClassName: "hover:border-slate-400",
    };
  }

  return {
    Icon: ShoppingBag,
    iconClassName: "bg-amber-100 text-amber-700",
    hoverClassName: "hover:border-amber-300",
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { Icon, iconClassName, hoverClassName } = getCategoryStyle(
    category.name,
  );

  const displayName = category.name.replace(/>+$/g, "").trim();

  const hasChildren =
    Array.isArray(category.children) && category.children.length > 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={[
        "group flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4",
        hoverClassName,
      ].join(" ")}
      aria-label={`Browse ${displayName}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 sm:h-12 sm:w-12",
            iconClassName,
          ].join(" ")}
        >
          <Icon
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>

        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-3 wrap-break-word text-xs font-black leading-5 text-slate-950 transition group-hover:text-amber-800 sm:text-sm">
        {displayName}
      </h2>

      {category.description ? (
        <p className="mt-1 line-clamp-2 wrap-break-word text-[10px] leading-4 text-slate-500 sm:text-[11px]">
          {category.description}
        </p>
      ) : null}

      <p className="mt-auto pt-3 text-[10px] font-bold text-slate-400 sm:text-[11px]">
        {hasChildren ? "Explore subcategories" : "Browse products"}
      </p>
    </Link>
  );
}
