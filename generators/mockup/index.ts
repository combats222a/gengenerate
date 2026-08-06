// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { MonitorSmartphone } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

const MAX_CONTENT_WIDTH = 900;

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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
  provider: createLocalProvider(async ({ input }) => {
    const file = input.image;
    if (!(file instanceof File)) {
      throw new Error("Загрузите изображение");
    }

    const frameStyle = String(input.frameStyle ?? "browser");
    const background = String(input.background ?? "#0a0a0d");

    const img = await loadImage(file);

    let contentWidth = img.naturalWidth;
    let contentHeight = img.naturalHeight;
    if (contentWidth > MAX_CONTENT_WIDTH) {
      const scale = MAX_CONTENT_WIDTH / contentWidth;
      contentWidth = MAX_CONTENT_WIDTH;
      contentHeight = Math.round(contentHeight * scale);
    }

    const padding = 48;
    const border = frameStyle === "phone" ? 16 : 0;
    const topChrome = frameStyle === "browser" ? 36 : 28;
    const radius = frameStyle === "phone" ? 28 : 10;

    const frameWidth = contentWidth + border * 2;
    const frameHeight = contentHeight + border * 2 + topChrome;

    const canvas = document.createElement("canvas");
    canvas.width = frameWidth + padding * 2;
    canvas.height = frameHeight + padding * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas недоступен в этом браузере");
    }

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frameX = padding;
    const frameY = padding;

    ctx.fillStyle = "#1a1a1f";
    drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, radius);
    ctx.fill();

    if (frameStyle === "browser") {
      const dotColors = ["#e0554b", "#e0b34b", "#4bc97a"];
      dotColors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(frameX + 20 + index * 20, frameY + topChrome / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.fillStyle = "#000000";
      drawRoundedRect(ctx, frameX + frameWidth / 2 - 28, frameY + (topChrome - 10) / 2, 56, 10, 5);
      ctx.fill();
    }

    ctx.drawImage(img, frameX + border, frameY + topChrome, contentWidth, contentHeight);
    URL.revokeObjectURL(img.src);

    return {
      kind: "image",
      url: canvas.toDataURL("image/png"),
      mimeType: "image/png",
    };
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
};
