"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getOrCreateSubscriptionToken } from "@/lib/subscription-token";
import type { SubscriptionPlan } from "@/lib/subscription-plans";

interface CheckStatusResponse {
  paid: boolean;
  expiresAt: number | null;
  /** ЭТАП 13 — какой именно план оплачен (month/year); null пока не оплачено. */
  plan: SubscriptionPlan | null;
}

interface UseSubscriptionResult {
  token: string;
  isPaid: boolean;
  expiresAt: number | null;
  /** ЭТАП 13 — активный план подписки (month/year), либо null на Free. Источник для useTariff(). */
  plan: SubscriptionPlan | null;
  /** Идёт первая проверка статуса */
  isLoading: boolean;
  /** Идёт переход на страницу оплаты NOWPayments */
  isRedirecting: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  subscribe: (plan: SubscriptionPlan) => Promise<void>;
}

/**
 * НОВОЕ (Этап 4) — связывает то, что уже было в старом проекте
 * (эндпоинты /api/check-status и /api/create-invoice, оба перенесены без
 * изменения логики), с токеном из subscription-token.ts. Самого такого
 * хука в исходном проекте не было — /pricing там был заглушкой.
 *
 * ЭТАП 13 — добавлено поле `plan`: раньше подписка была бинарной
 * (оплачено/нет), теперь тарифов два (month/year, см. tariffs.ts), и
 * Premium Gate 2.0 должен знать, какой именно активен.
 */
export function useSubscription(): UseSubscriptionResult {
  const [token, setToken] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retriedRef = useRef(false);

  const refresh = useCallback(async () => {
    const currentToken = getOrCreateSubscriptionToken();
    setToken(currentToken);
    if (!currentToken) return;

    setError(null);
    try {
      const response = await fetch(
        `/api/check-status?token=${encodeURIComponent(currentToken)}`,
      );
      const data: CheckStatusResponse = await response.json();
      setIsPaid(data.paid);
      setExpiresAt(data.expiresAt);
      setPlan(data.plan);
    } catch {
      setError("Не удалось проверить статус подписки");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Обычный паттерн "загрузить данные при монтировании": setState в refresh
    // происходит после await fetch(), а не синхронно в теле эффекта — но
    // текущая версия правила это не различает и требует явного исключения.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Если пользователь вернулся от NOWPayments с ?paid=1, вебхук мог ещё не
  // успеть отработать — делаем один повторный опрос через паузу.
  useEffect(() => {
    if (typeof window === "undefined" || retriedRef.current) return;
    const paidParam = new URLSearchParams(window.location.search).get("paid");
    if (paidParam !== "1") return;

    retriedRef.current = true;
    const timer = setTimeout(() => refresh(), 4000);
    return () => clearTimeout(timer);
  }, [refresh]);

  const subscribe = useCallback(
    async (plan: SubscriptionPlan) => {
      setIsRedirecting(true);
      setError(null);
      try {
        const response = await fetch("/api/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, plan }),
        });
        const data = await response.json();

        if (!response.ok || !data.invoice_url) {
          throw new Error(data.error || "Не удалось создать счёт на оплату");
        }

        window.location.href = data.invoice_url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка оплаты");
        setIsRedirecting(false);
      }
    },
    [token],
  );

  return { token, isPaid, expiresAt, plan, isLoading, isRedirecting, error, refresh, subscribe };
}
