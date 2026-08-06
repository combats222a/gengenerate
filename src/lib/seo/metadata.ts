import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export interface SeoInput {
  title: string;
  description: string;
  /** Путь без домена, например "/generators/qr" или "/?category=audio". */
  path: string;
  keywords?: string[];
  /**
   * Только для главной без фильтров: отключает шаблон "%s · GenGenerate" из
   * layout.tsx, чтобы заголовок сайта не задваивался.
   */
  titleAbsolute?: boolean;
  /**
   * Служебные/персонализированные страницы (localStorage-избранное,
   * настройки, витрина UI Kit) — не должны попадать в индекс, но
   * остаются доступными для перехода по ссылкам.
   */
  noIndex?: boolean;
}

/**
 * SEO Engine (Этап 9) — единая точка сборки Next.js Metadata.
 *
 * До этого этапа title/description собирались вручную на каждой странице,
 * а canonical, Open Graph и Twitter Cards не существовали вовсе. Теперь
 * любая страница отдаёт сюда только title/description/path — canonical
 * строится из siteConfig.url, а OG/Twitter — из тех же title/description
 * (дублировать их на каждой странице не нужно). Картинка Open Graph
 * подхватывается автоматически файловой конвенцией Next.js
 * (opengraph-image.tsx в том же сегменте роута, см. соседние файлы) —
 * здесь её указывать не нужно.
 *
 * Требование ТЗ "каждый генератор задаёт SEO исключительно через свою
 * конфигурацию" выполняется тем, что единственный вход сюда для страницы
 * генератора — это generatorModule.seo (Этап 6), больше нигде title и
 * description для неё не задаются.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  titleAbsolute,
  noIndex,
}: SeoInput): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
