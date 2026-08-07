"use client";

import { useMemo } from "react";

import { useTariff } from "@/hooks/use-tariff";
import { useGenerationLimit } from "@/lib/generator-engine/generation-limit";
import { LIMIT_KIND_LABELS, type GenerationKind } from "@/config/tariffs";

export interface UseGenerationQuotaResult {
  kind: GenerationKind;
  count: number;
  /** null = безлимит. */
  limit: number | null;
  remaining: number;
  isReached: boolean;
  increment: () => void;
  kindLabel: (typeof LIMIT_KIND_LABELS)[GenerationKind];
}

/**
 * ЭТАП 13 — "Архитектура тарифов": лимит генератора определяется
 * конфигурацией, а не кодом Generator Engine.
 *
 * По умолчанию генератор участвует в общем суточном пуле своего типа
 * (provider.kind: "local" → dailyLocalLimit, "api" → dailyAiLimit из
 * текущего тарифа, см. @/config/tariffs) — так и заданы лимиты "50
 * локальных / 5 AI в сутки" из ТЗ, общие на все генераторы разом.
 *
 * Если у конкретного генератора в его модуле задан freeDailyLimit — это
 * индивидуальный лимит именно для него: он не делит счётчик с общим
 * пулом (свой independent scope "gen:<id>") и применяется вместо
 * дефолтного лимита тарифа, пока пользователь на Free. С любым Premium-
 * тарифом индивидуальный лимит генератора отключается так же, как и
 * общий пул — Premium означает безлимит, если сам генератор целиком не
 * помечен isPremium (тогда работает PremiumGate, а не счётчик).
 */
export function useGenerationQuota(
  id: string,
  providerKind: "local" | "api",
  freeDailyLimit: number | undefined,
): UseGenerationQuotaResult {
  const { tariff, isPremium } = useTariff();
  const kind: GenerationKind = providerKind === "api" ? "ai" : "local";

  const scope = freeDailyLimit != null ? `gen:${id}` : `pool:${kind}`;
  const tariffLimit = kind === "ai" ? tariff.features.dailyAiLimit : tariff.features.dailyLocalLimit;
  const effectiveLimit = isPremium ? tariffLimit : (freeDailyLimit ?? tariffLimit);

  const limit = useGenerationLimit(scope, effectiveLimit);

  return useMemo(
    () => ({ kind, ...limit, kindLabel: LIMIT_KIND_LABELS[kind] }),
    [kind, limit],
  );
}
