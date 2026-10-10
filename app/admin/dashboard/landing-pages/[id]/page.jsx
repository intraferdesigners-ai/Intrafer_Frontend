'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  CARD, SECTION_LABEL, HINT, SELECT_STYLE, LIMITS, PLACEHOLDERS, StatusBadge, useMatchCheck, ctaPairError,
} from '../_components/shared';
import { TextField, TextArea } from '../_components/Fields';
import BannerFields from '../_components/BannerFields';
import SectionsEditor, { withKeys } from '../_components/SectionsEditor';
import SeoFields from '../_components/SeoFields';
import QualityChecklist from '../_components/QualityChecklist';
import DeleteLandingPageModal from '../_components/DeleteLandingPageModal';

// Server document -> editable form state. Only the fields this editor
// writes; category/state/city are fixed once created.
function toForm(page) {
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
    vendorList: { sort: page.vendorList?.sort || 'featured', limit: page.vendorList?.limit || 12 },
    seo: {
      metaTitle: s.metaTitle || '', metaDescription: s.metaDescription || '',
      ogImage: s.ogImage || '', indexing: s.indexing || 'auto',
    },
  };
}

// Form -> PUT body: editable fields only, client-only keys stripped.
function toPayload(form) {
  return {
    banner: form.banner,
    heading: form.heading,
    intro: form.intro,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sections: form.sections.map(({ _key, _id, ...rest }) => (_id ? { _id, ...rest } : rest)),
    vendorList: { sort: form.vendorList.sort, limit: Number(form.vendorList.limit) },
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

  const applyServerPage = useCallback((p) => {
    const f = toForm(p);
    setPage(withCategory(p));
    setForm(f);
    setSaved(JSON.stringify(toPayload(f)));
  }, []);

  useEffect(() => {
    api.get(`/admin/landing-pages/${id}`)
      .then(({ data }) => applyServerPage(data.data.page))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load landing page.'));
  }, [id, applyServerPage]);

  const dirty = useMemo(() => form && JSON.stringify(toPayload(form)) !== saved, [form, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const { result: match } = useMatchCheck(page?.category?._id, page?.state, page?.city, page?._id);
  const vendorCount = match ? (match.matchedPlace ? match.vendorsByPlace : match.vendorsByName) : null;

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
      const body = kind === 'unpublish' ? { status } : { ...toPayload(form), ...(status && { status }) };
      const { data } = await api.put(`/admin/landing-pages/${id}`, body);
      if (kind === 'unpublish') {
        // Keep any unsaved edits in the form; only status changed.
        setPage(withCategory(data.data.page));
      } else {
        applyServerPage(data.data.page);
      }
      toast.success({ save: 'Saved.', publish: 'Published.', unpublish: 'Unpublished — back to draft.' }[kind]);
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
  const path = `/${page.category?.slug}/${page.stateSlug}/${page.citySlug}/`;

  return (
    <div style={{ maxWidth: 860 }}>
      <BackLink />

      {/* Header */}
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            {page.category?.name} in {page.city}, {page.state}
          </h1>
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
            hint={`Blank = “${page.category?.name} in ${page.city}, ${page.state}”`}
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

      <SectionsEditor sections={form.sections} onChange={set('sections')} errors={errors} />

      {/* Vendor list */}
      <section style={CARD}>
        <span style={SECTION_LABEL}>Vendor list</span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="lp-sort" style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 5 }}>Sort</label>
            <select
              id="lp-sort"
              value={form.vendorList.sort}
              onChange={(e) => set('vendorList')({ ...form.vendorList, sort: e.target.value })}
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
              error={errors['vendorList.limit']}
            />
          </div>
          <p style={{ ...HINT, margin: '0 0 12px' }}>1–50 vendors.{vendorCount != null && ` ${vendorCount} currently match this city.`}</p>
        </div>
      </section>

      <SeoFields
        seo={form.seo}
        onChange={set('seo')}
        errors={errors}
        vendorCount={vendorCount}
        snippet={{ categoryName: page.category?.name, city: page.city, state: page.state, path }}
      />

      <DeleteLandingPageModal
        page={deleting ? page : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => {
          // Nothing left to save — don't let the unsaved-changes guard fire.
          setSaved(JSON.stringify(toPayload(form)));
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
