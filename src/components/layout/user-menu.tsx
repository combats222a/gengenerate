"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  expanded?: boolean;
}

/**
 * Заглушка блока пользователя. Аутентификация не входит в Этап 1 —
 * компонент уже собран так, чтобы позже принять реальные данные
 * аккаунта без изменения разметки Sidebar.
 */
export function UserMenu({ expanded = true }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Меню аккаунта: Гость"
          className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="size-7 shrink-0">
            <AvatarFallback>Г</AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-w-0 flex-col overflow-hidden"
              >
                <span className="truncate text-xs font-medium text-sidebar-foreground">
                  Гость
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/60">
                  Не авторизован
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56">
        <DropdownMenuLabel>Аккаунт</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User /> Профиль
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings /> Настройки
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogOut /> Выйти (нужна авторизация)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
