// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Fingerprint } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

function formatUuid(uuid: string, format: string): string {
  if (format === "no-dashes") return uuid.replace(/-/g, "");
  if (format === "uppercase") return uuid.toUpperCase();
  if (format === "braces") return `{${uuid}}`;
  return uuid;
}

export const generator: GeneratorModule = {
  slug: "uuid-generator",
  title: "Генератор UUID",
  description: "Список UUID v4 нужного количества и формата — по одному на строку.",
  icon: Fingerprint,
  categoryId: "code",
  fields: [
    {
      type: "slider",
      name: "count",
      label: "Количество",
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 10,
    },
    {
      type: "select",
      name: "format",
      label: "Формат",
      defaultValue: "default",
      options: [
        { value: "default", label: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" },
        { value: "uppercase", label: "В верхнем регистре" },
        { value: "no-dashes", label: "Без дефисов" },
        { value: "braces", label: "В фигурных скобках" },
      ],
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const count = Math.min(Math.max(Number(input.count ?? 10), 1), 100);
    const format = String(input.format ?? "default");

    const uuids = Array.from({ length: count }, () => formatUuid(crypto.randomUUID(), format));

    return { kind: "text", content: uuids.join("\n") };
  }),
  seo: {
    title: "Генератор UUID v4 онлайн",
    description:
      "Сгенерируйте от 1 до 100 UUID версии 4 в нужном формате — с дефисами, без них, в верхнем регистре или в скобках.",
    keywords: ["генератор uuid", "uuid v4 generator", "guid generator"],
  },
  isNew: true,
};
