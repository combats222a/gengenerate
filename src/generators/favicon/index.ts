// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Hexagon } from "lucide-react";

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

/** Растеризует SVG в PNG нужного размера через offscreen <img> + <canvas> — тот же приём, что и в mockup (main-thread путь, см. Этап 11). */
function rasterizeSvg(svg: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error("Canvas недоступен в этом браузере"));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось отрисовать favicon"));
    };
    img.src = url;
  });
}

export const generator: GeneratorModule = {
  slug: "favicon",
  title: "Генератор favicon",
  description: "Иконка сайта из 1–2 символов — квадратный PNG нужного размера (не .ico).",
  icon: Hexagon,
  categoryId: "design",
  fields: [
    {
      type: "text",
      name: "text",
      label: "Символ(ы)",
      placeholder: "A",
      required: true,
      maxLength: 2,
    },
    { type: "color", name: "background", label: "Цвет фона", defaultValue: "#5b7fff" },
    {
      type: "select",
      name: "shape",
      label: "Форма",
      defaultValue: "rounded",
      options: [
        { value: "rounded", label: "Скруглённый квадрат" },
        { value: "circle", label: "Круг" },
        { value: "square", label: "Квадрат (без скруглений)" },
      ],
    },
    {
      type: "select",
      name: "size",
      label: "Размер",
      defaultValue: "512",
      options: [
        { value: "16", label: "16×16 — favicon.ico база" },
        { value: "32", label: "32×32 — вкладка браузера" },
        { value: "180", label: "180×180 — apple-touch-icon" },
        { value: "512", label: "512×512 — PWA-манифест" },
      ],
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const text = escapeXml(String(input.text ?? "A").slice(0, 2).toUpperCase());
    const background = String(input.background ?? "#5b7fff");
    const shape = String(input.shape ?? "rounded");
    const size = Number(input.size ?? 512);
    const textColor = getContrastColor(background);

    const canvasSize = 512;
    let shapeMarkup: string;
    if (shape === "circle") {
      shapeMarkup = `<circle cx="${canvasSize / 2}" cy="${canvasSize / 2}" r="${canvasSize / 2}" fill="${background}" />`;
    } else if (shape === "square") {
      shapeMarkup = `<rect width="${canvasSize}" height="${canvasSize}" fill="${background}" />`;
    } else {
      shapeMarkup = `<rect width="${canvasSize}" height="${canvasSize}" rx="${canvasSize * 0.22}" fill="${background}" />`;
    }

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">` +
      shapeMarkup +
      `<text x="50%" y="50%" dy=".08em" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="system-ui, sans-serif" font-size="${canvasSize * (text.length > 1 ? 0.38 : 0.5)}" font-weight="700" fill="${textColor}">${text}</text></svg>`;

    const url = await rasterizeSvg(svg, size);

    return { kind: "image", url, mimeType: "image/png" };
  }),
  seo: {
    title: "Генератор favicon онлайн — PNG-иконка сайта",
    description:
      "Соберите квадратную иконку сайта из 1–2 символов и скачайте PNG нужного размера — 16, 32, 180 или 512 пикселей.",
    keywords: ["генератор favicon", "favicon generator", "иконка сайта"],
  },
  isNew: true,
};
