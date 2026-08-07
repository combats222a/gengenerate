/**
 * Формат сообщений, которыми воркер генератора отвечает главному потоку.
 * Общий для createWorkerLocalProvider (api-provider.ts) и каждого
 * конкретного worker.ts внутри src/generators/<slug>/ — оба импортируют
 * этот файл, а не переизобретают протокол на месте.
 *
 * Входящее сообщение (главный поток -> воркер) протокола не имеет —
 * это то, что вернул buildMessage(input) конкретного генератора, воркер
 * знает свою форму сам.
 */
export type WorkerResponse<TResult = unknown> =
  | { type: "progress"; percent?: number; message?: string }
  | { type: "result"; payload: TResult }
  | { type: "error"; message: string };
