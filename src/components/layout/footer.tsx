import packageJson from "../../../package.json";
import { siteConfig } from "@/config/site";
import { Container } from "./container";

/**
 * Минимальный футер для внутреннего SaaS-приложения — не маркетинговый
 * (без колонок ссылок, соцсетей и т.д., это не публичный лендинг).
 * Версия подтягивается из package.json, чтобы не рассинхронизироваться.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {year} {siteConfig.fullName}
        </p>
        <p>v{packageJson.version}</p>
      </Container>
    </footer>
  );
}
