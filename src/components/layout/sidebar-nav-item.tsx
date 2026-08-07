"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";

import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  item: NavItem;
  isExpanded: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({
  item,
  isExpanded,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={isExpanded ? undefined : item.title}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
        isActive
          ? "text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {isActive && (
        <m.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-md bg-sidebar-accent"
          transition={{ duration: 0.18, ease: "easeInOut" }}
        />
      )}
      {isActive && (
        <m.span
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary"
          transition={{ duration: 0.18, ease: "easeInOut" }}
        />
      )}
      <Icon className="relative size-[18px] shrink-0" />
      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="relative overflow-hidden whitespace-nowrap"
          >
            {item.title}
          </m.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (isExpanded) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}
