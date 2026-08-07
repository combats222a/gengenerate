"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 1024;

/**
 * true для узких экранов, где Sidebar работает как выезжающий Sheet-drawer
 * вместо постоянной иконочной панели. Возвращает `false` во время SSR
 * и первого рендера, чтобы избежать несовпадения разметки (hydration).
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => setIsMobile(mql.matches);
    onChange();

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
