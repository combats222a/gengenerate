import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

// settings/page.tsx — "use client" (useTheme), поэтому не может сам
// экспортировать metadata; этот серверный layout — единственный способ
// дать ему title/canonical/robots из SEO Engine (Этап 9). noIndex: страница
// не содержит уникального контента для поиска.
export const metadata: Metadata = buildMetadata({
  title: "Настройки",
  description: "Базовые настройки интерфейса GenGenerate.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
