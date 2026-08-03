import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

/**
 * Backend генератора "qr" (src/generators/qr). Сознательно оформлен как
 * API Provider, а не Local — чтобы в SDK был живой, полностью
 * протестированный пример именно этого пути (Local уже покрыт остальными
 * четырьмя генераторами). QR технически можно было бы кодировать и в
 * браузере той же библиотекой, но здесь это намеренно вынесено на
 * сервер как демонстрация паттерна "GeneratorEngine -> createApiProvider
 * -> собственный Route Handler". Логики конкретного генератора движок
 * по-прежнему не содержит — она целиком здесь.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  const size = typeof body?.size === "number" ? body.size : 256;

  if (!text.trim()) {
    return NextResponse.json({ error: "Введите текст или ссылку" }, { status: 400 });
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: Math.min(Math.max(size, 128), 1024),
      margin: 1,
    });
    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json({ error: "Не удалось сгенерировать QR-код" }, { status: 500 });
  }
}
