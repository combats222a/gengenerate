import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = "GenGenerate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Дефолтная OG-картинка сайта (Этап 9, SEO Engine) — файловая конвенция
 * Next.js, подхватывается автоматически для любой страницы без своего
 * opengraph-image.tsx. Страница генератора переопределяет её собственным
 * файлом с заголовком генератора — см.
 * src/app/generators/[slug]/opengraph-image.tsx.
 *
 * Цвета — те же токены дизайн-системы "Studio" (см. globals.css), не
 * Tailwind-классы: ImageResponse рендерит через Satori, который их не
 * понимает, поэтому значения продублированы как hex.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#5b7fff", display: "flex" }} />
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ededf1" }}>{siteConfig.name}</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, color: "#ededf1", display: "flex" }}>
          {siteConfig.fullName}
        </div>
        <div style={{ fontSize: 30, color: "#93939f", marginTop: 24, maxWidth: 920, display: "flex" }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
