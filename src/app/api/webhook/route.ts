import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getRedis } from "@/lib/redis";
import { PLAN_DURATION_MS } from "@/lib/subscription-plans";

export const runtime = "nodejs";

/**
 * Перенесено из api/webhook.js старого проекта (convertcontext).
 *
 * Проверка подписи НЕ МЕНЯЛАСЬ: sortObject и порядок сериализации важны
 * побайтово — именно так NOWPayments считает свою HMAC-SHA512 подпись
 * (обязательная сортировка ключей перед stringify, иначе подпись не
 * совпадёт и легитимные уведомления будут отклоняться как поддельные).
 * Расчёт expiresAt тоже не менялся: не "day" → тариф считается месячным,
 * как и в оригинале (это не баг, а точное повторение исходной логики).
 *
 * Изменён только конверт (Request -> Response вместо req,res) и вынесен
 * Redis-клиент в общий src/lib/redis.ts вместо копии, продублированной
 * в оригинале в двух файлах (webhook.js и check-status.js).
 */
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      const value = obj[key];
      result[key] =
        value && typeof value === "object" && !Array.isArray(value)
          ? sortObject(value as Record<string, unknown>)
          : value;
      return result;
    }, {});
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const receivedSignature = request.headers.get("x-nowpayments-sig");
  const sortedBody = JSON.stringify(sortObject(body as Record<string, unknown>));

  const expectedSignature = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET ?? "")
    .update(sortedBody)
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    console.error("Неверная подпись IPN — возможна подделка запроса");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { payment_status: paymentStatus, order_id: orderId } = body as {
    payment_status?: string;
    order_id?: string;
  };

  if (paymentStatus === "finished" || paymentStatus === "confirmed") {
    const [token, plan] = (orderId ?? "").split(":");

    const now = Date.now();
    const expiresAt = plan === "day" ? now + PLAN_DURATION_MS.day : now + PLAN_DURATION_MS.month;

    const redis = await getRedis();
    await redis.set(`paid:${token}`, expiresAt);
  }

  return NextResponse.json({ received: true });
}
