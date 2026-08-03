"use client";

import { Heart } from "lucide-react";

import { useIsFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  slug: string;
  className?: string;
}

/**
 * Импортирует свою иконку сама и получает только slug (строку) —
 * поэтому спокойно монтируется внутри GeneratorCard, который остаётся
 * серверным компонентом (см. комментарий в generator-card.tsx о том,
 * почему туда нельзя передавать сам компонент иконки).
 */
export function FavoriteButton({ slug, className }: FavoriteButtonProps) {
  const [isFavorite, toggle] = useIsFavorite(slug);

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        isFavorite && "text-destructive hover:text-destructive",
        className,
      )}
    >
      <Heart className={cn("size-4", isFavorite && "fill-current")} />
    </button>
  );
}
