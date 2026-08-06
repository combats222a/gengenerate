import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Compass className="size-6 text-muted-foreground" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Страница не найдена</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Такого генератора или раздела пока не существует. Возможно, он
          появится на следующих этапах.
        </p>
      </div>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
