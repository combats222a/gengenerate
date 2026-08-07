import { NextRequest, NextResponse } from "next/server";

import { getRedis } from "@/lib/redis";
import { isSubscriptionPlan, type SubscriptionPlan } from "@/lib/subscription-plans";

export const runtime = "nodejs";

/**
 * Перенесено из api/check-status.js старого проекта (convertcontext).
 * Ключ Redis (`paid:${token}`) и само условие оплаты (expiresAt > now)
 * не менялись.
 *
 * ЭТАП 13: значение в Redis теперь JSON { expiresAt, plan } вместо
 * голого числа (см. комментарий в webhook/route.ts) — Premium Gate 2.0
 * должен различать Premium Monthly и Premium Yearly, а не только сам
 * факт оплаты. parseStoredValue понимает оба формата: новый JSON и
 * старое голое число (уже оплаченные до этого изменения токены не
 * должны "слететь" на month/year распознавании — считаем их month).
 */
function parseStoredValue(raw: string): { expiresAt: number; plan: SubscriptionPlan } {
  try {
    const parsed = JSON.parse(raw) as { expiresAt?: unknown; plan?: unknown };
    if (typeof parsed.expiresAt === "number") {
      const plan = typeof parsed.plan === "string" && isSubscriptionPlan(parsed.plan) ? parsed.plan : "month";
      return { expiresAt: parsed.expiresAt, plan };
    }
  } catch {
    // не JSON — старый формат (голое число), см. ниже
  }
  return { expiresAt: Number(raw), plan: "month" };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token обязателен" }, { status: 400 });
  }

  const redis = await getRedis();
  const raw = await redis.get(`paid:${token}`);
  const stored = raw !== null ? parseStoredValue(raw) : null;
  const isPaid = stored !== null && stored.expiresAt > Date.now();

  return NextResponse.json(
    {
      paid: isPaid,
      expiresAt: isPaid ? stored!.expiresAt : null,
      plan: isPaid ? stored!.plan : null,
    },
    // no-store: статус оплаты меняется в любой момент (вебхук/оплата),
    // кеширование этого ответа хоть на секунду означает, что Premium Gate
    // может показать пользователю устаревшее состояние подписки (Этап 11).
    { headers: { "Cache-Control": "no-store" } },
  );
}
