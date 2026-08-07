import { NextRequest, NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/server";
import type { AnalyticsEvent } from "@/lib/analytics/types";

export const runtime = "nodejs";

/**
 * Принимает события от Beacon Provider (src/lib/analytics/providers/
 * beacon-provider.ts). Тело запроса не валидируется строго по схеме —
 * это внутренний, доверенный клиентом самого приложения эндпоинт, а не
 * публичное API; минимальной проверки name достаточно, чтобы не писать
 * в Redis мусор при повреждённом теле.
 */
export async function POST(request: NextRequest) {
  const event = (await request.json().catch(() => null)) as AnalyticsEvent | null;

  if (!event || typeof event.name !== "string") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  await trackServerEvent(event);

  // Явный no-store: событие аналитики нельзя кешировать/дедуплицировать
  // прокси или CDN — иначе повторные события с одинаковым телом (два
  // клика подряд) молча схлопнутся в один засчитанный. Без этого
  // заголовка Route Handler и так не кешируется по умолчанию (POST +
  // request.json() уже делают его динамическим), но здесь это важно
  // явно зафиксировать как часть контракта эндпоинта (Этап 11).
  return NextResponse.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
}
