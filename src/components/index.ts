/**
 * Единая точка входа в UI Kit проекта.
 *
 * Вместо:
 *   import { Button } from "@/components/ui/button";
 *   import { Card } from "@/components/ui/card";
 *
 * можно:
 *   import { Button, Card } from "@/components";
 *
 * Прямой импорт из конкретного файла (например "@/components/ui/button")
 * по-прежнему работает и ничем не хуже — это просто дело вкуса/привычки.
 */

// Layout
export * from "./layout/container";

// Базовые примитивы
export * from "./ui/button";
export * from "./ui/input";
export * from "./ui/textarea";
export * from "./ui/label";
export * from "./ui/select";
export * from "./ui/slider";
export * from "./ui/switch";
export * from "./ui/checkbox";
export * from "./ui/card";
export * from "./ui/badge";
export * from "./ui/avatar";
export * from "./ui/separator";
export * from "./ui/skeleton";
export * from "./ui/scroll-area";

// Оверлеи и всплывающий контент
export * from "./ui/tooltip";
export * from "./ui/dialog";
export * from "./ui/modal";
export * from "./ui/sheet";
export * from "./ui/dropdown-menu";
export * from "./ui/tabs";
export * from "./ui/toast";

// Индикаторы состояния
export * from "./ui/loader";
export * from "./ui/progress";
export * from "./shared/empty-state";
export * from "./shared/error-state";
