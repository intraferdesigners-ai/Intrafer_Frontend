import { serializeJsonLd } from '@/lib/structuredData';

// One JSON-LD block, server-rendered into the initial HTML. `data` null or
// undefined renders nothing, so callers can pass a builder's result as is.
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
