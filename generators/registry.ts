import fs from "node:fs";
import path from "node:path";

import type { Generator } from "@/types/generator";
import type { GeneratorModule } from "./types";

const GENERATORS_DIR = path.join(process.cwd(), "src", "generators");

/**
 * Только серверный код (node:fs) — поэтому весь модуль импортируется
 * исключительно из Server Component'ов и Route Handler'ов, никогда из
 * "use client" файлов.
 *
 * Подключение нового генератора = создать src/generators/<slug>/index.ts
 * с export const generator: GeneratorModule = {...}. Ни этот файл, ни
 * страницы каталога/генератора трогать не нужно — slug подхватывается
 * из имени папки автоматически.
 */
function getSlugs(): string[] {
  if (!fs.existsSync(GENERATORS_DIR)) return [];

  return fs
    .readdirSync(GENERATORS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function importGeneratorModule(slug: string): Promise<GeneratorModule | null> {
  try {
    // Шаблонный путь — Next.js (Turbopack) резолвит это как context-импорт:
    // на этапе сборки подхватываются ВСЕ подпапки src/generators/*/index.*,
    // а нужная выбирается по slug в рантайме.
    const mod = (await import(`../generators/${slug}/index`)) as {
      generator?: GeneratorModule;
    };

    if (!mod.generator) {
      console.error(`Генератор "${slug}": index.ts не экспортирует "generator"`);
      return null;
    }

    if (mod.generator.slug !== slug) {
      console.error(
        `Генератор "${slug}": поле slug ("${mod.generator.slug}") не совпадает с именем папки`,
      );
      return null;
    }

    return mod.generator;
  } catch (error) {
    console.error(`Не удалось загрузить генератор "${slug}":`, error);
    return null;
  }
}

let cachedModules: Promise<GeneratorModule[]> | null = null;

/** Все успешно загруженные генераторы, отсортированные по slug. Результат кэшируется на время жизни процесса. */
export function getAllGeneratorModules(): Promise<GeneratorModule[]> {
  if (!cachedModules) {
    cachedModules = (async () => {
      const slugs = getSlugs();
      const generatorModules = await Promise.all(slugs.map(importGeneratorModule));
      return generatorModules.filter(
        (generatorModule): generatorModule is GeneratorModule => generatorModule !== null,
      );
    })();
  }
  return cachedModules;
}

export async function getGeneratorModule(slug: string): Promise<GeneratorModule | null> {
  const generatorModules = await getAllGeneratorModules();
  return generatorModules.find((generatorModule) => generatorModule.slug === slug) ?? null;
}

/** Лёгкая проекция GeneratorModule -> Generator для каталога/карточек (Этап 1), без дублирования формы/провайдера. */
export function toCatalogGenerator(generatorModule: GeneratorModule): Generator {
  return {
    id: generatorModule.slug,
    slug: generatorModule.slug,
    title: generatorModule.title,
    description: generatorModule.description,
    categoryId: generatorModule.categoryId,
    icon: generatorModule.icon,
    status: "available",
    isNew: generatorModule.isNew,
    isPremium: generatorModule.isPremium,
    isPopular: generatorModule.isPopular,
  };
}
