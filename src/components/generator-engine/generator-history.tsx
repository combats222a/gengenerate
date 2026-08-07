"use client";

import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { downloadGeneratorOutput } from "@/lib/generator-engine/download";
import type { GeneratorHistoryEntry } from "@/lib/generator-engine/session-history";

interface GeneratorHistoryProps {
  entries: GeneratorHistoryEntry[];
}

const kindLabel: Record<GeneratorHistoryEntry["output"]["kind"], string> = {
  text: "Текст",
  image: "Изображение",
  audio: "Аудио",
  video: "Видео",
  file: "Файл",
};

function summarize(entry: GeneratorHistoryEntry): string {
  const firstValue = Object.values(entry.input).find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof firstValue === "string" ? firstValue.slice(0, 60) : "Без параметров";
}

export function GeneratorHistory({ entries }: GeneratorHistoryProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="История пуста"
        description="Здесь появятся результаты, сгенерированные в этой сессии."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
        >
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{kindLabel[entry.output.kind]}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="truncate text-sm text-foreground">{summarize(entry)}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadGeneratorOutput(entry.output, "generation")}
          >
            Скачать
          </Button>
        </li>
      ))}
    </ul>
  );
}
