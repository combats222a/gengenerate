"use client";

import * as React from "react";
import { Check, Lock } from "lucide-react";

import { useTariff } from "@/hooks/use-tariff";
import { TARIFFS, type SubscriptionPlan } from "@/config/tariffs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";

export interface PremiumGateProps {
  children: React.ReactNode;
  /** Заголовок пэйвола — например, название конкретного генератора */
  title?: string;
  description?: string;
  /** ЭТАП 13 — Premium-возможности именно этого генератора (GeneratorModule.premiumFeatures). */
  premiumFeatures?: string[];
  className?: string;
}

const PLAN_ORDER: SubscriptionPlan[] = ["month", "year"];

const FEATURE_LINES = [
  "Безлимитные локальные и AI-генерации",
  "Максимальное качество экспорта и доп. форматы",
  "Сохранение проектов и история генераций",
  "Пакетная генерация и приоритетная обработка AI-запросов",
  "Ранний доступ к новым генераторам",
];

/**
 * "Premium Gate 2.0" (Этап 13). Раньше (Этап 4) — просто пэйвол с двумя
 * тарифами (day/month) без какой-либо информации о том, что именно
 * покупается. Теперь автоматически определяет: тип подписки, доступные
 * функции, срок действия, и — если передан premiumFeatures — Premium-
 * возможности конкретного генератора, который она закрывает.
 *
 * Логика оплаты под капотом не изменилась с Этапа 4 (create-invoice/
 * check-status через useSubscription, см. tariffs.ts) — просто
 * useTariff() оборачивает её в понятие "тариф" вместо голого isPaid.
 */
export function PremiumGate({
  children,
  title = "Премиум-доступ",
  description,
  premiumFeatures,
  className,
}: PremiumGateProps) {
  const { isPremium, isLoading, tariff, expiresAt, subscribe, isRedirecting, error } =
    useTariff();
  const [pendingPlan, setPendingPlan] = React.useState<SubscriptionPlan | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader label="Проверяем статус подписки…" />
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className={className}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{tariff.label}</Badge>
          {expiresAt && <span>активна до {new Date(expiresAt).toLocaleDateString("ru-RU")}</span>}
        </div>
        {children}
      </div>
    );
  }

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setPendingPlan(plan);
    void subscribe(plan);
  };

  return (
    <Card className={className ? className : "mx-auto w-full max-w-md"}>
      <CardHeader className="items-center text-center">
        <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ?? "Этот раздел доступен по подписке. Оплата — в USDT через NOWPayments."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-left text-sm text-muted-foreground">
          {(premiumFeatures ?? FEATURE_LINES).map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {line}
            </li>
          ))}
        </ul>

        <div className="space-y-2.5">
          {PLAN_ORDER.map((plan) => {
            const planTariff = plan === "month" ? TARIFFS.premium_monthly : TARIFFS.premium_yearly;
            return (
              <Button
                key={plan}
                variant={plan === "year" ? "default" : "outline"}
                className="h-auto w-full justify-between py-2.5"
                disabled={isRedirecting}
                onClick={() => handleSubscribe(plan)}
              >
                <span className="flex flex-col items-start">
                  <span>{planTariff.label}</span>
                  {planTariff.discountNote && (
                    <span className="text-xs font-normal opacity-80">{planTariff.discountNote}</span>
                  )}
                </span>
                <span className="font-semibold">
                  ${planTariff.priceUsd} {planTariff.billingLabel}
                </span>
              </Button>
            );
          })}
        </div>

        {isRedirecting && (
          <p className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
            <Loader size="sm" />
            Переходим к оплате
            {pendingPlan ? ` (${TARIFFS[pendingPlan === "month" ? "premium_monthly" : "premium_yearly"].label})` : ""}
            …
          </p>
        )}
        {error && <p className="pt-1 text-center text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
