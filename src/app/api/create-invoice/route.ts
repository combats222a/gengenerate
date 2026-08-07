import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import { PLAN_LABELS, PLAN_PRICES, isSubscriptionPlan } from "@/lib/subscription-plans";

export const runtime = "nodejs";

/**
 * Перенесено из api/create-invoice.js старого проекта (convertcontext).
 * "Конверт" не менялся с Этапа 4: тот же payload для NOWPayments
 * (order_id = "token:plan" — вебхук потом раскодирует обратно),
 * pay_currency usdttrc20, те же callback/success/cancel URL, Route
 * Handler вместо Vercel-функции (req, res), домен из общего
 * siteConfig.url.
 *
 * ЭТАП 13: сами тарифы ("day"/"month" по $1/$3) заменены на Premium
 * Monthly/Premium Yearly из ТЗ — значения теперь читаются из
 * PLAN_PRICES/PLAN_LABELS (@/lib/subscription-plans, который в свою
 * очередь реэкспортирует @/config/tariffs — см. комментарий там).
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
        order_description: PLAN_LABELS[plan],
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
