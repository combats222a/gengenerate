import Link from "next/link";

import { categories } from "@/config/categories";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  activeCategoryId?: string;
  query?: string;
}

/**
 * Обычные ссылки, не client state — категория живёт в URL (?category=...),
 * страница просто перерисовывается на сервере под новый фильтр. Поиск
 * (?q=...) сохраняется при переключении категории.
 */
export function CategoryPills({ activeCategoryId, query }: CategoryPillsProps) {
  function hrefFor(categoryId?: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("category", categoryId);
    const search = params.toString();
    return `/${search ? `?${search}` : ""}`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor(undefined)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          !activeCategoryId
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
        )}
      >
        Все
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={hrefFor(category.id)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            activeCategoryId === category.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {category.title}
        </Link>
      ))}
    </div>
  );
}
