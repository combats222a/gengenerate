"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface CatalogSearchInputProps {
  className?: string;
}

/**
 * Поиск живёт в URL (?q=...), а не в client state: сама сетка
 * результатов (GeneratorCard) остаётся серверным компонентом и
 * фильтруется на сервере по searchParams (см. src/app/page.tsx) — так
 * иконки генераторов не нужно тащить через границу Server -> Client.
 *
 * Смонтирован в Header (глобально), поэтому работает из любого места:
 * если уже на каталоге ("/") — уточняет текущие фильтры на месте
 * (replace, без спама в истории); если на другой странице — переходит
 * на каталог с этим запросом (push, это уже настоящая навигация).
 *
 * Внешняя обёртка задаёт key={pathname} — при смене страницы внутренний
 * компонент перемонтируется и сам подхватывает актуальное значение через
 * обычный useState-инициализатор, без синхронизирующего useEffect.
 */
export function CatalogSearchInput({ className }: CatalogSearchInputProps) {
  const pathname = usePathname();
  return <CatalogSearchInputField key={pathname} className={className} />;
}

function CatalogSearchInputField({ className }: CatalogSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnCatalog = pathname === "/";
  const [value, setValue] = useState(() => (isOnCatalog ? searchParams.get("q") ?? "" : ""));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(isOnCatalog ? searchParams.toString() : "");
      if (next.trim()) {
        params.set("q", next.trim());
      } else {
        params.delete("q");
      }
      const query = params.toString();
      const url = `/${query ? `?${query}` : ""}`;

      if (isOnCatalog) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    }, 300);
  }

  return (
    <div className={className ? className : "relative w-full max-w-md"}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Поиск генераторов…"
        className="pl-8"
        aria-label="Поиск генераторов"
      />
    </div>
  );
}
