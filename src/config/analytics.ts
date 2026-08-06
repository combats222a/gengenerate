import type { AnalyticsProvider } from "@/lib/analytics/types";
import { createConsoleProvider } from "@/lib/analytics/providers/console-provider";
import { createBeaconProvider } from "@/lib/analytics/providers/beacon-provider";

/**
 * ЕДИНСТВЕННОЕ место во всём приложении, которое знает про конкретные
 * провайдеры аналитики. Сам движок (src/lib/analytics), хуки и точки
 * вызова trackXxx() ничего не знают о том, что из перечисленного здесь
 * реально включено — они просто вызывают trackEvent, а он рассылает
 * событие всем провайдерам из getConfiguredProviders().
 *
 * Чтобы подключить реальный сторонний сервис (GA4, PostHog, Plausible,
 * Vercel Analytics и т.д.) — нужно:
 *   1. добавить фабрику вида createXxxProvider() в lib/analytics/providers/;
 *   2. зарегистрировать её в PROVIDER_FACTORIES ниже;
 *   3. добавить её имя в NEXT_PUBLIC_ANALYTICS_PROVIDERS.
 * Ни движок, ни хуки, ни компоненты-потребители трогать не нужно.
 */
const PROVIDER_FACTORIES: Record<string, () => AnalyticsProvider> = {
  console: createConsoleProvider,
  beacon: createBeaconProvider,
};

/** В деве полезно видеть события в консоли; beacon включён всегда — он же кормит серверные счётчики. */
const DEFAULT_PROVIDERS =
  process.env.NODE_ENV === "production" ? "beacon" : "console,beacon";

export function getConfiguredProviders(): AnalyticsProvider[] {
  const names = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDERS ?? DEFAULT_PROVIDERS)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return names
    .map((name) => PROVIDER_FACTORIES[name]?.())
    .filter((provider): provider is AnalyticsProvider => Boolean(provider));
}
