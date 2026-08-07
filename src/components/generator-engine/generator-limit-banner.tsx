"use client";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { TARIFFS, type SubscriptionPlan, type LIMIT_KIND_LABELS, type GenerationKind } from "@/config/tariffs";

interface GeneratorLimitBannerProps {
  onSubscribe: (plan: SubscriptionPlan) => void;
  isRedirecting: boolean;
  kindLabel: (typeof LIMIT_KIND_LABELS)[GenerationKind];
}

/**
 * Показывается вместо кнопки запуска, когда дневной бесплатный лимит
 * (локальных или AI-генераций — см. kindLabel) исчерпан. В отличие от
 * PremiumGate (Этап 4/13) — не прячет форму и историю целиком,
 * пользователь по-прежнему видит свои прошлые результаты, просто не
 * может запустить новую генерацию сегодня.
 *
 * ЭТАП 13: раньше здесь были планы day/month ($1/$3), теперь — Premium
 * Monthly/Premium Yearly из ТЗ (см. @/config/tariffs), а текст
 * подстраивается под тип исчерпанного лимита (локальный/AI).
 */
export function GeneratorLimitBanner({ onSubscribe, isRedirecting, kindLabel }: GeneratorLimitBannerProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="size-4" />
      </span>
      <p className="text-sm text-foreground">
        Бесплатный лимит {kindLabel.genitive} на сегодня исчерпан
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button size="sm" onClick={() => onSubscribe("year")} disabled={isRedirecting}>
          {TARIFFS.premium_yearly.label} — ${TARIFFS.premium_yearly.priceUsd}{" "}
          {TARIFFS.premium_yearly.billingLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isRedirecting}
          onClick={() => onSubscribe("month")}
        >
          {TARIFFS.premium_monthly.label} — ${TARIFFS.premium_monthly.priceUsd}{" "}
          {TARIFFS.premium_monthly.billingLabel}
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
