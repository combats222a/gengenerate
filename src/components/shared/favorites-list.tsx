"use client";

import { Star } from "lucide-react";

import { useFavoriteSlugs } from "@/lib/favorites";
import { GENERATOR_ICON_BY_SLUG } from "@/lib/icon-map";
import { GeneratorCard } from "@/components/shared/generator-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Generator } from "@/types/generator";

/** То же самое, что Generator, но без icon — его нельзя передать с сервера (см. generator-card.tsx). */
export type SerializableCatalogItem = Omit<Generator, "icon">;

interface FavoritesListProps {
  items: SerializableCatalogItem[];
}

/**
 * Избранное живёт в localStorage — значит, список нужно фильтровать на
 * клиенте. Сервер (src/app/favorites/page.tsx) передаёт сюда все
 * доступные генераторы БЕЗ иконки (это функция, не сериализуется), а
 * иконка здесь довосстанавливается по slug через GENERATOR_ICON_BY_SLUG.
 * Дальше GeneratorCard используется как обычно — мы уже полностью на
 * клиенте, границы Server -> Client тут больше нет.
 */
export function FavoritesList({ items }: FavoritesListProps) {
  const favoriteSlugs = useFavoriteSlugs();
  const favorites = items.filter((item) => favoriteSlugs.includes(item.slug));

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Пока нет избранных генераторов"
        description="Нажмите на значок сердца на карточке генератора, чтобы добавить его сюда."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {favorites.map((item) => (
        <GeneratorCard
          key={item.id}
          generator={{ ...item, icon: GENERATOR_ICON_BY_SLUG[item.slug] ?? Star }}
        />
      ))}
    </div>
  );
}
