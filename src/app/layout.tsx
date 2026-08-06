import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";

/**
 * Базовые метаданные сайта. metadataBase обязателен для файловой
 * конвенции opengraph-image.tsx (Этап 9, SEO Engine) — без него
 * относительный URL картинки не резолвится в абсолютный для соцсетей.
 * openGraph/twitter здесь — только общие для всего сайта поля
 * (siteName, locale, тип карточки); title/description/url для
 * конкретной страницы дособирает src/lib/seo/metadata.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.fullName,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
