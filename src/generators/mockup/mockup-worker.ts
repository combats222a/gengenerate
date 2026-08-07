/**
 * Воркер мокап-генератора (Этап 11, Web Workers для тяжёлых локальных
 * генераторов). Запускается через createWorkerLocalProvider
 * (src/lib/generator-engine/api-provider.ts) и общается с главным
 * потоком по протоколу WorkerResponse (./worker-protocol.ts).
 *
 * Внутри воркера нет window/document, поэтому вместо `new Image()` и
 * `document.createElement("canvas")` используются их воркер-версии —
 * `createImageBitmap` и `OffscreenCanvas` — обе доступны и в главном
 * потоке, и в Dedicated Worker, так что рисующая логика (paintMockup)
 * общая с фоллбэком, отличается только то, чем создаётся канвас и
 * изображение (см. mockup/index.ts).
 *
 * tsconfig.json проекта подключает lib "dom" (не "webworker" — эти два
 * набора типов конфликтуют друг с другом в одном конфиге), поэтому
 * `self` типизирован через минимальный локальный интерфейс ниже, а не
 * через глобальный DedicatedWorkerGlobalScope.
 */
import type { WorkerResponse } from "@/lib/generator-engine/worker-protocol";
import { computeFrameGeometry, paintMockup } from "./draw";

export interface MockupWorkerMessage {
  image: File;
  frameStyle: string;
  background: string;
}

interface WorkerScope {
  postMessage(message: WorkerResponse<{ url: string; mimeType: string }>): void;
  addEventListener(type: "message", listener: (event: MessageEvent<MockupWorkerMessage>) => void): void;
}

const ctx = self as unknown as WorkerScope;

ctx.addEventListener("message", (event) => {
  void handle(event.data);
});

async function handle(message: MockupWorkerMessage) {
  try {
    ctx.postMessage({ type: "progress", message: "Загружаем изображение…" });

    const bitmap = await createImageBitmap(message.image);
    const geometry = computeFrameGeometry(bitmap.width, bitmap.height, message.frameStyle);

    ctx.postMessage({ type: "progress", percent: 40, message: "Рисуем рамку…" });

    const canvas = new OffscreenCanvas(geometry.canvasWidth, geometry.canvasHeight);
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) {
      throw new Error("OffscreenCanvas недоступен в этом браузере");
    }

    paintMockup(canvasCtx, bitmap, geometry, message.frameStyle, message.background);
    bitmap.close();

    ctx.postMessage({ type: "progress", percent: 85, message: "Кодируем PNG…" });

    const blob = await canvas.convertToBlob({ type: "image/png" });
    const url = URL.createObjectURL(blob);

    ctx.postMessage({ type: "result", payload: { url, mimeType: "image/png" } });
  } catch (error) {
    ctx.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Не удалось выполнить генерацию в воркере",
    });
  }
}
