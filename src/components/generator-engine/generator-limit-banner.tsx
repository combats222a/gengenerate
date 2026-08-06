"use client";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { PLAN_LABELS, PLAN_PRICES } from "@/lib/subscription-plans";

interface GeneratorLimitBannerProps {
  onSubscribe: (plan: "day" | "month") => void;
  isRedirecting: boolean;
}

/**
 * Показывается вместо кнопки запуска, когда дневной бесплатный лимит
 * исчерпан. В отличие от PremiumGate (Этап 4) — не прячет форму и
 * историю целиком, пользователь по-прежнему видит свои прошлые
 * результаты, просто не может запустить новую генерацию сегодня.
 */
export function GeneratorLimitBanner({ onSubscribe, isRedirecting }: GeneratorLimitBannerProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="size-4" />
      </span>
      <p className="text-sm text-foreground">
        Бесплатные генерации на сегодня закончились
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button size="sm" disabled={isRedirecting} onClick={() => onSubscribe("day")}>
          {PLAN_LABELS.day} — ${PLAN_PRICES.day}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isRedirecting}
          onClick={() => onSubscribe("month")}
        >
          {PLAN_LABELS.month} — ${PLAN_PRICES.month}
        </Button>
      </div>
      {isRedirecting && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader size="sm" /> Переходим к оплате…
        </p>
      )}
    </div>
  );
}
