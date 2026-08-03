import type {
  GenerationContext,
  GeneratorFormValues,
  GeneratorOutput,
  GeneratorProvider,
} from "./types";

/**
 * Local Provider — вся генерация происходит в браузере, без единого
 * сетевого запроса. Подходит для трансформаций, которые не требуют AI:
 * обработка текста, canvas-манипуляции с изображением, клиентские
 * WASM-библиотеки и т.д.
 *
 * fn получает те же input/signal/onProgress, что и API Provider —
 * поэтому GeneratorEngine обращается к обоим одинаково.
 */
export function createLocalProvider<TValues extends GeneratorFormValues = GeneratorFormValues>(
  fn: (context: GenerationContext<TValues>) => Promise<GeneratorOutput>,
): GeneratorProvider<TValues> {
  return { kind: "local", run: fn };
}

export interface ApiProviderConfig<TValues extends GeneratorFormValues = GeneratorFormValues> {
  /**
   * Путь к СОБСТВЕННОМУ Route Handler проекта (например
   * "/api/generators/my-tool"), а НЕ прямой URL внешнего AI-сервиса.
   * Ключи OpenAI/Anthropic/Gemini/FLUX/ElevenLabs и т.д. остаются на
   * сервере — конкретный вендор скрыт внутри этого эндпоинта и никогда
   * не виден ни движку, ни браузеру.
   */
  endpoint: string;
  method?: "POST" | "GET";
  /** Преобразует значения формы в тело запроса. По умолчанию — как есть. */
  buildRequestBody?: (input: TValues) => unknown;
  /** Преобразует ответ эндпоинта в единый формат GeneratorOutput. */
  parseResponse: (data: unknown) => GeneratorOutput;
}

/**
 * API Provider — универсальная обёртка над fetch() к собственному backend
 * проекта. Какой именно AI-сервис стоит за эндпоинтом (OpenAI, Claude,
 * Gemini, FLUX, ElevenLabs, что угодно ещё) — решает конкретный
 * генератор при подключении, задавая endpoint и parseResponse. Движок
 * этого не знает и не должен знать.
 */
export function createApiProvider<TValues extends GeneratorFormValues = GeneratorFormValues>(
  config: ApiProviderConfig<TValues>,
): GeneratorProvider<TValues> {
  return {
    kind: "api",
    async run({ input, signal, onProgress }) {
      onProgress({ message: "Отправляем запрос…" });

      const response = await fetch(config.endpoint, {
        method: config.method ?? "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.buildRequestBody ? config.buildRequestBody(input) : input),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && typeof errorData.error === "string" && errorData.error) ||
            "Не удалось выполнить генерацию",
        );
      }

      onProgress({ percent: 100, message: "Готово" });
      const data = await response.json();
      return config.parseResponse(data);
    },
  };
}
