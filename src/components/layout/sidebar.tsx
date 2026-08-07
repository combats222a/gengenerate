"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { mainNav, bottomNav } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SidebarNavItem } from "./sidebar-nav-item";
import { UserMenu } from "./user-menu";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;

function SidebarBody({
  expanded,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center",
          expanded ? "px-4" : "justify-center",
        )}
      >
        <Logo expanded={expanded} />
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {mainNav.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isExpanded={expanded}
            isActive={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="flex flex-col gap-1 px-2 pb-2">
        {bottomNav.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isExpanded={expanded}
            isActive={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="p-2">
        <UserMenu expanded={expanded} />
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isExpanded, toggleExpanded, setExpanded, isMobileOpen, setMobileOpen } =
    useSidebarStore();

  // Esc закрывает развёрнутую панель на десктопе (на мобильном Esc уже
  // обрабатывается самим Radix Dialog внутри Sheet).
  React.useEffect(() => {
    if (isMobile || !isExpanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, isExpanded, setExpanded]);

  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-64 flex-col bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground/70"
        >
          <SheetTitle className="sr-only">Навигация</SheetTitle>
          <SidebarBody
            expanded
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {/* Клик вне развёрнутой панели сворачивает её обратно в рельс —
          так контент под ней остаётся полностью доступен большую часть времени,
          а сама панель никогда не толкает layout. */}
      {isExpanded && (
        <button
          aria-label="Свернуть меню"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-30 cursor-default"
          tabIndex={-1}
        />
      )}

      <m.aside
        initial={false}
        animate={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
      >
        <SidebarBody expanded={isExpanded} pathname={pathname} />

        <button
          onClick={toggleExpanded}
          aria-label={isExpanded ? "Свернуть меню" : "Развернуть меню"}
          className="absolute -right-3 top-14 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm transition-colors hover:text-sidebar-foreground"
        >
          {isExpanded ? (
            <PanelLeftClose className="size-3.5" />
          ) : (
            <PanelLeftOpen className="size-3.5" />
          )}
        </button>
      </m.aside>
    </>
  );
}
