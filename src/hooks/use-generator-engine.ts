"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useTariff } from "@/hooks/use-tariff";
import { useGenerationQuota } from "@/hooks/use-generation-quota";
import {
  trackGenerationError,
  trackGenerationStarted,
  trackGenerationSuccess,
} from "@/lib/analytics/events";
import { buildDefaultValues, findMissingRequiredField } from "@/lib/generator-engine/form-values";
import { addHistoryEntry, useSessionHistory } from "@/lib/generator-engine/session-history";
import type {
  GenerationProgress,
  GeneratorEngineConfig,
  GeneratorFieldValue,
  GeneratorFormValues,
  GeneratorOutput,
} from "@/lib/generator-engine/types";

export type GeneratorEngineStatus = "idle" | "generating" | "success" | "error";

export function useGeneratorEngine<TValues extends GeneratorFormValues = GeneratorFormValues>(
  config: GeneratorEngineConfig<TValues>,
) {
  // Внутри движка значения формы всегда общего типа GeneratorFormValues —
  // так GeneratorForm остаётся негенерик-компонентом и работает с любой
  // схемой полей одинаково. TValues из конфига используется только в
  // одной точке — при вызове provider.run() ниже, где конкретный
  // генератор действительно получает строго типизированный input.
  const [values, setValues] = useState<GeneratorFormValues>(() =>
    buildDefaultValues(config.fields),
  );
  const [status, setStatus] = useState<GeneratorEngineStatus>("idle");
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [output, setOutput] = useState<GeneratorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { tariff, isPremium: isPaid, subscribe, isRedirecting: isSubscribeRedirecting } = useTariff();
  const limit = useGenerationQuota(config.id, config.provider.kind, config.freeDailyLimit);
  const history = useSessionHistory(config.id);

  const isPremiumLocked = Boolean(config.isPremium) && !isPaid;
  const isLimitReached = !config.isPremium && !isPaid && limit.isReached;
  const canGenerate = !isPremiumLocked && !isLimitReached && status !== "generating";

  const setValue = useCallback((name: string, value: GeneratorFieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const generate = useCallback(async () => {
    if (!canGenerate) return;

    const missingField = findMissingRequiredField(config.fields, values);
    if (missingField) {
      setValidationError(`Заполните поле «${missingField.label}»`);
      return;
    }
    setValidationError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("generating");
    setError(null);
    setProgress({ message: "Готовим генерацию…" });

    const startedAt = performance.now();
    trackGenerationStarted(config.id, config.provider.kind);

    try {
      const result = await config.provider.run({
        input: values as TValues,
        signal: controller.signal,
        onProgress: setProgress,
      });

      setOutput(result);
      setStatus("success");
      limit.increment();
      addHistoryEntry(config.id, { input: values, output: result });
      trackGenerationSuccess(config.id, config.provider.kind, performance.now() - startedAt);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("idle");
        setProgress(null);
        return;
      }
      const message = err instanceof Error ? err.message : "Не удалось выполнить генерацию";
      setStatus("error");
      setError(message);
      trackGenerationError(config.id, config.provider.kind, message);
    } finally {
      abortControllerRef.current = null;
    }
  }, [canGenerate, config.fields, config.id, config.provider, limit, values]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setOutput(null);
    setError(null);
    setStatus("idle");
    setProgress(null);
  }, []);

  return useMemo(
    () => ({
      values,
      setValue,
      status,
      progress,
      output,
      error,
      validationError,
      generate,
      cancel,
      reset,
      history,
      isPaid,
      subscribe,
      isSubscribeRedirecting,
      isPremiumLocked,
      isLimitReached,
      limit,
      tariff,
      providerKind: config.provider.kind,
    }),
    [
      values,
      setValue,
      status,
      progress,
      output,
      error,
      validationError,
      generate,
      cancel,
      reset,
      history,
      isPaid,
      subscribe,
      isSubscribeRedirecting,
      isPremiumLocked,
      isLimitReached,
      limit,
      tariff,
      config.provider.kind,
    ],
  );
}
