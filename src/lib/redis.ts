import { createClient, type RedisClientType } from "redis";

/**
 * Перенесено из старого проекта (api/webhook.js и api/check-status.js —
 * там этот же код был продублирован в обоих файлах дословно). Логика не
 * менялась: ленивый singleton-клиент, подключение по REDIS_URL из
 * окружения. Вынесено в общий модуль только чтобы не держать два
 * идентичных куска кода в разных route-обработчиках.
 *
 * ФИКС (Этап 13.1): бесплатный Redis Cloud (30MB, "No persistence")
 * периодически рвёт простаивающие соединения. Раньше при обрыве клиент
 * оставался висеть с isOpen === false, а модульный singleton продолжал
 * его отдавать как есть — все следующие get/set до холодного рестарта
 * serverless-функции падали с "The client is closed", и оплаты переставали
 * засчитываться без единой ошибки на стороне NOWPayments. Теперь клиент
 * подписывается на "error" (чтобы обрыв не ронял процесс необработанным
 * исключением) и getRedis() пересоздаёт соединение, если старое уже не
 * isOpen.
 */
let redisClient: RedisClientType | undefined;

export async function getRedis(): Promise<RedisClientType> {
  if (redisClient && !redisClient.isOpen) {
    redisClient = undefined;
  }

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis connection error:", err));
    await redisClient.connect();
  }

  return redisClient;
}
