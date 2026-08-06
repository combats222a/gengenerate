import { siteConfig } from "@/config/site";
import type { BreadcrumbItem } from "@/components/shared/breadcrumbs";
import type { GeneratorModule } from "@/generators/types";
import type { Generator } from "@/types/generator";

function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

/**
 * Schema.org BreadcrumbList — из тех же items, что рендерит визуальный
 * <Breadcrumbs> (Этап 8): последний пункт крошек обычно без href (это
 * текущая страница), поэтому его адрес достраивается из currentPath.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  };
}

/**
 * Schema.org ItemList для каталога — только доступные генераторы
 * (Coming Soon без страницы в список не попадают, как и в sitemap.ts).
 */
export function buildItemListJsonLd(generators: Generator[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: generators
      .filter((item) => item.status === "available")
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteUrl(`/generators/${item.slug}`),
      })),
  };
}

/**
 * Schema.org SoftwareApplication — единственная схема, специфичная для
 * конкретного генератора. isAccessibleForFree берётся из isPremium
 * (Этап 4/6) — не из отдельного SEO-поля, чтобы разметка не могла разойтись
 * с реальным поведением Premium Gate.
 */
export function buildSoftwareApplicationJsonLd(generatorModule: GeneratorModule) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: generatorModule.title,
    description: generatorModule.seo.description,
    url: absoluteUrl(`/generators/${generatorModule.slug}`),
    applicationCategory: "BrowserApplication",
    operatingSystem: "Любая (работает в браузере)",
    isAccessibleForFree: !generatorModule.isPremium,
  };
}

/**
 * Schema.org WebSite + SearchAction — один экземпляр на весь сайт
 * (рендерится только на канонической главной, см. src/app/page.tsx),
 * дублировать на каждой странице не нужно.
 */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.fullName,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
