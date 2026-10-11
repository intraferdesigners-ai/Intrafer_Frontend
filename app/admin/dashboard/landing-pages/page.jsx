'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, ExternalLink, Search, Copy, Layers, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import {
  SELECT_STYLE, ICON_BUTTON, StatusBadge, LevelChip, useLandingCategories, indexingLabel, pagePath, locationLabel,
} from './_components/shared';
import { levelOf } from '@/lib/landingLevel';
import DeleteLandingPageModal from './_components/DeleteLandingPageModal';
import DuplicateLandingPageModal from './_components/DuplicateLandingPageModal';

const COL = {
  select:   { width: 20, flexShrink: 0 },
  type:     { flex: '0 0 100px' },
  category: { flex: 2 },
  state:    { flex: 2 },
  city:     { flex: 2 },
  status:   { flex: 1 },
  indexing: { flex: 1 },
  updated:  { flex: 1 },
  // Fixed width: rows have 3-4 icons (View live only when published), and
  // a flexible column would shift every other column on those rows.
  actions:  { flex: '0 0 136px', display: 'flex', justifyContent: 'flex-end', gap: 6 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const DUPLICATE_TITLES = { city: 'Duplicate to another city', state: 'Duplicate to another state', category: 'Duplicate to another category' };

const CHECKBOX = { width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-accent)', margin: 0 };

const BULK_VERBS = {
  publish: { done: 'published', confirm: (n) => `Publish ${n} page${n === 1 ? '' : 's'}?` },
  unpublish: { done: 'unpublished', confirm: (n) => `Unpublish ${n} page${n === 1 ? '' : 's'}?` },
  delete: { done: 'deleted' },
};

// "12 published · 2 unchanged · 1 failed"
function bulkSummaryText(action, summary) {
  return [
    summary.ok && `${summary.ok} ${BULK_VERBS[action].done}`,
    summary.unchanged && `${summary.unchanged} unchanged`,
    summary.failed && `${summary.failed} failed`,
    summary.not_found && `${summary.not_found} not found`,
  ].filter(Boolean).join(' · ') || 'Nothing changed';
}

export default function AdminLandingPagesPage() {
  const categories = useLandingCategories();

  const [pages,      setPages]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [loadError,  setLoadError]  = useState(null);

  const [level,       setLevel]       = useState('');
  const [category,    setCategory]    = useState('');
  const [status,      setStatus]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [q,           setQ]           = useState('');

  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Bulk selection: ids on the current page of results. Cleared when the
  // filters or page change, so an action never hits rows you can't see.
  const [selected, setSelected] = useState(() => new Set());
  const [confirming, setConfirming] = useState(null);  // 'publish' | 'unpublish' | 'delete'
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);  // { action, summary, failed: [{ id, label, message }] }

  useEffect(() => { setSelected(new Set()); }, [level, category, status, q, page]);

  useEffect(() => {
    // Filters can change faster than responses arrive; only the latest
    // request may update the table.
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const params = { page, limit: 20 };
    if (level) params.level = level;
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
  }, [level, category, status, q, page, reloadKey]);

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

  const filtered = Boolean(level || category || status || q);

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allOnPage = pages.length > 0 && pages.every((p) => selected.has(p._id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(pages.map((p) => p._id)));
  const selectedPages = pages.filter((p) => selected.has(p._id));

  // One bulk-action call for the selection. Failed ids stay selected so
  // they can be fixed and retried; everything else is cleared.
  const runBulk = async (action) => {
    const ids = [...selected];
    setBulkBusy(true);
    try {
      const { data } = await api.post('/admin/landing-pages/bulk-action', { ids, action });
      const { results, summary } = data.data;
      const label = (id) => {
        const row = pages.find((p) => p._id === id);
        return row ? locationLabel(row) : id;
      };
      const failed = results.filter((r) => r.status === 'failed').map((r) => ({ id: r.id, label: label(r.id), message: r.message }));
      setSelected(new Set(failed.map((f) => f.id)));
      setBulkResult({ action, summary, failed });
      (summary.failed ? toast.error : toast.success)(bulkSummaryText(action, summary));
      setConfirming(null);
      // Deleting every row on a page > 1 would leave it empty.
      if (action === 'delete' && summary.ok >= pages.length && page > 1) setPage((n) => n - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk action failed.');
    }
    setBulkBusy(false);
  };

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
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/dashboard/landing-pages/bulk">
            <Button variant="outline" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} /> Bulk create
            </Button>
          </Link>
          <Link href="/admin/dashboard/landing-pages/new">
            <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> New landing page
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          aria-label="Type"
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          style={SELECT_STYLE}
        >
          <option value="">All types</option>
          <option value="category">Category pages</option>
          <option value="state">State pages</option>
          <option value="city">City pages</option>
        </select>
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

      {bulkResult && (
        <div role="status" style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16, fontSize: 13, lineHeight: 1.6,
          padding: '10px 14px', borderRadius: 'var(--radius-lg)',
          background: bulkResult.failed.length ? 'var(--warning-bg)' : 'var(--success-bg)',
          color: bulkResult.failed.length ? 'var(--warning)' : 'var(--success)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{bulkSummaryText(bulkResult.action, bulkResult.summary)}</div>
            {bulkResult.failed.length > 0 && (
              <>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, listStyle: 'disc' }}>
                  {bulkResult.failed.slice(0, 5).map((f) => <li key={f.id}><strong>{f.label}</strong>: {f.message}</li>)}
                  {bulkResult.failed.length > 5 && <li>…and {bulkResult.failed.length - 5} more</li>}
                </ul>
                <div style={{ marginTop: 4 }}>Failed pages stay selected — fix them in the editor and try again.</div>
              </>
            )}
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setBulkResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, minHeight: 0 }}>
            <X size={15} />
          </button>
        </div>
      )}

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
              like /interior-designers/maharashtra/pune/ — or to a state or category page.
              Pages without one keep the automatic page.
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
            <div style={COL.select}>
              <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={toggleAll} style={CHECKBOX} />
            </div>
            <div style={{ ...HEADER_CELL, flex: COL.type.flex }}>Type</div>
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
              <div style={COL.select}>
                <input type="checkbox" aria-label={`Select ${locationLabel(p)}`} checked={selected.has(p._id)} onChange={() => toggle(p._id)} style={CHECKBOX} />
              </div>
              <div style={{ flex: COL.type.flex }}><LevelChip level={levelOf(p)} /></div>
              {/* The row's link sits on its most specific part: the city,
                  the state on a state page, the category on a category page. */}
              <div style={{ flex: COL.category.flex, minWidth: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
                {levelOf(p) === 'category' ? <RowLink page={p}>{p.category?.name || '—'}</RowLink> : (p.category?.name || '—')}
              </div>
              <div style={{ flex: COL.state.flex, minWidth: 0, fontSize: 13, color: 'var(--color-text)' }}>
                {levelOf(p) === 'state' ? <RowLink page={p}>{p.state}</RowLink> : (p.state || '—')}
              </div>
              <div style={{ flex: COL.city.flex, minWidth: 0 }}>
                {levelOf(p) === 'city'
                  ? <RowLink page={p}>{p.city}</RowLink>
                  : <span style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>—</span>}
              </div>
              <div style={{ flex: COL.status.flex }}><StatusBadge status={p.status} /></div>
              <div style={{ flex: COL.indexing.flex, fontSize: 12, color: 'var(--color-text-sub)' }}>
                {indexingLabel(p)}
              </div>
              <div style={{ flex: COL.updated.flex, fontSize: 12, color: 'var(--color-text-sub)' }}>
                {formatDate(p.updatedAt)}
              </div>
              <div style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end', gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/dashboard/landing-pages/${p._id}`} title="Edit" aria-label="Edit" style={ICON_BUTTON}>
                  <Pencil size={13} color="var(--color-text-sub)" />
                </Link>
                {p.status === 'published' && pagePath(p) && (
                  <a href={pagePath(p)} target="_blank" rel="noopener noreferrer" title="View live" aria-label="View live" style={ICON_BUTTON}>
                    <ExternalLink size={13} color="var(--color-text-sub)" />
                  </a>
                )}
                <button
                  type="button"
                  title={DUPLICATE_TITLES[levelOf(p)]}
                  aria-label="Duplicate"
                  onClick={() => setDuplicating(p)}
                  style={ICON_BUTTON}
                >
                  <Copy size={13} color="var(--color-text-sub)" />
                </button>
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

          {selected.size > 0 && (
            <div style={{
              position: 'sticky', bottom: 16, zIndex: 5, marginTop: 8,
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              background: 'var(--color-surface)', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-lg)', padding: '10px 16px', boxShadow: 'var(--shadow-md)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{selected.size} selected</span>
              <span style={{ flex: 1 }} />
              <Button variant="success" size="sm" disabled={bulkBusy} onClick={() => setConfirming('publish')}>Publish</Button>
              <Button variant="secondary" size="sm" disabled={bulkBusy} onClick={() => setConfirming('unpublish')}>Unpublish</Button>
              <Button variant="danger" size="sm" disabled={bulkBusy} onClick={() => setConfirming('delete')}>Delete</Button>
              <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          )}

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
      <DeleteLandingPageModal
        pages={confirming === 'delete' ? selectedPages : null}
        busy={bulkBusy}
        onBulkDelete={() => runBulk('delete')}
        onClose={() => setConfirming(null)}
      />
      <DuplicateLandingPageModal page={duplicating} onClose={() => setDuplicating(null)} />

      <Modal
        isOpen={confirming === 'publish' || confirming === 'unpublish'}
        onClose={bulkBusy ? () => {} : () => setConfirming(null)}
        title={confirming ? BULK_VERBS[confirming].confirm?.(selected.size) : ''}
        size="sm"
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.7, margin: '0 0 20px' }}>
          {confirming === 'publish'
            ? 'They become public immediately. Pages that fail validation are skipped and listed afterwards.'
            : 'They go back to draft; their URLs show the automatic page again.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setConfirming(null)} disabled={bulkBusy}>Cancel</Button>
          <Button variant={confirming === 'publish' ? 'success' : 'primary'} size="sm" loading={bulkBusy} onClick={() => runBulk(confirming)}>
            {confirming === 'publish' ? `Publish ${selected.size}` : `Unpublish ${selected.size}`}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function RowLink({ page, children }) {
  return (
    <Link href={`/admin/dashboard/landing-pages/${page._id}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}
