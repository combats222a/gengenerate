import type { MetadataRoute } from "next";

import { getAllGeneratorModules } from "@/generators/registry";
import { siteConfig } from "@/config/site";

/**
 * Автоматический sitemap.xml (Этап 9, SEO Engine) — файловая конвенция
 * Next.js, ничего вручную не собирается и не поддерживается руками.
 *
 * В список попадают только реальные страницы: главная, избранное и
 * каждый генератор из SDK-реестра (Этап 6) — по одному <url> на slug,
 * без правок при добавлении нового генератора. Coming Soon-тизеры
 * (src/config/upcoming-generators.ts) сюда не входят — у них нет
 * собственной страницы. /generators (редирект), /settings и /kit
 * намеренно исключены — см. disallow в src/app/robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatorModules = await getAllGeneratorModules();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/favorites`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  const generatorRoutes: MetadataRoute.Sitemap = generatorModules.map((generatorModule) => ({
    url: `${siteConfig.url}/generators/${generatorModule.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...generatorRoutes];
}
