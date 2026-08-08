/**
 * Синтез речи (Text-to-Speech) — MVP на бесплатном браузерном Web Speech
 * API (SpeechSynthesis), без бэкенда и без ключей. Голоса — те, что
 * установлены в ОС/браузере пользователя, поэтому набор языков ниже —
 * не жёсткий список голосов, а языковые теги, по которым мы на лету
 * подбираем наиболее подходящий voice из window.speechSynthesis.
 *
 * Важное архитектурное ограничение платформы: Web Speech API отдаёт звук
 * напрямую в аудиовыход ОС и не даёт доступа к аудиопотоку/буферу — это
 * значит, что "скачать MP3/WAV" отсюда технически невозможно (в отличие
 * от облачных TTS вроде ElevenLabs/OpenAI, которые прямо возвращают
 * аудиофайл). Поэтому генератор проигрывает озвучку сразу в браузере, а
 * не отдаёт kind: "audio". Когда подключим облачного провайдера как
 * второй GeneratorProvider в этом же модуле — сможем добавить честный
 * kind: "audio" со скачиванием.
 */
import { Mic } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

/** Ждёт заполнения списка голосов — в Chrome он изначально пустой до события voiceschanged. */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    // Фолбэк, если voiceschanged в конкретном браузере не выстрелит.
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

/** Точное совпадение языка (ru-RU), иначе первый голос с тем же основным языком (ru-*). */
function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const primary = lang.split("-")[0];
  return (
    voices.find((voice) => voice.lang === lang) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(primary.toLowerCase())) ??
    null
  );
}

export const generator: GeneratorModule = {
  slug: "text-to-speech",
  title: "Синтез речи",
  description: "Озвучивает введённый текст голосом прямо в браузере — бесплатно, без регистрации.",
  icon: Mic,
  categoryId: "audio",
  fields: [
    {
      type: "textarea",
      name: "text",
      label: "Текст для озвучки",
      placeholder: "Введите текст, который нужно озвучить…",
      maxLength: 3000,
      required: true,
    },
    {
      type: "select",
      name: "lang",
      label: "Язык голоса",
      defaultValue: "ru-RU",
      options: [
        { value: "ru-RU", label: "Русский" },
        { value: "uk-UA", label: "Українська" },
        { value: "en-US", label: "English (US)" },
        { value: "en-GB", label: "English (UK)" },
        { value: "de-DE", label: "Deutsch" },
        { value: "fr-FR", label: "Français" },
        { value: "es-ES", label: "Español" },
      ],
    },
    {
      type: "slider",
      name: "rate",
      label: "Скорость речи",
      min: 0.5,
      max: 2,
      step: 0.1,
      defaultValue: 1,
    },
    {
      type: "slider",
      name: "pitch",
      label: "Тон голоса",
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 1,
    },
    {
      type: "slider",
      name: "volume",
      label: "Громкость",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 1,
    },
  ],
  provider: createLocalProvider(async ({ input, signal, onProgress }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      throw new Error(
        "Ваш браузер не поддерживает синтез речи (Web Speech API). Попробуйте Chrome, Edge или Safari.",
      );
    }

    const text = String(input.text ?? "").trim();
    if (!text) {
      throw new Error("Введите текст для озвучки.");
    }

    const lang = String(input.lang ?? "ru-RU");
    const rate = Number(input.rate ?? 1);
    const pitch = Number(input.pitch ?? 1);
    const volume = Number(input.volume ?? 1);

    onProgress({ message: "Подбираем голос…" });
    const voices = await getVoices();
    const voice = pickVoice(voices, lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    if (voice) utterance.voice = voice;

    onProgress({ message: "Озвучиваем…" });

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        window.speechSynthesis.cancel();
        reject(new DOMException("Генерация отменена", "AbortError"));
      };

      utterance.onend = () => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      };
      utterance.onerror = (event) => {
        signal.removeEventListener("abort", onAbort);
        reject(
          new Error(
            event.error === "canceled" ? "Озвучка остановлена" : "Не удалось озвучить текст",
          ),
        );
      };

      signal.addEventListener("abort", onAbort, { once: true });
      // На случай зависшей предыдущей очереди озвучки в этой же вкладке.
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });

    onProgress({ percent: 100, message: "Готово" });

    return {
      kind: "text",
      content: `🔊 Текст озвучен голосом «${voice?.name ?? `по умолчанию (${lang})`}».\n\n${text}`,
    };
  }),
  seo: {
    title: "Бесплатный синтез речи онлайн — озвучка текста голосом",
    description:
      "Введите текст и прослушайте озвучку прямо в браузере — бесплатно, без регистрации и установки программ.",
    keywords: ["синтез речи онлайн", "text to speech", "озвучка текста", "text-to-speech бесплатно"],
  },
};
