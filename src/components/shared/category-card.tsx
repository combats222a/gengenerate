import type { GeneratorCategory } from "@/types/generator";

interface CategoryCardProps {
  category: GeneratorCategory;
  count: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/80">
        <Icon className="size-[18px]" />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{category.title}</h3>
        <p className="text-xs text-muted-foreground">{category.description}</p>
        <p className="text-[11px] text-muted-foreground/70">
          {count} {count === 1 ? "генератор" : "генераторов"}
        </p>
      </div>
    </div>
  );
}
