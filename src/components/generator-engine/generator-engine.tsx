"use client";

import { Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumGate } from "@/components/subscription/premium-gate";
import { useGeneratorEngine } from "@/hooks/use-generator-engine";
import type { GeneratorEngineConfig, GeneratorFormValues } from "@/lib/generator-engine/types";
import { GeneratorForm } from "./generator-form";
import { GeneratorProgress } from "./generator-progress";
import { GeneratorPreview } from "./generator-preview";
import { GeneratorHistory } from "./generator-history";
import { GeneratorLimitBanner } from "./generator-limit-banner";

export interface GeneratorEngineProps<TValues extends GeneratorFormValues = GeneratorFormValues> {
  config: GeneratorEngineConfig<TValues>;
}

/**
 * Единственная точка входа для будущих генераторов: страница генератора
 * рендерит <GeneratorEngine config={...} /> и больше ничего не пишет
 * сама — весь UX (форма, прогресс, превью, лимит, история, Premium Gate)
 * одинаков независимо от того, Local Provider внутри config или API Provider
 * к любому AI-сервису.
 */
export function GeneratorEngine<TValues extends GeneratorFormValues = GeneratorFormValues>({
  config,
}: GeneratorEngineProps<TValues>) {
  const engine = useGeneratorEngine(config);

  const content = (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="size-4 text-primary" />
            {config.title}
          </CardTitle>
          <Badge variant="outline">
            {engine.providerKind === "local" ? "Работает в браузере" : "Через API"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}

          <GeneratorForm
            fields={config.fields}
            values={engine.values}
            disabled={engine.status === "generating"}
            onFieldChange={engine.setValue}
          />

          {engine.validationError && (
            <p className="text-xs text-destructive">{engine.validationError}</p>
          )}

          {engine.isLimitReached ? (
            <GeneratorLimitBanner
              onSubscribe={engine.subscribe}
              isRedirecting={engine.isSubscribeRedirecting}
            />
          ) : (
            <div className="space-y-1.5">
              <Button
                className="w-full"
                disabled={engine.status === "generating"}
                onClick={() => void engine.generate()}
              >
                <Sparkles /> Сгенерировать
              </Button>
              {config.submitHint && (
                <p className="text-center text-xs text-muted-foreground">{config.submitHint}</p>
              )}
              {!config.isPremium && !engine.isPaid && (
                <p className="text-center text-xs text-muted-foreground">
                  Осталось бесплатных генераций сегодня: {engine.limit.remaining} из{" "}
                  {engine.limit.limit}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Результат</CardTitle>
          </CardHeader>
          <CardContent>
            {engine.status === "generating" && (
              <GeneratorProgress progress={engine.progress} onCancel={engine.cancel} />
            )}
            {engine.status === "error" && (
              <ErrorState
                description={engine.error ?? undefined}
                action={
                  <Button size="sm" variant="outline" onClick={() => void engine.generate()}>
                    Повторить
                  </Button>
                }
              />
            )}
            {engine.status === "success" && engine.output && (
              <GeneratorPreview output={engine.output} filenameBase={config.id} />
            )}
            {engine.status === "idle" && (
              <EmptyState
                icon={Sparkles}
                title="Пока пусто"
                description="Заполните форму слева и запустите генерацию."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              История сессии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GeneratorHistory entries={engine.history} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (config.isPremium) {
    return (
      <PremiumGate
        title={config.title}
        description="Этот генератор доступен по подписке. Оплата — в USDT через NOWPayments."
      >
        {content}
      </PremiumGate>
    );
  }

  return content;
}
