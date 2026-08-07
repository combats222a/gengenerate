// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Type } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

const HEIGHT = 120;

export const generator: GeneratorModule = {
  slug: "logo",
  title: "Генератор логотипа",
  description: "Текстовый логотип-вордмарк с меткой из первой буквы — как SVG.",
  icon: Type,
  categoryId: "design",
  fields: [
    {
      type: "text",
      name: "text",
      label: "Название",
      placeholder: "Acme Studio",
      required: true,
      maxLength: 24,
    },
    {
      type: "select",
      name: "markShape",
      label: "Форма метки",
      defaultValue: "rounded",
      options: [
        { value: "rounded", label: "Скруглённый квадрат" },
        { value: "circle", label: "Круг" },
        { value: "square", label: "Квадрат" },
        { value: "none", label: "Без метки, только текст" },
      ],
    },
    { type: "color", name: "color", label: "Цвет метки", defaultValue: "#5b7fff" },
    { type: "color", name: "textColor", label: "Цвет текста", defaultValue: "#111111" },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const rawText = String(input.text ?? "").trim() || "Logo";
    const text = escapeXml(rawText);
    const markShape = String(input.markShape ?? "rounded");
    const color = String(input.color ?? "#5b7fff");
    const textColor = String(input.textColor ?? "#111111");
    const markLetter = escapeXml(rawText.trim().charAt(0).toUpperCase());
    const markColor = getContrastColor(color);

    const markSize = HEIGHT * 0.72;
    const markY = (HEIGHT - markSize) / 2;
    const gap = 20;
    const textFontSize = HEIGHT * 0.4;
    // Грубая, но достаточная для вордмарка оценка ширины текста —
    // на глаз считаем моноширинный символ ~0.58 от кегля, с запасом
    // под пропорциональные шрифты (system-ui), чтобы текст не обрезался.
    const textWidth = text.length * textFontSize * 0.62;

    let markMarkup = "";
    let markWidth = 0;
    if (markShape !== "none") {
      markWidth = markSize;
      if (markShape === "circle") {
        markMarkup = `<circle cx="${markSize / 2}" cy="${HEIGHT / 2}" r="${markSize / 2}" fill="${color}" />`;
      } else if (markShape === "square") {
        markMarkup = `<rect y="${markY}" width="${markSize}" height="${markSize}" fill="${color}" />`;
      } else {
        markMarkup = `<rect y="${markY}" width="${markSize}" height="${markSize}" rx="${markSize * 0.24}" fill="${color}" />`;
      }
      markMarkup += `<text x="${markSize / 2}" y="${HEIGHT / 2}" dy=".08em" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="${markSize * 0.5}" font-weight="700" fill="${markColor}">${markLetter}</text>`;
    }

    const textX = markWidth > 0 ? markWidth + gap : 0;
    const totalWidth = textX + textWidth;

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${HEIGHT}" viewBox="0 0 ${totalWidth} ${HEIGHT}">` +
      markMarkup +
      `<text x="${textX}" y="${HEIGHT / 2}" dy=".08em" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="${textFontSize}" font-weight="600" fill="${textColor}">${text}</text></svg>`;

    return {
      kind: "image",
      url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      mimeType: "image/svg+xml",
    };
  }),
  seo: {
    title: "Генератор логотипа онлайн — текстовый вордмарк SVG",
    description:
      "Соберите простой текстовый логотип с меткой из первой буквы и скачайте в SVG — без загрузки файлов на сервер.",
    keywords: ["генератор логотипа", "logo generator", "wordmark svg"],
  },
  isNew: true,
};
