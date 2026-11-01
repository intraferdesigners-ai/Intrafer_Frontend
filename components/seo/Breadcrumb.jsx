import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/structuredData';

// Generic breadcrumb trail — visible nav plus matching BreadcrumbList
// JSON-LD, kept in the same component so the two can never drift apart.
// `items`: [{ label, href }], in order, first-to-last. The last item is
// the current page — pass it with no `href` (rendered as plain text, not
// a link, and omitted from the JSON-LD's `item` URL per schema.org's own
// guidance for the terminal breadcrumb entry). Every page with a breadcrumb
// uses this component; the JSON-LD comes from lib/structuredData.js's
// breadcrumbJsonLd(), unit-tested in scripts/testStructuredData.mjs.
export default function Breadcrumb({ items }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
        <ol
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px',
            listStyle: 'none', margin: 0, padding: 0,
            fontSize: '13px', color: 'var(--text-hint)',
          }}
        >
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {item.href ? (
                <Link href={item.href} style={{ color: 'var(--text-hint)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" style={{ color: 'var(--text-mid)' }}>{item.label}</span>
              )}
              {i < items.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
