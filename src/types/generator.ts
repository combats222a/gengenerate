import type { LucideIcon } from "lucide-react";

/**
 * Статус генератора в каталоге.
 * - available    — генератор работает и доступен пользователю
 * - beta         — доступен, но помечен как бета-версия
 * - coming-soon  — карточка видна в каталоге, но открыть ещё нельзя
 */
export type GeneratorStatus = "available" | "beta" | "coming-soon";

export interface GeneratorCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Описание одного генератора. Это единственная модель данных,
 * которую нужно будет заполнять на следующих этапах — весь UI
 * (Sidebar, каталог, страница генератора, поиск) строится поверх неё.
 */
export interface Generator {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: GeneratorCategory["id"];
  icon: LucideIcon;
  status: GeneratorStatus;
  /** Помечает генератор как недавно добавленный (бейдж "Новое") */
  isNew?: boolean;
  /** Требует подписки — бейдж "Premium" (см. Premium Gate, Этап 4) */
  isPremium?: boolean;
  /**
   * Бейдж "Популярное" — сейчас проставляется вручную (редакционно),
   * не на основе реальной статистики использования: у проекта пока нет
   * серверной аналитики генераций между пользователями (счётчик лимита
   * из Этапа 5 — локальный, per-браузер, для этого не подходит).
   */
  isPopular?: boolean;
}
