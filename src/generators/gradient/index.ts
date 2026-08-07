// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Blend } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

export const generator: GeneratorModule = {
  slug: "gradient",
  title: "Генератор градиентов",
  description: "CSS-градиент по двум цветам с готовым кодом для копирования.",
  icon: Blend,
  categoryId: "design",
  fields: [
    {
      type: "select",
      name: "type",
      label: "Тип",
      defaultValue: "linear",
      options: [
        { value: "linear", label: "Линейный" },
        { value: "radial", label: "Радиальный" },
      ],
    },
    { type: "color", name: "from", label: "Цвет 1", defaultValue: "#667eea" },
    { type: "color", name: "to", label: "Цвет 2", defaultValue: "#764ba2" },
    {
      type: "slider",
      name: "angle",
      label: "Угол (только для линейного), °",
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 135,
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const type = String(input.type ?? "linear");
    const from = String(input.from ?? "#667eea");
    const to = String(input.to ?? "#764ba2");
    const angle = Number(input.angle ?? 135);

    const cssFunction =
      type === "radial" ? `radial-gradient(circle, ${from} 0%, ${to} 100%)` : `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;

    const content = [
      `/* ${type === "radial" ? "Радиальный" : "Линейный"} градиент */`,
      `background: ${cssFunction};`,
      "",
      "/* Tailwind (arbitrary value) */",
      `bg-[${cssFunction.replace(/\s/g, "_")}]`,
    ].join("\n");

    return { kind: "text", content };
  }),
  seo: {
    title: "Генератор CSS-градиентов онлайн — готовый код",
    description:
      "Соберите линейный или радиальный CSS-градиент по двум цветам и скопируйте готовый код background.",
    keywords: ["генератор градиентов", "css gradient generator", "linear-gradient"],
  },
  isNew: true,
};
