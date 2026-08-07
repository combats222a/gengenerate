import type {
  GenerationContext,
  GeneratorFormValues,
  GeneratorOutput,
  GeneratorProvider,
} from "./types";
import type { WorkerResponse } from "./worker-protocol";

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

export interface WorkerProviderConfig<
  TValues extends GeneratorFormValues = GeneratorFormValues,
  TMessage = TValues,
  TResult = unknown,
> {
  /**
   * Фабрика воркера — тот же паттерн `new Worker(new URL(...))`, что уже
   * используется для генераторов на клиенте (см. generator-loader.tsx),
   * только каждый вызов создаёт СВОЙ инстанс: воркер одноразовый, живёт
   * ровно одну генерацию и терминируется по завершении/отмене/ошибке.
   */
  createWorker: () => Worker;
  /** Готовит сообщение для воркера из значений формы (по умолчанию — как есть; File передаётся через structured clone без доп. конвертации). */
  buildMessage?: (input: TValues) => TMessage;
  /** Собирает GeneratorOutput из результата, который вернул воркер. */
  parseResult: (result: TResult) => GeneratorOutput;
  /**
   * Тот же алгоритм на основном потоке — для браузеров без Web Worker
   * (SSR-заглушка) или без нужных воркеру API (например OffscreenCanvas).
   * Обязателен: воркер — это оптимизация, а не единственный путь генерации.
   */
  fallback: (context: GenerationContext<TValues>) => Promise<GeneratorOutput>;
}

/**
 * Local Provider, который считает тяжёлую генерацию в отдельном потоке
 * (Web Worker), а не на основном — чтобы длинные Canvas/DSP/парсинг-
 * вычисления не подвешивали интерфейс (форму, скролл, анимации Sidebar)
 * на время генерации. С точки зрения Generator Engine это по-прежнему
 * `kind: "local"` — движок не знает и не должен знать, что конкретно
 * происходит внутри run() (см. комментарий у createLocalProvider выше).
 *
 * Протокол обмена сообщениями — WorkerResponse из ./worker-protocol,
 * общий для главного потока и всех воркеров генераторов.
 *
 * Использовать точечно: только для генераторов, чьи вычисления реально
 * заметны на глаз (Canvas-композитинг больших изображений, тяжёлый DSP,
 * парсинг больших файлов). Для лёгких генераторов (SVG-строка, форма
 * QR-кода) обычный createLocalProvider быстрее и проще — создание
 * воркера и передача данных сами по себе не бесплатны.
 */
export function createWorkerLocalProvider<
  TValues extends GeneratorFormValues = GeneratorFormValues,
  TMessage = TValues,
  TResult = unknown,
>(config: WorkerProviderConfig<TValues, TMessage, TResult>): GeneratorProvider<TValues> {
  return {
    kind: "local",
    run({ input, signal, onProgress }) {
      if (typeof Worker === "undefined") {
        return config.fallback({ input, signal, onProgress });
      }

      let worker: Worker;
      try {
        worker = config.createWorker();
      } catch {
        // Конструктор воркера может бросить на совсем старых/нестандартных
        // окружениях (например некоторые WebView) — падаем на fallback.
        return config.fallback({ input, signal, onProgress });
      }

      return new Promise<GeneratorOutput>((resolve, reject) => {
        const cleanup = () => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onWorkerError);
          signal.removeEventListener("abort", onAbort);
          worker.terminate();
        };

        const onMessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
          const message = event.data;
          if (message.type === "progress") {
            onProgress({ percent: message.percent, message: message.message });
            return;
          }
          if (message.type === "result") {
            cleanup();
            try {
              resolve(config.parseResult(message.payload));
            } catch (error) {
              reject(error instanceof Error ? error : new Error("Не удалось разобрать результат воркера"));
            }
            return;
          }
          cleanup();
          reject(new Error(message.message));
        };

        const onWorkerError = (event: ErrorEvent) => {
          cleanup();
          reject(new Error(event.message || "Воркер завершился с ошибкой"));
        };

        const onAbort = () => {
          cleanup();
          reject(new DOMException("Генерация отменена", "AbortError"));
        };

        signal.addEventListener("abort", onAbort, { once: true });
        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onWorkerError);
        worker.postMessage(config.buildMessage ? config.buildMessage(input) : input);
      });
    },
  };
}
