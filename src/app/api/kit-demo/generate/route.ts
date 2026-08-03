import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * ТОЛЬКО для демонстрации API Provider на /kit (см. Этап 5, GeneratorEngine).
 * Никакой реальной AI-логики здесь нет и не должно быть — по ТЗ движок не
 * должен содержать логику конкретного генератора. Это тривиальный
 * эндпоинт, который лишь доказывает, что путь
 * GeneratorEngine -> createApiProvider -> fetch -> Route Handler -> ответ
 * реально работает, а не только типизируется.
 *
 * Настоящий генератор на следующих этапах будет вызывать здесь любой
 * реальный AI-сервис (OpenAI, Claude, Gemini, FLUX, ElevenLabs и т.д.) —
 * GeneratorEngine об этом ничего не будет знать, ему важен только контракт
 * ответа, который читает parseResponse в конфиге провайдера.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Введите текст" }, { status: 400 });
  }

  // Имитация сетевой задержки внешнего API.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const reversed = text.split("").reverse().join("");

  return NextResponse.json({ result: reversed });
}
