import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllGeneratorModules, getGeneratorModule } from "@/generators/registry";
import { getSimilarGenerators } from "@/lib/catalog";
import { getCategoryById } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { GeneratorCard } from "@/components/shared/generator-card";
import { GeneratorEngineLoader } from "@/components/generator-engine/generator-loader";

interface GeneratorPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Страница генератора целиком собирается по конфигу из
 * src/generators/<slug>/index.ts — сама страница не знает и не должна
 * знать, что конкретно генерирует каждый из них (Этап 6, Generator SDK).
 * Новый генератор подключается добавлением папки в src/generators/,
 * без единой правки в этом файле.
 *
 * Серверный компонент читает модуль через SDK-реестр только чтобы
 * получить СЕРИАЛИЗУЕМЫЕ данные (title/description/fields/SEO) и
 * провалидировать, что slug существует. Сам provider.run (функция)
 * дальше подгружается на клиенте — см. GeneratorEngineLoader.
 */
export async function generateStaticParams() {
  const generatorModules = await getAllGeneratorModules();
  return generatorModules.map((generatorModule) => ({ slug: generatorModule.slug }));
}

export async function generateMetadata({ params }: GeneratorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const generatorModule = await getGeneratorModule(slug);
  if (!generatorModule) return {};

  return {
    title: generatorModule.seo.title,
    description: generatorModule.seo.description,
    keywords: generatorModule.seo.keywords,
  };
}

export default async function GeneratorPage({ params }: GeneratorPageProps) {
  const { slug } = await params;
  const generatorModule = await getGeneratorModule(slug);

  if (!generatorModule) {
    notFound();
  }

  const category = getCategoryById(generatorModule.categoryId);
  const similar = await getSimilarGenerators(generatorModule.slug, generatorModule.categoryId);

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    ...(category ? [{ label: category.title, href: `/?category=${category.id}` }] : []),
    { label: generatorModule.title },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.url}${item.href}` : `${siteConfig.url}/generators/${slug}`,
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHeader title={generatorModule.title} description={category?.title} />

      <Container className="space-y-6 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <GeneratorEngineLoader
          slug={generatorModule.slug}
          title={generatorModule.title}
          description={generatorModule.description}
          fields={generatorModule.fields}
          isPremium={generatorModule.isPremium}
          freeDailyLimit={generatorModule.freeDailyLimit}
        />

        {similar.length > 0 && (
          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-medium text-muted-foreground">Похожие генераторы</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => (
                <GeneratorCard key={item.id} generator={item} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
