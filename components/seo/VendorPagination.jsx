import Link from 'next/link';
import { pageHref, pageItems } from '@/lib/cityPagination';

// Prev / numbered / next links for a paginated vendor list, as real
// <a href> anchors in the server HTML (crawlable without JavaScript). Page 1
// links to the bare URL, page N to `?page=N` (lib/cityPagination.js).
// Renders nothing for a single page.
const LINK = {
  minWidth: 36, height: 36, padding: '0 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface)',
  fontSize: 13, color: 'var(--text)', textDecoration: 'none',
};

export default function VendorPagination({ basePath, current, total }) {
  if (!total || total <= 1) return null;
  return (
    <nav aria-label="Vendor list pages" style={{ marginTop: 32 }}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
        {current > 1 && (
          <li><Link href={pageHref(basePath, current - 1)} prefetch={false} rel="prev" style={LINK}>← Previous</Link></li>
        )}
        {pageItems(current, total).map((n, i) => (
          <li key={n ?? `gap-${i}`}>
            {n === null ? (
              <span aria-hidden="true" style={{ fontSize: 13, color: 'var(--text-hint)' }}>…</span>
            ) : n === current ? (
              <span aria-current="page" style={{ ...LINK, background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }}>{n}</span>
            ) : (
              <Link href={pageHref(basePath, n)} prefetch={false} aria-label={`Page ${n}`} style={LINK}>{n}</Link>
            )}
          </li>
        ))}
        {current < total && (
          <li><Link href={pageHref(basePath, current + 1)} prefetch={false} rel="next" style={LINK}>Next →</Link></li>
        )}
      </ul>
    </nav>
  );
}
