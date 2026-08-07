import type { LucideIcon } from "lucide-react";

import type {
  GeneratorFieldSchema,
  GeneratorFormValues,
  GeneratorProvider,
} from "@/lib/generator-engine/types";

export interface GeneratorSeo {
  title: string;
  description: string;
  keywords?: string[];
}

/**
 * Единственное, что должен экспортировать генератор (как `generator`
 * из src/generators/<slug>/index.ts) — ровно те 7 вещей из ТЗ, ни строчкой
 * больше. Всё остальное (страница, роутинг, SEO-теги, форма, превью,
 * прогресс, лимит, история, Premium Gate) собирает сама SDK/движок.
 */
export interface GeneratorModule<TValues extends GeneratorFormValues = GeneratorFormValues> {
  /** Должен совпадать с именем папки в src/generators/ — на этом строится автообнаружение. */
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  categoryId: string;
  fields: GeneratorFieldSchema[];
  provider: GeneratorProvider<TValues>;
  seo: GeneratorSeo;
  isPremium?: boolean;
  freeDailyLimit?: number;
  /** ЭТАП 13 — см. GeneratorEngineConfig.premiumFeatures в lib/generator-engine/types.ts. */
  premiumFeatures?: string[];
  /** Бейдж "Новое" в каталоге (Этап 8) — проставляется вручную. */
  isNew?: boolean;
  /** Бейдж "Популярное" в каталоге (Этап 8) — редакционная пометка, не аналитика. */
  isPopular?: boolean;
}
