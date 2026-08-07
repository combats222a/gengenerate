"use client";

import { GeneratorFormField } from "./generator-form-field";
import type { GeneratorFieldSchema, GeneratorFormValues } from "@/lib/generator-engine/types";

interface GeneratorFormProps {
  fields: GeneratorFieldSchema[];
  values: GeneratorFormValues;
  onFieldChange: (name: string, value: GeneratorFormValues[string]) => void;
  disabled?: boolean;
}

export function GeneratorForm({ fields, values, onFieldChange, disabled }: GeneratorFormProps) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      {fields.map((field) => (
        <GeneratorFormField
          key={field.name}
          field={field}
          value={values[field.name] ?? null}
          onChange={(value) => onFieldChange(field.name, value)}
          disabled={disabled}
        />
      ))}
    </fieldset>
  );
}
