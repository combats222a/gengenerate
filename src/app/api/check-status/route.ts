import { NextRequest, NextResponse } from "next/server";

import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

/**
 * Перенесено из api/check-status.js старого проекта (convertcontext).
 * Логика не менялась: тот же ключ Redis (`paid:${token}`), то же сравнение
 * expiresAt с Date.now(). Изменён только конверт — query-параметр читается
 * через request.nextUrl.searchParams вместо req.query.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token обязателен" }, { status: 400 });
  }

  const redis = await getRedis();
  const expiresAt = await redis.get(`paid:${token}`);
  const isPaid = expiresAt !== null && Number(expiresAt) > Date.now();

  return NextResponse.json({
    paid: isPaid,
    expiresAt: isPaid ? Number(expiresAt) : null,
  });
}
