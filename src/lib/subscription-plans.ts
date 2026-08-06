/**
 * Значения перенесены без изменений: цены — из api/create-invoice.js
 * (объект PRICES), длительности — из api/webhook.js (расчёт expiresAt).
 * В старом проекте оба набора значений были захардкожены по отдельности
 * в двух разных файлах; здесь — один источник, чтобы create-invoice и
 * webhook не могли разойтись между собой.
 */
export type SubscriptionPlan = "day" | "month";

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  day: 1, // $1 — снять лимит на сегодня
  month: 3, // $3 — безлимит на месяц
};

export const PLAN_DURATION_MS: Record<SubscriptionPlan, number> = {
  day: 24 * 60 * 60 * 1000, // +1 день
  month: 30 * 24 * 60 * 60 * 1000, // +30 дней
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  day: "Снять лимит на сегодня",
  month: "Безлимит на месяц",
};

export function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return value === "day" || value === "month";
}
