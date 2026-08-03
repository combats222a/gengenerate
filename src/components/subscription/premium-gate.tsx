"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { useSubscription } from "@/hooks/use-subscription";
import { PLAN_LABELS, PLAN_PRICES, type SubscriptionPlan } from "@/lib/subscription-plans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

export interface PremiumGateProps {
  children: React.ReactNode;
  /** Заголовок пэйвола — например, название конкретного генератора */
  title?: string;
  description?: string;
  className?: string;
}

/**
 * НОВОЕ (Этап 4) — самого компонента Premium Gate в исходном проекте не
 * было (см. README, раздел "Этап 4"). Логика оплаты под капотом — это
 * ровно перенесённые без изменений api/create-invoice.js и
 * api/check-status.js старого проекта (через useSubscription), только
 * добавлена сама UI-обёртка, которой не хватало для реального
 * использования.
 *
 * Оборачивает премиум-контент: пока подписка не активна — показывает
 * пэйвол с двумя тарифами; как только Redis подтверждает оплату
 * (через вебхук) — рендерит children.
 */
export function PremiumGate({ children, title = "Премиум-доступ", description, className }: PremiumGateProps) {
  const { isPaid, isLoading, subscribe, isRedirecting, error } = useSubscription();
  const [pendingPlan, setPendingPlan] = React.useState<SubscriptionPlan | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader label="Проверяем статус подписки…" />
      </div>
    );
  }

  if (isPaid) {
    return <>{children}</>;
  }

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setPendingPlan(plan);
    void subscribe(plan);
  };

  const plans: SubscriptionPlan[] = ["day", "month"];

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
      <CardContent className="space-y-2.5">
        {plans.map((plan) => (
          <Button
            key={plan}
            variant={plan === "month" ? "default" : "outline"}
            className="w-full justify-between"
            disabled={isRedirecting}
            onClick={() => handleSubscribe(plan)}
          >
            <span>{PLAN_LABELS[plan]}</span>
            <span className="font-semibold">${PLAN_PRICES[plan]}</span>
          </Button>
        ))}

        {isRedirecting && (
          <p className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
            <Loader size="sm" />
            Переходим к оплате{pendingPlan ? ` (${PLAN_LABELS[pendingPlan].toLowerCase()})` : ""}…
          </p>
        )}
        {error && <p className="pt-1 text-center text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
