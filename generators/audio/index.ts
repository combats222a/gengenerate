// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { AudioWaveform } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

/** Кодирует AudioBuffer в 16-bit PCM WAV — без внешних зависимостей. */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, text: string) {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let channel = 0; channel < numChannels; channel += 1) {
    channels.push(audioBuffer.getChannelData(channel));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export const generator: GeneratorModule = {
  slug: "audio",
  title: "Тональный сигнал",
  description: "Генерирует короткий тестовый звуковой сигнал (тон) заданной частоты и формы волны.",
  icon: AudioWaveform,
  categoryId: "audio",
  fields: [
    {
      type: "slider",
      name: "frequency",
      label: "Частота, Гц",
      min: 100,
      max: 2000,
      step: 10,
      defaultValue: 440,
    },
    {
      type: "slider",
      name: "duration",
      label: "Длительность, сек",
      min: 0.5,
      max: 5,
      step: 0.5,
      defaultValue: 1,
    },
    {
      type: "select",
      name: "waveform",
      label: "Форма волны",
      defaultValue: "sine",
      options: [
        { value: "sine", label: "Синус" },
        { value: "square", label: "Прямоугольная" },
        { value: "sawtooth", label: "Пилообразная" },
        { value: "triangle", label: "Треугольная" },
      ],
    },
  ],
  provider: createLocalProvider(async ({ input, onProgress }) => {
    const frequency = Number(input.frequency ?? 440);
    const duration = Number(input.duration ?? 1);
    const waveform = String(input.waveform ?? "sine") as OscillatorType;

    onProgress({ message: "Синтезируем звук…" });

    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate);

    const oscillator = offlineCtx.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;

    const gainNode = offlineCtx.createGain();
    const fade = Math.min(0.02, duration / 4);
    gainNode.gain.setValueAtTime(0, 0);
    gainNode.gain.linearRampToValueAtTime(0.8, fade);
    gainNode.gain.setValueAtTime(0.8, Math.max(fade, duration - fade));
    gainNode.gain.linearRampToValueAtTime(0, duration);

    oscillator.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    oscillator.start(0);
    oscillator.stop(duration);

    const renderedBuffer = await offlineCtx.startRendering();
    onProgress({ percent: 90, message: "Кодируем WAV…" });

    const blob = encodeWav(renderedBuffer);
    const url = URL.createObjectURL(blob);

    return { kind: "audio", url, mimeType: "audio/wav" };
  }),
  seo: {
    title: "Генератор тестовых звуковых сигналов онлайн",
    description:
      "Создайте тестовый тон нужной частоты и формы волны прямо в браузере, скачайте в WAV.",
    keywords: ["генератор звука", "tone generator", "test tone wav"],
  },
};
