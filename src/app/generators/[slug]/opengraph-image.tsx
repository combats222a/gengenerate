import { ImageResponse } from "next/og";

import { getGeneratorModule } from "@/generators/registry";
import { siteConfig } from "@/config/site";

export const alt = "Превью генератора — AI Generators Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * OG-картинка страницы генератора (Этап 9, SEO Engine) — переопределяет
 * общий src/app/opengraph-image.tsx для этого сегмента роута. Текст
 * берётся из generatorModule.seo (Этап 6) — как и метатеги, картинка
 * определяется исключительно конфигурацией генератора, отдельного
 * поля под неё заводить не пришлось.
 */
export default async function Image({ params }: OgImageProps) {
  const { slug } = await params;
  const generatorModule = await getGeneratorModule(slug);

  const title = generatorModule?.title ?? siteConfig.fullName;
  const description = generatorModule?.seo.description ?? siteConfig.description;

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
          <div style={{ fontSize: 28, fontWeight: 700, color: "#93939f" }}>{siteConfig.name}</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.15, color: "#ededf1", display: "flex" }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#93939f", marginTop: 24, maxWidth: 920, display: "flex" }}>
          {description}
        </div>
      </div>
    ),
    { ...size },
  );
}
