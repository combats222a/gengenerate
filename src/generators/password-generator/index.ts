// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { KeyRound } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}";
const AMBIGUOUS = /[Il1O0]/g;

/** crypto.getRandomValues, а не Math.random — пароли должны быть криптографически случайными. */
function randomPassword(charset: string, length: number): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

export const generator: GeneratorModule = {
  slug: "password-generator",
  title: "Генератор паролей",
  description: "Криптографически случайные пароли заданной длины и сложности.",
  icon: KeyRound,
  categoryId: "other",
  fields: [
    {
      type: "slider",
      name: "length",
      label: "Длина",
      min: 8,
      max: 64,
      step: 1,
      defaultValue: 16,
    },
    {
      type: "slider",
      name: "count",
      label: "Количество паролей",
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 1,
    },
    { type: "switch", name: "useUppercase", label: "Заглавные буквы (A-Z)", defaultValue: true },
    { type: "switch", name: "useNumbers", label: "Цифры (0-9)", defaultValue: true },
    { type: "switch", name: "useSymbols", label: "Символы (!@#$…)", defaultValue: true },
    {
      type: "switch",
      name: "excludeAmbiguous",
      label: "Исключить похожие символы (I, l, 1, O, 0)",
      defaultValue: false,
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const length = Math.min(Math.max(Number(input.length ?? 16), 8), 64);
    const count = Math.min(Math.max(Number(input.count ?? 1), 1), 20);

    let charset = LOWERCASE;
    if (input.useUppercase !== false) charset += UPPERCASE;
    if (input.useNumbers !== false) charset += NUMBERS;
    if (input.useSymbols !== false) charset += SYMBOLS;
    if (input.excludeAmbiguous === true) charset = charset.replace(AMBIGUOUS, "");

    if (charset.length === 0) {
      throw new Error("Нужен хотя бы один набор символов");
    }

    const passwords = Array.from({ length: count }, () => randomPassword(charset, length));

    return { kind: "text", content: passwords.join("\n") };
  }),
  seo: {
    title: "Генератор паролей онлайн — криптографически случайные",
    description:
      "Сгенерируйте один или несколько надёжных паролей заданной длины и сложности — целиком в браузере, без отправки на сервер.",
    keywords: ["генератор паролей", "password generator", "random password"],
  },
  isNew: true,
};
