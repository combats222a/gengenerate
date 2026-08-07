"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import type { GenerationProgress } from "@/lib/generator-engine/types";

interface GeneratorProgressProps {
  progress: GenerationProgress | null;
  onCancel: () => void;
}

export function GeneratorProgress({ progress, onCancel }: GeneratorProgressProps) {
  const hasPercent = typeof progress?.percent === "number";

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 py-12 text-center">
      {hasPercent ? (
        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress?.percent} />
          <p className="text-xs text-muted-foreground">{progress?.percent}%</p>
        </div>
      ) : (
        <Loader />
      )}
      <p className="text-sm text-muted-foreground">{progress?.message ?? "Генерируем…"}</p>
      <Button variant="outline" size="sm" onClick={onCancel}>
        Отменить
      </Button>
    </div>
  );
}
