import { Shapes, Grid3x3, QrCode, MonitorSmartphone, AudioWaveform } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Ссылки на компоненты-иконки нельзя передать из Server в Client
 * Component (см. src/components/shared/generator-card.tsx). Там, где
 * список генераторов нужно прочитать на клиенте (страница избранного —
 * избранное живёт в localStorage), иконка резолвится по имени через эту
 * карту, а не через прямую ссылку на компонент.
 *
 * Ключи — имена генераторов (GeneratorModule.slug), не универсальный
 * реестр иконок: карта обновляется вручную при добавлении генератора,
 * который должен уметь попадать в избранное.
 */
export const GENERATOR_ICON_BY_SLUG: Record<string, LucideIcon> = {
  svg: Shapes,
  pattern: Grid3x3,
  qr: QrCode,
  mockup: MonitorSmartphone,
  audio: AudioWaveform,
};
