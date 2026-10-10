'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { slugify } from '@/lib/slug';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  SECTION_LABEL, FIELD_LABEL, HINT, FIELD_ERROR, publicPath, useMatchCheck, useLandingCategories,
} from '../_components/shared';
import MatchCheckHint from '../_components/MatchCheckHint';

export default function NewLandingPagePage() {
  const router = useRouter();
  const categories = useLandingCategories();

  const [form, setForm] = useState({ category: '', state: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [duplicate, setDuplicate] = useState(null); // 409 message

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setDuplicate(null);
  };

  const categorySlug = categories.find((c) => c._id === form.category)?.slug;
  const path = publicPath(categorySlug, form.state, form.city);
  const { result: match, loading: matching } = useMatchCheck(form.category, form.state, form.city);

  // The 409 doesn't carry the existing page's id; match-check's same-URL
  // entry does.
  const existing = match?.similar?.find((p) => p.citySlug === slugify(form.city));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.category) next.category = 'Choose a category.';
    if (!slugify(form.state)) next.state = 'Enter a state.';
    if (!slugify(form.city)) next.city = 'Enter a city.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const { data } = await api.post('/admin/landing-pages', {
        category: form.category, state: form.state.trim(), city: form.city.trim(), status: 'draft',
      });
      toast.success('Draft created.');
      router.push(`/admin/dashboard/landing-pages/${data.data.page._id}`);
      return;
    } catch (err) {
      const res = err.response;
      if (res?.status === 409) setDuplicate(res.data?.message || 'A landing page for this city already exists.');
      else if (res?.data?.errors) setErrors(res.data.errors);
      else toast.error(res?.data?.message || 'Failed to create landing page.');
    }
    setSaving(false);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/landing-pages"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 20 }}
      >
        <ChevronLeft size={14} /> Landing pages
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 24px' }}>
        New landing page
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 28,
          display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640,
        }}>
          <span style={{ ...SECTION_LABEL, marginBottom: 0 }}>Page location</span>

          <div>
            <label htmlFor="lp-category" style={FIELD_LABEL}>Category</label>
            <select id="lp-category" className="form-select-styled" value={form.category} onChange={set('category')}>
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p style={FIELD_ERROR}>{errors.category}</p>}
          </div>

          <div className="form-row" style={{ gap: 12 }}>
            <Input label="State" value={form.state} onChange={set('state')} placeholder="e.g. Uttar Pradesh" error={errors.state} maxLength={80} />
            <Input label="City" value={form.city} onChange={set('city')} placeholder="e.g. Ghaziabad" error={errors.city} maxLength={80} />
          </div>

          <div>
            <p style={{ ...HINT, marginTop: 0 }}>
              State and city are free text — the page works even if the city isn&apos;t in place data.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '6px 0 0', wordBreak: 'break-all' }}>
              Public URL:{' '}
              <code style={{ fontSize: 12, color: path ? 'var(--color-text)' : 'var(--color-text-hint)' }}>
                {path ? `intrafer.in${path}` : '—'}
              </code>
            </p>
          </div>

          <MatchCheckHint result={match} loading={matching} />

          {duplicate && (
            <div role="alert" style={{ fontSize: 13, lineHeight: 1.6, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {duplicate}{' '}
              {existing && (
                <Link href={`/admin/dashboard/landing-pages/${existing._id}`} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'underline' }}>
                  Open the existing page
                </Link>
              )}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={saving} style={{ width: '100%' }}>
            Create draft
          </Button>
        </div>
      </form>
    </div>
  );
}
