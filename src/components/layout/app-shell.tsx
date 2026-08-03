import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Единый корневой Layout: Sidebar лежит отдельным fixed-слоем поверх
 * страницы, поэтому колонка с Header/Main/Footer получает ПОСТОЯННЫЙ
 * отступ слева (lg:pl-16 — ширина свёрнутого рельса). Этот отступ не
 * меняется при разворачивании/сворачивании Sidebar — меняется только
 * сам Sidebar. На мобильных отступа нет вовсе, т.к. там Sidebar — это
 * Sheet-оверлей, который ничего не резервирует в layout.
 *
 * main получает flex-1, поэтому Footer всегда либо прижат к низу
 * вьюпорта (на коротких страницах), либо идёт сразу после контента
 * (на длинных) — классический sticky-footer без лишнего JS.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-16">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
