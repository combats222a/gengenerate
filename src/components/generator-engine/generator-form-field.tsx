"use client";

import { Upload } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GeneratorFieldSchema,
  GeneratorFieldValue,
} from "@/lib/generator-engine/types";
import { cn } from "@/lib/utils";

interface GeneratorFormFieldProps {
  field: GeneratorFieldSchema;
  value: GeneratorFieldValue;
  onChange: (value: GeneratorFieldValue) => void;
  disabled?: boolean;
}

/**
 * Единственный файл, который знает про соответствие "тип поля из схемы -> компонент UI Kit".
 * Добавление нового типа поля — правка в одном месте, а не в каждом
 * будущем генераторе.
 */
export function GeneratorFormField({ field, value, onChange, disabled }: GeneratorFormFieldProps) {
  const fieldId = `field-${field.name}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={fieldId}>
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>
        {field.type === "slider" && (
          <span className="text-xs text-muted-foreground">{String(value ?? field.min)}</span>
        )}
      </div>

      {field.type === "text" && (
        <Input
          id={fieldId}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          disabled={disabled}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={fieldId}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          disabled={disabled}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {field.type === "select" && (
        <Select
          value={(value as string) ?? ""}
          disabled={disabled}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger id={fieldId}>
            <SelectValue placeholder="Выберите значение" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "slider" && (
        <Slider
          id={fieldId}
          value={[(value as number) ?? field.min]}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          disabled={disabled}
          onValueChange={([next]) => onChange(next)}
        />
      )}

      {field.type === "switch" && (
        <div className="flex items-center gap-2 pt-0.5">
          <Switch
            id={fieldId}
            checked={(value as boolean) ?? false}
            disabled={disabled}
            onCheckedChange={(next) => onChange(next)}
          />
        </div>
      )}

      {field.type === "color" && (
        <input
          id={fieldId}
          type="color"
          value={(value as string) ?? "#5b7fff"}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-16 cursor-pointer rounded-md border border-input bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}

      {field.type === "file" && (
        <label
          htmlFor={fieldId}
          className={cn(
            "flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-center text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Upload className="size-4" />
          {value instanceof File ? value.name : "Нажмите, чтобы выбрать файл"}
          <input
            id={fieldId}
            type="file"
            accept={field.accept}
            disabled={disabled}
            className="sr-only"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
