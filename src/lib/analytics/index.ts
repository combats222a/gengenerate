import type { AnalyticsEvent, AnalyticsEventInput, AnalyticsProvider } from "./types";

export * from "./types";
export * from "./events";

/**
 * Реестр провайдеров держится модульным замыканием, а не React-состоянием —
 * события могут прилетать (см. events.ts) до того, как AnalyticsProvider
 * успеет смонтироваться и вызвать initAnalytics. До инициализации события
 * складываются в очередь и рассылаются сразу после неё, чтобы не терять
 * то, что произошло в первые миллисекунды загрузки страницы.
 */
let providers: AnalyticsProvider[] = [];
let initialized = false;
const pendingQueue: AnalyticsEvent[] = [];

function dispatch(event: AnalyticsEvent): void {
  for (const provider of providers) {
    try {
      provider.track(event);
    } catch (error) {
      // Один упавший провайдер не должен ронять остальные и уж тем более сайт.
      console.error(`[analytics] провайдер "${provider.name}" упал на событии "${event.name}"`, error);
    }
  }
}

/** Вызывается один раз из AnalyticsProvider (см. components/providers). */
export function initAnalytics(list: AnalyticsProvider[]): void {
  providers = list;
  initialized = true;
  const queued = pendingQueue.splice(0, pendingQueue.length);
  queued.forEach(dispatch);
}

/**
 * Низкоуровневая точка входа. Конкретные точки вызова в приложении должны
 * использовать типизированные хелперы из events.ts, а не эту функцию
 * напрямую — так набор полей каждого события задаётся в одном месте.
 */
export function trackEvent(event: AnalyticsEventInput): void {
  const fullEvent = { ...event, timestamp: Date.now() } as AnalyticsEvent;

  if (!initialized) {
    pendingQueue.push(fullEvent);
    return;
  }
  dispatch(fullEvent);
}
