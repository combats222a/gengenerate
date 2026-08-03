"use client";

import { useTheme } from "next-themes";
import { Moon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Базовые настройки интерфейса. Раздел будет расширяться на следующих этапах."
      />

      <Container size="narrow" className="py-8">
        <Card>
          <CardHeader>
            <CardTitle>Оформление</CardTitle>
            <CardDescription>
              Тёмная тема включена по умолчанию для всего проекта.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="flex items-center gap-2.5">
                <Moon className="size-4 text-muted-foreground" />
                <Label htmlFor="dark-mode" className="cursor-pointer">
                  Тёмная тема
                </Label>
              </div>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
