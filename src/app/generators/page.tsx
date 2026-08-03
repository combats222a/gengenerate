import { redirect } from "next/navigation";

/**
 * С Этапа 8 каталог — это главная страница ("/"), см. src/app/page.tsx.
 * Маршрут оставлен как редирект (а не удалён), чтобы старые ссылки на
 * /generators не превращались в 404 — но контент не дублируется для
 * поисковиков (один канонический URL для каталога).
 */
export default function GeneratorsRedirectPage() {
  redirect("/");
}
