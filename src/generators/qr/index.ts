// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { QrCode } from "lucide-react";

import { createApiProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

export const generator: GeneratorModule = {
  slug: "qr",
  title: "QR-код",
  description: "Генерирует QR-код по тексту или ссылке.",
  icon: QrCode,
  categoryId: "other",
  fields: [
    {
      type: "text",
      name: "text",
      label: "Текст или ссылка",
      placeholder: "https://example.com",
      required: true,
    },
    {
      type: "slider",
      name: "size",
      label: "Размер, px",
      min: 128,
      max: 1024,
      step: 32,
      defaultValue: 256,
    },
  ],
  provider: createApiProvider({
    endpoint: "/api/generators/qr",
    parseResponse: (data) => ({
      kind: "image",
      url: (data as { dataUrl: string }).dataUrl,
      mimeType: "image/png",
    }),
  }),
  seo: {
    title: "Генератор QR-кодов онлайн",
    description:
      "Бесплатный генератор QR-кодов из текста или ссылки. Скачайте готовый QR-код в PNG.",
    keywords: ["qr код", "генератор qr", "qr code generator"],
  },
  isPopular: true,
};
