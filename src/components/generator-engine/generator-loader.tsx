"use client";

import * as React from "react";

import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/shared/error-state";
import type {
  GeneratorFieldSchema,
  GeneratorFormValues,
  GeneratorProvider,
} from "@/lib/generator-engine/types";
import { GeneratorEngine } from "./generator-engine";

interface GeneratorEngineLoaderProps {
  slug: string;
  title: string;
  description?: string;
  fields: GeneratorFieldSchema[];
  isPremium?: boolean;
  freeDailyLimit?: number;
  premiumFeatures?: string[];
}

/**
 * `provider.run` — функция, а React Server Components не умеет передавать
 * функции из Server Component в Client Component (граница сериализуется
 * в JSON-подобный формат). Поэтому серверная страница генератора
 * (src/app/generators/[slug]/page.tsx) передаёт сюда только
 * СЕРИАЛИЗУЕМУЮ часть конфига (title/description/fields/лимиты), а сам
 * provider этот компонент подгружает динамическим import() по slug —
 * тем же способом, что и серверный реестр (src/generators/registry.ts),
 * только вызванным на клиенте. Обнаружено на реальной сборке всех пяти
 * генераторов — на моке из двух папок эта проблема не проявлялась.
 */
export function GeneratorEngineLoader({
  slug,
  title,
  description,
  fields,
  isPremium,
  freeDailyLimit,
  premiumFeatures,
}: GeneratorEngineLoaderProps) {
  const [provider, setProvider] = React.useState<GeneratorProvider<GeneratorFormValues> | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    import(`../../generators/${slug}/index`)
      .then((mod: { generator?: { provider?: GeneratorProvider<GeneratorFormValues> } }) => {
        if (cancelled) return;
        if (!mod.generator?.provider) {
          setError("Генератор не найден");
          return;
        }
        setProvider(mod.generator.provider);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить генератор");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return <ErrorState description={error} />;
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader label="Загружаем генератор…" />
      </div>
    );
  }

  return (
    <GeneratorEngine
      config={{
        id: slug,
        title,
        description,
        fields,
        provider,
        isPremium,
        freeDailyLimit,
        premiumFeatures,
      }}
    />
  );
}
