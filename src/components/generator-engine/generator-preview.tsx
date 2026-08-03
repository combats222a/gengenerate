"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { downloadGeneratorOutput } from "@/lib/generator-engine/download";
import type { GeneratorOutput } from "@/lib/generator-engine/types";
import { cn } from "@/lib/utils";

interface GeneratorPreviewProps {
  output: GeneratorOutput;
  filenameBase?: string;
  className?: string;
}

export function GeneratorPreview({ output, filenameBase, className }: GeneratorPreviewProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (output.kind !== "text") return;
    await navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {output.kind === "text" && (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-4 text-sm text-foreground">
            {output.content}
          </pre>
        )}
        {output.kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element -- динамический blob/data URL результата генерации, next/image тут не подходит
          <img src={output.url} alt="Результат генерации" className="w-full" />
        )}
        {output.kind === "audio" && (
          <audio controls src={output.url} className="w-full p-4">
            Браузер не поддерживает воспроизведение аудио.
          </audio>
        )}
        {output.kind === "video" && (
          <video controls src={output.url} className="w-full">
            Браузер не поддерживает воспроизведение видео.
          </video>
        )}
        {output.kind === "file" && (
          <div className="flex items-center justify-between p-4 text-sm">
            <span className="truncate text-muted-foreground">{output.filename}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => downloadGeneratorOutput(output, filenameBase)}>
          <Download /> Скачать
        </Button>
        {output.kind === "text" && (
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Скопировано" : "Копировать"}
          </Button>
        )}
      </div>
    </div>
  );
}
