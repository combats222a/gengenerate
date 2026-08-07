"use client";

import { LazyMotion, type LazyFeatureBundle } from "framer-motion";

/**
 * Этап 11 (Оптимизация), Code Splitting.
 *
 * До этого этапа компоненты layout'а (Sidebar, Logo, SidebarNavItem,
 * UserMenu) импортировали `motion` напрямую из "framer-motion" — это
 * тянет в основной бандл сразу и движок анимаций, и жестовый рантайм
 * (drag/pan), хотя реально используются только opacity/transform и
 * AnimatePresence (exit-анимации при сворачивании Sidebar).
 *
 * LazyMotion + облегчённый компонент `m` (вместо `motion`) убирают из
 * стартового бандла всё, кроме самого LazyMotion; сами фичи анимации
 * подгружаются отдельным чанком асинхронно через динамический import
 * ниже. `strict` — dev-предохранитель: React бросит ошибку, если где-то
 * по ошибке останется импорт полного `motion` вместо `m`.
 *
 * Взят именно `domMax`, а не более лёгкий `domAnimation`: SidebarNavItem
 * использует `layoutId` для перетекающей подложки активного пункта меню
 * (layout-анимация), а она входит только в domMax. domAnimation не бросил
 * бы ошибку — просто молча перестал бы анимировать эту подложку, поэтому
 * здесь сознательно не экономим ещё ~10кб ради точного сохранения
 * поведения. Экономия Code Splitting'а всё равно есть: даже domMax теперь
 * грузится отдельным чанком, а не лежит в основном бандле.
 *
 * Все конкретные генераторы (Local/API Provider) сюда не входят и этот
 * файл не касается — затронуты только shared layout-компоненты.
 */
const loadFeatures: LazyFeatureBundle = () => import("framer-motion").then((mod) => mod.domMax);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
