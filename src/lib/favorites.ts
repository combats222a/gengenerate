"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "favorite-generators";
const listeners = new Set<() => void>();

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

let cache: { raw: string | null; parsed: string[] } | null = null;

function readFavorites(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed: string[] = [];
  try {
    parsed = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    parsed = [];
  }
  cache = { raw, parsed };
  return parsed;
}

function getServerSnapshot(): string[] {
  return [];
}

function writeFavorites(slugs: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  notify();
}

export function isFavorite(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return readFavorites().includes(slug);
}

export function toggleFavorite(slug: string): void {
  const current = readFavorites();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  writeFavorites(next);
}

/** Список slug'ов избранных генераторов, реактивно (обновляется на toggle). */
export function useFavoriteSlugs(): string[] {
  return useSyncExternalStore(subscribe, readFavorites, getServerSnapshot);
}

/** true/false для одного генератора + функция переключения. */
export function useIsFavorite(slug: string): [boolean, () => void] {
  const favorites = useFavoriteSlugs();
  const toggle = useCallback(() => toggleFavorite(slug), [slug]);
  return [favorites.includes(slug), toggle];
}
