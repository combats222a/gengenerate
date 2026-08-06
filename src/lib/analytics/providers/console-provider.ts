import type { AnalyticsProvider } from "../types";

/**
 * Простейший провайдер: пишет событие в консоль браузера. Полезен в
 * разработке и как референс для того, как выглядит минимальный
 * AnalyticsProvider — вся реализация укладывается в одну функцию track().
 */
export function createConsoleProvider(): AnalyticsProvider {
  return {
    name: "console",
    track(event) {
      console.info(`[analytics] ${event.name}`, event);
    },
  };
}
