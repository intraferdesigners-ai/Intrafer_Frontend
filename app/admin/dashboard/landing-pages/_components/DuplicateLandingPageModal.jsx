'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { slugify } from '@/lib/slug';
import { levelOf } from '@/lib/landingLevel';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import MatchCheckHint from './MatchCheckHint';
import {
  FIELD_LABEL, FIELD_ERROR, HINT, publicPath, useMatchCheck, useLandingCategories, storeDuplicateWarnings,
  locationLabel, matchExisting,
} from './shared';

const TITLES = {
  city: 'Duplicate to another city',
  state: 'Duplicate to another state',
  category: 'Duplicate to another category',
};
const CONFLICT = {
  city: 'A landing page for this city already exists in this category.',
  state: 'A landing page for this state already exists in this category.',
  category: 'That category already has a category page.',
};

// Copy a landing page as a new DRAFT, shared by the list and the editor.
// `page` is the source (null = closed); needs _id, level, state, city and
// a populated category ({ _id, slug, name }). The target follows the
// source's level: another city (state + city), another state (same
// category) or another category.
export default function DuplicateLandingPageModal({ page, onClose }) {
  const router = useRouter();
  const level = levelOf(page);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(null); // 409 message
  const [saving, setSaving] = useState(false);
  const categories = useLandingCategories();

  useEffect(() => {
    if (!page) return;
    setState(levelOf(page) === 'city' ? page.state || '' : '');
    setCity('');
    setCategory('');
    setErrors({});
    setConflict(null);
  }, [page]);

  const categoryId = level === 'category' ? category : page?.category?._id;
  const categorySlug = level === 'category' ? categories.find((c) => c._id === category)?.slug : page?.category?.slug;
  const { result: match, loading: matching } = useMatchCheck(categoryId, state, city, undefined, level);
  const path = publicPath(categorySlug, state, city, level);
  const existing = matchExisting(match, level, city);

  const edit = (setter, key) => (e) => {
    setter(e.target.value);
    setErrors((p) => ({ ...p, [key]: undefined }));
    setConflict(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (level === 'category' && !category) next.category = 'Choose a category.';
    if (level !== 'category' && !slugify(state)) next.state = 'Enter a state.';
    if (level === 'city' && !slugify(city)) next.city = 'Enter a city.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const body = level === 'category'
      ? { category }
      : { state: state.trim(), ...(level === 'city' && { city: city.trim() }) };
    setSaving(true);
    try {
      const { data } = await api.post(`/admin/landing-pages/${page._id}/duplicate`, body);
      const { page: created, warnings } = data.data;
      storeDuplicateWarnings(created._id, warnings);
      toast.success('Draft created');
      setSaving(false);
      onClose();
      router.push(`/admin/dashboard/landing-pages/${created._id}`);
      return;
    } catch (err) {
      const res = err.response;
      if (res?.status === 409) setConflict(res.data?.message || CONFLICT[level]);
      else toast.error(res?.data?.message || 'Failed to duplicate the landing page.');
    }
    setSaving(false);
  };

  const sourceName = level === 'category' ? page?.category?.name : page && locationLabel(page);

  return (
    <Modal isOpen={Boolean(page)} onClose={saving ? () => {} : onClose} title={TITLES[level]} size="md">
      {page && (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6, margin: 0 }}>
            Copies the banner, text, sections and SEO settings of <strong>{sourceName}</strong> into a
            new <strong>draft</strong>. Nothing goes live until you publish it.
          </p>
          {level === 'category' && (
            <div>
              <label htmlFor="dup-category" style={FIELD_LABEL}>Category</label>
              <select id="dup-category" className="form-select-styled" value={category} onChange={edit(setCategory, 'category')} autoFocus>
                <option value="">Choose a category…</option>
                {categories.filter((c) => c._id !== page.category?._id).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p style={FIELD_ERROR}>{errors.category}</p>}
            </div>
          )}
          {level === 'state' && (
            <Input label="State" value={state} onChange={edit(setState, 'state')} error={errors.state} maxLength={80} placeholder="e.g. Gujarat" autoFocus />
          )}
          {level === 'city' && (
            <div className="form-row" style={{ gap: 12 }}>
              <Input label="State" value={state} onChange={edit(setState, 'state')} error={errors.state} maxLength={80} />
              <Input label="City" value={city} onChange={edit(setCity, 'city')} error={errors.city} maxLength={80} placeholder="e.g. Nashik" autoFocus />
            </div>
          )}
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0, wordBreak: 'break-all' }}>
            Public URL:{' '}
            <code style={{ fontSize: 12, color: path ? 'var(--color-text)' : 'var(--color-text-hint)' }}>
              {path ? `intrafer.in${path}` : '—'}
            </code>
          </p>
          <MatchCheckHint result={match} loading={matching} />
          {(conflict || existing) && (
            <div role="alert" style={{ fontSize: 13, lineHeight: 1.6, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {conflict || CONFLICT[level]}{' '}
              {existing && (
                <Link href={`/admin/dashboard/landing-pages/${existing._id}`} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'underline' }}>
                  Open the existing page
                </Link>
              )}
            </div>
          )}
          <p style={{ ...HINT, margin: 0 }}>Text that names {level === 'city' ? page.city : sourceName} or copied localities will be flagged for review in the new draft.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} disabled={Boolean(existing)}>Create draft</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
