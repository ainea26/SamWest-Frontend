"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  ListTree,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Category } from "@/types/category";

type CategoryTreeProps = {
  categories: Category[];
  expandAll?: boolean;
};

type CategoryTreeItemProps = {
  category: Category;
  level: number;
  expandAll: boolean;
  expandedIds: Set<number>;
  onToggle: (categoryId: number) => void;
};

function CategoryTreeItem({
  category,
  level,
  expandAll,
  expandedIds,
  onToggle,
}: CategoryTreeItemProps) {
  const children = Array.isArray(category.children) ? category.children : [];

  const hasChildren = children.length > 0;

  const isExpanded = expandAll || expandedIds.has(category.id);

  return (
    <li className="min-w-0">
      <div
        className={[
          "group flex min-w-0 items-stretch rounded-lg transition",
          level === 0 ? "hover:bg-amber-50" : "hover:bg-slate-50",
        ].join(" ")}
      >
        <Link
          href={`/categories/${category.slug}`}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-1.5"
          style={{
            paddingLeft: `${8 + level * 12}px`,
          }}
        >
          {hasChildren ? (
            <FolderOpen
              className="h-3.5 w-3.5 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          ) : (
            <Folder
              className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-amber-600"
              aria-hidden="true"
            />
          )}

          <span className="min-w-0 flex-1 wrap-break-word text-xs font-bold leading-4 text-slate-700 transition group-hover:text-amber-800">
            {category.name}
          </span>
        </Link>

        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            className="flex w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-100 hover:text-amber-700"
            aria-label={
              isExpanded
                ? `Collapse ${category.name}`
                : `Expand ${category.name}`
            }
            aria-expanded={isExpanded}
          >
            <ChevronDown
              className={[
                "h-3.5 w-3.5 transition-transform",
                isExpanded ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="flex w-6 shrink-0 items-center justify-center">
            <ChevronRight
              className="h-3 w-3 text-slate-300"
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      {hasChildren && isExpanded ? (
        <ul className="min-w-0">
          {children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              expandAll={expandAll}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function CategoryTree({
  categories,
  expandAll = false,
}: CategoryTreeProps) {
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (expandAll) {
      setIsDirectoryOpen(true);
    }
  }, [expandAll]);

  function toggleCategory(categoryId: number) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        No matching categories.
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsDirectoryOpen((current) => !current)}
        className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left lg:hidden"
        aria-expanded={isDirectoryOpen}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ListTree
            className="h-4 w-4 shrink-0 text-amber-700"
            aria-hidden="true"
          />

          <span className="wrap-break-word text-xs font-black uppercase tracking-widest text-slate-900">
            Categories and subcategories
          </span>
        </span>

        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            isDirectoryOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      <div
        className={[
          "border-t border-slate-200 lg:block lg:border-t-0",
          isDirectoryOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <div className="hidden border-b border-slate-200 px-3 py-3 lg:block">
          <h2 className="text-xs font-black uppercase tracking-[0.12em] text-slate-950">
            Category directory
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Browse categories and subcategories.
          </p>
        </div>

        <div className="max-h-[55dvh] overflow-y-auto overscroll-contain p-2 lg:max-h-[calc(100dvh-10rem)]">
          <ul className="min-w-0 space-y-0.5">
            {categories.map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                level={0}
                expandAll={expandAll}
                expandedIds={expandedIds}
                onToggle={toggleCategory}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
