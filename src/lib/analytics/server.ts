import { getRedis } from "@/lib/redis";
import type { AnalyticsEventInput, AnalyticsEventName } from "./types";

/**
 * Серверная сторона Analytics Engine. Используется в двух местах:
 *  - src/app/api/analytics/route.ts — принимает события с клиента (Beacon Provider);
 *  - src/app/api/webhook/route.ts — событие premium_conversion рождается
 *    не в браузере, а в момент подтверждения оплаты NOWPayments, поэтому
 *    трекается отсюда напрямую, а не через client-side trackEvent.
 *
 * Пока это только суточные счётчики в том же Redis, что уже используется
 * подписками (Этап 4) — сознательно простое хранилище, а НЕ конкретный
 * сервис аналитики. Если позже понадобится реальный вендор (GA4,
 * PostHog, Plausible, собственная БД...) — меняется только эта функция
 * (и, возможно, providers/beacon-provider.ts на клиенте остаётся вообще
 * без изменений, т.к. он ничего не знает о том, что происходит с
 * событием после /api/analytics).
 */
function dayKey(name: AnalyticsEventName): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, тот же приём, что в generation-limit.ts
  return `analytics:${name}:${date}`;
}

export async function trackServerEvent(event: AnalyticsEventInput): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.incr(dayKey(event.name));
  } catch (error) {
    // Аналитика никогда не должна ронять основной запрос (оплату, генерацию и т.д.).
    console.error(`[analytics] не удалось записать серверное событие "${event.name}"`, error);
  }
}
