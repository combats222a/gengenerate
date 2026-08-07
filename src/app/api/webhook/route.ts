import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/server";
import { getRedis } from "@/lib/redis";
import { PLAN_DURATION_MS, isSubscriptionPlan } from "@/lib/subscription-plans";

export const runtime = "nodejs";

/**
 * Перенесено из api/webhook.js старого проекта (convertcontext).
 *
 * Проверка подписи НЕ МЕНЯЛАСЬ: sortObject и порядок сериализации важны
 * побайтово — именно так NOWPayments считает свою HMAC-SHA512 подпись
 * (обязательная сортировка ключей перед stringify, иначе подпись не
 * совпадёт и легитимные уведомления будут отклоняться как поддельные).
 *
 * Изменён только конверт (Request -> Response вместо req,res) и вынесен
 * Redis-клиент в общий src/lib/redis.ts вместо копии, продублированной
 * в оригинале в двух файлах (webhook.js и check-status.js).
 *
 * ЭТАП 13: раньше в Redis писалось голое число (expiresAt), а тариф был
 * всегда один ("оплачено = месяц"). Теперь тарифов два (month/year) с
 * разной длительностью и Premium Gate 2.0 должен знать, какой именно —
 * поэтому значение стало JSON { expiresAt, plan }. check-status.ts умеет
 * читать оба формата, чтобы не терять уже оплаченные до этого изменения
 * подписки (обратная совместимость по данным).
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
    const [token, rawPlan] = (orderId ?? "").split(":");
    // Неизвестный/повреждённый order_id — считаем месячным, как и раньше
    // (точное повторение прежней защитной логики "не day -> month").
    const plan = isSubscriptionPlan(rawPlan) ? rawPlan : "month";

    const now = Date.now();
    const expiresAt = now + PLAN_DURATION_MS[plan];

    const redis = await getRedis();
    await redis.set(`paid:${token}`, JSON.stringify({ expiresAt, plan }));
    await trackServerEvent({ name: "premium_conversion", plan });
  }

  return NextResponse.json({ received: true });
}
