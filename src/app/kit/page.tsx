"use client";

import * as React from "react";
import {
  Download,
  Inbox,
  Info,
  MoreHorizontal,
  Settings,
  Trash2,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { PremiumGate } from "@/components/subscription/premium-gate";
import { GeneratorEngine } from "@/components/generator-engine/generator-engine";
import { createLocalProvider, createApiProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorEngineConfig } from "@/lib/generator-engine/types";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Checkbox,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Modal,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Loader,
  EmptyState,
  ErrorState,
  toast,
} from "@/components";

// Демо-конфиги для секции "Generator Engine" ниже. Оба тривиальные и не
// являются логикой конкретного генератора — только пример подключения
// Local и API Provider к одному и тому же движку.

const textCaseLocalDemo: GeneratorEngineConfig = {
  id: "demo-local-text-case",
  title: "Регистр текста",
  description: "Local Provider — вся генерация происходит в браузере, без единого сетевого запроса.",
  fields: [
    {
      type: "textarea",
      name: "text",
      label: "Текст",
      placeholder: "Введите текст…",
      required: true,
    },
    {
      type: "select",
      name: "mode",
      label: "Регистр",
      defaultValue: "upper",
      options: [
        { value: "upper", label: "ВЕРХНИЙ РЕГИСТР" },
        { value: "lower", label: "нижний регистр" },
        { value: "title", label: "Каждое Слово С Большой" },
      ],
    },
  ],
  provider: createLocalProvider(async ({ input }) => {
    const text = String(input.text ?? "");
    const mode = String(input.mode ?? "upper");

    await new Promise((resolve) => setTimeout(resolve, 400)); // чтобы progress-состояние было заметно

    let content = text;
    if (mode === "upper") content = text.toUpperCase();
    if (mode === "lower") content = text.toLowerCase();
    if (mode === "title") {
      content = text.replace(
        /\p{L}+/gu,
        (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
      );
    }

    return { kind: "text", content };
  }),
};

const textReverseApiDemo: GeneratorEngineConfig = {
  id: "demo-api-text-reverse",
  title: "Переворот текста",
  description:
    "API Provider — запрос уходит на собственный backend проекта (/api/kit-demo/generate). В реальном генераторе на его месте будет любой AI-сервис — GeneratorEngine об этом не знает.",
  fields: [
    {
      type: "text",
      name: "text",
      label: "Текст",
      placeholder: "Введите текст…",
      required: true,
    },
  ],
  provider: createApiProvider({
    endpoint: "/api/kit-demo/generate",
    parseResponse: (data) => ({
      kind: "text",
      content: (data as { result: string }).result,
    }),
  }),
};

function KitSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-10">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

/**
 * Витрина всех компонентов UI Kit. Страница для разработки и визуальной
 * проверки — сознательно не добавлена в навигацию Sidebar, т.к. не является
 * частью продукта. Можно удалить перед продакшеном или оставить как
 * внутренний справочник для будущих генераторов.
 */
export default function KitPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [checked, setChecked] = React.useState(true);
  const [switchOn, setSwitchOn] = React.useState(true);

  return (
    <div>
      <PageHeader
        title="UI Kit"
        description="Витрина всех переиспользуемых компонентов проекта — справочник для будущих генераторов, не часть продуктовой навигации."
      />

      <Container className="space-y-10 py-8">
        <KitSection title="Button" description="Варианты и размеры">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="icon" aria-label="Настройки">
            <Settings />
          </Button>
          <Button disabled>Disabled</Button>
        </KitSection>

        <KitSection title="Input / Label" description="Текстовые поля форм">
          <div className="w-64 space-y-1.5">
            <Label htmlFor="kit-email">Email</Label>
            <Input id="kit-email" type="email" placeholder="you@example.com" />
          </div>
        </KitSection>

        <KitSection title="Select">
          <div className="w-56">
            <Select defaultValue="gpt">
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt">GPT-стиль</SelectItem>
                <SelectItem value="claude">Claude-стиль</SelectItem>
                <SelectItem value="custom">Своя модель</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </KitSection>

        <KitSection title="Slider" description={`Текущее значение: ${sliderValue[0]}`}>
          <div className="w-64 pt-2">
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          </div>
        </KitSection>

        <KitSection title="Switch / Checkbox">
          <div className="flex items-center gap-2">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} id="kit-switch" />
            <Label htmlFor="kit-switch">Уведомления</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => setChecked(!!value)}
              id="kit-checkbox"
            />
            <Label htmlFor="kit-checkbox">Согласен с условиями</Label>
          </div>
        </KitSection>

        <KitSection title="Card">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Генератор статей</CardTitle>
              <CardDescription>Пишет SEO-статьи по ключевым словам</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Пример карточки для будущих генераторов.
            </CardContent>
            <CardFooter>
              <Button size="sm">Открыть</Button>
            </CardFooter>
          </Card>
        </KitSection>

        <KitSection title="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </KitSection>

        <KitSection title="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Информация">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Подсказка появляется при наведении</TooltipContent>
          </Tooltip>
        </KitSection>

        <KitSection title="Modal" description="Готовая обёртка поверх Dialog — для большинства случаев">
          <Button onClick={() => setModalOpen(true)}>Открыть Modal</Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Пример Modal"
            description="Простой способ показать модалку без ручной сборки Dialog*"
            footer={
              <>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setModalOpen(false)}>Готово</Button>
              </>
            }
          >
            <p className="text-sm text-muted-foreground">
              Любой контент попадает сюда через children.
            </p>
          </Modal>
        </KitSection>

        <KitSection title="Dialog" description="Гибкая композиция из под-компонентов Dialog*">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Открыть Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить генератор?</DialogTitle>
                <DialogDescription>
                  Действие необратимо и удалит все связанные результаты.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                  Удалить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </KitSection>

        <KitSection title="Tabs">
          <Tabs defaultValue="settings" className="w-72">
            <TabsList>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="text-sm text-muted-foreground">
              Содержимое вкладки «Настройки».
            </TabsContent>
            <TabsContent value="history" className="text-sm text-muted-foreground">
              Содержимое вкладки «История».
            </TabsContent>
          </Tabs>
        </KitSection>

        <KitSection title="Dropdown" description="DropdownMenu — меню действий (не форм-контрол)">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Ещё действия">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download /> Скачать
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </KitSection>

        <KitSection title="Skeleton">
          <div className="w-64 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </KitSection>

        <KitSection title="Toast" description="sonner под капотом — toast() доступен из любого места">
          <Button variant="outline" onClick={() => toast("Стандартное уведомление")}>
            Default
          </Button>
          <Button variant="outline" onClick={() => toast.success("Генератор завершил работу")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Не удалось выполнить запрос")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.loading("Генерация…")}>
            Loading
          </Button>
        </KitSection>

        <KitSection title="Loader">
          <Loader size="sm" />
          <Loader />
          <Loader size="lg" />
        </KitSection>

        <KitSection title="Empty State">
          <EmptyState
            icon={Inbox}
            title="Пусто"
            description="Пример пустого состояния для будущих генераторов."
            className="w-full"
          />
        </KitSection>

        <KitSection title="Error State">
          <ErrorState
            title="Не удалось загрузить"
            description="Пример состояния ошибки, например при сбое генерации."
            action={
              <Button size="sm" variant="outline">
                Повторить
              </Button>
            }
            className="w-full"
          />
        </KitSection>

        <KitSection
          title="Premium Gate"
          description="Этап 4: под капотом — перенесённые без изменений create-invoice/check-status. Без настроенных NOWPAYMENTS_API_KEY/REDIS_URL проверка статуса ниже закономерно завершится ошибкой сети — это ожидаемо в этой песочнице."
        >
          <PremiumGate
            className="w-full max-w-md"
            title="Пример премиум-раздела"
            description="Так будет выглядеть пэйвол для платных генераторов."
          >
            <p className="text-sm text-muted-foreground">
              Если бы подписка была активна, здесь отображался бы контент генератора.
            </p>
          </PremiumGate>
        </KitSection>
        <KitSection
          title="Generator Engine"
          description="Этап 5: два примера одного и того же движка — Local Provider (слева) и API Provider (справа). Форма, прогресс, превью, лимит генераций и история работают одинаково в обоих случаях; отличается только provider внутри конфига."
        >
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-2">
            <GeneratorEngine config={textCaseLocalDemo} />
            <GeneratorEngine config={textReverseApiDemo} />
          </div>
        </KitSection>
      </Container>
    </div>
  );
}
