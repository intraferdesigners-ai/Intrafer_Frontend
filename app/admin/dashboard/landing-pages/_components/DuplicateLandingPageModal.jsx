'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { slugify } from '@/lib/slug';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import MatchCheckHint from './MatchCheckHint';
import { HINT, publicPath, useMatchCheck, storeDuplicateWarnings } from './shared';

// Copy a landing page to another city as a new DRAFT, shared by the list
// and the editor. `page` is the source (null = closed); needs _id, state,
// city and a populated category ({ _id, slug }).
export default function DuplicateLandingPageModal({ page, onClose }) {
  const router = useRouter();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(null); // 409 message
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!page) return;
    setState(page.state || '');
    setCity('');
    setErrors({});
    setConflict(null);
  }, [page]);

  const categoryId = page?.category?._id;
  const { result: match, loading: matching } = useMatchCheck(categoryId, state, city);
  const path = publicPath(page?.category?.slug, state, city);
  const existing = match?.similar?.find((p) => p.citySlug === slugify(city));

  const edit = (setter, key) => (e) => {
    setter(e.target.value);
    setErrors((p) => ({ ...p, [key]: undefined }));
    setConflict(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!slugify(state)) next.state = 'Enter a state.';
    if (!slugify(city)) next.city = 'Enter a city.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const { data } = await api.post(`/admin/landing-pages/${page._id}/duplicate`, { state: state.trim(), city: city.trim() });
      const { page: created, warnings } = data.data;
      storeDuplicateWarnings(created._id, warnings);
      toast.success('Draft created');
      setSaving(false);
      onClose();
      router.push(`/admin/dashboard/landing-pages/${created._id}`);
      return;
    } catch (err) {
      const res = err.response;
      if (res?.status === 409) setConflict(res.data?.message || 'A landing page for this city already exists.');
      else toast.error(res?.data?.message || 'Failed to duplicate the landing page.');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={Boolean(page)} onClose={saving ? () => {} : onClose} title="Duplicate to another city" size="md">
      {page && (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6, margin: 0 }}>
            Copies the banner, text, sections and SEO settings of <strong>{page.city}, {page.state}</strong> into a
            new <strong>draft</strong>. Nothing goes live until you publish it.
          </p>
          <div className="form-row" style={{ gap: 12 }}>
            <Input label="State" value={state} onChange={edit(setState, 'state')} error={errors.state} maxLength={80} />
            <Input label="City" value={city} onChange={edit(setCity, 'city')} error={errors.city} maxLength={80} placeholder="e.g. Nashik" autoFocus />
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0, wordBreak: 'break-all' }}>
            Public URL:{' '}
            <code style={{ fontSize: 12, color: path ? 'var(--color-text)' : 'var(--color-text-hint)' }}>
              {path ? `intrafer.in${path}` : '—'}
            </code>
          </p>
          <MatchCheckHint result={match} loading={matching} />
          {(conflict || existing) && (
            <div role="alert" style={{ fontSize: 13, lineHeight: 1.6, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {conflict || 'A landing page for this city already exists in this category.'}{' '}
              {existing && (
                <Link href={`/admin/dashboard/landing-pages/${existing._id}`} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'underline' }}>
                  Open the existing page
                </Link>
              )}
            </div>
          )}
          <p style={{ ...HINT, margin: 0 }}>Text that names {page.city} or copied localities will be flagged for review in the new draft.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} disabled={Boolean(existing)}>Create draft</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
