'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ChevronLeft, Copy, ExternalLink, Eye, History, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  CARD, SECTION_LABEL, HINT, SELECT_STYLE, LIMITS, PLACEHOLDERS, StatusBadge, useMatchCheck, ctaPairError,
  takeDuplicateWarnings, LevelChip, pageTitle, pagePath, matchVendorCount,
} from '../_components/shared';
import { defaultLandingTitle, isHubLevel, levelOf } from '@/lib/landingLevel';
import { TextField, TextArea } from '../_components/Fields';
import BannerFields from '../_components/BannerFields';
import SectionsEditor, { withKeys } from '../_components/SectionsEditor';
import SeoFields from '../_components/SeoFields';
import QualityChecklist from '../_components/QualityChecklist';
import DeleteLandingPageModal from '../_components/DeleteLandingPageModal';
import DuplicateLandingPageModal from '../_components/DuplicateLandingPageModal';
import HistoryPanel, { formatWhen } from '../_components/HistoryPanel';

// Server document (or a version snapshot) -> editable form state. Only the
// fields this editor writes; level/category/state/city are fixed once
// created. `level` is the page's: hubs also edit vendorList.enabled.
function toForm(page, level) {
  const b = page.banner || {};
  const s = page.seo || {};
  return {
    banner: {
      imageUrl: b.imageUrl || '', headline: b.headline || '', subheadline: b.subheadline || '',
      ctaLabel: b.ctaLabel || '', ctaUrl: b.ctaUrl || '',
    },
    heading: page.heading || '',
    intro: page.intro || '',
    sections: withKeys((page.sections || []).map((sec) => ({
      _id: sec._id, type: sec.type, title: sec.title || '', body: sec.body || '',
      faqItems: (sec.faqItems || []).map((f) => ({ question: f.question || '', answer: f.answer || '' })),
      localities: sec.localities || [], enabled: sec.enabled !== false,
    }))),
    vendorList: {
      sort: page.vendorList?.sort || 'featured',
      limit: page.vendorList?.limit || 12,
      ...(isHubLevel(level) && { enabled: page.vendorList?.enabled === true }),
    },
    seo: {
      metaTitle: s.metaTitle || '', metaDescription: s.metaDescription || '',
      ogImage: s.ogImage || '', indexing: s.indexing || 'auto',
    },
  };
}

// Form -> PUT body: editable fields only, client-only keys stripped.
// City pages always list their vendors, so only hubs send `enabled`.
function toPayload(form, level) {
  return {
    banner: form.banner,
    heading: form.heading,
    intro: form.intro,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sections: form.sections.map(({ _key, _id, ...rest }) => (_id ? { _id, ...rest } : rest)),
    vendorList: {
      ...(isHubLevel(level) && { enabled: form.vendorList.enabled === true }),
      sort: form.vendorList.sort,
      limit: Number(form.vendorList.limit),
    },
    seo: form.seo,
  };
}

// PUT responses carry `category` as a bare id (only GET populates it) —
// keep the populated { name, slug } from the page already loaded.
const withCategory = (p) => (prev) => (
  p.category && typeof p.category === 'object' ? p : { ...p, category: prev?.category }
);

export default function LandingPageEditor() {
  const { id } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(null);         // last server copy
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState('');          // JSON of the last-saved payload
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(null);          // 'save' | 'publish' | 'unpublish'
  const [previewing, setPreviewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  // Set when this draft was just made by Duplicate / Bulk create.
  const [copyWarnings, setCopyWarnings] = useState([]);
  // Version history: list (null while loading), and the version currently
  // loaded into the form by Restore ({ id, createdAt, bannerHidden }).
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState(null);
  const [versionsError, setVersionsError] = useState(null);
  const [restored, setRestored] = useState(null);

  const loadVersions = useCallback(() => {
    setVersionsError(null);
    api.get(`/admin/landing-pages/${id}/versions`)
      .then(({ data }) => setVersions(data.data.versions || []))
      .catch((err) => {
        setVersions([]);
        setVersionsError(err.response?.data?.message || 'Could not load the history.');
      });
  }, [id]);
  useEffect(() => { loadVersions(); }, [loadVersions]);

  useEffect(() => {
    const warnings = takeDuplicateWarnings(id);
    if (warnings.length) setCopyWarnings(warnings);
  }, [id]);

  const applyServerPage = useCallback((p) => {
    const f = toForm(p, levelOf(p));
    setPage(withCategory(p));
    setForm(f);
    setSaved(JSON.stringify(toPayload(f, levelOf(p))));
  }, []);

  useEffect(() => {
    api.get(`/admin/landing-pages/${id}`)
      .then(({ data }) => applyServerPage(data.data.page))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load landing page.'));
  }, [id, applyServerPage]);

  const level = levelOf(page);
  const hub = isHubLevel(level);
  const dirty = useMemo(() => form && JSON.stringify(toPayload(form, level)) !== saved, [form, saved, level]);

  // A restore is only pending while it's an unsaved change: once saved,
  // or edited back to the saved content, there's nothing to attribute.
  useEffect(() => {
    if (!dirty) setRestored(null);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const { result: match } = useMatchCheck(page?.category?._id, page?.state, page?.city, page?._id, level);
  const vendorCount = matchVendorCount(match);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // Editing either CTA field clears the pair error from both.
  const setBanner = (banner) => {
    if (banner.ctaLabel !== form.banner.ctaLabel || banner.ctaUrl !== form.banner.ctaUrl) {
      setErrors((e) => ({ ...e, 'banner.ctaLabel': undefined, 'banner.ctaUrl': undefined }));
    }
    set('banner')(banner);
  };

  // One PUT: editable fields, plus `status` when publishing/unpublishing —
  // so "Publish" saves and publishes together, or does neither on a
  // validation error.
  const submit = async (kind, status) => {
    // Unpublish sends only `status`, so the banner isn't checked then.
    const ctaError = kind !== 'unpublish' && ctaPairError(form.banner);
    if (ctaError) {
      setErrors(ctaError);
      toast.error('Some fields need fixing — see the highlighted fields.');
      return;
    }
    setBusy(kind);
    setErrors({});
    try {
      const body = kind === 'unpublish'
        ? { status }
        : { ...toPayload(form, level), ...(status && { status }), ...(restored && { restoredFrom: restored.id }) };
      const { data } = await api.put(`/admin/landing-pages/${id}`, body);
      if (kind === 'unpublish') {
        // Keep any unsaved edits in the form; only status changed.
        setPage(withCategory(data.data.page));
      } else {
        applyServerPage(data.data.page);
      }
      toast.success({ save: 'Saved.', publish: 'Published.', unpublish: 'Unpublished — back to draft.' }[kind]);
      loadVersions();
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors && Object.keys(res.errors).length) {
        setErrors(res.errors);
        toast.error('Some fields need fixing — see the highlighted fields.');
      } else {
        toast.error(res?.message || 'Failed to save.');
      }
    }
    setBusy(null);
  };

  // Opens the SAVED page (draft or published) at its public URL via a
  // 30-minute signed link. The tab is opened synchronously, inside the
  // click, so popup blockers allow it; it's pointed at the link once the
  // token arrives, with its opener cut (noopener).
  const openPreview = async () => {
    if (dirty) {
      toast.error('Save your changes first — preview shows the saved version');
      return;
    }
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    setPreviewing(true);
    try {
      const { data } = await api.post(`/admin/landing-pages/${id}/preview-token`);
      const url = `${window.location.origin}${data.data.path}`;
      if (tab) tab.location.replace(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      tab?.close();
      toast.error(err.response?.data?.message || 'Could not create a preview link.');
    }
    setPreviewing(false);
  };

  // Loads a version's CONTENT into the form as unsaved edits (location and
  // status aren't in snapshots, so they can't change). The next save
  // sends restoredFrom so the backend records it as a restore.
  const restoreVersion = (version) => {
    if (dirty) {
      toast.error('Save or discard your changes first');
      return;
    }
    setForm(toForm(version.snapshot || {}, level));
    setErrors({});
    setRestored({ id: version.id, createdAt: version.createdAt, bannerHidden: false });
    setHistoryOpen(false);
  };

  // Duplicates the SAVED page, so unsaved edits would silently not be copied.
  const openDuplicate = () => {
    if (dirty) {
      toast.error('Save your changes first — duplicate copies the saved version');
      return;
    }
    setDuplicating(true);
  };

  if (loadError) {
    return (
      <div>
        <BackLink />
        <div style={{ ...CARD, textAlign: 'center', fontSize: 13, color: 'var(--color-text-hint)' }}>{loadError}</div>
      </div>
    );
  }
  if (!form) return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;

  const published = page.status === 'published';
  const path = pagePath(page) || '';
  const defaultTitle = defaultLandingTitle(level, { categoryName: page.category?.name, state: page.state, city: page.city });

  return (
    <div style={{ maxWidth: 860 }}>
      <BackLink />

      {restored && !restored.bannerHidden && (
        <div role="status" style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16,
          padding: '12px 14px', borderRadius: 'var(--radius-lg)',
          background: 'var(--info-bg)', color: 'var(--info)', fontSize: 13, lineHeight: 1.6,
        }}>
          <RotateCcw size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            Restored the version from {formatWhen(restored.createdAt)}. Review it, then click Save.
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setRestored((r) => ({ ...r, bannerHidden: true }))}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, minHeight: 0, flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {copyWarnings.length > 0 && (
        <div role="alert" style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16,
          padding: '12px 14px', borderRadius: 'var(--radius-lg)',
          background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: 13, lineHeight: 1.6,
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Review before publishing — this draft was copied from another page:</div>
            <ul style={{ margin: '4px 0 0', paddingLeft: 18, listStyle: 'disc' }}>
              {copyWarnings.map((w, i) => <li key={i}>{w.message}</li>)}
            </ul>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setCopyWarnings([])}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, minHeight: 0, flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            {pageTitle(page)}
          </h1>
          <LevelChip level={level} />
          <StatusBadge status={page.status} />
          <span
            aria-live="polite"
            style={{ fontSize: 12, fontWeight: 500, color: dirty ? 'var(--warning)' : 'var(--success)' }}
          >
            {dirty ? '● Unsaved changes' : '✓ Saved'}
          </span>
        </div>
        <code style={{ fontSize: 12, color: 'var(--color-text-sub)', wordBreak: 'break-all' }}>intrafer.in{path}</code>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" loading={busy === 'save'} disabled={Boolean(busy) || !dirty} onClick={() => submit('save')}>
            Save
          </Button>
          {published ? (
            <Button variant="secondary" size="sm" loading={busy === 'unpublish'} disabled={Boolean(busy)} onClick={() => submit('unpublish', 'draft')}>
              Unpublish
            </Button>
          ) : (
            <Button variant="success" size="sm" loading={busy === 'publish'} disabled={Boolean(busy)} onClick={() => submit('publish', 'published')}>
              {dirty ? 'Save & publish' : 'Publish'}
            </Button>
          )}
          <Button variant="outline" size="sm" loading={previewing} disabled={Boolean(busy)} onClick={openPreview}>
            <Eye size={13} /> Preview
          </Button>
          {published && (
            <a href={path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm"><ExternalLink size={13} /> View live</Button>
            </a>
          )}
          <Button variant="outline" size="sm" disabled={Boolean(busy)} onClick={openDuplicate}>
            <Copy size={13} /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(busy) || !versions || (versions.length === 0 && !versionsError)}
            title={versions && versions.length === 0 && !versionsError ? 'No history yet — a version is recorded each time the page is saved' : undefined}
            onClick={() => setHistoryOpen(true)}
          >
            <History size={13} /> History
          </Button>
          <Button variant="danger" size="sm" disabled={Boolean(busy)} onClick={() => setDeleting(true)} style={{ marginLeft: 'auto' }}>
            <Trash2 size={13} /> Delete
          </Button>
        </div>
        {!published && (
          <p style={{ ...HINT, margin: 0 }}>
            Drafts aren&apos;t visible publicly; the URL keeps showing the automatic page until you publish.
          </p>
        )}
      </div>

      <QualityChecklist
        form={form}
        categoryName={page.category?.name}
        city={page.city}
        state={page.state}
        level={level}
        vendorCount={vendorCount}
        published={published}
      />

      <BannerFields banner={form.banner} onChange={setBanner} errors={errors} />

      {/* Heading + intro */}
      <section style={CARD}>
        <span style={SECTION_LABEL}>Heading &amp; intro</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextField
            label="Heading (H1)"
            value={form.heading}
            onChange={set('heading')}
            max={LIMITS.heading}
            counter
            error={errors.heading}
            hint={`Blank = “${defaultTitle}”`}
          />
          <TextArea
            label="Intro (Markdown)"
            value={form.intro}
            onChange={set('intro')}
            max={LIMITS.intro}
            counter
            rows={7}
            error={errors.intro}
          />
          <p style={{ ...HINT, margin: 0 }}>
            Markdown supported (**bold**, lists, [links](/path/)); any HTML is removed. Placeholders:{' '}
            {PLACEHOLDERS.map((p, i) => (
              <span key={p}>
                <code style={{ fontSize: 11, background: 'var(--color-surface-alt)', padding: '1px 5px', borderRadius: 4 }}>{p}</code>
                {i < PLACEHOLDERS.length - 1 ? ' ' : ''}
              </span>
            ))}
            {' '}— filled in on the live page; unknown ones are dropped.
          </p>
        </div>
      </section>

      <SectionsEditor
        sections={form.sections}
        onChange={set('sections')}
        errors={errors}
        localitiesTitle={{ category: 'Areas we cover', state: 'Localities in {{state}}', city: 'Localities in {{city}}' }[level]}
      />

      {/* Vendor list */}
      <section style={CARD}>
        <span style={SECTION_LABEL}>Vendor list</span>
        {hub && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={form.vendorList.enabled === true}
              onChange={(e) => set('vendorList')({ ...form.vendorList, enabled: e.target.checked })}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-accent)' }}
            />
            <span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Show top vendors on this page</span>
              <span style={{ ...HINT, display: 'block', marginTop: 2 }}>
                Adds a vendor list below the {level === 'state' ? 'city' : 'state'} cards. Off by default.
              </span>
            </span>
          </label>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', ...(hub && !form.vendorList.enabled && { opacity: 0.55 }) }}>
          <div>
            <label htmlFor="lp-sort" style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 5 }}>Sort</label>
            <select
              id="lp-sort"
              value={form.vendorList.sort}
              onChange={(e) => set('vendorList')({ ...form.vendorList, sort: e.target.value })}
              disabled={hub && !form.vendorList.enabled}
              style={SELECT_STYLE}
            >
              <option value="featured">Featured first</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div style={{ width: 120 }}>
            <TextField
              label="Show up to"
              type="number"
              min={1}
              max={50}
              value={String(form.vendorList.limit)}
              onChange={(v) => set('vendorList')({ ...form.vendorList, limit: v === '' ? '' : Math.max(1, Math.min(50, Number(v) || 1)) })}
              disabled={hub && !form.vendorList.enabled}
              error={errors['vendorList.limit']}
            />
          </div>
          <p style={{ ...HINT, margin: '0 0 12px' }}>
            1–50 vendors.{vendorCount != null && ` ${vendorCount} currently match this ${level === 'category' ? 'category' : level}.`}
          </p>
        </div>
      </section>

      <SeoFields
        seo={form.seo}
        onChange={set('seo')}
        errors={errors}
        vendorCount={vendorCount}
        level={level}
        snippet={{ categoryName: page.category?.name, city: page.city, state: page.state, path, level }}
      />

      <DuplicateLandingPageModal page={duplicating ? page : null} onClose={() => setDuplicating(false)} />

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        pageId={id}
        versions={versions}
        loadError={versionsError}
        onRetry={loadVersions}
        savedContent={page}
        onRestore={restoreVersion}
      />

      <DeleteLandingPageModal
        page={deleting ? page : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => {
          // Nothing left to save — don't let the unsaved-changes guard fire.
          setSaved(JSON.stringify(toPayload(form, level)));
          router.push('/admin/dashboard/landing-pages');
        }}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/dashboard/landing-pages"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 20 }}
    >
      <ChevronLeft size={14} /> Landing pages
    </Link>
  );
}
