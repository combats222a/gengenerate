/* ==========================================================================
   Analytics Engine — типы.

   Идея та же, что у Generator Engine (Этап 5/6.5): движок работает с
   единым набором типов событий и НЕ ЗНАЕТ, куда именно они улетают —
   в консоль, в собственный /api/analytics, в GA4, PostHog, Plausible
   или куда угодно ещё. Конкретный сервис аналитики — это всегда
   AnalyticsProvider, который движок вызывает по одинаковой сигнатуре
   track(event). Подключение/замена сервиса не должно требовать
   изменения движка, хуков или точек вызова trackEvent — только
   src/config/analytics.ts (и, при необходимости, серверного роута).
   ========================================================================== */

export type AnalyticsEventName =
  | "page_view"
  | "generation_started"
  | "generation_success"
  | "generation_error"
  | "download"
  | "premium_conversion"
  | "search"
  | "client_error"
  | "web_vital";

interface BaseAnalyticsEvent {
  name: AnalyticsEventName;
  /** Проставляется движком автоматически в trackEvent — вызывающий код это поле не задаёт. */
  timestamp: number;
}

export interface PageViewEvent extends BaseAnalyticsEvent {
  name: "page_view";
  path: string;
}

export interface GenerationStartedEvent extends BaseAnalyticsEvent {
  name: "generation_started";
  generatorId: string;
  providerKind: "local" | "api";
}

export interface GenerationSuccessEvent extends BaseAnalyticsEvent {
  name: "generation_success";
  generatorId: string;
  providerKind: "local" | "api";
  durationMs: number;
}

export interface GenerationErrorEvent extends BaseAnalyticsEvent {
  name: "generation_error";
  generatorId: string;
  providerKind: "local" | "api";
  message: string;
}

export interface DownloadEvent extends BaseAnalyticsEvent {
  name: "download";
  generatorId: string;
  outputKind: string;
}

export interface PremiumConversionEvent extends BaseAnalyticsEvent {
  name: "premium_conversion";
  plan: string;
}

export interface SearchEvent extends BaseAnalyticsEvent {
  name: "search";
  query: string;
}

/** Названо client_error, а не error/ErrorEvent — чтобы не конфликтовать с глобальным DOM-типом ErrorEvent. */
export interface ClientErrorEvent extends BaseAnalyticsEvent {
  name: "client_error";
  message: string;
  source: string;
  stack?: string;
}

export interface WebVitalEvent extends BaseAnalyticsEvent {
  name: "web_vital";
  metric: string;
  value: number;
  rating?: string;
  path: string;
}

export type AnalyticsEvent =
  | PageViewEvent
  | GenerationStartedEvent
  | GenerationSuccessEvent
  | GenerationErrorEvent
  | DownloadEvent
  | PremiumConversionEvent
  | SearchEvent
  | ClientErrorEvent
  | WebVitalEvent;

/** То немногое, что обязан предоставить конкретный провайдер аналитики. */
export interface AnalyticsProvider {
  /** Только для логов/отладки движка, на логику не влияет. */
  name: string;
  track: (event: AnalyticsEvent) => void;
}

/**
 * Обычный Omit<AnalyticsEvent, "timestamp"> схлопывает дискриминированное
 * объединение до полей, общих для ВСЕХ вариантов (keyof объединения — это
 * пересечение ключей, а не их сумма) — остаётся только name, остальные
 * поля пропадают и excess property check ломается. DistributiveOmit
 * применяет Omit к каждому варианту объединения по отдельности через
 * условный тип, поэтому специфичные поля (plan, query, generatorId и т.д.)
 * сохраняются.
 */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type AnalyticsEventInput = DistributiveOmit<AnalyticsEvent, "timestamp">;
