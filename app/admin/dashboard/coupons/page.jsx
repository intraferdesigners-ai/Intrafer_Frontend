'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, formatINR } from '../../../../lib/utils';

const COL = {
  code:     { flex: 2 },
  discount: { flex: 1 },
  usage:    { flex: 1 },
  validity: { flex: 2 },
  status:   { flex: 1 },
  actions:  { flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

function formatDiscount(coupon) {
  return coupon.discountType === 'percentage'
    ? `${coupon.discountValue}% off`
    : `${formatINR(coupon.discountValue)} off`;
}

function formatValidity(coupon) {
  const from = coupon.validFrom ? formatDate(coupon.validFrom) : null;
  const until = coupon.validUntil ? formatDate(coupon.validUntil) : 'No expiry';
  return from ? `${from} – ${until}` : until;
}

export default function AdminCouponsPage() {
  const [coupons,    setCoupons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/admin/coupons')
      .then(({ data }) => setCoupons(data.data?.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleToggleActive = async (coupon) => {
    setTogglingId(coupon._id);
    try {
      const { data } = await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      const updated = data.data?.coupon;
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? updated : c)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update coupon.');
    }
    setTogglingId(null);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setDeletingId(coupon._id);
    try {
      await api.delete(`/admin/coupons/${coupon._id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      toast.success('Coupon deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon.');
    }
    setDeletingId(null);
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Coupons
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {coupons.length} total
            </span>
          )}
        </div>
        <Link href="/admin/dashboard/coupons/new">
          <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New coupon
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No coupons yet. Create your first one.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.code.flex }}>Code</div>
            <div style={{ ...HEADER_CELL, flex: COL.discount.flex }}>Discount</div>
            <div style={{ ...HEADER_CELL, flex: COL.usage.flex }}>Usage</div>
            <div style={{ ...HEADER_CELL, flex: COL.validity.flex }}>Validity</div>
            <div style={{ ...HEADER_CELL, flex: COL.status.flex }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: COL.actions.flex, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Data rows */}
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Code */}
              <div style={{ flex: COL.code.flex, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                  {coupon.code}
                </div>
                {coupon.applicablePlans?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                    {coupon.applicablePlans.join(', ')}
                  </div>
                )}
              </div>

              {/* Discount */}
              <div style={{ flex: COL.discount.flex }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>{formatDiscount(coupon)}</span>
              </div>

              {/* Usage */}
              <div style={{ flex: COL.usage.flex }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                  {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                </span>
              </div>

              {/* Validity */}
              <div style={{ flex: COL.validity.flex }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{formatValidity(coupon)}</span>
              </div>

              {/* Status toggle */}
              <div style={{ flex: COL.status.flex }}>
                <button
                  type="button"
                  disabled={togglingId === coupon._id}
                  onClick={() => handleToggleActive(coupon)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    opacity: togglingId === coupon._id ? 0.6 : 1,
                  }}
                >
                  {coupon.isActive
                    ? <CheckCircle size={12} color="var(--color-success)" />
                    : <XCircle size={12} color="var(--color-text-hint)" />
                  }
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: coupon.isActive ? 'var(--color-success)' : 'var(--color-text-hint)',
                  }}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>

              {/* Actions */}
              <div style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end', gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/dashboard/coupons/${coupon._id}/edit`}>
                  <button
                    type="button"
                    title="Edit"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <Pencil size={13} color="var(--color-text-sub)" />
                  </button>
                </Link>
                <button
                  type="button"
                  title="Delete"
                  disabled={deletingId === coupon._id}
                  onClick={() => handleDelete(coupon)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-danger-bg)', border: '1px solid transparent',
                    cursor: 'pointer', opacity: deletingId === coupon._id ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={13} color="var(--color-danger)" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
