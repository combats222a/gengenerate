import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Автоматический robots.txt (Этап 9, SEO Engine) — файловая конвенция
 * Next.js. /api/ — служебные роуты (webhook, create-invoice и т.д.,
 * Этап 4), /settings и /kit — персонализированная и служебная
 * dev-страницы без уникального контента (см. noIndex в их metadata,
 * это дополнительная подстраховка, а не замена robots).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings", "/kit"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
