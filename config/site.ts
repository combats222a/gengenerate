import type { LucideIcon } from "lucide-react";
import { Layers, Star, Settings } from "lucide-react";

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * url — единая точка правды для домена (нужен create-invoice.ts для
 * ipn_callback_url/success_url/cancel_url NOWPayments — см. Этап 4).
 * Задаётся через NEXT_PUBLIC_SITE_URL; локальный fallback — для разработки,
 * ПЕРЕД боевым запуском платежей обязательно выставить реальный домен.
 */
export const siteConfig = {
  name: "AI Hub",
  fullName: "AI Generators Hub",
  description: "Единая платформа для 100+ ИИ-генераторов контента.",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Основная навигация Sidebar. С Этапа 8 "/" и есть каталог генераторов
 * (см. src/app/page.tsx) — отдельного пункта "Все генераторы" больше не
 * нужно, /generators оставлен как редирект на "/" для старых ссылок.
 */
export const mainNav: NavItem[] = [
  { title: "Каталог", href: "/", icon: Layers },
  { title: "Избранное", href: "/favorites", icon: Star },
];

export const bottomNav: NavItem[] = [
  { title: "Настройки", href: "/settings", icon: Settings },
];
