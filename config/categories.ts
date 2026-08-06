import {
  FileText,
  Image as ImageIcon,
  AudioLines,
  Clapperboard,
  Code2,
  Megaphone,
  Palette,
  Sparkles,
} from "lucide-react";

import type { GeneratorCategory } from "@/types/generator";

/**
 * Категории группируют генераторы в каталоге и в поиске.
 * Чтобы добавить категорию — достаточно одной записи здесь,
 * без изменений в компонентах Sidebar / Catalog / Header.
 */
export const categories: GeneratorCategory[] = [
  {
    id: "text",
    slug: "text",
    title: "Текст",
    description: "Статьи, посты, описания и другой текстовый контент",
    icon: FileText,
  },
  {
    id: "image",
    slug: "image",
    title: "Изображения",
    description: "Генерация и обработка изображений",
    icon: ImageIcon,
  },
  {
    id: "audio",
    slug: "audio",
    title: "Аудио",
    description: "Голос, музыка и звуковые эффекты",
    icon: AudioLines,
  },
  {
    id: "video",
    slug: "video",
    title: "Видео",
    description: "Ролики, монтаж и видеоэффекты",
    icon: Clapperboard,
  },
  {
    id: "code",
    slug: "code",
    title: "Код",
    description: "Скрипты, сниппеты и разработка",
    icon: Code2,
  },
  {
    id: "marketing",
    slug: "marketing",
    title: "Маркетинг",
    description: "Реклама, email-рассылки, лендинги",
    icon: Megaphone,
  },
  {
    id: "design",
    slug: "design",
    title: "Дизайн",
    description: "Логотипы, иконки, фирменный стиль",
    icon: Palette,
  },
  {
    id: "other",
    slug: "other",
    title: "Другое",
    description: "Генераторы вне остальных категорий",
    icon: Sparkles,
  },
];

export function getCategoryById(id: string): GeneratorCategory | undefined {
  return categories.find((category) => category.id === id);
}
