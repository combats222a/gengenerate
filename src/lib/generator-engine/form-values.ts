import type { GeneratorFieldSchema, GeneratorFormValues } from "./types";

export function buildDefaultValues(fields: GeneratorFieldSchema[]): GeneratorFormValues {
  const values: GeneratorFormValues = {};

  for (const field of fields) {
    switch (field.type) {
      case "text":
      case "textarea":
        values[field.name] = field.defaultValue ?? "";
        break;
      case "select":
        values[field.name] = field.defaultValue ?? field.options[0]?.value ?? "";
        break;
      case "slider":
        values[field.name] = field.defaultValue ?? field.min;
        break;
      case "switch":
        values[field.name] = field.defaultValue ?? false;
        break;
      case "color":
        values[field.name] = field.defaultValue ?? "#5b7fff";
        break;
      case "file":
        values[field.name] = null;
        break;
    }
  }

  return values;
}

/** Простая валидация required-полей — генератор не пишет собственную логику проверки. */
export function findMissingRequiredField(
  fields: GeneratorFieldSchema[],
  values: GeneratorFormValues,
): GeneratorFieldSchema | null {
  for (const field of fields) {
    if (!field.required) continue;
    const value = values[field.name];
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "");
    if (isEmpty) return field;
  }
  return null;
}
