import { getAllGeneratorModules, toCatalogGenerator } from "@/generators/registry";
import { upcomingGenerators, type UpcomingGenerator } from "@/config/upcoming-generators";
import type { Generator } from "@/types/generator";

export interface CatalogFilters {
  query?: string;
  categoryId?: string;
}

export interface CatalogResult {
  /** Уже отфильтрованный по query/categoryId список для рендера */
  items: Generator[];
  /** Общее число (без фильтров) — для шапки страницы */
  totalAvailable: number;
  totalUpcoming: number;
}

function upcomingToCatalogGenerator(item: UpcomingGenerator, index: number): Generator {
  return {
    id: `upcoming-${index}`,
    slug: `upcoming-${index}`,
    title: item.title,
    description: item.description,
    categoryId: item.categoryId,
    icon: item.icon,
    status: "coming-soon",
  };
}

/**
 * Единая точка сборки каталога: реальные генераторы (SDK, кликабельны) +
 * тизеры "скоро" (src/config/upcoming-generators.ts, некликабельны) —
 * см. Этап 8, "большинство генераторов пока могут быть Coming Soon".
 * Реальные всегда идут первыми.
 */
export async function getCatalog(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const modules = await getAllGeneratorModules();
  const available = modules.map(toCatalogGenerator);
  const upcoming = upcomingGenerators.map(upcomingToCatalogGenerator);

  let items: Generator[] = [...available, ...upcoming];

  if (filters.categoryId) {
    items = items.filter((item) => item.categoryId === filters.categoryId);
  }

  if (filters.query) {
    const query = filters.query.trim().toLowerCase();
    if (query) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    }
  }

  return {
    items,
    totalAvailable: available.length,
    totalUpcoming: upcoming.length,
  };
}

/**
 * Похожие генераторы для страницы одного генератора — по той же
 * категории, сам генератор исключается. Если в категории пусто —
 * дополняется другими доступными, чтобы блок редко оставался пустым.
 */
export async function getSimilarGenerators(
  currentSlug: string,
  categoryId: string,
  limit = 4,
): Promise<Generator[]> {
  const modules = await getAllGeneratorModules();
  const available = modules.map(toCatalogGenerator).filter((item) => item.slug !== currentSlug);

  const sameCategory = available.filter((item) => item.categoryId === categoryId);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const others = available.filter((item) => item.categoryId !== categoryId);
  return [...sameCategory, ...others].slice(0, limit);
}
