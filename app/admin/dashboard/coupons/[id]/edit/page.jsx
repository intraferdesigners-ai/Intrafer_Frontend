'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../../lib/api';
import Button from '../../../../../../components/ui/Button';
import Input from '../../../../../../components/ui/Input';
import Spinner from '../../../../../../components/ui/Spinner';

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

const FIELD_LABEL = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: 6, letterSpacing: '0.01em',
};

const PLAN_NAMES = ['3 Month', '6 Month', '12 Month'];

function toDateInputValue(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().slice(0, 10);
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id;

  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '',
    applicablePlans: [], maxUses: '', validFrom: '', validUntil: '', isActive: true,
  });

  useEffect(() => {
    api.get('/admin/coupons')
      .then(({ data }) => {
        const coupon = (data.data?.coupons || []).find((c) => c._id === couponId);
        if (!coupon) { setNotFound(true); return; }
        setForm({
          code: coupon.code || '',
          discountType: coupon.discountType || 'percentage',
          discountValue: coupon.discountType === 'flat'
            ? coupon.discountValue / 100
            : coupon.discountValue,
          applicablePlans: coupon.applicablePlans || [],
          maxUses: coupon.maxUses === null || coupon.maxUses === undefined ? '' : coupon.maxUses,
          validFrom: toDateInputValue(coupon.validFrom),
          validUntil: toDateInputValue(coupon.validUntil),
          isActive: !!coupon.isActive,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [couponId]);

  const togglePlan = (plan) => {
    setForm((p) => ({
      ...p,
      applicablePlans: p.applicablePlans.includes(plan)
        ? p.applicablePlans.filter((x) => x !== plan)
        : [...p.applicablePlans, plan],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim())   { toast.error('Coupon code is required.');    return; }
    if (!form.discountValue) { toast.error('Discount value is required.'); return; }

    setSaving(true);
    try {
      await api.put(`/admin/coupons/${couponId}`, {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: form.discountType === 'flat'
          ? Math.round(Number(form.discountValue) * 100)
          : Number(form.discountValue),
        applicablePlans: form.applicablePlans,
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || null,
        isActive: form.isActive,
      });
      toast.success('Coupon updated.');
      router.push('/admin/dashboard/coupons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update coupon.');
    }
    setSaving(false);
  };

  const pillStyle = (active) => ({
    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 150ms ease-out',
    ...(active
      ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
      : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
    ),
  });

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner size="md" /></div>
    );
  }

  if (notFound) {
    return (
      <div style={{
        background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
        padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
      }}>
        Coupon not found.
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/dashboard/coupons"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ChevronLeft size={14} /> Coupons
      </Link>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 24px',
      }}>
        Edit coupon
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 28,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>

          {/* Code */}
          <div>
            <span style={SECTION_LABEL}>Coupon details</span>
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. WELCOME20"
              required
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Discount */}
          <div>
            <span style={SECTION_LABEL}>Discount</span>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                style={pillStyle(form.discountType === 'percentage')}
                onClick={() => setForm((p) => ({ ...p, discountType: 'percentage' }))}
              >
                Percentage
              </button>
              <button
                type="button"
                style={pillStyle(form.discountType === 'flat')}
                onClick={() => setForm((p) => ({ ...p, discountType: 'flat' }))}
              >
                Flat amount
              </button>
            </div>
            <Input
              label={form.discountType === 'percentage' ? 'Discount percentage (%)' : 'Discount amount (₹)'}
              type="number"
              min={1}
              max={form.discountType === 'percentage' ? 100 : undefined}
              value={form.discountValue}
              onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
              placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
              required
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Applicable plans */}
          <div>
            <span style={SECTION_LABEL}>Applicable plans</span>
            <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: '-6px 0 12px' }}>
              Leave all unchecked to apply this coupon to every plan.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLAN_NAMES.map((plan) => (
                <button
                  key={plan}
                  type="button"
                  style={pillStyle(form.applicablePlans.includes(plan))}
                  onClick={() => togglePlan(plan)}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Usage & validity */}
          <div>
            <span style={SECTION_LABEL}>Usage &amp; validity</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Max uses (blank = unlimited)"
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                placeholder="e.g. 100"
              />
              <div className="form-row" style={{ gap: 12 }}>
                <div>
                  <label style={FIELD_LABEL}>Valid from</label>
                  <input
                    type="date"
                    className="form-input-styled"
                    value={form.validFrom}
                    onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={FIELD_LABEL}>Valid until (blank = no expiry)</label>
                  <input
                    type="date"
                    className="form-input-styled"
                    value={form.validUntil}
                    onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Status */}
          <div>
            <span style={SECTION_LABEL}>Status</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={pillStyle(form.isActive)}
                onClick={() => setForm((p) => ({ ...p, isActive: true }))}
              >
                Active
              </button>
              <button
                type="button"
                style={pillStyle(!form.isActive)}
                onClick={() => setForm((p) => ({ ...p, isActive: false }))}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" size="lg" loading={saving} style={{ width: '100%' }}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
