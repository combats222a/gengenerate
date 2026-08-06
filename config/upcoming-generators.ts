import type { LucideIcon } from "lucide-react";
import {
  PenLine,
  MessageSquareText,
  Eraser,
  Wand2,
  Mic,
  Music,
  Captions,
  Scissors,
  Regex,
  Database,
  Link as LinkIcon,
  Mail,
  Palette,
  Blend,
  KeyRound,
  Ruler,
} from "lucide-react";

export interface UpcomingGenerator {
  title: string;
  description: string;
  icon: LucideIcon;
  categoryId: string;
}

/**
 * Тизеры генераторов, которые ещё не реализованы — только для каталога
 * (Этап 8, "большинство генераторов пока могут отображаться как Coming
 * Soon"). Это НЕ часть SDK: у них нет папки в src/generators, нет формы,
 * нет provider, нет собственной страницы — карточка в каталоге просто
 * неактивна. Как только генератор реализуют по-настоящему, запись отсюда
 * удаляется, а вместо неё появляется папка в src/generators/ (см. гайд
 * src/generators/README.md).
 */
export const upcomingGenerators: UpcomingGenerator[] = [
  {
    title: "Генератор заголовков",
    description: "Цепляющие заголовки для статей и постов по ключевым словам.",
    icon: PenLine,
    categoryId: "text",
  },
  {
    title: "Перефразировщик текста",
    description: "Переписывает текст другими словами, сохраняя смысл.",
    icon: MessageSquareText,
    categoryId: "text",
  },
  {
    title: "Удаление фона",
    description: "Убирает фон с изображения в один клик.",
    icon: Eraser,
    categoryId: "image",
  },
  {
    title: "Апскейлер изображений",
    description: "Увеличивает разрешение картинки без потери качества.",
    icon: Wand2,
    categoryId: "image",
  },
  {
    title: "Синтез речи",
    description: "Озвучивает текст естественным голосом.",
    icon: Mic,
    categoryId: "audio",
  },
  {
    title: "Генератор музыкальных лупов",
    description: "Короткие зацикленные музыкальные фрагменты для фона.",
    icon: Music,
    categoryId: "audio",
  },
  {
    title: "Генератор субтитров",
    description: "Автоматические субтитры по видео или аудиодорожке.",
    icon: Captions,
    categoryId: "video",
  },
  {
    title: "Нарезка видео на клипы",
    description: "Делит длинное видео на короткие фрагменты для соцсетей.",
    icon: Scissors,
    categoryId: "video",
  },
  {
    title: "Генератор регулярных выражений",
    description: "Строит regex по описанию на обычном языке.",
    icon: Regex,
    categoryId: "code",
  },
  {
    title: "Генератор мок-данных",
    description: "Тестовые JSON/CSV-данные по заданной схеме.",
    icon: Database,
    categoryId: "code",
  },
  {
    title: "Генератор UTM-меток",
    description: "Собирает ссылки с UTM-параметрами для кампаний.",
    icon: LinkIcon,
    categoryId: "marketing",
  },
  {
    title: "Генератор email-рассылок",
    description: "Черновики писем по теме и целевой аудитории.",
    icon: Mail,
    categoryId: "marketing",
  },
  {
    title: "Генератор цветовых палитр",
    description: "Гармоничные наборы цветов по одному базовому оттенку.",
    icon: Palette,
    categoryId: "design",
  },
  {
    title: "Генератор градиентов",
    description: "CSS-градиенты с готовым кодом для копирования.",
    icon: Blend,
    categoryId: "design",
  },
  {
    title: "Генератор паролей",
    description: "Случайные пароли заданной длины и сложности.",
    icon: KeyRound,
    categoryId: "other",
  },
  {
    title: "Конвертер единиц измерения",
    description: "Переводит величины между метрической и другими системами.",
    icon: Ruler,
    categoryId: "other",
  },
];
