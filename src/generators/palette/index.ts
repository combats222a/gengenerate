// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { Palette as PaletteIcon } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = (parseInt(clean.substring(0, 2), 16) || 0) / 255;
  const g = (parseInt(clean.substring(2, 4), 16) || 0) / 255;
  const b = (parseInt(clean.substring(4, 6), 16) || 0) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;

  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

const HARMONY_OFFSETS: Record<string, number[]> = {
  complementary: [0, 180, 30, 150, 210],
  analogous: [0, -30, -15, 15, 30],
  triadic: [0, 120, 240, 60, 180],
  tetradic: [0, 90, 180, 270, 45],
  monochromatic: [0, 0, 0, 0, 0],
};

function getContrastColor(hex: string): string {
  const [, , l] = hexToHsl(hex);
  return l > 60 ? "#111111" : "#ffffff";
}

export const generator: GeneratorModule = {
  slug: "palette",
  title: "Генератор цветовых палитр",
  description: "Гармоничный набор из 5 цветов по одному базовому оттенку.",
  icon: PaletteIcon,
  categoryId: "design",
  fields: [
    { type: "color", name: "base", label: "Базовый цвет", defaultValue: "#5b7fff" },
    {
      type: "select",
      name: "harmony",
      label: "Гармония",
      defaultValue: "analogous",
      options: [
        { value: "analogous", label: "Аналоговая" },
        { value: "complementary", label: "Комплементарная" },
        { value: "triadic", label: "Триадная" },
        { value: "tetradic", label: "Тетрадная" },
        { value: "monochromatic", label: "Монохромная (по светлоте)" },
      ],
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const base = String(input.base ?? "#5b7fff");
    const harmony = String(input.harmony ?? "analogous");
    const [h, s] = hexToHsl(base);
    const offsets = HARMONY_OFFSETS[harmony] ?? HARMONY_OFFSETS.analogous;

    const colors =
      harmony === "monochromatic"
        ? [20, 35, 50, 65, 80].map((l) => hslToHex(h, s, l))
        : offsets.map((offset) => hslToHex((h + offset + 360) % 360, s, 50));

    const swatchWidth = 140;
    const height = 200;
    const swatches = colors
      .map((color, index) => {
        const x = index * swatchWidth;
        const textColor = getContrastColor(color);
        return (
          `<rect x="${x}" y="0" width="${swatchWidth}" height="${height}" fill="${color}" />` +
          `<text x="${x + swatchWidth / 2}" y="${height - 16}" text-anchor="middle" ` +
          `font-family="ui-monospace, monospace" font-size="13" fill="${textColor}">${color}</text>`
        );
      })
      .join("");

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${swatchWidth * colors.length}" height="${height}" ` +
      `viewBox="0 0 ${swatchWidth * colors.length} ${height}">${swatches}</svg>`;

    return {
      kind: "image",
      url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      mimeType: "image/svg+xml",
    };
  }),
  seo: {
    title: "Генератор цветовых палитр онлайн — по базовому цвету",
    description:
      "Постройте гармоничную палитру из 5 цветов (аналоговая, комплементарная, триадная) по одному базовому оттенку.",
    keywords: ["генератор палитр", "color palette generator", "подбор цветов"],
  },
  isNew: true,
};
