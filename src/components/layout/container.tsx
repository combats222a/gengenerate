import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * "default" — для сеток и основного контента (каталог, дашборд).
   * "narrow" — для форм и текстового контента в одну колонку (настройки).
   */
  size?: "default" | "narrow";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  default: "max-w-[1400px]",
  narrow: "max-w-2xl",
};

/**
 * Единая точка правды для ширины и горизонтальных отступов контента.
 * Header, Footer и PageHeader используют её же — поэтому их содержимое
 * всегда выровнено по одной сетке, независимо от того, что рендерит
 * конкретная страница между ними.
 */
export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
}
