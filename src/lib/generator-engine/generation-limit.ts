"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Механический счётчик "сколько раз за сегодня" — намеренно не знает
 * ничего про тарифы, планы или конкретные генераторы, только считает по
 * произвольному scope. Какой лимит применить к какому scope — решает
 * useGenerationQuota (@/hooks/use-generation-quota.ts), опираясь на
 * @/config/tariffs. Это и есть "универсальный механизм лимитов" из ТЗ
 * Этапа 13: один и тот же счётчик обслуживает и общий пул локальных
 * генераций, и общий пул AI-генераций, и индивидуальный лимит отдельного
 * генератора — разница только в строке scope.
 */

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

/**
 * scope — общий пул ("pool:local" / "pool:ai") либо индивидуальный
 * лимит конкретного генератора ("gen:<slug>"), см. use-generation-quota.ts.
 */
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
  /** null = безлимит (Premium или тариф без ограничения для этого пула). */
  limit: number | null;
  /** Infinity, если limit === null. */
  remaining: number;
  isReached: boolean;
  increment: () => void;
}

export function useGenerationLimit(
  scope: string,
  limit: number | null,
): UseGenerationLimitResult {
  const count = useGenerationCount(scope);
  const increment = useCallback(() => {
    incrementGenerationCount(scope);
  }, [scope]);

  if (limit === null) {
    return { count, limit: null, remaining: Infinity, isReached: false, increment };
  }

  const remaining = Math.max(0, limit - count);
  return { count, limit, remaining, isReached: remaining <= 0, increment };
}
