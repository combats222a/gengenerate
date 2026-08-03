import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { getCatalog } from "@/lib/catalog";
import { categories, getCategoryById } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { GeneratorCard } from "@/components/shared/generator-card";
import { CategoryPills } from "@/components/shared/category-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

interface HomePageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const activeCategory = category ? getCategoryById(category) : undefined;

  if (activeCategory) {
    return {
      title: `${activeCategory.title} — генераторы`,
      description: `Генераторы в категории «${activeCategory.title}»: ${activeCategory.description}.`,
    };
  }

  return {
    title: {
      absolute: siteConfig.fullName,
    },
    description: siteConfig.description,
  };
}

/**
 * Главная страница проекта (Этап 8) — теперь это и есть каталог
 * генераторов: поиск и категория живут в URL (?q=, ?category=), сама
 * страница — серверный компонент, фильтрует src/lib/catalog.ts и рендерит
 * GeneratorCard напрямую (без клиентской границы, см. её комментарий).
 * /generators ведёт сюда же (redirect) — чтобы не плодить дублирующий
 * контент для поисковиков.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, category } = await searchParams;
  const { items, totalAvailable, totalUpcoming } = await getCatalog({
    query: q,
    categoryId: category,
  });

  const activeCategory = category ? getCategoryById(category) : undefined;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items
      .filter((item) => item.status === "available")
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${siteConfig.url}/generators/${item.slug}`,
      })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PageHeader
        title={activeCategory ? activeCategory.title : "Каталог генераторов"}
        description={`${totalAvailable} готово · ${totalUpcoming} скоро · ${categories.length} категорий`}
      />

      <Container className="space-y-5 py-8">
        {activeCategory && (
          <Breadcrumbs
            items={[{ label: "Главная", href: "/" }, { label: activeCategory.title }]}
          />
        )}

        <CategoryPills activeCategoryId={category} query={q} />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <GeneratorCard key={item.id} generator={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            description="Попробуйте изменить запрос или выбрать другую категорию."
          />
        )}
      </Container>
    </div>
  );
}
