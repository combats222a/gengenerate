"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { siteConfig } from "@/config/site";

interface LogoProps {
  expanded?: boolean;
}

export function Logo({ expanded = true }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={siteConfig.name}
      className="flex min-w-0 items-center gap-2.5"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap text-sm font-semibold tracking-tight text-sidebar-foreground"
          >
            {siteConfig.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
