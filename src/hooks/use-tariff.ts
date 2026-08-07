"use client";

import { useMemo } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import {
  TARIFFS,
  tariffForPlan,
  type SubscriptionPlan,
  type TariffDefinition,
  type TariffId,
} from "@/config/tariffs";

export interface UseTariffResult {
  tariffId: TariffId;
  tariff: TariffDefinition;
  isPremium: boolean;
  /** Активный платный план (month/year) или null на Free. */
  plan: SubscriptionPlan | null;
  /** Срок действия подписки (мс, unix). null на Free. */
  expiresAt: number | null;
  isLoading: boolean;
  isRedirecting: boolean;
  error: string | null;
  subscribe: (plan: SubscriptionPlan) => Promise<void>;
}

/**
 * ЭТАП 13 — "Premium Gate 2.0". Раньше (Этап 4) вся система знала только
 * один бинарный факт — оплачено/нет (useSubscription().isPaid). Этого
 * хватало для одного пэйвола, но не хватает для тарифной сетки: нужно
 * автоматически определять тип подписки, доступные функции, остаток
 * лимитов и Premium-возможности конкретного генератора.
 *
 * useTariff() — единственная точка, где "оплачено/план/срок" (из Redis
 * через useSubscription) превращается в "тариф с конкретным набором
 * функций" (из @/config/tariffs). Всё остальное — useGenerationQuota,
 * PremiumGate, GeneratorEngine — читает функции тарифа отсюда, а не
 * пишет собственные if(isPaid).
 */
export function useTariff(): UseTariffResult {
  const { isPaid, expiresAt, plan, isLoading, isRedirecting, error, subscribe } =
    useSubscription();

  const tariffId = isPaid ? tariffForPlan(plan) : "free";
  const tariff = TARIFFS[tariffId];

  return useMemo(
    () => ({
      tariffId,
      tariff,
      isPremium: isPaid,
      plan: isPaid ? plan : null,
      expiresAt: isPaid ? expiresAt : null,
      isLoading,
      isRedirecting,
      error,
      subscribe,
    }),
    [tariffId, tariff, isPaid, plan, expiresAt, isLoading, isRedirecting, error, subscribe],
  );
}
