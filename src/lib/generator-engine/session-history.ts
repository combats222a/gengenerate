"use client";

import { useSyncExternalStore } from "react";

import type { GeneratorFormValues, GeneratorOutput } from "./types";

export interface GeneratorHistoryEntry {
  id: string;
  input: GeneratorFormValues;
  output: GeneratorOutput;
  createdAt: number;
}

/**
 * "История ТЕКУЩЕЙ сессии" — принципиально sessionStorage, а не
 * localStorage: должна очищаться вместе с закрытием вкладки, а не жить
 * вечно, как токен подписки или дневной счётчик.
 */
const MAX_ENTRIES = 20;
const listeners = new Set<() => void>();

function storageKey(scope: string): string {
  return `generator-history:${scope}`;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Кэш снапшота: useSyncExternalStore требует стабильную ссылку, пока
// данные не менялись, иначе React решит, что стор меняется на каждый рендер.
let cache: { scope: string; raw: string | null; parsed: GeneratorHistoryEntry[] } | null = null;

function readHistory(scope: string): GeneratorHistoryEntry[] {
  const raw = window.sessionStorage.getItem(storageKey(scope));
  if (cache && cache.scope === scope && cache.raw === raw) {
    return cache.parsed;
  }
  let parsed: GeneratorHistoryEntry[] = [];
  try {
    parsed = raw ? (JSON.parse(raw) as GeneratorHistoryEntry[]) : [];
  } catch {
    parsed = [];
  }
  cache = { scope, raw, parsed };
  return parsed;
}

function getServerSnapshot(): GeneratorHistoryEntry[] {
  return [];
}

export function addHistoryEntry(
  scope: string,
  entry: Omit<GeneratorHistoryEntry, "id" | "createdAt">,
): void {
  const current = readHistory(scope);
  const next = [
    { ...entry, id: crypto.randomUUID(), createdAt: Date.now() },
    ...current,
  ].slice(0, MAX_ENTRIES);
  window.sessionStorage.setItem(storageKey(scope), JSON.stringify(next));
  notify();
}

export function clearHistory(scope: string): void {
  window.sessionStorage.removeItem(storageKey(scope));
  notify();
}

export function useSessionHistory(scope: string): GeneratorHistoryEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => readHistory(scope),
    getServerSnapshot,
  );
}
