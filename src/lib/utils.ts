import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы Tailwind с учётом конфликтов (twMerge)
 * и условной логики (clsx). Стандартный хелпер во всех UI-компонентах.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
