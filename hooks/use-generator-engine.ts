"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import { buildDefaultValues, findMissingRequiredField } from "@/lib/generator-engine/form-values";
import { useGenerationLimit } from "@/lib/generator-engine/generation-limit";
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

  const { isPaid, subscribe, isRedirecting: isSubscribeRedirecting } = useSubscription();
  const limit = useGenerationLimit(config.id, config.freeDailyLimit);
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
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("idle");
        setProgress(null);
        return;
      }
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось выполнить генерацию");
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
      config.provider.kind,
    ],
  );
}
