"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast реализован через sonner, а не "сырой" Radix Toast — тот требует
 * самостоятельно писать провайдер, очередь и viewport на каждый чих.
 * sonner даёт то же самое через один компонент + функцию toast().
 *
 * Использование в любом будущем генераторе:
 *   import { toast } from "@/components/ui/toast";
 *   toast.success("Готово"); toast.error("Ошибка генерации");
 *
 * <Toaster /> подключён один раз глобально в src/app/layout.tsx.
 */
function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
export { toast } from "sonner";
