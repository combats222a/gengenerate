import type { ReactNode } from "react";

/* ==========================================================================
   Форма — декларативная схема полей.
   GeneratorEngine рендерит форму сам, зная только эту схему: конкретный
   генератор никогда не пишет свою JSX-разметку формы.
   ========================================================================== */

interface BaseField {
  /** Ключ в объекте значений формы */
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface TextFieldSchema extends BaseField {
  type: "text" | "textarea";
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
}

export interface SelectFieldSchema extends BaseField {
  type: "select";
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

export interface SliderFieldSchema extends BaseField {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
}

export interface SwitchFieldSchema extends BaseField {
  type: "switch";
  defaultValue?: boolean;
}

export interface ColorFieldSchema extends BaseField {
  type: "color";
  defaultValue?: string;
}

export interface FileFieldSchema extends BaseField {
  type: "file";
  accept?: string;
}

export type GeneratorFieldSchema =
  | TextFieldSchema
  | SelectFieldSchema
  | SliderFieldSchema
  | SwitchFieldSchema
  | ColorFieldSchema
  | FileFieldSchema;

/** Значения формы — держим максимально общо, конкретную форму типизирует сам генератор через дженерик. */
export type GeneratorFieldValue = string | number | boolean | File | null;
export type GeneratorFormValues = Record<string, GeneratorFieldValue>;

/* ==========================================================================
   Результат генерации.
   Discriminated union по kind — превью и скачивание рендерятся по одной
   и той же логике независимо от того, откуда взялся результат:
   Local Provider или любой API Provider.
   ========================================================================== */

export type GeneratorOutput =
  | { kind: "text"; content: string }
  | { kind: "image"; url: string; mimeType?: string }
  | { kind: "audio"; url: string; mimeType?: string }
  | { kind: "video"; url: string; mimeType?: string }
  | { kind: "file"; url: string; filename: string; mimeType?: string };

/* ==========================================================================
   Провайдеры.
   Это единственная точка, которая отличается между "генерация в браузере"
   и "генерация через внешний API" — и она нарочно СПРЯТАНА за одинаковой
   сигнатурой run(). GeneratorEngine вызывает provider.run(...) и не знает
   и не должен знать, что происходит внутри.
   ========================================================================== */

export interface GenerationProgress {
  /** 0–100, если прогресс известен. Если undefined — показывается индикатор без процента. */
  percent?: number;
  message?: string;
}

export interface GenerationContext<TValues extends GeneratorFormValues = GeneratorFormValues> {
  input: TValues;
  /** Пробрасывается в fetch()/любую отменяемую операцию — обеспечивает кнопку "Отменить". */
  signal: AbortSignal;
  onProgress: (progress: GenerationProgress) => void;
}

export interface GeneratorProvider<TValues extends GeneratorFormValues = GeneratorFormValues> {
  /** Не влияет на логику движка — только на вспомогательную UI-метку ("в браузере" / "через API"). */
  kind: "local" | "api";
  run: (context: GenerationContext<TValues>) => Promise<GeneratorOutput>;
}

/* ==========================================================================
   Конфигурация конкретного генератора для движка.
   Это то немногое, что генератор обязан предоставить сам — но никакой
   JSX, никакого рендеринга, только данные и функция run().
   ========================================================================== */

export interface GeneratorEngineConfig<TValues extends GeneratorFormValues = GeneratorFormValues> {
  /** Уникальный id — используется как ключ для истории и счётчика лимита. */
  id: string;
  title: string;
  description?: string;
  fields: GeneratorFieldSchema[];
  provider: GeneratorProvider<TValues>;
  /** Требует активной подписки независимо от дневного лимита. */
  isPremium?: boolean;
  /**
   * ЭТАП 13 — переопределяет дневной лимит бесплатных генераций для
   * конкретного генератора (изолированный счётчик "gen:<id>" вместо
   * общего пула "pool:local"/"pool:ai" тарифа Free, см.
   * @/hooks/use-generation-quota). На Premium-тарифах не действует.
   */
  freeDailyLimit?: number;
  /**
   * ЭТАП 13 — что именно у этого генератора доступно только на Premium,
   * помимо общих ограничений тарифа (для Premium Gate 2.0 — "Premium-
   * возможности конкретного генератора" из ТЗ). Чисто описательное поле,
   * не влияет на логику движка.
   */
  premiumFeatures?: string[];
  /** Текст под кнопкой запуска, например пояснение про формат вывода. */
  submitHint?: ReactNode;
}
