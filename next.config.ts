import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * Этап 11 (Оптимизация). Три группы настроек ниже готовят проект к
 * большому количеству генераторов, не трогая ничего из предыдущих этапов:
 *
 * 1. images — современные форматы и долгий кеш для превью/OG-картинок
 *    (сами генераторы пока не грузят внешние изображения, но каталог
 *    на сотню карточек и будущие генераторы с превью будут).
 * 2. experimental.optimizePackageImports — lucide-react и radix-ui
 *    экспортируют сотни именованных сущностей из одной точки входа;
 *    без этой опции сборщик в дев-режиме и при анализе трассирует куда
 *    больше модулей, чем реально используется. В проде next уже умеет
 *    тришейкать оба пакета и без этой опции, но она страхует от
 *    регрессии и ускоряет холодный старт `next dev` при росте числа
 *    генераторов (у каждого свои иконки).
 * 3. Иммутабельный кеш для хэшированных статических ассетов
 *    (_next/static/*) НЕ настраивается здесь отдельно: Next.js уже
 *    отдаёт их с `Cache-Control: public, max-age=31536000, immutable`
 *    из коробки (имя файла содержит хэш контента, инвалидация не нужна).
 *    Явно прописанный `headers()` на этот путь в next.config при сборке
 *    даёт предупреждение «may break Next.js development behavior» — это
 *    сознательно НЕ сделано здесь, чтобы не наступить на встроенное
 *    поведение.
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui"],
  },
};

export default withBundleAnalyzer(nextConfig);
