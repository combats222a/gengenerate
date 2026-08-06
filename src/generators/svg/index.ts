// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Shapes } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const generator: GeneratorModule = {
  slug: "svg",
  title: "SVG-аватар",
  description: "Простая иконка-заглушка (аватар/бейдж) с инициалами — без загрузки на сервер.",
  icon: Shapes,
  categoryId: "design",
  fields: [
    {
      type: "text",
      name: "text",
      label: "Инициалы",
      placeholder: "AB",
      required: true,
      maxLength: 3,
    },
    {
      type: "select",
      name: "shape",
      label: "Форма",
      defaultValue: "circle",
      options: [
        { value: "circle", label: "Круг" },
        { value: "rounded", label: "Скруглённый квадрат" },
        { value: "square", label: "Квадрат" },
      ],
    },
    { type: "color", name: "color", label: "Цвет фона", defaultValue: "#5b7fff" },
    {
      type: "slider",
      name: "size",
      label: "Размер, px",
      min: 64,
      max: 512,
      step: 16,
      defaultValue: 128,
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const text = escapeXml(String(input.text ?? "").slice(0, 3).toUpperCase());
    const shape = String(input.shape ?? "circle");
    const color = String(input.color ?? "#5b7fff");
    const size = Number(input.size ?? 128);
    const textColor = getContrastColor(color);
    const fontSize = Math.round(size * 0.4);

    let shapeMarkup: string;
    if (shape === "circle") {
      shapeMarkup = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}" />`;
    } else if (shape === "rounded") {
      shapeMarkup = `<rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${color}" />`;
    } else {
      shapeMarkup = `<rect width="${size}" height="${size}" fill="${color}" />`;
    }

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      shapeMarkup +
      `<text x="50%" y="50%" dy=".08em" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="600" fill="${textColor}">${text}</text></svg>`;

    // Небольшая пауза — исключительно чтобы progress-состояние движка было заметно в демо.
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      kind: "image",
      url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      mimeType: "image/svg+xml",
    };
  }),
  seo: {
    title: "Генератор SVG-аватаров с инициалами",
    description:
      "Создайте простую иконку-заглушку с инициалами прямо в браузере — без загрузки файлов на сервер.",
    keywords: ["генератор аватаров", "placeholder avatar", "svg иконка"],
  },
  isNew: true,
};
