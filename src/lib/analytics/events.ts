import { trackEvent } from "./index";

/**
 * Единственное, что должны импортировать компоненты и хуки приложения —
 * не trackEvent напрямую и не AnalyticsEvent-типы. Каждая функция здесь
 * соответствует ровно одной метрике из требований Этапа 10 (просмотры
 * страниц, генерации, скачивания, конверсии Premium, поиск, ошибки,
 * производительность) и фиксирует набор полей для неё.
 */

export function trackPageView(path: string): void {
  trackEvent({ name: "page_view", path });
}

export function trackGenerationStarted(generatorId: string, providerKind: "local" | "api"): void {
  trackEvent({ name: "generation_started", generatorId, providerKind });
}

export function trackGenerationSuccess(
  generatorId: string,
  providerKind: "local" | "api",
  durationMs: number,
): void {
  trackEvent({ name: "generation_success", generatorId, providerKind, durationMs });
}

export function trackGenerationError(
  generatorId: string,
  providerKind: "local" | "api",
  message: string,
): void {
  trackEvent({ name: "generation_error", generatorId, providerKind, message });
}

export function trackDownload(generatorId: string, outputKind: string): void {
  trackEvent({ name: "download", generatorId, outputKind });
}

export function trackSearch(query: string): void {
  if (!query.trim()) return;
  trackEvent({ name: "search", query: query.trim() });
}

export function trackClientError(message: string, source: string, stack?: string): void {
  trackEvent({ name: "client_error", message, source, stack });
}

export function trackWebVital(metric: string, value: number, path: string, rating?: string): void {
  trackEvent({ name: "web_vital", metric, value, rating, path });
}
