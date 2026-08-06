import * as React from "react";

const subscribe = () => () => {};

/**
 * true после гидратации на клиенте, false во время SSR и первого рендера.
 * Нужен там, где вывод зависит от значения, недоступного на сервере
 * (например, resolvedTheme из next-themes) — без этого возможен
 * hydration mismatch. Реализовано через useSyncExternalStore, а не
 * useEffect+setState, чтобы не вызывать каскадный ре-рендер.
 */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
