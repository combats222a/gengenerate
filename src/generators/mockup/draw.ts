/**
 * Чистые функции отрисовки мокапа — без обращения к DOM/window, поэтому
 * подходят и для основного потока (CanvasRenderingContext2D), и для
 * воркера (OffscreenCanvasRenderingContext2D). У обоих типов идентичный
 * набор методов, которые здесь используются (fillRect/arc/path/fill) —
 * поэтому Ctx2D описывает только то общее подмножество, а не полный тип
 * одного из двух контекстов.
 */
export interface Ctx2D {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  closePath(): void;
  fill(): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
}

export const MAX_CONTENT_WIDTH = 900;

export function drawRoundedRect(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface FrameGeometry {
  contentWidth: number;
  contentHeight: number;
  padding: number;
  border: number;
  topChrome: number;
  radius: number;
  frameWidth: number;
  frameHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

/** Считает геометрию рамки по исходному размеру картинки — общая часть до создания canvas. */
export function computeFrameGeometry(
  naturalWidth: number,
  naturalHeight: number,
  frameStyle: string,
): FrameGeometry {
  let contentWidth = naturalWidth;
  let contentHeight = naturalHeight;
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

  return {
    contentWidth,
    contentHeight,
    padding,
    border,
    topChrome,
    radius,
    frameWidth,
    frameHeight,
    canvasWidth: frameWidth + padding * 2,
    canvasHeight: frameHeight + padding * 2,
  };
}

/** Рисует саму рамку (фон, корпус, «шапку») и вставляет картинку — не создаёт canvas и не знает, откуда взялось изображение. */
export function paintMockup(
  ctx: Ctx2D,
  image: CanvasImageSource,
  geometry: FrameGeometry,
  frameStyle: string,
  background: string,
) {
  const { padding, border, topChrome, radius, frameWidth, frameHeight, canvasWidth, canvasHeight, contentWidth, contentHeight } =
    geometry;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

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

  ctx.drawImage(image, frameX + border, frameY + topChrome, contentWidth, contentHeight);
}
