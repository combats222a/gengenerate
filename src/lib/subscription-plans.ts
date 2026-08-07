/**
 * ЭТАП 13 — значения тарифов (цены, длительности, лейблы) больше не
 * хранятся здесь как константы: единственный источник правды — теперь
 * src/config/tariffs.ts (TARIFFS), сюда только реэкспортируются под
 * прежними именами, чтобы не трогать все файлы, которые уже их
 * импортируют (create-invoice, webhook, premium-gate, generator-limit-
 * banner и т.д.). Логика оплаты (create-invoice/webhook/check-status)
 * при этом не менялась ни на строчку — см. Этап 4.
 *
 * Раньше (Этап 4) здесь было два плана: "day" ($1, снять лимит на
 * сегодня) и "month" ($3, безлимит на месяц) — перенесённые как есть из
 * старого проекта. Этап 13 заменяет их тремя тарифами из ТЗ (Free,
 * Premium Monthly, Premium Yearly): "day"-пропуска в новой системе нет,
 * вместо него — треть уровня Free с суточными лимитами по типу
 * генератора (см. tariffs.ts).
 */
export type {
  SubscriptionPlan,
  TariffId,
  TariffDefinition,
  TariffFeatures,
  ExportQuality,
  GenerationKind,
} from "@/config/tariffs";

export {
  PLAN_PRICES,
  PLAN_DURATION_MS,
  PLAN_LABELS,
  PLAN_TO_TARIFF,
  TARIFFS,
  LIMIT_KIND_LABELS,
  isSubscriptionPlan,
  tariffForPlan,
  getTariff,
} from "@/config/tariffs";
