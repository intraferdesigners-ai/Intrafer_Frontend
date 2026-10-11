'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { slugify } from '@/lib/slug';
import { LEVEL_LABELS, landingPath, levelOf } from '@/lib/landingLevel';

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

// Duplicate/bulk-create warnings ("your intro mentions 'Pune'") travel to
// the new draft's editor through sessionStorage, shown there once.
const warningsKey = (id) => `intrafer_lp_copy_warnings:${id}`;
export function storeDuplicateWarnings(pageId, warnings) {
  if (!warnings?.length) return;
  try { sessionStorage.setItem(warningsKey(pageId), JSON.stringify(warnings)); } catch { /* storage full/blocked: skip */ }
}
export function takeDuplicateWarnings(pageId) {
  try {
    const raw = sessionStorage.getItem(warningsKey(pageId));
    sessionStorage.removeItem(warningsKey(pageId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const INDEXING_LABELS = { auto: 'Auto', index: 'Force index', noindex: 'Noindex' };
// State/category pages: 'auto' and 'index' both mean indexed.
export const HUB_INDEXING_LABELS = { auto: 'Index', index: 'Index', noindex: 'Noindex' };
export const indexingLabel = (page) => (
  (levelOf(page) === 'city' ? INDEXING_LABELS : HUB_INDEXING_LABELS)[page.seo?.indexing] || (levelOf(page) === 'city' ? 'Auto' : 'Index')
);

export const PLACEHOLDERS = ['{{city}}', '{{state}}', '{{category}}', '{{vendorCount}}'];

// Public URL path for a page of `level` (default city) from free-text
// state/city — same slug rules as the backend and the routes (lib/slug.js).
// null until every part the level needs is filled in.
export function publicPath(categorySlug, state, city, level = 'city') {
  return landingPath(level, categorySlug, slugify(state || ''), slugify(city || ''));
}

// A saved page's public path (needs a populated category.slug), or null.
export const pagePath = (page) => (
  page?.category?.slug ? landingPath(levelOf(page), page.category.slug, page.stateSlug, page.citySlug) : null
);

// "Pune, Maharashtra" / "Maharashtra" / "All of India" — a page's location.
export function locationLabel(page) {
  const level = levelOf(page);
  if (level === 'category') return 'All of India';
  if (level === 'state') return page.state;
  return `${page.city}, ${page.state}`;
}

// Editor title: "Interior Designers" / "Interior Designers in Uttar
// Pradesh" / "Interior Designers in Pune, Maharashtra".
export function pageTitle(page) {
  const name = page.category?.name || 'Unknown category';
  const level = levelOf(page);
  if (level === 'category') return name;
  return `${name} in ${locationLabel(page)}`;
}

export function LevelChip({ level }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '.02em', whiteSpace: 'nowrap',
      background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)',
    }}>
      {LEVEL_LABELS[level] || LEVEL_LABELS.city}
    </span>
  );
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

// Debounced GET /admin/landing-pages/match-check for a page of `level`
// (default city). Returns { result, loading } — result is null until
// there's a category (+ state, + city, as the level needs) to check, or
// when the check itself fails (it's only a hint).
export function useMatchCheck(category, state, city, excludeId, level = 'city') {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ready = category
      && (level === 'category' || slugify(state || ''))
      && (level !== 'city' || slugify(city || ''));
    if (!ready) {
      setResult(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      api.get('/admin/landing-pages/match-check', {
        params: level === 'city'
          ? { category, state, city, ...(excludeId && { excludeId }) }
          : { level, category, ...(level === 'state' && { state }), ...(excludeId && { excludeId }) },
      })
        .then(({ data }) => { if (!cancelled) setResult(data.data || null); })
        .catch(() => { if (!cancelled) setResult(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [category, state, city, excludeId, level]);

  return { result, loading };
}

// The vendor count a match-check result reports, or null.
export function matchVendorCount(match) {
  if (!match) return null;
  if (match.level) return match.vendorCount ?? null;
  return match.matchedPlace ? match.vendorsByPlace : match.vendorsByName;
}

// The existing page at exactly this key, from a match-check result.
export function matchExisting(match, level, city) {
  if (!match?.similar) return null;
  if (level === 'city') return match.similar.find((p) => p.citySlug === slugify(city || '')) || null;
  return match.similar.find((p) => p.reason === 'same-slug') || null;
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
