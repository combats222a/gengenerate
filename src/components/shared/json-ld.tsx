interface JsonLdProps {
  /** Один объект Schema.org или несколько — тогда рендерится по <script> на каждый. */
  data: object | object[];
}

/**
 * Общий рендерер JSON-LD (Этап 9, SEO Engine). До этого этапа каждая
 * страница сама писала `<script type="application/ld+json" dangerouslySetInnerHTML={...}>` —
 * теперь это в одном месте, страницы передают только готовые объекты
 * из src/lib/seo/json-ld.ts.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
