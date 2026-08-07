// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { MonitorSmartphone } from "lucide-react";

import { createWorkerLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorFormValues } from "@/lib/generator-engine/types";
import type { GeneratorModule } from "@/generators/types";
import { computeFrameGeometry, paintMockup } from "./draw";
import type { MockupWorkerMessage } from "./mockup-worker";

/** Main-thread версия loadImage — воркер вместо этого использует createImageBitmap (см. mockup-worker.ts). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось загрузить изображение"));
    };
    img.src = url;
  });
}

interface MockupResult {
  url: string;
  mimeType: string;
}

export const generator: GeneratorModule = {
  slug: "mockup",
  title: "Мокап скриншота",
  description: "Оборачивает загруженный скриншот в рамку браузера или телефона.",
  icon: MonitorSmartphone,
  categoryId: "design",
  fields: [
    {
      type: "file",
      name: "image",
      label: "Скриншот",
      accept: "image/*",
      required: true,
    },
    {
      type: "select",
      name: "frameStyle",
      label: "Стиль рамки",
      defaultValue: "browser",
      options: [
        { value: "browser", label: "Браузер" },
        { value: "phone", label: "Телефон" },
      ],
    },
    { type: "color", name: "background", label: "Фон", defaultValue: "#0a0a0d" },
  ],
  /**
   * Этап 11: композитинг рамки перенесён в Web Worker
   * (mockup-worker.ts) через createWorkerLocalProvider — на больших
   * скриншотах (4K+) декодирование картинки и отрисовка на Canvas
   * иначе заметно подвешивают интерфейс на основном потоке. Рисующая
   * логика (draw.ts) общая для воркера и fallback ниже, так что
   * результат идентичен независимо от того, какой путь сработал.
   */
  provider: createWorkerLocalProvider<GeneratorFormValues, MockupWorkerMessage, MockupResult>({
    createWorker: () => new Worker(new URL("./mockup-worker.ts", import.meta.url)),
    buildMessage: (input) => {
      const file = input.image;
      if (!(file instanceof File)) {
        throw new Error("Загрузите изображение");
      }
      return {
        image: file,
        frameStyle: String(input.frameStyle ?? "browser"),
        background: String(input.background ?? "#0a0a0d"),
      };
    },
    parseResult: (result) => ({ kind: "image", url: result.url, mimeType: result.mimeType }),
    // Fallback на основном потоке — для браузеров без Worker/OffscreenCanvas
    // (см. проверки в createWorkerLocalProvider). Логика 1:1 с воркером,
    // только источник изображения/канвас — DOM-версии (Image/<canvas>).
    fallback: async ({ input }) => {
      const file = input.image;
      if (!(file instanceof File)) {
        throw new Error("Загрузите изображение");
      }

      const frameStyle = String(input.frameStyle ?? "browser");
      const background = String(input.background ?? "#0a0a0d");

      const img = await loadImage(file);
      const geometry = computeFrameGeometry(img.naturalWidth, img.naturalHeight, frameStyle);

      const canvas = document.createElement("canvas");
      canvas.width = geometry.canvasWidth;
      canvas.height = geometry.canvasHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas недоступен в этом браузере");
      }

      paintMockup(ctx, img, geometry, frameStyle, background);
      URL.revokeObjectURL(img.src);

      return {
        kind: "image",
        url: canvas.toDataURL("image/png"),
        mimeType: "image/png",
      };
    },
  }),
  seo: {
    title: "Генератор мокапов скриншотов — рамка браузера и телефона",
    description:
      "Оформите скриншот в рамку браузера или телефона для презентаций и маркетинговых материалов.",
    keywords: ["мокап скриншота", "browser mockup", "screenshot frame generator"],
  },
  // Единственный из пяти генераторов, помеченный премиумом — специально,
  // чтобы бейдж "Premium" в каталоге был не косметикой, а честно совпадал
  // с реальным поведением (см. PremiumGate, Этап 4/5).
  isPremium: true,
  // ЭТАП 13 — описательные Premium-возможности именно этого генератора,
  // для Premium Gate 2.0 (см. PremiumGate).
  premiumFeatures: ["Экспорт в максимальном качестве", "Пакетная генерация нескольких рамок сразу"],
};
