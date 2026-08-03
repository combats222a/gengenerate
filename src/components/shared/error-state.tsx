import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Единый компонент для состояний ошибки (генератор не ответил, запрос
 * не выполнен и т.д.) — визуально в паре с EmptyState, но с акцентом
 * destructive-цвета вместо нейтрального.
 */
export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Что-то пошло не так",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="size-5 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
