# GenGenerate

Архитектурный фундамент SaaS-платформы для 100+ ИИ-генераторов контента.

- **Этап 1 — Фундамент**: масштабируемая структура, единая дизайн-система, навигация.
- **Этап 2 — UI Kit**: библиотека переиспользуемых компонентов (см. раздел ниже).
- **Этап 3 — Layout**: Footer и Container достроены поверх готового с Этапа 1
  Sidebar/Header/адаптивности (см. раздел ниже).
- **Этап 4 — Система подписок**: перенесена из отдельного проекта (NOWPayments +
  Redis + Premium Gate), см. раздел ниже — там же честный разбор, что именно
  было перенесено 1:1, а что пришлось достроить заново.
- **Этап 5 — Generator Engine**: универсальный движок для всех будущих
  генераторов — форма, превью, прогресс, лимит генераций, история сессии,
  Premium Gate; поддерживает Local и API Provider через один интерфейс
  (см. раздел ниже).
- **Этап 6 — Generator SDK**: 5 реальных генераторов, подключённых без
  единой новой страницы — просто папки в `src/generators/`, найденные
  автоматически (см. раздел ниже, там же — честный разбор одной
  архитектурной проблемы, найденной и решённой в процессе).
- **Этап 7 — эталон архитектуры**: `pattern` приведён к каноническому
  виду и официально назначен референсом для копирования. Полный гайд для
  разработчиков — [`src/generators/README.md`](src/generators/README.md).
- **Этап 8 — каталог генераторов**: главная страница ("/") стала полным
  каталогом — поиск, категории, избранное, бейджи New/Premium/Popular,
  похожие генераторы, хлебные крошки, SEO (JSON-LD). См. раздел ниже.

Это первый этап, где генераторы РЕАЛЬНО работают — предыдущие этапы
сознательно держали `src/generators/` пустым.

## Стек

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui-совместимые компоненты** (собраны вручную на Radix UI — см. раздел ниже)
- **Framer Motion** — анимации Sidebar, карточек, появления контента
- **Zustand** — состояние Sidebar (persist в localStorage)
- **Lucide Icons**
- **next-themes** — тёмная тема по умолчанию + переключение
- **Geist Sans / Geist Mono** — шрифты (пакет `geist`, локально, без Google Fonts)
- **redis** (node-redis v4) — хранилище статуса подписки
- **NOWPayments** — приём крипто-платежей (см. раздел «Система подписок»)

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:3000. Тёмная тема включена по умолчанию.

## О shadcn/ui в этом проекте

Компоненты в `src/components/ui` написаны вручную по стандартным конвенциям
shadcn/ui (та же структура файлов, `cn()`, `class-variance-authority`,
стандартный `components.json`), но не через `npx shadcn add`, а напрямую на
`radix-ui` (unified-пакет примитивов). Причина: в среде, где собирался этот
проект, не было доступа к `ui.shadcn.com`.

Практическое следствие — `components.json` в корне проекта стандартный,
поэтому на вашей машине с обычным интернетом команда

```bash
npx shadcn@latest add <component>
```

должна продолжать работать и корректно добавлять новые компоненты поверх
уже существующих.

## Как добавить генератор

Начиная с Этапа 6 это делается через SDK — создать папку в
`src/generators/<slug>/index.ts` с конфигом (название, описание, иконка,
поля формы, провайдер, SEO). Ни каталог, ни страницу генератора трогать
не нужно. Подробности, реальные примеры и разбор архитектуры — в разделе
[Generator SDK (Этап 6)](#generator-sdk-этап-6) ниже.

## UI Kit (Этап 2)

Все переиспользуемые компоненты собраны в `src/components` и доступны как
по прямому пути (`@/components/ui/button`), так и через единую точку входа:

```ts
import { Button, Card, Modal, EmptyState, toast } from "@/components";
```

**Живая витрина всех компонентов**: страница `/kit` (`src/app/kit/page.tsx`).
Она не добавлена в навигацию Sidebar — это справочник для разработки, а не
часть продукта. Можно свободно удалить перед продакшеном или оставить как
внутренний style-guide.

### Полный список компонентов

| Компонент | Файл | Основа |
|---|---|---|
| Button | `ui/button.tsx` | CVA |
| Input | `ui/input.tsx` | — |
| Select | `ui/select.tsx` | Radix Select |
| Slider | `ui/slider.tsx` | Radix Slider |
| Switch | `ui/switch.tsx` | Radix Switch |
| Checkbox | `ui/checkbox.tsx` | Radix Checkbox |
| Card | `ui/card.tsx` | — |
| Badge | `ui/badge.tsx` | CVA |
| Tooltip | `ui/tooltip.tsx` | Radix Tooltip |
| Modal | `ui/modal.tsx` | обёртка над Dialog |
| Dialog | `ui/dialog.tsx` | Radix Dialog |
| Tabs | `ui/tabs.tsx` | Radix Tabs |
| Dropdown | `ui/dropdown-menu.tsx` | Radix DropdownMenu |
| Skeleton | `ui/skeleton.tsx` | — |
| Toast | `ui/toast.tsx` | sonner |
| Loader | `ui/loader.tsx` | CVA + lucide |
| Empty State | `shared/empty-state.tsx` | — |
| Error State | `shared/error-state.tsx` | — |

Плюс из Этапа 1: Avatar, Separator, Label, ScrollArea, Sheet (мобильный drawer).

### Два уточнения по неймингу из ТЗ

- **Modal vs Dialog** — это не дублирование. `Dialog` (и его под-компоненты
  `DialogHeader/DialogFooter/DialogTitle`...) — гибкий строительный набор для
  нестандартной композиции. `Modal` — готовая обёртка над ним с простым
  API (`open`, `onOpenChange`, `title`, `description`, `footer`, `children`)
  для случаев, когда полная кастомизация не нужна — а таких в будущих
  генераторах будет большинство.
- **Dropdown vs Select** — `Select` это форм-контрол выбора одного значения
  (используется внутри форм генераторов). `Dropdown` (файл `dropdown-menu.tsx`)
  — это меню действий по клику (Скачать / Удалить / Настройки), а не форма.
  Такое разделение соответствует и Radix, и большинству дизайн-систем.

### Toast — почему sonner, а не «сырой» Radix Toast

Радикс-примитив Toast требует вручную писать провайдер, очередь и viewport.
`sonner` даёт то же самое через один компонент `<Toaster />` (уже подключён
глобально в `src/app/layout.tsx`) и функцию `toast()`, вызываемую из любого
места:

```ts
import { toast } from "@/components";

toast.success("Готово");
toast.error("Не удалось выполнить запрос");
```



## Layout (Этап 3)

Часть требований этого этапа уже была реализована на Этапе 1, так как без
них не собрать сам каркас приложения. Ниже — что было и что добавлено
именно сейчас.

**Уже было (Этап 1), без изменений в поведении:**
- `Sidebar` — иконочная панель, разворачивается по клику, `position: fixed`,
  никогда не сдвигает контент.
- `Header` — закреплён сверху (`sticky`), не зависит от состояния Sidebar.
- Адаптивность и мобильное меню — `useIsMobile` + `Sheet`-drawer с оверлеем,
  закрытием по Esc и клику вне меню.
- Анимации открытия Sidebar — Framer Motion (ширина рельса/панели,
  проявление подписей, индикатор активного пункта).
- Навигация — `src/config/site.ts` (`mainNav`, `bottomNav`).
- Поиск по генераторам без логики — инпут в Header + готовая функция
  `searchGenerators()` в `src/config/generators.ts`, ждёт первых данных.

**Добавлено на Этапе 3:**
- **`Footer`** (`components/layout/footer.tsx`) — минимальный, без
  выдуманных ссылок на несуществующие страницы: копирайт + версия из
  `package.json`. Подключён в `AppShell`; `main` имеет `flex-1`, поэтому
  футер всегда либо прижат к низу вьюпорта, либо идёт сразу после контента
  (sticky footer без JS).
- **`Container`** (`components/layout/container.tsx`) — единая точка
  правды для ширины и горизонтальных отступов (`max-w-[1400px]` по
  умолчанию, `size="narrow"` для форм вроде настроек). `Header`, `Footer`
  и `PageHeader` теперь используют именно его — раньше каждый задавал
  `px-6 lg:px-8` отдельно, что могло разойтись при правках. Теперь все три
  визуально выровнены по одной сетке.

Каждая будущая страница генератора должна оборачивать свой контент в
`<Container>` (импорт из `@/components` или `@/components/layout/container`)
для единообразной ширины.

## Система подписок (Этап 4)

Перенесена из отдельного проекта (архив `1_convertcontext-main.zip`).
Важно понимать, **что именно там было**, поэтому — честно, по пунктам.

### Что в исходном проекте было полностью реализовано → перенесено 1:1

Логика не менялась ни в одной из этих частей — только синтаксис Vercel-функций
`(req, res)` заменён на Next.js App Router Route Handlers `(Request) => Response`,
без этого код физически не исполнился бы в App Router. Значения (цены, сроки,
формула подписи) — те же самые.

| Было (старый проект) | Стало | Изменения в логике |
|---|---|---|
| `api/create-invoice.js` | `src/app/api/create-invoice/route.ts` | нет |
| `api/webhook.js` | `src/app/api/webhook/route.ts` | нет — `sortObject` и HMAC-SHA512 не тронуты |
| `api/check-status.js` | `src/app/api/check-status/route.ts` | нет |
| Redis-клиент (дублировался в 2 файлах) | `src/lib/redis.ts` (один общий модуль) | нет, тот же lazy-singleton |
| `PRICES` в create-invoice.js + расчёт срока в webhook.js | `src/lib/subscription-plans.ts` | нет, те же цифры ($1/день, $3/месяц, 1/30 дней), просто в одном месте вместо двух |
| `NEXT_PUBLIC_SITE_URL` (константа в create-invoice.js) | `siteConfig.url` в `src/config/site.ts` | нет — тот же env var, переиспользована уже существующая в проекте конфигурация вместо копии |

**Проверено вживую** (поднимал тестовый Redis прямо в песочнице): вебхук с
подделанной подписью → `401`; с настоящей HMAC-SHA512 подписью → `200` и
запись в Redis; `check-status` после этого честно отдаёт `paid: true` с
правильным `expiresAt`. Полный цикл подпись → Redis → статус подтверждён,
не только типами/сборкой.

### Чего в исходном проекте НЕ было — достроено заново

Это ключевая находка, о которой нужно знать: `app/pricing/page.tsx` в старом
проекте — это заглушка `ComingSoon`, а не рабочий пэйвол. Бэкенд (таблица
выше) ждёт на вход `{ token, plan }`, но **кода, который создаёт этот token
на клиенте, в проекте не было вообще** — ни отдельного файла, ни в
компонентах. Component'а с именем/логикой "Premium Gate" тоже нигде не
существовало.

Поэтому эти три файла — не перенос, а новая реализация того же контракта,
который уже задавали рабочие `create-invoice`/`check-status`:

- **`src/lib/subscription-token.ts`** — анонимный идентификатор браузера
  (`crypto.randomUUID()` + `localStorage`), без аккаунтов и без
  аутентификации — ровно так, как это устроено в бэкенде (никакого
  Supabase Auth или другой системы не добавлялось, как и просили).
- **`src/hooks/use-subscription.ts`** — связывает токен с
  `/api/check-status` и `/api/create-invoice`.
- **`src/components/subscription/premium-gate.tsx`** — сама обёртка с
  пэйволом (тарифы day/month), рендерит `children`, когда подписка активна.

Каждый из этих трёх файлов помечен комментарием `НОВОЕ (Этап 4)` прямо в
коде — чтобы не путать с перенесённой логикой при код-ревью.

### Переменные окружения

Добавлен `.env.example` в корне проекта:

```
NEXT_PUBLIC_SITE_URL=    # боевой домен — обязателен для ipn_callback_url
NOWPAYMENTS_API_KEY=     # Dashboard → API keys
NOWPAYMENTS_IPN_SECRET=  # Dashboard → Store Settings → IPN
REDIS_URL=               # redis://[:password@]host:port
NEXT_PUBLIC_ANALYTICS_PROVIDERS=  # см. Этап 10, необязательная — есть дефолт
```

`.gitignore` по-прежнему игнорирует `.env*`, но с явным исключением для
`.env.example` (в нём нет секретов, это шаблон).

### Что нельзя проверить в этой песочнице

Сеть песочницы не пускает наружу к `api.nowpayments.io` (белый список
доменов ограничен), поэтому сам вызов создания инвойса протестирован только
на graceful-обработку ошибки (сервер не падает, отдаёт `500` вместо того
чтобы зависнуть) — реальный инвойс и настоящий редирект на оплату можно
проверить только с вашими настоящими `NOWPAYMENTS_API_KEY` и боевым (или
тестовым) Redis. Демо-секция «Premium Gate» на `/kit` по той же причине
без настроенных переменных окружения корректно показывает состояние
загрузки/ошибки — это ожидаемо, не баг.

### Старый проект

Не менялся — только прочитан для переноса, как и было указано. Файлы
исходного архива в этой поставке не участвуют.

## Generator Engine (Этап 5)

Универсальный движок, на котором будут строиться все будущие генераторы.
Сам по себе не содержит логики ни одного конкретного генератора — только
форму, превью, прогресс, лимит генераций, историю сессии и Premium Gate.

### Как подключить новый генератор

Генератор — это конфиг (данные), а не компонент. Вся разметка уже есть в
движке:

```tsx
import { GeneratorEngine } from "@/components/generator-engine/generator-engine";
import { createLocalProvider } from "@/lib/generator-engine/api-provider";
import type { GeneratorEngineConfig } from "@/lib/generator-engine/types";

const config: GeneratorEngineConfig = {
  id: "my-generator",
  title: "Мой генератор",
  fields: [
    { type: "textarea", name: "prompt", label: "Промпт", required: true },
  ],
  provider: createLocalProvider(async ({ input }) => {
    return { kind: "text", content: `Результат: ${input.prompt}` };
  }),
};

export default function MyGeneratorPage() {
  return <GeneratorEngine config={config} />;
}
```

### Local Provider и API Provider — один и тот же интерфейс

```ts
interface GeneratorProvider<TValues> {
  kind: "local" | "api";
  run: (context: { input: TValues; signal: AbortSignal; onProgress }) => Promise<GeneratorOutput>;
}
```

- **`createLocalProvider(fn)`** — `fn` выполняется полностью в браузере
  (canvas, WASM, чистые JS-трансформации — без единого сетевого запроса).
- **`createApiProvider({ endpoint, parseResponse })`** — `endpoint` это
  **собственный** Route Handler проекта (например
  `/api/generators/my-tool`), а не прямой URL вендора. Ключи OpenAI /
  Anthropic Claude / Google Gemini / FLUX / ElevenLabs и любого другого
  сервиса остаются на сервере, внутри этого эндпоинта — какой конкретно
  вендор там вызывается, решает сам генератор при подключении.
  **GeneratorEngine об этом не знает и не должен знать** — он вызывает
  `provider.run()` одинаково в обоих случаях, интерфейс/прогресс/превью
  не отличаются.

Проверено вживую: на `/kit` есть два реальных примера с одной и той же
разметкой — Local Provider (регистр текста, без сети) и API Provider
(запрос на тестовый `/api/kit-demo/generate`, с задержкой и настоящим
HTTP-циклом). Оба протестированы через curl, не только сборкой.

### Блокировка Premium и подсчёт генераций — связь с Этапом 4

Два независимых механизма:

1. **`isPremium: true` в конфиге генератора** — целиком закрыт `PremiumGate`
   (тем же компонентом из Этапа 4), пока нет активной подписки.
2. **Дневной бесплатный лимит** (по умолчанию 3 генерации, переопределяется
   через `freeDailyLimit` в конфиге) — считается **отдельно по каждому
   генератору** (`localStorage`, ключ по `id` генератора + сегодняшней
   дате). Активная подписка (`isPaid` из `useSubscription`, Этап 4)
   снимает лимит сразу везде, для всех генераторов — ровно как и было
   задумано в перенесённой схеме оплаты ("$1 — снять лимит на сегодня").

   Если лимит исчерпан, движок не прячет всю страницу (в отличие от
   `isPremium`) — форма и история остаются видны, блокируется только
   кнопка генерации, с инлайн-предложением оплаты.

   Если нужен один общий лимит на все генераторы вместо отдельного по
   каждому — `useGenerationLimit` уже поддерживает произвольный scope,
   достаточно передавать `"global"` вместо `config.id` при вызове.

### Что ещё умеет движок

- **Прогресс** — `onProgress({ percent, message })`: если `percent` есть,
  показывается `Progress`-бар, если нет — индикатор без деления на
  проценты. Кнопка "Отменить" вызывает `AbortController.abort()`.
- **Превью** — рендерится по `output.kind` (`text/image/audio/video/file`)
  одинаково независимо от провайдера.
- **Скачивание** — `downloadGeneratorOutput()`, единая функция для всех
  `kind` (текст оборачивается в `Blob` на лету, остальное скачивается по
  готовому `url`).
- **История сессии** — `sessionStorage` (очищается с закрытием вкладки, в
  отличие от лимита в `localStorage`), последние 20 генераций.

### Новые файлы

```
src/lib/generator-engine/
  types.ts            — GeneratorFieldSchema, GeneratorOutput, GeneratorProvider, GeneratorEngineConfig
  api-provider.ts       — createLocalProvider, createApiProvider
  generation-limit.ts    — дневной лимит (useSyncExternalStore + localStorage)
  session-history.ts      — история сессии (useSyncExternalStore + sessionStorage)
  download.ts               — downloadGeneratorOutput()
  form-values.ts             — значения по умолчанию + валидация required

src/hooks/use-generator-engine.ts   — оркестрирующий хук

src/components/generator-engine/
  generator-engine.tsx    — сборка формы+превью+прогресса+истории+Premium Gate
  generator-form.tsx        — рендер формы по схеме
  generator-form-field.tsx    — рендер одного поля (text/textarea/select/slider/switch/file)
  generator-preview.tsx         — превью результата
  generator-progress.tsx         — индикатор прогресса + отмена
  generator-history.tsx           — список истории сессии
  generator-limit-banner.tsx       — инлайн-предложение оплаты при исчерпанном лимите

src/app/api/kit-demo/generate/route.ts  — тестовый эндпоинт ТОЛЬКО для демо API Provider на /kit (без AI-логики)
```

Также добавлены `Textarea` и `Progress` в UI Kit (`src/components/ui`) —
понадобились форме и индикатору прогресса, в Этапе 2 их не было.

## Generator SDK (Этап 6) и эталон архитектуры (Этап 7)

**Подробный гайд для разработчиков — [`src/generators/README.md`](src/generators/README.md):**
жизненный цикл генератора, что создавать, что никогда не трогать,
справочники по полям формы и типам результата, чек-лист. Здесь —
только краткая ориентировка и история архитектурных решений.

Новый генератор подключается без создания страницы — достаточно папки в
`src/generators/`:

```
src/generators/
  pattern/index.ts   — бесшовный SVG-паттерн — ЭТАЛОН, копируйте именно его (Этап 7)
  svg/index.ts       — SVG-аватар с инициалами (Local Provider)
  qr/index.ts        — QR-код (API Provider → /api/generators/qr)
  mockup/index.ts    — рамка браузера/телефона вокруг скриншота (Local, Canvas)
  audio/index.ts     — тестовый тональный сигнал (Local, Web Audio API + WAV)
```

Каждый `index.ts` экспортирует ровно то, что просили в ТЗ — ни строчкой
больше:

```ts
export const generator: GeneratorModule = {
  slug: "pattern",                // должен совпадать с именем папки
  title: "Бесшовный паттерн",
  description: "...",
  icon: Grid3x3,                  // любая иконка lucide-react
  categoryId: "design",
  fields: [ /* настройки формы */ ],
  provider: createLocalProvider(/* обработчик генерации */),
  seo: { title: "...", description: "...", keywords: [...] },
};
```

`src/app/generators/[slug]/page.tsx` (один файл на ВСЕ генераторы) читает
эту папку через `src/generators/registry.ts` и сам собирает: `PageHeader`,
`generateMetadata` (SEO из поля `seo`), `generateStaticParams` (статическая
пре-генерация каждой страницы) и сам `GeneratorEngine`. Добавить новый
генератор — создать папку, странице ничего не нужно менять.

### Как работает автообнаружение

`registry.ts` читает `src/generators/` через `node:fs` (`fs.readdirSync`) и
динамически импортирует `index.ts` каждой найденной папки:

```ts
const mod = await import(`../generators/${slug}/index`);
```

Это не заглушка — реально протестировал отдельным spike-эндпоинтом с
двумя тестовыми папками до того, как строить на этом всю страницу:
Next.js (Turbopack) резолвит такой шаблонный путь как **context-импорт**
— на этапе сборки подхватывает все существующие `src/generators/*/index.*`,
а нужный выбирается в рантайме по `slug`.

### Важная находка: функции не пересекают границу Server → Client

При сборке всех пяти генераторов (не на моковых двух папках из spike-теста)
всплыла настоящая архитектурная проблема: `provider.run` — это функция, а
React Server Components физически не умеет передавать функции из Server
Component в Client Component (только сериализуемые данные). Страница
генератора — Server Component (иначе не работали бы `fs`-автообнаружение
и `generateStaticParams`), а `GeneratorEngine` — Client Component (нужны
хуки, стейт). Прямая передача `provider` между ними ломала сборку.

Решение — `GeneratorEngineLoader` (`components/generator-engine/generator-loader.tsx`):
серверная страница передаёт клиенту только сериализуемую часть
(`title`/`description`/`fields`/лимиты — обычные данные), а сам `provider`
клиентский компонент подгружает **тем же** динамическим `import()` по
`slug`, но уже на клиенте. Проверил: код `audio`-генератора (Web Audio
API, кодирование WAV) реально присутствует в клиентском JS-чанке
(`.next/static/chunks/`), а не только на сервере — то есть подгрузка
рабочая, а не теоретическая.

Побочный эффект той же природы: `GeneratorCard` тоже был Client Component
(из-за анимации framer-motion) и получал иконку генератора (тоже функцию)
от серверной страницы каталога. Решение проще — заменил анимацию на чистый
CSS (`hover:-translate-y-0.5`), и карточка вообще перестала быть Client
Component, проблема исчезла сама собой.

### Проверено вживую (Этап 6)

- Полная сборка всех 5 генераторов проходит (`generators/[slug]` помечен
  `●` — SSG, все 5 путей пере-рендерены статически).
- Все 5 страниц отдают 200, несуществующий slug — 404.
- `generateMetadata` реально формирует разные `<title>`/`<meta description>`
  для каждого генератора (проверил в HTML, не только в коде).
- `/api/generators/qr` — настоящая генерация через `qrcode`, отдаёт валидный
  `data:image/png;base64,...` (проверил длину и префикс), пустой текст → 400.
- Каталог и главная показывают все 5 генераторов и правильный счётчик (5).

### Проверено вживую (Этап 7) — реальный код, не только сборка

На Этапе 6 для 4 из 5 генераторов (всё, кроме `qr`) была проверена только
сборка/бандлинг — не сама логика внутри браузера, т.к. headless-браузера
в этой среде нет. На Этапе 7 это исправлено — каждый генератор прогнан
через реальный код (импорт напрямую через `tsx`, не переписанные копии):

- **svg** — вызван реальный `provider.run`; проверены валидность
  получившегося SVG, все 3 формы, и что контраст текста считается верно.
- **pattern** — то же для всех 4 типов узора и граничных значений слайдера.
- **audio** — собран функциональный мок Web Audio API (реально считает
  сэмплы, не заглушка); получившийся WAV разобран по байтам (RIFF/fmt/data
  корректны), количество переходов через ноль соответствует заданной
  частоте 440 Гц, fade-in подтверждён (тихий первый сэмпл).
- **mockup** — поднят `node-canvas`; реальный `provider.run` отработал
  целиком (загрузка файла → рисование рамки → композиция), результат
  сохранён в PNG и просмотрен визуально — рамки браузера и телефона
  рисуются корректно.

Все тестовые зависимости (`node-canvas` и др.) и файлы использовались
только во временной директории и удалены — в поставке их нет.

Дополнительно: скопировал `pattern` в тестовую папку `template-check`
строго по шагам из `src/generators/README.md`, чтобы подтвердить, что
процесс «Создать генератор за 5–10 минут» действительно не требует
правок в Engine/SDK/Layout — см. подробности ниже.


## Каталог генераторов (Этап 8)

**Главная страница проекта ("/") — теперь это и есть каталог.** `/generators`
оставлен как `redirect("/")` (307) — старые ссылки не 404-ят, но контент
не дублируется для поисковиков (один канонический URL).

### Поиск и категории — в URL, не в client state

`?q=текст` и `?category=slug` — страница остаётся серверным компонентом,
фильтрует `src/lib/catalog.ts` и рендерит `GeneratorCard` напрямую. Это
осознанный выбор: если бы фильтрация была client-side, пришлось бы тащить
иконки генераторов через границу Server → Client, а это именно та
проблема, что уже ловили на Этапе 6. Инпут поиска (`CatalogSearchInput`,
монтируется в Header) — единственный клиентский код: с debounce обновляет
URL через `router.replace`/`push`, сама сетка результатов не в нём.

### Избранное — localStorage + маленькие клиентские "островки"

`src/lib/favorites.ts` (тот же паттерн `useSyncExternalStore`, что и
дневной лимит генераций, Этап 5) + `FavoriteButton` — крошечный клиентский
компонент внутри `GeneratorCard`, получает только `slug` (строку), поэтому
сама карточка остаётся серверной. Страница `/favorites` — гибрид: сервер
отдаёт список генераторов **без иконки** (её нельзя передать с сервера),
клиентский `FavoritesList` фильтрует по localStorage и довосстанавливает
иконку по `slug` через `src/lib/icon-map.ts`.

Логика проверена не только типами — прогнал `toggleFavorite`/`isFavorite`
через мок `localStorage` в Node: добавление, снятие, несколько элементов
независимо друг от друга — всё верно.

### Бейджи: New, Premium, Popular

- **New** (`isNew`) и **Popular** (`isPopular`) — поля в `GeneratorModule`,
  проставляются вручную в конкретном генераторе. Popular — **честно
  редакционная пометка, не аналитика**: у проекта нет серверной
  статистики использования между пользователями (счётчик лимита из
  Этапа 5 — локальный, per-браузер, для этого не годится).
- **Premium** (`isPremium`) — уже существовавшее поле (Этап 5/6), теперь
  ещё и рендерится бейджем в каталоге. `mockup` — единственный из пяти
  генераторов, помеченный премиумом, специально: бейдж совпадает с
  реальным поведением (гейтится через `PremiumGate`), а не только рисуется.

### Похожие генераторы и хлебные крошки

`getSimilarGenerators()` (`src/lib/catalog.ts`) — по той же категории,
сам генератор исключается; если в категории пусто, дополняется другими
доступными, чтобы блок редко пустовал. `Breadcrumbs` — на странице
генератора (Главная → Категория → Генератор) и в каталоге при активном
фильтре категории.

### "Coming Soon"

`src/config/upcoming-generators.ts` — 16 тизеров будущих генераторов
(по 2 на категорию), **не часть SDK**: ни папки, ни provider, ни
собственной страницы — просто неактивная карточка в каталоге ("большинство
генераторов пока могут быть Coming Soon" по ТЗ). Как только генератор
реализуют по-настоящему — запись отсюда удаляется, вместо неё появляется
папка в `src/generators/`.

### SEO

- `generateMetadata` каталога меняется под активную категорию.
- JSON-LD `ItemList` на каталоге, `BreadcrumbList` на странице генератора.
- Оба проверены в реальном отрендеренном HTML, не только в коде.

### Проверено вживую

Поиск (`?q=qr` находит только QR, ноль совпадений с остальными),
категория (`?category=audio` — только аудио-генераторы, ноль посторонних),
бейджи (New/Popular/Premium отрисованы), редирect `/generators` (307,
`Location: /`), хлебные крошки и «Похожие генераторы» на `/generators/pattern`,
пустое состояние избранного без localStorage. Регрессий на `/kit` и
`/settings` нет.

## SEO Engine (Этап 9)

**Цель этапа — убрать ручной SEO-код со страниц.** До Этапа 9 `generateMetadata`
и JSON-LD (`<script type="application/ld+json">`) писались вручную и по
отдельности на каждой странице; canonical, Open Graph и Twitter Cards не
существовали вовсе. Теперь это `src/lib/seo/` (два файла) + файловые
конвенции Next.js — сама страница почти ничего не знает про SEO-механику.

### `src/lib/seo/metadata.ts` — единая сборка `Metadata`

`buildMetadata({ title, description, path, keywords?, noIndex?, titleAbsolute? })`
строит title/description/keywords, `alternates.canonical`, `openGraph` и
`twitter` (оба — из тех же title/description, дублировать не нужно) и
`robots`. Картинку Open Graph здесь указывать не нужно — её подхватывает
файловая конвенция `opengraph-image.tsx` (см. ниже) автоматически.
`titleAbsolute` — единственный частный случай (главная страница без
фильтров), чтобы не задваивался шаблон `%s · GenGenerate` из `layout.tsx`.

### `src/lib/seo/json-ld.ts` — Schema.org

Четыре чистые функции, без React:

- `buildBreadcrumbJsonLd(items, currentPath)` — `BreadcrumbList`, из тех же
  `items`, что рендерит визуальный `<Breadcrumbs>` (Этап 8).
- `buildItemListJsonLd(generators)` — `ItemList` для каталога, только
  `status: "available"`.
- `buildSoftwareApplicationJsonLd(generatorModule)` — `SoftwareApplication`,
  один на страницу генератора. `isAccessibleForFree` берётся из
  `isPremium` (Этап 4/6), а не из отдельного SEO-поля — так разметка не
  может разойтись с реальным поведением Premium Gate.
- `buildWebSiteJsonLd()` — `WebSite` + `SearchAction`, рендерится только на
  канонической главной (без `?category=`) — Google не рекомендует
  дублировать один и тот же `WebSite` на каждой странице сайта.

`<JsonLd data={...} />` (`src/components/shared/json-ld.tsx`) — рендерит
один объект или массив объектов как `<script>`-теги; страницы передают
туда только готовую разметку.

### Canonical, Open Graph, Twitter Cards — откуда берутся данные

Единственный источник title/description для страницы генератора —
`generatorModule.seo` (Этап 6): страница вызывает `buildMetadata` и
`buildSoftwareApplicationJsonLd` с одним и тем же модулем, второй раз
текст нигде не задаётся. Это и есть требование ТЗ «каждый генератор
задаёт SEO исключительно через свою конфигурацию».

### `sitemap.xml` и `robots.txt` — файловые конвенции Next.js

`src/app/sitemap.ts` и `src/app/robots.ts` — не самописный код, а
стандартный `MetadataRoute.Sitemap`/`MetadataRoute.Robots` Next.js,
отдаются по адресам `/sitemap.xml` и `/robots.txt` сами. Sitemap собирает
главную, `/favorites` и по одному `<url>` на каждый генератор из
SDK-реестра (Этап 6) — при добавлении генератора список обновляется сам,
без правок. Coming Soon-тизеры не попадают (у них нет страницы), как и
`/generators` (редирект), `/settings`, `/kit` — их закрывает `robots.ts`
(`disallow`) и `noIndex: true` в их собственных метаданных (двойная
подстраховка, а не дублирование одной и той же логики).

### Open Graph / Twitter-картинки — тоже файловая конвенция

`src/app/opengraph-image.tsx` — дефолтная OG-картинка сайта (через
`ImageResponse` из `next/og`), подхватывается для любой страницы без
своего файла. `src/app/generators/[slug]/opengraph-image.tsx`
переопределяет её для сегмента генератора: читает `generatorModule` через
`getGeneratorModule(slug)` и рисует title/description генератора — то
есть картинка тоже целиком из конфигурации генератора, отдельного поля
под неё заводить не пришлось. Twitter-картинка отдельным файлом не
заводилась — Next.js переиспользует `opengraph-image` для
`twitter:image`, если своего `twitter-image.tsx` нет.

`metadataBase` (в `layout.tsx`, `new URL(siteConfig.url)`) обязателен для
этого — без него относительный URL картинки не резолвится в абсолютный
для соцсетей.

### Хлебные крошки

Визуал не менялся (`<Breadcrumbs>`, Этап 8) — добавился только JSON-LD:
`BreadcrumbList` теперь есть не только на странице генератора, но и на
каталоге при активном `?category=` (раньше там был только визуальный
компонент без разметки).

### Проверено вживую

Собранный прод (`next build && next start`) — заголовок, `canonical`,
`og:*`/`twitter:*` (включая `og:image`/`twitter:image` с реальным
content-type `image/png`) и оба JSON-LD блока на `/generators/qr`; `/`
отдаёт `ItemList` + `WebSite`, `/?category=audio` — `ItemList` +
`BreadcrumbList`; `/sitemap.xml` — валидный XML с 5 генераторами;
`/robots.txt` — `disallow` на `/api/`, `/settings`, `/kit` и ссылка на
sitemap; `/favorites`, `/settings`, `/kit` отдают `noindex, follow`.
Регрессий по `tsc --noEmit`, `eslint` и `next build` нет.

## Analytics Engine (Этап 10)

Универсальная система аналитики — тот же принцип провайдеров, что у
Generator Engine (Этап 5/6.5): движок (`src/lib/analytics/`) работает с
типизированными событиями и не знает, куда именно они улетают. Куда именно
— решает `src/config/analytics.ts`, единственное место, которое знает про
конкретные сервисы.

### Что отслеживается

- **Просмотры страниц** — `page_view`, на каждой смене `pathname`/`searchParams`.
- **Генерации** — `generation_started` / `generation_success` (с длительностью)
  / `generation_error`, из `useGeneratorEngine` (Этап 5).
- **Скачивания** — `download`, из `GeneratorPreview` при клике на "Скачать".
- **Конверсии Premium** — `premium_conversion`, из `/api/webhook` в момент
  подтверждения оплаты NOWPayments (не при клике на тариф — конверсия
  считается только когда деньги реально пришли, см. Этап 4).
- **Поиск** — `search`, из `CatalogSearchInput` после дебаунса.
- **Ошибки** — `client_error`, глобальные `window.onerror` и
  `unhandledrejection`, из `AnalyticsProvider`.
- **Производительность** — `web_vital`, через встроенный `useReportWebVitals`
  Next.js (LCP, CLS, INP и т.д.), без дополнительных зависимостей.

### Архитектура — не привязана к сервису

```
components/providers/analytics-provider.tsx   — монтируется в layout,
                                                 инициализирует движок,
                                                 ловит page_view/error/vitals
lib/analytics/events.ts                        — trackPageView, trackSearch,
                                                 trackDownload и т.д. — то,
                                                 что вызывают компоненты
lib/analytics/index.ts                         — ядро: рассылает событие
                                                 всем зарегистрированным
                                                 провайдерам
lib/analytics/providers/*.ts                   — console, beacon — конкретные
                                                 реализации track()
config/analytics.ts                            — какие провайдеры включены
                                                 (NEXT_PUBLIC_ANALYTICS_PROVIDERS)
app/api/analytics/route.ts + lib/analytics/server.ts
                                                — приём событий с клиента и
                                                  серверные события (webhook);
                                                  сейчас — суточные счётчики
                                                  в том же Redis, что и
                                                  подписки (Этап 4)
```

Чтобы подключить реальный сервис (GA4, PostHog, Plausible, Vercel Analytics
и т.д.), нужно добавить новый `createXxxProvider()` и/или переслать событие
из `trackServerEvent` — движок, хуки и компоненты-потребители трогать не
нужно.

`DistributiveOmit` в `lib/analytics/types.ts` — обычный `Omit` на
дискриминированном объединении схлопывает специфичные поля каждого события
до общих (`keyof` объединения — это пересечение ключей), поэтому для
`AnalyticsEventInput` использован распределяющий вариант.

### Проверено вживую

`tsc` (через `next build`) и `eslint` — без ошибок; `next build` собирает
`/api/analytics` вместе с остальными роутами.

## Оптимизация (Этап 11)

Проект подготовлен к росту от 5 генераторов до сотен (Этап 12) — без
изменения Generator Engine/SDK, только через конфигурацию сборки и
точечные, документированные решения там, где это оправдано.

### Dynamic Import / Code Splitting

- **Каждый генератор уже был отдельным чанком с Этапа 6** — и
  серверный реестр (`registry.ts`), и клиентский `GeneratorEngineLoader`
  подгружают `src/generators/<slug>/index.ts` через `import()` по slug,
  а не статически. Этап 11 это не создаёт заново, а достраивает поверх.
- **framer-motion** — `src/components/providers/motion-provider.tsx`:
  `LazyMotion` с фичами (`domMax`, из-за `layoutId` в
  `SidebarNavItem`), загружаемыми асинхронным `import()`, вместо
  прямого статического импорта. Все использования `motion.xxx` в
  `Sidebar`/`Logo`/`SidebarNavItem`/`UserMenu`/`FadeIn` переведены на
  облегчённый `m.xxx` — без этого `LazyMotion` не даёт эффекта (`strict`
  бросает ошибку в деве, если где-то остался `motion`).
- **Web Worker для тяжёлого Local Provider** (см. ниже) — тоже форма
  Code Splitting: `OffscreenCanvas`-логика `mockup` физически не входит
  в чанк страницы генератора, а грузится отдельным ассетом только когда
  запущена генерация.

### Виртуализация длинных списков

Каталог (`src/app/page.tsx`) и «Избранное» (`favorites-list.tsx`) —
сознательно Server/клиентские компоненты БЕЗ размонтирования карточек
вне вьюпорта: настоящая JS-виртуализация (react-window и т.п.) спрятала
бы карточки от поисковых краулеров и свела на нет работу SEO Engine
(Этап 9) на каталоге, который должен вырасти до сотен генераторов.
Вместо этого — `.cv-auto` в `globals.css`
(`content-visibility: auto` + `contain-intrinsic-size`): все карточки
остаются в DOM и доступны краулеру/Ctrl+F, но браузер не тратит
layout/paint на то, что не видно, и досчитывает при подскролле.

### Web Workers для тяжёлых локальных генераторов

Общая инфраструктура — не разовый хак под один генератор:

```
lib/generator-engine/worker-protocol.ts   — формат сообщений воркер ↔ главный поток
lib/generator-engine/api-provider.ts      — createWorkerLocalProvider(), третья
                                             фабрика провайдера рядом с
                                             createLocalProvider/createApiProvider
generators/mockup/draw.ts                 — чистая отрисовка без DOM, общая для
                                             воркера и fallback
generators/mockup/mockup-worker.ts        — сам воркер: createImageBitmap +
                                             OffscreenCanvas вместо Image/<canvas>
generators/mockup/index.ts                — createWorkerLocalProvider(...) с
                                             fallback = тем же алгоритмом на
                                             основном потоке
```

`fallback` — обязательное поле конфига, а не опциональное: провайдер
сам проверяет доступность `Worker` (и ловит исключение из его
конструктора) и переключается на основной поток, если воркер
недоступен. Как добавить воркер новому генератору — раздел
«Local Provider в Web Worker» в `src/generators/README.md`. Используется
точечно: остальные четыре генератора (`pattern`, `svg`, `qr`, `audio`)
достаточно лёгкие, чтобы воркер только добавил накладные расходы на его
создание.

### Кеширование

- `next.config.ts`: `images.minimumCacheTTL` — год для оптимизированных
  Next/Image; `_next/static/*` кеш НЕ настраивается вручную — Next.js
  уже отдаёт хэшированные ассеты с `immutable` из коробки (явный
  `headers()` на этот путь даёт предупреждение сборщика и намеренно не
  используется).
- Явный `Cache-Control: no-store` на `/api/analytics` и
  `/api/check-status` — оба отдают состояние, которое меняется в любой
  момент (событие аналитики, статус оплаты); кеширование ответа хоть на
  секунду означает устаревший Premium Gate или потерянное событие.
- Статическая генерация страниц генераторов (`generateStaticParams`,
  Этап 6/7) и process-level кеш `registry.ts` (`cachedModules`) — уже
  были с более ранних этапов, Этап 11 их не менял, они и есть основная
  часть кеширующей стратегии для контента.

### Оптимизация размера бандла

- `next.config.ts`: `experimental.optimizePackageImports` для
  `lucide-react` и `radix-ui` — оба экспортируют сотни именованных
  сущностей из одной точки входа.
- `@next/bundle-analyzer` подключён и обёрнут вокруг конфига
  (`npm run analyze`, флаг `ANALYZE=true`) — чтобы при добавлении новых
  генераторов (Этап 12) можно было увидеть, какой конкретно чанк
  раздулся, а не гадать на глаз.
- framer-motion переведён на `LazyMotion`/`m` (см. Code Splitting выше) —
  это одновременно и code splitting, и прямое уменьшение веса основного
  чанка layout'а.

### Оптимизация изображений

`next.config.ts`: `images.formats` — `avif`/`webp` вместо исходного
формата там, где браузер их поддерживает. Заранее, под будущие
генераторы с превью и внешними изображениями (Этап 12) — сейчас в
`public/` нет статических картинок, а единственный `<img>` в проекте
(`generator-preview.tsx`, результат генерации — blob/data URL) намеренно
не через `next/image`: это динамический, не заранее известный источник,
`next/image` для него не подходит по конструкции (комментарий на месте
не менялся с более ранних этапов).

### Проверено вживую

- `next build` — компиляция, `tsc` и генерация статических страниц без
  ошибок и предупреждений (включая `/generators/mockup` — воркер не
  ломает SSG, потому что вызывается только в браузере при генерации).
- `eslint` — без ошибок.
- Собранный бандл проверен вручную: `mockup-worker.ts` компилируется в
  отдельный ассет (`OffscreenCanvas`/`createImageBitmap`/`convertToBlob`
  найдены только в нём), а не в общий чанк страницы генератора.

## Массовое добавление генераторов (Этап 12)

ТЗ Этапа 12 — 18 генераторов. Из них **4 уже существовали** с более
ранних этапов (использованы как есть, без изменений), **9 реализованы
в этом этапе**, **4 (API: изображения/видео/голос/аудио) намеренно
отложены** — см. ниже почему.

### Уже было (эталонные примеры с Этапа 5–10)

| Пункт ТЗ | Фактический генератор |
|---|---|
| 1. SVG Background Generator | `pattern` — уже ровно это (тайловый SVG-фон) |
| 2. Pattern Generator | `pattern` — тот же генератор, дубль в списке ТЗ |
| 3. QR Generator | `qr` |
| 7. Mockup Generator | `mockup` (Web Worker, Этап 11) |

Отдельно: **4. Avatar Generator** по содержанию — это уже существующий
`svg` (SVG-аватар с инициалами), только с несовпадающим slug/названием
(`svg`, а не `avatar`). Не переименовал: slug — часть URL и уже
проиндексирован (Этап 9, `sitemap.xml`/canonical), переименование
сломало бы существующие ссылки без пользы. Если такое расхождение
имени со временем будет мешать — это отдельное решение, не должно
приниматься мимоходом внутри этапа про количество генераторов.

### Реализовано в Этапе 12 (9 новых, все Local Provider)

| Генератор | slug | Категория | Результат |
|---|---|---|---|
| 5. Генератор градиентов | `gradient` | design | CSS-код (text) |
| 6. Генератор палитр | `palette` | design | SVG со свотчами и hex (image) |
| 8. Генератор логотипа | `logo` | design | SVG-вордмарк (image) |
| 9. Генератор favicon | `favicon` | design | PNG нужного размера (image) |
| 10. JSON-форматтер | `json-formatter` | code | pretty/minify/validate (text) |
| 11. Генератор CSV | `csv-generator` | code | .csv-файл (file) |
| 12. Генератор UUID | `uuid-generator` | code | список UUID v4 (text) |
| 13. Генератор паролей | `password-generator` | other | `crypto.getRandomValues` (text) |
| 14. Генератор Lorem Ipsum | `lorem-ipsum` | text | слова/предложения/абзацы (text) |

Все девять — по референсной архитектуре `pattern` (Этап 7): 7 полей
из SDK, `createLocalProvider`, никакой ручной регистрации. Соответствующие
тизеры-заглушки (палитры, градиенты, пароли) удалены из
`src/config/upcoming-generators.ts` — по правилу из его же комментария
("как только генератор реализуют по-настоящему, запись отсюда удаляется").

Заметки по паре решений:
- **CSV Generator** — единственный из девяти с `kind: "file"`, а не
  `"text"`: CSV должен скачиваться с расширением `.csv` и открываться в
  Excel/Sheets, а не читаться в `<pre>` (у `kind: "text"` скачивание
  всегда даёт `.txt`, см. `lib/generator-engine/download.ts`). Ряды —
  небольшие встроенные списки имён/доменов, без новой зависимости
  (`faker` и т.п.) ради 4 пресетов колонок.
- **Password Generator** — `crypto.getRandomValues`, не `Math.random()`:
  для пароля криптографическая случайность не опциональна.
- **Favicon Generator** — отдаёт PNG нужного размера (16/32/180/512), не
  собирает многослойный `.ico`. Явно написано в `description` генератора,
  чтобы это не читалось как забытая часть, а не решение.

### Отложено: 15–18, все четыре — API-генераторы

Audio (API), Image (API), Video (API), Voice (API) не реализованы в
этом проходе. Причины, по которым это осознанная пауза, а не пропуск:

- **У slug `audio` уже есть смысл** — это Local-генератор синтеза тона
  (Web Audio, Этап 6), а пункт 15 ТЗ — это отдельно взятый Audio Generator
  **на API**. Нужен слаг, который не конфликтует (например `audio` для
  текущего локального и что-то вроде `music`/`ai-audio` для нового —
  решать вместе, а не молча выбирать за автора проекта).
- **Каждый требует реального внешнего сервиса и ключа** — по прецеденту
  NOWPayments (Этап 4)/Redis (Этап 4) выбор конкретного вендора (OpenAI
  Images vs Stability vs Replicate для Image; ElevenLabs vs OpenAI TTS
  для Voice; провайдеров видео-генерации существенно меньше и они
  дороже/медленнее — это влияет на UX ожидания результата) — решение с
  ценой и владением API-ключом, а не архитектурная деталь, которую можно
  выбрать за Sun.
- Технически контракт готов: `createApiProvider` + собственный Route
  Handler — тот же паттерн, что уже подтверждён на `qr`
  (`src/app/api/generators/qr/route.ts`), новых возможностей от
  Generator Engine эти четыре не потребуют.

### Проверено вживую

- `next build` — компиляция, `tsc`, генерация всех 14 маршрутов
  генераторов (5 существовавших + 9 новых) без ошибок.
- `eslint` — без ошибок.
- Логика каждого нового провайдера прогнана напрямую (`tsx`, минуя
  браузерную форму) на всех select-пресетах и граничных значениях —
  `gradient` (linear/radial), `palette` (все 5 гармоний), `logo`
  (с меткой и без), `json-formatter` (pretty/minify/validate и
  невалидный JSON — корректно выбрасывает ошибку), `csv-generator` (все
  4 пресета колонок), `uuid-generator` (все 4 формата), `password-generator`,
  `lorem-ipsum` (все 3 единицы). Реального клика по кнопке в браузере
  это не заменяет — оно проверяет провайдер, а не форму/движок вокруг
  него, стоит перепроверить в браузере до релиза.

## Система тарифов и монетизации (Этап 13)

До этого этапа подписка была бинарной: `isPaid` — да/нет, куплено это на
день ($1) или на месяц ($3) (Этап 4). Этап 13 заменяет это тремя
тарифами из ТЗ (Free / Premium Monthly / Premium Yearly) с раздельными
суточными лимитами для локальных и AI-генераций, набором Premium-
функций и «Premium Gate 2.0».

### Единственный источник правды — `src/config/tariffs.ts`

Всё, что раньше было бы «настройками админки» (цены, длительности,
лимиты, набор функций каждого тарифа), — в одном файле,
`src/config/tariffs.ts` (`TARIFFS`). Ни один компонент/хук не хранит
цифры сам — все читают их отсюда:

- `src/lib/subscription-plans.ts` теперь просто реэкспортирует значения
  из `tariffs.ts` под именами, которые уже использовались с Этапа 4
  (`PLAN_PRICES`, `PLAN_LABELS`...), чтобы не трогать все места импорта.
- `useTariff()` (`src/hooks/use-tariff.ts`) превращает
  `useSubscription()` (сырое «оплачено/план/срок», Этап 4, без
  изменений в логике create-invoice/webhook/check-status) в тариф с
  конкретным набором функций (`TariffFeatures`).
- `useGenerationQuota()` (`src/hooks/use-generation-quota.ts`) решает,
  какой лимит и какой scope применить к конкретному генератору —
  единственное место, которое связывает "локальный/API Provider" с
  "локальный/AI лимит тарифа".

Поменять цену Premium Yearly или суточный лимит AI-генераций на Free —
правка одного объекта в `tariffs.ts`, без изменений в Generator Engine,
компонентах или API-роутах. Полноценная админ-панель с UI/БД — не
реализована (её и не было в ТЗ этого этапа буквально), но контракт
«один центральный конфиг» уже даёт основу для переноса значений в
БД/CMS без переписывания остального проекта.

### Универсальная система лимитов

`src/lib/generator-engine/generation-limit.ts` — механический счётчик
"сколько раз сегодня" по `scope` (не знает про тарифы). По умолчанию
каждый генератор считается в общий суточный пул своего типа:
`pool:local` (лимит из `TariffFeatures.dailyLocalLimit`, 50 на Free) или
`pool:ai` (`dailyAiLimit`, 5 на Free) — так и получаются лимиты из ТЗ,
общие сразу на все локальные/все AI-генераторы. Деление на "локальный"
vs "AI" — это уже существовавший с Этапа 5 `provider.kind: "local" |
"api"`, здесь он впервые используется не только для бейджа в UI, но и
для выбора лимита.

Если конкретному генератору в его модуле явно задан `freeDailyLimit` —
он получает собственный изолированный счётчик (`gen:<slug>`) вместо
общего пула, и именно это число действует для него на Free вместо
дефолтного лимита тарифа. На любом Premium индивидуальный лимит, как и
общий пул, отключается — Premium означает безлимит, если сам генератор
целиком не помечен `isPremium` (тогда работает `PremiumGate`, а не
счётчик).

### Premium Gate 2.0

`src/components/subscription/premium-gate.tsx` — раньше просто пэйвол
с двумя кнопками (day/month) без какого-либо контекста. Теперь:
показывает активный тариф и дату окончания подписки, если она уже
куплена; список функций Premium (или Premium-возможностей конкретного
генератора — новое поле `GeneratorModule.premiumFeatures`, см.
`mockup`); кнопки Premium Monthly/Premium Yearly со скидкой годового
тарифа, взятые из `tariffs.ts`, а не захардкоженные в компоненте.

Чтобы Premium Gate 2.0 умел отличать Premium Monthly от Premium Yearly
(а не просто "оплачено/нет", как раньше), значение в Redis по ключу
`paid:<token>` стало `{ expiresAt, plan }` вместо голого числа
(`src/app/api/webhook/route.ts`, `src/app/api/check-status/route.ts`).
`check-status` при этом понимает и старый формат (голое число) — уже
оплаченные до этого изменения токены не "слетают" при переходе, просто
интерпретируются как `month`. Сама проверка HMAC-подписи NOWPayments
(Этап 4) не менялась ни на строчку.

### Уведомления о лимитах

`src/components/subscription/limit-notice.tsx` — три состояния из ТЗ
дословно ("Осталось 10…", "Осталось 5…", "лимит исчерпан…"), только
число не захардкожено, а берётся из фактического остатка; появляется,
когда остаток ≤ 10 (что даёт ровно те же 10/5, что и в примерах ТЗ, но
не завязано жёстко именно на эти два числа — работает при любом лимите).

### Что реализовано как заготовка, а не полноценная функция

Честно, по примеру предыдущих этапов:

- **Сохранённые проекты** (`src/lib/generator-engine/saved-projects.ts`)
  — реальный localStorage-механизм (аналог `favorites.ts`/
  `session-history.ts`), лимит количества берётся из
  `TariffFeatures.savedProjects`. Кнопка "Сохранить" и список появляются
  в `GeneratorEngine`, но полноценной страницы "Мои проекты" со
  сортировкой/поиском нет — за пределами того, что просит ТЗ Этапа 13.
- **Дополнительные форматы экспорта / максимальное качество** — флаги
  `extraExportFormats`/`exportQuality` есть в `TariffFeatures` и
  читаются в Premium Gate 2.0 как текст, но ни один из текущих
  генераторов не предлагает выбор формата/качества в форме — сначала
  нужен хотя бы один генератор, где это применимо, иначе это была бы
  UI-заглушка без реального эффекта.
- **Пакетная генерация** и **приоритетная обработка AI-запросов** —
  флаги `batchGeneration`/`priorityProcessing` заведены в тариф и
  видны как пункт списка в Premium Gate 2.0, но сам Generator Engine
  по-прежнему запускает генерацию по одной — реальная пакетная
  генерация потребовала бы менять `useGeneratorEngine`/`GeneratorForm`
  и это отдельный по объёму этап, а не часть системы тарифов.
- **Администрирование** — реализовано как «один центральный конфиг»
  (см. выше), а не UI-панель с аутентификацией и БД: последнее явно
  больше по объёму, чем «Этап 13» из ТЗ, и не было явно запрошено как
  отдельная страница.

### Проверено вживую

- `npx tsc --noEmit` и `npx eslint .` — без ошибок.
- `npm run build` — компиляция и генерация всех страниц/маршрутов без
  ошибок, включая обновлённые `api/webhook`, `api/check-status`,
  `api/create-invoice`.
- Сеть песочницы не пускает наружу к `api.nowpayments.io`/Redis (тот же
  known limitation, что и в Этапе 4) — сам платёжный поток end-to-end
  (создание инвойса → вебхук → чтение тарифа в Premium Gate 2.0) на
  боевых `NOWPAYMENTS_API_KEY`/`REDIS_URL` не проверялся, только
  типами/сборкой и логикой парсинга нового формата значения в Redis.

## Известные ограничения

- **Analytics Engine (Этап 10) хранит только суточные счётчики по имени
  события** (`analytics:<name>:<YYYY-MM-DD>` в Redis) — без разбивки по
  конкретному генератору/странице и без дашборда для просмотра. Такой
  срез не требовался в ТЗ Этапа 10 ("не привязывать к конкретному
  сервису"); детальная аналитика с UI — задача для реального стороннего
  сервиса (GA4/PostHog/Plausible), который подключается через тот же
  `config/analytics.ts` без изменения движка.

- **Аутентификация не подключена** — блок пользователя в Sidebar (`UserMenu`) это
  статичная заглушка ("Гость"), готовая принять реальные данные аккаунта.
  Токен подписки (Этап 4) — отдельная, независимая от неё анонимная сущность.
- **Swipe для закрытия мобильного Sidebar** не реализован — закрытие работает
  через тап по оверлею и клавишу Esc (оба варианта из ТЗ уже работают),
  свайп можно добавить позже поверх `Sheet` из `src/components/ui/sheet.tsx`.
- **Оплата не проверена вживую с реальным NOWPayments-аккаунтом** — только
  протестирована graceful-обработка его недоступности (см. Этап 4).
- **Streaming-вывод не поддержан** — `onProgress` передаёт процент/статус,
  но не частичный контент. Для генераторов текста в духе ChatGPT (вывод
  токен за токеном) это осмысленное расширение `GenerationProgress`
  на следующих этапах, сейчас его нет.
- **Секундная задержка перед формой генератора** — `GeneratorEngineLoader`
  подгружает `provider` на клиенте (см. Этап 6), поэтому между отрисовкой
  страницы и появлением самой формы есть короткий спиннер. Заголовок,
  описание и SEO-метаданные при этом уже полностью статические.
- **Web Worker подключён только к `mockup`** (Этап 11) — единственному
  из пяти генераторов, где Canvas-композитинг реально заметен на глаз.
  `pattern`/`svg`/`qr`/`audio` осознанно оставлены на основном потоке —
  инфраструктура (`createWorkerLocalProvider`) общая и готова принять
  следующие тяжёлые генераторы (Этап 12), но переводить на неё лёгкие
  сейчас означало бы менять их без функциональной причины.
- **`.cv-auto` (content-visibility) откалиброван под текущий размер
  карточки каталога** (`contain-intrinsic-size: 0 168px`) — если высота
  карточки в `GeneratorCard` заметно изменится на будущих этапах, это
  число стоит пересчитать вместе с ней, иначе появится небольшой прыжок
  скролла при подгрузке карточек вне вьюпорта.

## AGENTS.md / CLAUDE.md

Next.js сам сгенерировал эти файлы при создании проекта — это подсказка для
ИИ-агентов (Claude Code и подобных), что стек новее их данных обучения и
перед правками стоит свериться с `node_modules/next/dist/docs/`. Полезно
оставить как есть для следующих этапов.
