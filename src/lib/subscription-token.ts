"use client";

const STORAGE_KEY = "subscription_token";

/**
 * НОВОЕ (Этап 4) — в исходном проекте такой функции не было: там
 * create-invoice.js и check-status.js уже принимали токен как готовый
 * параметр, но откуда он берётся на клиенте, реализовано не было
 * (страница /pricing была заглушкой ComingSoon).
 *
 * Здесь — минимальная реализация того же контракта: анонимный
 * идентификатор браузера (не аккаунт, без аутентификации — как и было
 * задумано в исходной архитектуре), создаётся один раз через
 * crypto.randomUUID() и переживает перезагрузки через localStorage.
 */
export function getOrCreateSubscriptionToken(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, token);
  return token;
}
