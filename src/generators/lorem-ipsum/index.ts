// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { AlignLeft } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildSentence(minWords = 6, maxWords = 14): string {
  const length = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words = Array.from({ length }, () => randomItem(WORDS));
  return `${capitalize(words[0])} ${words.slice(1).join(" ")}.`;
}

function buildParagraph(sentenceCount = 5): string {
  return Array.from({ length: sentenceCount }, () => buildSentence()).join(" ");
}

export const generator: GeneratorModule = {
  slug: "lorem-ipsum",
  title: "Генератор Lorem Ipsum",
  description: "Текст-заполнитель нужного объёма — слова, предложения или абзацы.",
  icon: AlignLeft,
  categoryId: "text",
  fields: [
    {
      type: "select",
      name: "unit",
      label: "Единица",
      defaultValue: "paragraphs",
      options: [
        { value: "words", label: "Слова" },
        { value: "sentences", label: "Предложения" },
        { value: "paragraphs", label: "Абзацы" },
      ],
    },
    {
      type: "slider",
      name: "count",
      label: "Количество",
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 3,
    },
    {
      type: "switch",
      name: "startWithLorem",
      label: 'Начинать с "Lorem ipsum dolor sit amet…"',
      defaultValue: true,
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const unit = String(input.unit ?? "paragraphs");
    const count = Math.min(Math.max(Number(input.count ?? 3), 1), 50);
    const startWithLorem = input.startWithLorem !== false;

    let content: string;
    if (unit === "words") {
      const words = Array.from({ length: count }, () => randomItem(WORDS));
      if (startWithLorem) words[0] = "lorem";
      content = words.join(" ");
    } else if (unit === "sentences") {
      const sentences = Array.from({ length: count }, () => buildSentence());
      if (startWithLorem) sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
      content = sentences.join(" ");
    } else {
      const paragraphs = Array.from({ length: count }, () => buildParagraph());
      if (startWithLorem) {
        paragraphs[0] = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${paragraphs[0]}`;
      }
      content = paragraphs.join("\n\n");
    }

    return { kind: "text", content };
  }),
  seo: {
    title: "Генератор Lorem Ipsum онлайн",
    description:
      "Сгенерируйте текст-заполнитель нужного объёма — словами, предложениями или абзацами — для макетов и вёрстки.",
    keywords: ["lorem ipsum generator", "текст заполнитель", "рыба текст"],
  },
  isNew: true,
};
