"use client";

import { useSyncExternalStore } from "react";

import type { GeneratorFormValues, GeneratorOutput } from "./types";

/**
 * ЭТАП 13 — "сохранённые проекты" из списка Premium-возможностей.
 * В исходном ТЗ этой функции не было вообще ни в каком виде (в отличие
 * от истории сессии, у которой уже был sessionStorage-механизм с Этапа
 * 5) — здесь реализация с нуля, по тому же паттерну, что и
 * favorites.ts/session-history.ts (useSyncExternalStore + storage-эвент
 * для синхронизации между вкладками), но в localStorage — в отличие от
 * истории сессии, проект должен пережить закрытие вкладки.
 *
 * Лимит количества сохранённых проектов (TariffFeatures.savedProjects)
 * проверяется на уровне UI (см. GeneratorEngine) — этот модуль сам
 * лимитов не знает, только хранит и отдаёт список.
 */

export interface SavedProject {
  id: string;
  generatorId: string;
  title: string;
  input: GeneratorFormValues;
  output: GeneratorOutput;
  createdAt: number;
}

const STORAGE_KEY = "saved-projects";
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

let cache: { raw: string | null; parsed: SavedProject[] } | null = null;

function readAll(): SavedProject[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed: SavedProject[] = [];
  try {
    parsed = raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch {
    parsed = [];
  }
  cache = { raw, parsed };
  return parsed;
}

function writeAll(projects: SavedProject[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  notify();
}

function getServerSnapshot(): SavedProject[] {
  return [];
}

export function saveProject(
  generatorId: string,
  title: string,
  entry: Pick<SavedProject, "input" | "output">,
): SavedProject {
  const project: SavedProject = {
    id: crypto.randomUUID(),
    generatorId,
    title,
    createdAt: Date.now(),
    ...entry,
  };
  writeAll([project, ...readAll()]);
  return project;
}

export function deleteProject(id: string): void {
  writeAll(readAll().filter((project) => project.id !== id));
}

/** Все сохранённые проекты, реактивно. */
export function useSavedProjects(): SavedProject[] {
  return useSyncExternalStore(subscribe, readAll, getServerSnapshot);
}

/** Только для конкретного генератора — используется в GeneratorEngine. */
export function useSavedProjectsFor(generatorId: string): SavedProject[] {
  const all = useSavedProjects();
  return all.filter((project) => project.generatorId === generatorId);
}
