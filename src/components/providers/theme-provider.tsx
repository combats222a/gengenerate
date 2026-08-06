"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Тонкая обёртка над next-themes.
 * defaultTheme="dark" — тёмная тема применяется до первой отрисовки
 * (next-themes инжектит блокирующий скрипт в <head>, поэтому мигания
 * светлой темы при загрузке не будет).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
