import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loaderVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface LoaderProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loaderVariants> {
  /** Текст для скринридеров (визуально скрыт) */
  label?: string;
}

/**
 * Универсальный спиннер загрузки — для кнопок, целых секций или
 * состояния "генератор обрабатывает запрос". Центрирование и
 * позиционирование — на усмотрение места использования.
 */
function Loader({ className, size, label = "Загрузка…", ...props }: LoaderProps) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={loaderVariants({ size })} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Loader, loaderVariants };
