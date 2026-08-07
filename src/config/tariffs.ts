/**
 * ЭТАП 13 — Система тарифов и монетизации.
 *
 * Единственный источник правды для всего, что касается тарифов: цены,
 * длительности, лимиты, доступные функции. Ничего из этого не зашито в
 * коде компонентов/хуков — они только читают значения отсюда. Это и есть
 * ответ на пункт ТЗ "Администрирование": чтобы поменять лимит, цену или
 * набор функций тарифа, правится один этот файл, Generator Engine и
 * компоненты трогать не нужно. Полноценная админ-панель с UI и БД —
 * следующий шаг, но контракт (один центральный конфиг, из которого всё
 * читается) уже даёт то самое "централизованное хранение настроек",
 * которое просит ТЗ, и делает будущий перенос в БД/CMS переносом одного
 * модуля, а не рефакторингом всего проекта.
 */

/** Платный тариф, за который реально проводится оплата через NOWPayments (см. subscription-plans.ts). */
export type SubscriptionPlan = "month" | "year";

/** Тариф целиком, включая бесплатный — то, чем реально оперирует остальной код (Premium Gate 2.0, лимиты, экспорт). */
export type TariffId = "free" | "premium_monthly" | "premium_yearly";

export type ExportQuality = "standard" | "max";

export interface TariffFeatures {
  /** Суточный лимит локальных генераций (provider.kind === "local"). null = безлимит. */
  dailyLocalLimit: number | null;
  /** Суточный лимит AI-генераций (provider.kind === "api"). null = безлимит. */
  dailyAiLimit: number | null;
  /** Качество экспорта результата. */
  exportQuality: ExportQuality;
  /** Дополнительные форматы экспорта сверх базового (например SVG→PDF, PNG→WebP). */
  extraExportFormats: boolean;
  /** Сколько проектов можно сохранить. null = безлимит, 0 = функция недоступна. */
  savedProjects: number | null;
  /** История генераций (сессионная история — см. session-history.ts). */
  generationHistory: boolean;
  /** Расширенные настройки генераторов (доп. поля формы сверх базовых). */
  advancedSettings: boolean;
  /** Пакетная генерация (несколько результатов за один запуск). */
  batchGeneration: boolean;
  /** Приоритетная обработка AI-запросов. Информационный флаг для API-провайдеров. */
  priorityProcessing: boolean;
  /** Ранний доступ к новым генераторам (см. src/config/upcoming-generators.ts). */
  earlyAccess: boolean;
}

export interface TariffDefinition {
  id: TariffId;
  /** Платный план, который покупается через /api/create-invoice. null — бесплатный тариф, не продаётся. */
  plan: SubscriptionPlan | null;
  label: string;
  /** Цена в USD. null — бесплатно. */
  priceUsd: number | null;
  billingLabel: string;
  /** Заметка о выгоде — используется только у годового тарифа. */
  discountNote?: string;
  features: TariffFeatures;
}

const PREMIUM_FEATURES: TariffFeatures = {
  dailyLocalLimit: null,
  dailyAiLimit: null,
  exportQuality: "max",
  extraExportFormats: true,
  savedProjects: null,
  generationHistory: true,
  advancedSettings: true,
  batchGeneration: true,
  priorityProcessing: true,
  earlyAccess: true,
};

export const TARIFFS: Record<TariffId, TariffDefinition> = {
  free: {
    id: "free",
    plan: null,
    label: "Free",
    priceUsd: null,
    billingLabel: "Бесплатно",
    features: {
      dailyLocalLimit: 50,
      dailyAiLimit: 5,
      exportQuality: "standard",
      extraExportFormats: false,
      savedProjects: 0,
      generationHistory: false,
      advancedSettings: false,
      batchGeneration: false,
      priorityProcessing: false,
      earlyAccess: false,
    },
  },
  premium_monthly: {
    id: "premium_monthly",
    plan: "month",
    label: "Premium Monthly",
    priceUsd: 3,
    billingLabel: "в месяц",
    features: PREMIUM_FEATURES,
  },
  premium_yearly: {
    id: "premium_yearly",
    plan: "year",
    label: "Premium Yearly",
    // Эффективно дешевле, чем 12×Premium Monthly ($36/год) — снижение
    // стоимости относительно ежемесячной подписки, как требует ТЗ.
    priceUsd: 24,
    billingLabel: "в год",
    discountNote: "На 33% дешевле, чем помесячно",
    features: PREMIUM_FEATURES,
  },
};

export const PLAN_TO_TARIFF: Record<SubscriptionPlan, TariffId> = {
  month: "premium_monthly",
  year: "premium_yearly",
};

export const PLAN_DURATION_MS: Record<SubscriptionPlan, number> = {
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  month: TARIFFS.premium_monthly.priceUsd as number,
  year: TARIFFS.premium_yearly.priceUsd as number,
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  month: TARIFFS.premium_monthly.label,
  year: TARIFFS.premium_yearly.label,
};

export function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return value === "month" || value === "year";
}

/** Тариф, к которому относится текущая подписка (или "free", если подписки нет/план неизвестен). */
export function tariffForPlan(plan: SubscriptionPlan | null | undefined): TariffId {
  if (!plan) return "free";
  return PLAN_TO_TARIFF[plan] ?? "free";
}

export function getTariff(id: TariffId): TariffDefinition {
  return TARIFFS[id];
}

/** Человекочитаемая подпись типа лимита — используется в уведомлениях и бейджах. */
export const LIMIT_KIND_LABELS = {
  local: { genitive: "локальных генераций", short: "локальных" },
  ai: { genitive: "AI-генераций", short: "AI" },
} as const;

export type GenerationKind = keyof typeof LIMIT_KIND_LABELS;
