// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Braces } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

export const generator: GeneratorModule = {
  slug: "json-formatter",
  title: "JSON-форматтер",
  description: "Форматирует, минифицирует или проверяет валидность JSON.",
  icon: Braces,
  categoryId: "code",
  fields: [
    {
      type: "textarea",
      name: "input",
      label: "JSON",
      placeholder: '{"key": "value"}',
      required: true,
    },
    {
      type: "select",
      name: "mode",
      label: "Режим",
      defaultValue: "pretty",
      options: [
        { value: "pretty", label: "Форматировать (с отступами)" },
        { value: "minify", label: "Минифицировать (в одну строку)" },
        { value: "validate", label: "Только проверить" },
      ],
    },
    {
      type: "slider",
      name: "indent",
      label: "Отступ, пробелов (для «Форматировать»)",
      min: 2,
      max: 8,
      step: 2,
      defaultValue: 2,
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const raw = String(input.input ?? "");
    const mode = String(input.mode ?? "pretty");
    const indent = Number(input.indent ?? 2);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "неизвестная ошибка";
      throw new Error(`Невалидный JSON: ${reason}`);
    }

    if (mode === "validate") {
      const type = Array.isArray(parsed) ? "массив" : typeof parsed === "object" && parsed !== null ? "объект" : typeof parsed;
      return { kind: "text", content: `✅ Валидный JSON (${type}).` };
    }

    const content = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);

    return { kind: "text", content };
  }),
  seo: {
    title: "JSON-форматтер онлайн — форматирование, минификация, валидация",
    description:
      "Приведите JSON к читаемому виду, сожмите в одну строку или проверьте на валидность — прямо в браузере, без отправки данных на сервер.",
    keywords: ["json formatter", "json форматирование", "json validator"],
  },
  isNew: true,
};
