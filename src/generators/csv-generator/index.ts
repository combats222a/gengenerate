// Эталон архитектуры генератора — src/generators/pattern/index.ts
// (и гайд по созданию новых в src/generators/README.md).
import { FileSpreadsheet } from "lucide-react";

import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorModule } from "@/generators/types";

const FIRST_NAMES = ["Анна", "Иван", "Мария", "Пётр", "Елена", "Сергей", "Ольга", "Дмитрий", "Наталья", "Алексей"];
const LAST_NAMES = ["Иванов", "Петрова", "Сидоров", "Кузнецова", "Смирнов", "Попова", "Соколов", "Новикова"];
const DOMAINS = ["example.com", "mail.test", "corp.io", "demo.dev"];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomDate(): string {
  const start = new Date(2023, 0, 1).getTime();
  const end = Date.now();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().slice(0, 10);
}

interface ColumnPreset {
  headers: string[];
  buildRow: () => string[];
}

const PRESETS: Record<string, ColumnPreset> = {
  "name-email": {
    headers: ["name", "email"],
    buildRow: () => {
      const first = randomItem(FIRST_NAMES);
      const last = randomItem(LAST_NAMES);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@${randomItem(DOMAINS)}`;
      return [`${first} ${last}`, email];
    },
  },
  "name-email-phone": {
    headers: ["name", "email", "phone"],
    buildRow: () => {
      const first = randomItem(FIRST_NAMES);
      const last = randomItem(LAST_NAMES);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@${randomItem(DOMAINS)}`;
      const phone = `+7 9${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}-${Math.floor(10 + Math.random() * 89)}`;
      return [`${first} ${last}`, email, phone];
    },
  },
  "id-name-price": {
    headers: ["id", "name", "price"],
    buildRow: () => [
      String(Math.floor(1000 + Math.random() * 9000)),
      `${randomItem(["Товар", "Продукт", "Позиция"])} ${Math.floor(1 + Math.random() * 99)}`,
      (Math.random() * 5000).toFixed(2),
    ],
  },
  "uuid-name-date": {
    headers: ["uuid", "name", "created_at"],
    buildRow: () => [crypto.randomUUID(), `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`, randomDate()],
  },
};

function escapeCsvCell(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const generator: GeneratorModule = {
  slug: "csv-generator",
  title: "Генератор CSV",
  description: "Тестовый CSV-файл с реалистичными строками по выбранному набору колонок.",
  icon: FileSpreadsheet,
  categoryId: "code",
  fields: [
    {
      type: "select",
      name: "preset",
      label: "Колонки",
      defaultValue: "name-email",
      options: [
        { value: "name-email", label: "name, email" },
        { value: "name-email-phone", label: "name, email, phone" },
        { value: "id-name-price", label: "id, name, price" },
        { value: "uuid-name-date", label: "uuid, name, created_at" },
      ],
    },
    {
      type: "select",
      name: "delimiter",
      label: "Разделитель",
      defaultValue: ",",
      options: [
        { value: ",", label: "Запятая (,)" },
        { value: ";", label: "Точка с запятой (;)" },
        { value: "\t", label: "Табуляция" },
      ],
    },
    {
      type: "slider",
      name: "rows",
      label: "Количество строк",
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 20,
    },
  ],
  provider: createLocalProvider(async ({ input, onProgress }) => {
    const preset = PRESETS[String(input.preset ?? "name-email")] ?? PRESETS["name-email"];
    const delimiter = String(input.delimiter ?? ",");
    const rows = Math.min(Math.max(Number(input.rows ?? 20), 1), 500);

    onProgress({ message: "Генерируем строки…" });

    const lines = [preset.headers.join(delimiter)];
    for (let i = 0; i < rows; i += 1) {
      lines.push(preset.buildRow().map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return { kind: "file", url, filename: "data.csv", mimeType: "text/csv" };
  }),
  seo: {
    title: "Генератор тестового CSV онлайн",
    description:
      "Скачайте CSV-файл с реалистичными тестовыми строками — контакты, товары или данные с UUID — для проверки импорта.",
    keywords: ["генератор csv", "csv generator", "тестовые данные csv"],
  },
  isNew: true,
};
