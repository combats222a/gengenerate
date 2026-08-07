import { createClient, type RedisClientType } from "redis";

/**
 * Перенесено из старого проекта (api/webhook.js и api/check-status.js —
 * там этот же код был продублирован в обоих файлах дословно). Логика не
 * менялась: ленивый singleton-клиент, подключение по REDIS_URL из
 * окружения. Вынесено в общий модуль только чтобы не держать два
 * идентичных куска кода в разных route-обработчиках.
 */
let redisClient: RedisClientType | undefined;

export async function getRedis(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}
