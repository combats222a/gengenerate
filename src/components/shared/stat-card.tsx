import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/80">
        <Icon className="size-[18px]" />
      </span>
      <div>
        <p className="text-lg font-semibold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
