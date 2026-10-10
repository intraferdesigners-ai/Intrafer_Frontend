'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, ExternalLink, Search } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import {
  SELECT_STYLE, ICON_BUTTON, INDEXING_LABELS, StatusBadge, useLandingCategories,
} from './_components/shared';
import DeleteLandingPageModal from './_components/DeleteLandingPageModal';

const COL = {
  category: { flex: 2 },
  state:    { flex: 2 },
  city:     { flex: 2 },
  status:   { flex: 1 },
  indexing: { flex: 1 },
  updated:  { flex: 1 },
  actions:  { flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const livePath = (p) => `/${p.category?.slug}/${p.stateSlug}/${p.citySlug}/`;

export default function AdminLandingPagesPage() {
  const categories = useLandingCategories();

  const [pages,      setPages]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [loadError,  setLoadError]  = useState(null);

  const [category,    setCategory]    = useState('');
  const [status,      setStatus]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [q,           setQ]           = useState('');

  const [deleting, setDeleting] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Filters can change faster than responses arrive; only the latest
    // request may update the table.
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const params = { page, limit: 20 };
    if (category) params.category = category;
    if (status) params.status = status;
    if (q) params.q = q;
    api.get('/admin/landing-pages', { params })
      .then(({ data }) => {
        if (cancelled) return;
        const d = data.data || {};
        setPages(d.pages || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setPages([]);
        setLoadError(err.response?.data?.message || 'Failed to load landing pages.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, status, q, page, reloadKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQ(searchInput.trim());
    setPage(1);
  };

  const handleDeleted = () => {
    setDeleting(null);
    // The last row on a page > 1 going away would leave an empty page.
    if (pages.length === 1 && page > 1) setPage((p) => p - 1);
    else setReloadKey((k) => k + 1);
  };

  const filtered = Boolean(category || status || q);

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Landing pages
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {total} total
            </span>
          )}
        </div>
        <Link href="/admin/dashboard/landing-pages/new">
          <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New landing page
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={SELECT_STYLE}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={SELECT_STYLE}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search state or city…"
            style={{ ...SELECT_STYLE, cursor: 'text', width: 220, maxWidth: '100%' }}
          />
          <Button type="submit" variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} /> Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : pages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)', lineHeight: 1.7 }}>
          {loadError ? (
            <span style={{ color: 'var(--color-danger)' }}>{loadError}</span>
          ) : filtered ? (
            'No landing pages match these filters.'
          ) : (
            <>
              No landing pages yet.<br />
              A landing page adds your own banner, text, FAQs and SEO settings to a city page
              like /interior-designers/maharashtra/pune/. Cities without one keep the automatic page.
            </>
          )}
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.category.flex }}>Category</div>
            <div style={{ ...HEADER_CELL, flex: COL.state.flex }}>State</div>
            <div style={{ ...HEADER_CELL, flex: COL.city.flex }}>City</div>
            <div style={{ ...HEADER_CELL, flex: COL.status.flex }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: COL.indexing.flex }}>Indexing</div>
            <div style={{ ...HEADER_CELL, flex: COL.updated.flex }}>Updated</div>
            <div style={{ ...HEADER_CELL, flex: COL.actions.flex, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Data rows */}
          {pages.map((p) => (
            <div
              key={p._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              <div style={{ flex: COL.category.flex, minWidth: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
                {p.category?.name || '—'}
              </div>
              <div style={{ flex: COL.state.flex, minWidth: 0, fontSize: 13, color: 'var(--color-text)' }}>{p.state}</div>
              <div style={{ flex: COL.city.flex, minWidth: 0 }}>
                <Link href={`/admin/dashboard/landing-pages/${p._id}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>
                  {p.city}
                </Link>
              </div>
              <div style={{ flex: COL.status.flex }}><StatusBadge status={p.status} /></div>
              <div style={{ flex: COL.indexing.flex, fontSize: 12, color: 'var(--color-text-sub)' }}>
                {INDEXING_LABELS[p.seo?.indexing] || 'Auto'}
              </div>
              <div style={{ flex: COL.updated.flex, fontSize: 12, color: 'var(--color-text-sub)' }}>
                {formatDate(p.updatedAt)}
              </div>
              <div style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end', gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/dashboard/landing-pages/${p._id}`} title="Edit" aria-label="Edit" style={ICON_BUTTON}>
                  <Pencil size={13} color="var(--color-text-sub)" />
                </Link>
                {p.status === 'published' && p.category?.slug && (
                  <a href={livePath(p)} target="_blank" rel="noopener noreferrer" title="View live" aria-label="View live" style={ICON_BUTTON}>
                    <ExternalLink size={13} color="var(--color-text-sub)" />
                  </a>
                )}
                <button
                  type="button"
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => setDeleting(p)}
                  style={{ ...ICON_BUTTON, background: 'var(--color-danger-bg)', border: '1px solid transparent' }}
                >
                  <Trash2 size={13} color="var(--color-danger)" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
                ← Prev
              </Button>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                Page {page} of {totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((n) => n + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      <DeleteLandingPageModal page={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />
    </div>
  );
}
