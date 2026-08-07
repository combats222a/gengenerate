"use client";

import { Bookmark, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumGate } from "@/components/subscription/premium-gate";
import { LimitNotice } from "@/components/subscription/limit-notice";
import { useGeneratorEngine } from "@/hooks/use-generator-engine";
import { saveProject, useSavedProjectsFor, deleteProject } from "@/lib/generator-engine/saved-projects";
import { toast } from "@/components";
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
 *
 * ЭТАП 13: лимит генераций теперь берётся из тарифа (engine.limit —
 * local-пул/AI-пул/индивидуальный лимит генератора, см.
 * use-generation-quota.ts), а история сессии и сохранение проектов —
 * Premium-функции: на Free они скрыты за апсейл-заглушкой вместо того,
 * чтобы молча работать всем одинаково, как было до этого этапа.
 */
export function GeneratorEngine<TValues extends GeneratorFormValues = GeneratorFormValues>({
  config,
}: GeneratorEngineProps<TValues>) {
  const engine = useGeneratorEngine(config);
  const savedProjects = useSavedProjectsFor(config.id);
  const { savedProjects: savedProjectsLimit } = engine.tariff.features;
  const canSaveMore = savedProjectsLimit === null || savedProjects.length < savedProjectsLimit;

  const handleSave = () => {
    if (!engine.output) return;
    if (!canSaveMore) {
      toast.error("Достигнут лимит сохранённых проектов для вашего тарифа");
      return;
    }
    saveProject(config.id, config.title, { input: engine.values, output: engine.output });
    toast.success("Проект сохранён");
  };

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
              kindLabel={engine.limit.kindLabel}
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
              {!config.isPremium && !engine.isPaid && engine.limit.limit !== null && (
                <p className="text-center text-xs text-muted-foreground">
                  Осталось {engine.limit.kindLabel.short} генераций сегодня: {engine.limit.remaining} из{" "}
                  {engine.limit.limit}
                </p>
              )}
              {!config.isPremium && !engine.isPaid && (
                <LimitNotice
                  className="justify-center"
                  remaining={engine.limit.remaining}
                  limit={engine.limit.limit}
                  kind={engine.limit.kind}
                  kindLabel={engine.limit.kindLabel}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Результат</CardTitle>
            {engine.status === "success" && engine.output && engine.tariff.features.savedProjects !== 0 && (
              <Button size="sm" variant="outline" onClick={handleSave}>
                <Bookmark className="size-3.5" /> Сохранить
              </Button>
            )}
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
            {engine.tariff.features.generationHistory ? (
              <GeneratorHistory entries={engine.history} />
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Доступно на Premium"
                description="История генераций и сохранённые проекты открываются в тарифах Premium Monthly и Premium Yearly."
              />
            )}
          </CardContent>
        </Card>

        {engine.tariff.features.generationHistory && savedProjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Сохранённые проекты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">{project.title}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deleteProject(project.id);
                      toast.success("Проект удалён");
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  if (config.isPremium) {
    return (
      <PremiumGate
        title={config.title}
        description="Этот генератор доступен по подписке. Оплата — в USDT через NOWPayments."
        premiumFeatures={config.premiumFeatures}
      >
        {content}
      </PremiumGate>
    );
  }

  return content;
}
