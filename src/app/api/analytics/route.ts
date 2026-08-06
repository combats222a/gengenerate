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

  return NextResponse.json({ received: true });
}
