/**
 * ЭТАЛОН АРХИТЕКТУРЫ ГЕНЕРАТОРА.
 *
 * Этот файл — официальный референс: при создании нового генератора
 * копируйте именно его. Полный гайд (за сколько минут, что создавать,
 * что никогда не трогать, жизненный цикл) — в src/generators/README.md.
 *
 * Экспортирует ровно 7 вещей и ничего больше: slug/title/description/
 * icon/categoryId — метаданные; fields — форма; provider — логика
 * генерации; seo — метатеги страницы. Никакой JSX, никакой ручной
 * регистрации — папка сама себя регистрирует (см. registry.ts).
 */
import { Grid3x3 } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

const CANVAS_SIZE = 400;

/**
 * Один "тайл" узора — SVG-фрагмент, который дальше бесшовно повторяется
 * через <pattern>. Коэффициенты (0.06, 0.09, 0.18) — это просто пропорции
 * штриха/радиуса относительно шага тайла, подобранные на глаз так, чтобы
 * узор адекватно выглядел на всём диапазоне slider'а (10–60px); менять их
 * не обязательно для понимания архитектуры, это чисто визуальная настройка.
 */
function buildTileMarkup(type: string, spacing: number, color: string): string {
  const strokeWidth = Math.max(1, spacing * 0.06);

  switch (type) {
    case "dots":
      return `<circle cx="${spacing / 2}" cy="${spacing / 2}" r="${Math.max(2, spacing * 0.09)}" fill="${color}" />`;
    case "lines":
      return `<line x1="0" y1="${spacing}" x2="${spacing}" y2="0" stroke="${color}" stroke-width="${strokeWidth}" />`;
    case "grid":
      return `<path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
    case "cross": {
      const center = spacing / 2;
      const arm = spacing * 0.18;
      return (
        `<path d="M ${center - arm} ${center} L ${center + arm} ${center} ` +
        `M ${center} ${center - arm} L ${center} ${center + arm}" ` +
        `stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />`
      );
    }
    default:
      return "";
  }
}

export const generator: GeneratorModule = {
  // slug ОБЯЗАН совпадать с именем папки (src/generators/pattern) —
  // на этом строится автообнаружение в registry.ts.
  slug: "pattern",
  title: "Бесшовный паттерн",
  description: "Генерирует тайловый SVG-паттерн для фона — точки, линии, сетка или кресты.",
  icon: Grid3x3, // любая иконка из lucide-react
  categoryId: "design", // должен существовать в src/config/categories.ts

  // Каждый элемент — одно поле формы. GeneratorEngine рендерит их сам
  // по type, вам не нужно писать ни одного <input>. Полный список
  // доступных type — в src/generators/README.md.
  fields: [
    {
      type: "select",
      name: "type",
      label: "Тип узора",
      defaultValue: "dots",
      options: [
        { value: "dots", label: "Точки" },
        { value: "lines", label: "Диагональные линии" },
        { value: "grid", label: "Сетка" },
        { value: "cross", label: "Кресты" },
      ],
    },
    { type: "color", name: "color", label: "Цвет узора", defaultValue: "#5b7fff" },
    { type: "color", name: "background", label: "Цвет фона", defaultValue: "#0a0a0d" },
    {
      type: "slider",
      name: "spacing",
      label: "Плотность (шаг тайла, px)",
      min: 10,
      max: 60,
      step: 2,
      defaultValue: 28,
    },
  ],

  // createLocalProvider — генерация целиком в браузере, без единого
  // сетевого запроса (для сравнения: генератор "qr" использует
  // createApiProvider и обращается к собственному Route Handler).
  // input типизирован как значения формы выше; onProgress — необязательная,
  // но именно так генератор сообщает статус движку (см. GeneratorProgress).
  provider: createLocalProvider(async ({ input, onProgress }) => {
    const type = String(input.type ?? "dots");
    const color = String(input.color ?? "#5b7fff");
    const background = String(input.background ?? "#0a0a0d");
    const spacing = Number(input.spacing ?? 28);

    onProgress({ message: "Строим SVG-паттерн…" });

    const tile = buildTileMarkup(type, spacing, color);

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}">` +
      `<defs><pattern id="tile" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">` +
      `<rect width="${spacing}" height="${spacing}" fill="${background}" />${tile}</pattern></defs>` +
      `<rect width="100%" height="100%" fill="url(#tile)" /></svg>`;

    // GeneratorOutput — discriminated union по kind. Для SVG самый простой
    // валидный вариант — data-URL напрямую, без Blob и без URL.createObjectURL.
    return {
      kind: "image",
      url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      mimeType: "image/svg+xml",
    };
  }),

  // Реально используется generateMetadata() в src/app/generators/[slug]/page.tsx —
  // это не декоративное поле, а настоящие <title>/<meta description>.
  seo: {
    title: "Генератор бесшовных SVG-паттернов онлайн",
    description:
      "Создайте тайловый фоновый узор (точки, линии, сетка, кресты) и скачайте в SVG — без серверной обработки.",
    keywords: ["генератор паттернов", "seamless pattern", "фоновый узор svg"],
  },
};
