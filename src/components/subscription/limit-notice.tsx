import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LIMIT_KIND_LABELS, GenerationKind } from "@/config/tariffs";

export interface LimitNoticeProps {
  remaining: number;
  limit: number | null;
  kind: GenerationKind;
  kindLabel: (typeof LIMIT_KIND_LABELS)[GenerationKind];
  className?: string;
}

/** Ниже которого показываем "осталось N генераций сегодня" (примеры из ТЗ: 10, 5). */
const LOW_REMAINING_THRESHOLD = 10;

/**
 * ЭТАП 13 — "Уведомления о лимитах" из ТЗ. Три состояния из примера
 * дословно: "Осталось 10…", "Осталось 5…", "Вы использовали весь
 * бесплатный лимит…" — только числа не захардкожены, а берутся из
 * фактического остатка (LOW_REMAINING_THRESHOLD решает, когда вообще
 * стоит начинать беспокоить пользователя).
 */
export function LimitNotice({ remaining, limit, kindLabel, className }: LimitNoticeProps) {
  if (limit === null) return null; // безлимит — уведомлять не о чем

  if (remaining <= 0) {
    return (
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs text-destructive",
          className,
        )}
      >
        <AlertTriangle className="size-3.5 shrink-0" />
        Вы использовали весь бесплатный лимит {kindLabel.genitive}. Оформите Premium для
        безлимитного доступа или попробуйте снова завтра.
      </p>
    );
  }

  if (remaining <= LOW_REMAINING_THRESHOLD) {
    return (
      <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Info className="size-3.5 shrink-0 text-primary" />
        Осталось {remaining} бесплатных {kindLabel.genitive} сегодня.
      </p>
    );
  }

  return null;
}
