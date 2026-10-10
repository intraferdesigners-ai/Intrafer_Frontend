'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { slugify } from '@/lib/slug';

// Shared bits for the landing pages admin (Phase 3A): styles matching the
// coupons/projects admin pages, the backend model's limits, and the
// match-check hook used by both the create page and the editor.

export const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

export const FIELD_LABEL = {
  display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '.1em',
  textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 5,
};

export const HINT = { fontSize: 11, color: 'var(--color-text-hint)', marginTop: 4, lineHeight: 1.5 };
export const FIELD_ERROR = { fontSize: 11, color: 'var(--danger)', marginTop: 4 };

export const CARD = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 16,
};

export const SELECT_STYLE = {
  padding: '9px 12px', fontSize: 13,
  background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)', cursor: 'pointer',
};

// minHeight matches globals.css's 44px touch-target rule for <button>, so
// icon links (Edit / View live) line up with icon buttons (Delete).
export const ICON_BUTTON = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, minHeight: 44, borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
  cursor: 'pointer', flexShrink: 0,
};

// Mirrors Intrafer_Backend/src/models/LandingPage.model.js.
export const LIMITS = {
  headline: 120, subheadline: 250, ctaLabel: 40,
  heading: 120, intro: 5000,
  sectionTitle: 120, sectionBody: 5000,
  question: 300, answer: 2000, faqItems: 30,
  locality: 80, localities: 100,
  sections: 12,
  metaTitle: 70, metaDescription: 170,
};

// Same rule and message as the model's pre('validate') hook: the CTA
// needs both a label and a URL, or neither. Returns an `errors` entry
// for the empty field, or null.
export const CTA_PAIR_MESSAGE = 'Set both the CTA label and the CTA URL, or leave both empty.';
export function ctaPairError(banner) {
  const hasLabel = Boolean(banner.ctaLabel?.trim());
  const hasUrl = Boolean(banner.ctaUrl?.trim());
  if (hasLabel === hasUrl) return null;
  return { [hasLabel ? 'banner.ctaUrl' : 'banner.ctaLabel']: CTA_PAIR_MESSAGE };
}

export const INDEXING_LABELS = { auto: 'Auto', index: 'Force index', noindex: 'Noindex' };

export const PLACEHOLDERS = ['{{city}}', '{{state}}', '{{category}}', '{{vendorCount}}'];

// Public URL path for a page — same slug rules as the backend and the city
// route (lib/slug.js).
export function publicPath(categorySlug, state, city) {
  const s = slugify(state || '');
  const c = slugify(city || '');
  if (!categorySlug || !s || !c) return null;
  return `/${categorySlug}/${s}/${c}/`;
}

export function StatusBadge({ status }) {
  const published = status === 'published';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '.02em',
      background: published ? 'var(--success-bg)' : 'var(--bg-parchment)',
      color: published ? 'var(--success)' : 'var(--text-mid)',
    }}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

// Debounced GET /admin/landing-pages/match-check. Returns
// { result, loading } — result is null until there's a category, state
// and city to check, or when the check itself fails (it's only a hint).
export function useMatchCheck(category, state, city, excludeId) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category || !slugify(state || '') || !slugify(city || '')) {
      setResult(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      api.get('/admin/landing-pages/match-check', {
        params: { category, state, city, ...(excludeId && { excludeId }) },
      })
        .then(({ data }) => { if (!cancelled) setResult(data.data || null); })
        .catch(() => { if (!cancelled) setResult(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [category, state, city, excludeId]);

  return { result, loading };
}

// GET /admin/landing-pages/categories — active service categories with
// their ObjectIds (create and the list filter take an id, not a slug).
export function useLandingCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get('/admin/landing-pages/categories')
      .then(({ data }) => setCategories(data.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);
  return categories;
}
