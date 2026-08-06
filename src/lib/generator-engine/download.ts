import type { GeneratorOutput } from "./types";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function guessExtension(kind: GeneratorOutput["kind"], mimeType?: string): string {
  if (mimeType && EXTENSION_BY_MIME[mimeType]) return EXTENSION_BY_MIME[mimeType];
  if (kind === "image") return "png";
  if (kind === "audio") return "mp3";
  if (kind === "video") return "mp4";
  return "bin";
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Скачивание результата не зависит от того, откуда он взялся — Local
 * Provider или API Provider. Текст оборачивается в Blob на лету (у него
 * нет url), остальные kind уже несут готовый url.
 */
export function downloadGeneratorOutput(output: GeneratorOutput, filenameBase = "result"): void {
  if (output.kind === "text") {
    const blob = new Blob([output.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filenameBase}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  if (output.kind === "file") {
    triggerDownload(output.url, output.filename);
    return;
  }

  const extension = guessExtension(output.kind, output.mimeType);
  triggerDownload(output.url, `${filenameBase}.${extension}`);
}
