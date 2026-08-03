import Link from "next/link";

import type { Generator } from "@/types/generator";
import { getCategoryById } from "@/config/categories";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { cn } from "@/lib/utils";

const statusLabel: Record<Generator["status"], string> = {
  available: "Доступен",
  beta: "Бета",
  "coming-soon": "Скоро",
};

interface GeneratorCardProps {
  generator: Generator;
}

/**
 * Карточка одного генератора для каталога. Данные приходят из SDK
 * (src/generators/*, см. Этап 6) через toCatalogGenerator().
 *
 * Сознательно БЕЗ "use client" и без framer-motion: иконка генератора
 * (generator.icon) — это ссылка на компонент, а такие ссылки нельзя
 * передать из Server Component в Client Component (RSC не умеет их
 * сериализовать — обнаружено на реальной сборке всех генераторов).
 * Эффект приподнимания при наведении — на чистом CSS (hover:-translate-y),
 * поэтому карточка спокойно остаётся серверным компонентом и рендерит
 * иконку напрямую, без границы Server -> Client. FavoriteButton внутри —
 * отдельный маленький клиентский компонент, которому передаётся только
 * slug (строка), а не сам компонент/функция — так что проблема не
 * возникает и здесь (см. комментарий в favorite-button.tsx).
 */
export function GeneratorCard({ generator }: GeneratorCardProps) {
  const Icon = generator.icon;
  const category = getCategoryById(generator.categoryId);
  const isComingSoon = generator.status === "coming-soon";

  // Бейджи New/Premium/Popular имеют смысл только у реально доступных
  // генераторов — "скоро" и так достаточно говорит само за себя.
  const badges = isComingSoon
    ? [{ key: "status", label: statusLabel[generator.status], variant: "secondary" as const }]
    : [
        generator.status === "beta" && {
          key: "beta",
          label: statusLabel.beta,
          variant: "warning" as const,
        },
        generator.isPremium && { key: "premium", label: "Premium", variant: "warning" as const },
        generator.isNew && { key: "new", label: "Новое", variant: "success" as const },
        generator.isPopular && {
          key: "popular",
          label: "Популярное",
          variant: "default" as const,
        },
      ].filter((badge): badge is { key: string; label: string; variant: "warning" | "success" | "default" } => Boolean(badge));

  const content = (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-[transform,colors] duration-150",
        isComingSoon ? "opacity-60" : "hover:-translate-y-0.5 hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {!isComingSoon && <FavoriteButton slug={generator.slug} className="-mr-1 -mt-1" />}
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {badges.map((badge) => (
                <Badge key={badge.key} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{generator.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {generator.description}
        </p>
      </div>
      {category && (
        <span className="mt-auto text-[11px] uppercase tracking-wide text-muted-foreground/70">
          {category.title}
        </span>
      )}
    </div>
  );

  if (isComingSoon) {
    return content;
  }

  return (
    <Link href={`/generators/${generator.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
