import { getAllGeneratorModules, toCatalogGenerator } from "@/generators/registry";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { FavoritesList, type SerializableCatalogItem } from "@/components/shared/favorites-list";

export const metadata = {
  title: "Избранное",
};

/**
 * Избранное живёт в localStorage (см. src/lib/favorites.ts), поэтому
 * реальная фильтрация — на клиенте (FavoritesList). Эта серверная
 * страница только готовит СЕРИАЛИЗУЕМЫЙ список всех доступных
 * генераторов (без icon — см. комментарий в favorites-list.tsx).
 */
export default async function FavoritesPage() {
  const modules = await getAllGeneratorModules();
  const items: SerializableCatalogItem[] = modules.map((generatorModule) => {
    const generator = toCatalogGenerator(generatorModule);
    return {
      id: generator.id,
      slug: generator.slug,
      title: generator.title,
      description: generator.description,
      categoryId: generator.categoryId,
      status: generator.status,
      isNew: generator.isNew,
      isPremium: generator.isPremium,
      isPopular: generator.isPopular,
    };
  });

  return (
    <div>
      <PageHeader
        title="Избранное"
        description="Генераторы, которые вы отметили сердцем на карточке."
      />
      <Container className="py-8">
        <FavoritesList items={items} />
      </Container>
    </div>
  );
}
