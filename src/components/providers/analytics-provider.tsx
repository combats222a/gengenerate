"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

import { initAnalytics } from "@/lib/analytics";
import { trackClientError, trackPageView, trackWebVital } from "@/lib/analytics/events";
import { getConfiguredProviders } from "@/config/analytics";

// Модульная переменная, а не useRef/useState: инициализация провайдеров
// должна произойти РОВНО один раз за жизнь вкладки, а не при каждом
// перемонтировании AnalyticsProvider (например, из-за Fast Refresh в деве).
let providersInitialized = false;

/**
 * usePathname/useSearchParams требуют собственного Suspense-барьера в
 * App Router — вынесены в отдельный компонент, чтобы не переводить
 * весь RootLayout в динамический рендеринг.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

/** Core Web Vitals (LCP, CLS, INP и т.д.) — встроенный хук Next.js, без дополнительных зависимостей. */
function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    trackWebVital(metric.name, metric.value, window.location.pathname, metric.rating);
  });

  return null;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    if (!providersInitialized) {
      providersInitialized = true;
      initAnalytics(getConfiguredProviders());
    }

    function handleWindowError(event: WindowEventMap["error"]) {
      trackClientError(event.message, "window.onerror", event.error?.stack);
    }

    function handleUnhandledRejection(event: WindowEventMap["unhandledrejection"]) {
      const { reason } = event;
      trackClientError(
        reason instanceof Error ? reason.message : String(reason),
        "unhandledrejection",
        reason instanceof Error ? reason.stack : undefined,
      );
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <WebVitalsTracker />
      {children}
    </>
  );
}
