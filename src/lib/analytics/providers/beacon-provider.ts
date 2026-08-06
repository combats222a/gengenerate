import type { AnalyticsEvent, AnalyticsProvider } from "../types";

const ENDPOINT = "/api/analytics";

/**
 * Отправляет событие на СОБСТВЕННЫЙ backend проекта, а не напрямую в
 * сторонний сервис аналитики — какой сервис (если вообще какой-то)
 * стоит за /api/analytics, решает src/lib/analytics/server.ts. Этот
 * провайдер и движок, который его вызывает, об этом не знают и не
 * должны знать — ровно тот же принцип, что у API Provider в Generator
 * Engine (Этап 5) по отношению к конкретному AI-вендору.
 *
 * navigator.sendBeacon гарантирует доставку даже если страница сразу
 * после события закрывается (уход со страницы, скачивание файла) —
 * именно поэтому предпочитается fetch с keepalive, который используется
 * только как fallback для окружений без sendBeacon.
 */
function send(event: AnalyticsEvent): void {
  const body = JSON.stringify(event);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const queued = navigator.sendBeacon(ENDPOINT, blob);
    if (queued) return;
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Потеря отдельного события аналитики не должна быть заметна пользователю.
  });
}

export function createBeaconProvider(): AnalyticsProvider {
  return { name: "beacon", track: send };
}
