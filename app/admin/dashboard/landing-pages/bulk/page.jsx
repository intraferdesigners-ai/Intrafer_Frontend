'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { parseLocations, MAX_LOCATIONS } from '@/lib/landingBulkParse';
import {
  CARD, SECTION_LABEL, FIELD_LABEL, HINT, publicPath, useLandingCategories, storeDuplicateWarnings,
} from '../_components/shared';

// Bulk create (landing pages, Phase 4A): paste up to 50 "City, State"
// lines, check them (POST /bulk dryRun — no writes), then create drafts
// for the ready ones, optionally copying a template page's content.

const TEMPLATE_PAGE_LIMIT = 50; // backend paginate() max
const TEMPLATE_MAX_PAGES = 10;

const STATUS_CHIPS = {
  ok: { label: 'Ready', tone: 'success' },
  similar: { label: 'Similar', tone: 'warning' },
  exists: { label: 'Already exists', tone: 'muted' },
  duplicate_in_batch: { label: 'Duplicate in list', tone: 'muted' },
  invalid: { label: 'Invalid', tone: 'danger' },
  created: { label: 'Created', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};
const TONES = {
  success: { background: 'var(--success-bg)', color: 'var(--success)' },
  warning: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  danger: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  muted: { background: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
};
const SKIPPED = ['exists', 'duplicate_in_batch', 'invalid'];

// Every landing page, for the template picker ("Category — City, State").
function useAllLandingPages() {
  const [pages, setPages] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = [];
      for (let page = 1; page <= TEMPLATE_MAX_PAGES; page += 1) {
        const { data } = await api.get('/admin/landing-pages', { params: { page, limit: TEMPLATE_PAGE_LIMIT } });
        all.push(...(data.data?.pages || []));
        if (page >= (data.data?.totalPages || 1)) break;
      }
      if (!cancelled) setPages(all);
    })().catch(() => { if (!cancelled) setPages([]); });
    return () => { cancelled = true; };
  }, []);
  return pages;
}

function Chip({ status, children }) {
  const chip = STATUS_CHIPS[status] || STATUS_CHIPS.invalid;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      ...TONES[chip.tone],
    }}>
      {children || chip.label}
    </span>
  );
}

function statusText(r) {
  if (r.status === 'invalid' || r.status === 'failed') return r.reason;
  if (r.status === 'similar') return `Similar to ${r.similarTo?.city}`;
  if (r.status === 'duplicate_in_batch' && r.duplicateOfLine) return `Duplicate of line ${r.duplicateOfLine}`;
  return null;
}

export default function BulkCreateLandingPages() {
  const categories = useLandingCategories();
  const allPages = useAllLandingPages();

  const [templateId, setTemplateId] = useState('');
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');
  const [defaultState, setDefaultState] = useState('');

  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [check, setCheck] = useState(null);     // { key, rows, summary, warnings }
  const [created, setCreated] = useState(null); // { rows, summary, warnings }

  const parsed = useMemo(() => parseLocations(text, { defaultState }), [text, defaultState]);
  const template = allPages.find((p) => p._id === templateId) || null;
  const categorySlug = categories.find((c) => c._id === category)?.slug;
  const inputKey = JSON.stringify({ templateId, category, items: parsed.items });
  const stale = check && check.key !== inputKey;

  const chooseTemplate = (id) => {
    setTemplateId(id);
    const tpl = allPages.find((p) => p._id === id);
    if (tpl?.category?._id) setCategory(tpl.category._id);
  };

  const payload = (dryRun) => ({
    ...(templateId && { templateId }),
    ...(category && { category }),
    items: parsed.items.map(({ state, city }) => ({ state, city })),
    dryRun,
  });

  // Server results are per sent item; local parse errors are merged back in
  // by line so the table follows the textarea's order.
  const mergeRows = (results) => {
    const byLine = new Map(parsed.items.map((item, i) => [item.line, results[i]]));
    return parsed.rows.map((row) => {
      if (row.error) return { line: row.line, city: row.city, state: row.state, status: 'invalid', reason: row.error };
      const r = byLine.get(row.line) || {};
      const duplicateOfLine = r.status === 'duplicate_in_batch' ? parsed.items[r.duplicateOf]?.line : undefined;
      return { ...r, line: row.line, duplicateOfLine };
    });
  };

  const runCheck = async () => {
    setCreated(null);
    if (!category && !templateId) { toast.error('Choose a category or a template.'); return; }
    if (!parsed.items.length) {
      setCheck({ key: inputKey, rows: mergeRows([]), summary: {}, warnings: [] });
      return;
    }
    setChecking(true);
    try {
      const { data } = await api.post('/admin/landing-pages/bulk', payload(true));
      setCheck({ key: inputKey, rows: mergeRows(data.data.results), summary: data.data.summary, warnings: data.data.warnings || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check failed.');
    }
    setChecking(false);
  };

  const creatable = check && !stale ? check.rows.filter((r) => r.status === 'ok' || r.status === 'similar').length : 0;

  const runCreate = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/admin/landing-pages/bulk', payload(false));
      const rows = mergeRows(data.data.results);
      rows.filter((r) => r.status === 'created').forEach((r) => storeDuplicateWarnings(r.pageId, r.warnings));
      setCreated({ rows, summary: data.data.summary, warnings: data.data.warnings || [] });
      setCheck(null);
      toast.success(`${data.data.summary.created} draft${data.data.summary.created === 1 ? '' : 's'} created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk create failed.');
    }
    setCreating(false);
  };

  const shown = created || (check && { ...check, stale });
  const pagesWithWarnings = created ? created.rows.filter((r) => r.warnings?.length) : [];
  const mentioned = [...new Set(pagesWithWarnings.flatMap((r) => r.warnings.map((w) => w.match).filter(Boolean)))];

  return (
    <div style={{ maxWidth: 960 }}>
      <Link
        href="/admin/dashboard/landing-pages"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 20 }}
      >
        <ChevronLeft size={14} /> Landing pages
      </Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 8px' }}>
        Bulk create landing pages
      </h1>
      <p style={{ ...HINT, fontSize: 13, margin: '0 0 24px' }}>
        Creates one <strong>draft</strong> per city — nothing goes live until you publish it.
      </p>

      <section style={CARD}>
        <span style={SECTION_LABEL}>Template &amp; category</span>
        <div className="form-row" style={{ gap: 12 }}>
          <div>
            <label htmlFor="bulk-template" style={FIELD_LABEL}>Template (optional)</label>
            <select id="bulk-template" className="form-select-styled" value={templateId} onChange={(e) => chooseTemplate(e.target.value)}>
              <option value="">Blank drafts</option>
              {allPages.map((p) => (
                <option key={p._id} value={p._id}>{p.category?.name || '—'} — {p.city}, {p.state}</option>
              ))}
            </select>
            <p style={HINT}>{template ? `Copies ${template.city}'s banner, text, sections and SEO into each draft.` : 'Each draft starts empty.'}</p>
          </div>
          <div>
            <label htmlFor="bulk-category" style={FIELD_LABEL}>Category</label>
            <select id="bulk-category" className="form-select-styled" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {template && category && template.category?._id !== category && (
              <p style={{ ...HINT, color: 'var(--warning)' }}>The template is from a different category ({template.category?.name}).</p>
            )}
          </div>
        </div>
      </section>

      <section style={CARD}>
        <span style={SECTION_LABEL}>Locations</span>
        <label htmlFor="bulk-locations" style={FIELD_LABEL}>One per line</label>
        <textarea
          id="bulk-locations"
          className="form-textarea-styled"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Nashik, Maharashtra\nSurat - Gujarat\n# lines starting with # are ignored'}
          style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.6, borderColor: parsed.overLimit ? 'var(--danger)' : undefined }}
        />
        <p style={{ ...HINT, color: parsed.overLimit ? 'var(--danger)' : HINT.color }}>
          {parsed.count} / {MAX_LOCATIONS} locations
          {parsed.overLimit && ` — remove ${parsed.count - MAX_LOCATIONS} to continue`}
          {' · '}“City, State”, “City - State” or tab-separated.
        </p>
        <div style={{ maxWidth: 320, marginTop: 12 }}>
          <Input
            label="Default state (optional)"
            value={defaultState}
            onChange={(e) => setDefaultState(e.target.value)}
            placeholder="e.g. Maharashtra"
            hint="Lines without a state use this state."
            maxLength={80}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary" size="sm" loading={checking} disabled={creating || parsed.overLimit || parsed.count === 0} onClick={runCheck}>
            Check
          </Button>
          <Button variant="primary" size="sm" loading={creating} disabled={checking || creating || creatable === 0} onClick={runCreate}>
            Create {creatable || ''} draft{creatable === 1 ? '' : 's'}
          </Button>
          {stale && <span style={{ ...HINT, marginTop: 0, color: 'var(--warning)' }}>Inputs changed — check again before creating.</span>}
        </div>
      </section>

      {shown && (
        <section style={{ ...CARD, opacity: shown.stale ? 0.55 : 1 }}>
          <span style={SECTION_LABEL}>{created ? 'Result' : 'Check'}</span>

          {created ? (
            <div style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.7 }}>
              <strong>{created.summary.created}</strong> created · {created.summary.skipped} skipped
              {created.summary.failed > 0 && <> · <span style={{ color: 'var(--danger)' }}>{created.summary.failed} failed</span></>}
              {' · '}<Link href="/admin/dashboard/landing-pages" style={{ color: 'var(--color-accent)' }}>Back to the list</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {Object.entries(STATUS_CHIPS).filter(([k]) => shown.rows.some((r) => r.status === k)).map(([k]) => (
                <Chip key={k} status={k}>{STATUS_CHIPS[k].label}: {shown.rows.filter((r) => r.status === k).length}</Chip>
              ))}
            </div>
          )}

          {[...(shown.warnings || [])].map((w) => (
            <p key={w} style={{ ...HINT, color: 'var(--warning)', margin: '0 0 8px' }}>{w}</p>
          ))}
          {pagesWithWarnings.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, lineHeight: 1.6, padding: '8px 12px', marginBottom: 12, borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 3 }} />
              <span>
                {pagesWithWarnings.length} page{pagesWithWarnings.length === 1 ? '' : 's'}
                {mentioned.length
                  ? ` still mention ${mentioned.map((m) => `“${m}”`).join(' / ')} from the template`
                  : ' have localities copied from the template'}
                {' '}— each editor lists what to review before publishing.
              </span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--color-text-hint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  <th style={{ padding: '6px 8px' }}>City</th>
                  <th style={{ padding: '6px 8px' }}>State</th>
                  <th style={{ padding: '6px 8px' }}>URL</th>
                  {!created && <th style={{ padding: '6px 8px', textAlign: 'right' }}>Vendors</th>}
                  <th style={{ padding: '6px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.rows.map((r) => {
                  const skipped = SKIPPED.includes(r.status);
                  const path = publicPath(categorySlug, r.state, r.city);
                  const detail = statusText(r);
                  return (
                    <tr key={r.line} style={{ borderTop: '1px solid var(--color-border)', opacity: skipped ? 0.5 : 1 }}>
                      <td style={{ padding: '8px', color: 'var(--color-text)' }}>
                        {r.status === 'created'
                          ? <Link href={`/admin/dashboard/landing-pages/${r.pageId}`} style={{ color: 'var(--color-accent)' }}>{r.city}</Link>
                          : r.city || '—'}
                      </td>
                      <td style={{ padding: '8px', color: 'var(--color-text-sub)' }}>{r.state || '—'}</td>
                      <td style={{ padding: '8px' }}><code style={{ fontSize: 11, color: 'var(--color-text-hint)', wordBreak: 'break-all' }}>{path || '—'}</code></td>
                      {!created && <td style={{ padding: '8px', textAlign: 'right', color: 'var(--color-text-sub)' }}>{r.vendorCount ?? '—'}</td>}
                      <td style={{ padding: '8px' }}>
                        <Chip status={r.status} />
                        {r.status === 'exists' && r.existingId && (
                          <Link href={`/admin/dashboard/landing-pages/${r.existingId}`} style={{ marginLeft: 8, fontSize: 12, color: 'var(--color-accent)' }}>Open</Link>
                        )}
                        {detail && <div style={{ ...HINT, marginTop: 2 }}>{detail}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
