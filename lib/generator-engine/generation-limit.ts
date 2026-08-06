"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Смысл дневного лимита — тот же, что в перенесённой на Этапе 4 схеме
 * оплаты ("$1 — снять лимит на сегодня"): у бесплатного пользователя есть
 * ограниченное число генераций в день, план "day" снимает его на сутки,
 * план "month" — убирает совсем на месяц (см. useSubscription).
 */
export const DEFAULT_FREE_DAILY_LIMIT = 3;

const STORAGE_PREFIX = "generation-count";
const listeners = new Set<() => void>();

function todayKey(scope: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD — ключ меняется сам по себе в полночь
  return `${STORAGE_PREFIX}:${scope}:${date}`;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(scope: string): number {
  return Number(window.localStorage.getItem(todayKey(scope)) ?? 0);
}

function getServerSnapshot(): number {
  return 0;
}

/** scope — "global" для единого лимита на все генераторы, либо id конкретного генератора для отдельного лимита. */
export function incrementGenerationCount(scope: string): number {
  const next = getSnapshot(scope) + 1;
  window.localStorage.setItem(todayKey(scope), String(next));
  notify();
  return next;
}

function useGenerationCount(scope: string): number {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(scope),
    getServerSnapshot,
  );
}

export interface UseGenerationLimitResult {
  count: number;
  limit: number;
  remaining: number;
  isReached: boolean;
  increment: () => void;
}

export function useGenerationLimit(
  scope: string,
  limit: number = DEFAULT_FREE_DAILY_LIMIT,
): UseGenerationLimitResult {
  const count = useGenerationCount(scope);
  const increment = useCallback(() => {
    incrementGenerationCount(scope);
  }, [scope]);

  const remaining = Math.max(0, limit - count);
  return { count, limit, remaining, isReached: remaining <= 0, increment };
}
