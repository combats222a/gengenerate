import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import { PLAN_PRICES, isSubscriptionPlan } from "@/lib/subscription-plans";

export const runtime = "nodejs";

/**
 * Перенесено из api/create-invoice.js старого проекта (convertcontext).
 * Логика НЕ менялась: те же тарифы ($1/день, $3/месяц), тот же payload для
 * NOWPayments (order_id = "token:plan" — вебхук потом раскодирует обратно),
 * pay_currency usdttrc20, те же callback/success/cancel URL.
 *
 * Изменился только "конверт": оригинал был написан как Vercel-функция
 * (req, res) вне роутинга Next.js — под App Router так работать не будет,
 * поэтому сигнатура адаптирована под Route Handler (Request -> Response).
 * Домен теперь берётся из общего siteConfig.url (src/config/site.ts)
 * вместо отдельной константы, продублированной в оригинальном файле.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const plan = body?.plan as string | undefined;

  if (!token || !plan) {
    return NextResponse.json({ error: "token и plan обязательны" }, { status: 400 });
  }

  if (!isSubscriptionPlan(plan)) {
    return NextResponse.json({ error: "Неизвестный тариф" }, { status: 400 });
  }

  const amount = PLAN_PRICES[plan];

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "usdttrc20",
        order_id: `${token}:${plan}`, // вебхук прочитает token и plan отсюда
        order_description: plan === "day" ? "Снятие лимита на день" : "Подписка на месяц",
        ipn_callback_url: `${siteConfig.url}/api/webhook`,
        success_url: `${siteConfig.url}/?paid=1`,
        cancel_url: `${siteConfig.url}/?paid=0`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NOWPayments error:", data);
      return NextResponse.json({ error: "Не удалось создать инвойс" }, { status: 500 });
    }

    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
