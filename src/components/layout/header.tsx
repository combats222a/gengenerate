"use client";

import { Suspense } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { CatalogSearchInput } from "@/components/shared/catalog-search-input";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

/**
 * Поиск подключён по-настоящему (Этап 8) — см. CatalogSearchInput.
 * Живёт в URL (?q=...), сама фильтрация — на сервере в src/app/page.tsx,
 * поэтому Header остаётся простым и не хранит список генераторов.
 *
 * Suspense обязателен: CatalogSearchInput использует useSearchParams(),
 * а Header рендерится на каждой странице, включая статически
 * генерируемые (например /_not-found) — без границы сборка падает.
 */
export function Header() {
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/80 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Открыть меню"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        <Suspense fallback={<div className="h-9 w-full max-w-md rounded-md border border-input" />}>
          <CatalogSearchInput />
        </Suspense>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
