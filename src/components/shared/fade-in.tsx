"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Лёгкое появление контента (150-220ms по стандарту анимаций проекта).
 * Уважает prefers-reduced-motion через хук framer-motion.
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </m.div>
  );
}
