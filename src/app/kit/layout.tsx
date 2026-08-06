import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

// kit/page.tsx — "use client" витрина UI Kit (Этап 2), служебная
// dev-страница, не публичный контент. noIndex через SEO Engine (Этап 9).
export const metadata: Metadata = buildMetadata({
  title: "UI Kit",
  description: "Витрина компонентов дизайн-системы проекта.",
  path: "/kit",
  noIndex: true,
});

export default function KitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
