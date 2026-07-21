'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, formatINR } from '../../../../lib/utils';

const STATUS_BADGE = {
  pending:   { label: 'Pending',   bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)'   },
  active:    { label: 'Active',    bg: 'var(--color-success-bg)',  color: 'var(--color-success)'   },
  expired:   { label: 'Expired',   bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
  cancelled: { label: 'Cancelled', bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)'    },
  failed:    { label: 'Failed',    bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)'    },
};

const STATUS_OPTIONS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'Active' },
  { value: 'expired',   label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed',    label: 'Failed' },
];

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const INPUT_STYLE = {
  padding: '9px 12px', fontSize: 13,
  background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading,        setLoading]      = useState(true);
  const [page,           setPage]         = useState(1);
  const [totalPages,     setTotalPages]   = useState(1);
  const [total,          setTotal]        = useState(0);

  const [status,         setStatus]         = useState('');
  const [planNameInput,  setPlanNameInput]  = useState('');
  const [planName,       setPlanName]       = useState('');
  const [searchInput,    setSearchInput]    = useState('');
  const [search,         setSearch]         = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '15', page: String(page) });
    if (status) params.set('status', status);
    if (planName) params.set('planName', planName);
    if (search) params.set('search', search);
    api.get(`/admin/subscriptions?${params}`)
      .then(({ data }) => {
        const d = data.data;
        setSubscriptions(d.subscriptions || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
      })
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  }, [status, planName, search, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPlanName(planNameInput.trim());
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
          Subscriptions &amp; payments
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
            {total} total
          </span>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={status} onChange={handleStatusChange} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="text"
          value={planNameInput}
          onChange={(e) => setPlanNameInput(e.target.value)}
          placeholder="Plan name…"
          style={{ ...INPUT_STYLE, width: 160 }}
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by vendor…"
          style={{ ...INPUT_STYLE, width: 200 }}
        />
        <Button type="submit" variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={14} /> Apply
        </Button>
      </form>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : subscriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No subscriptions found.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: 1.6 }}>Vendor</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Plan</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Price</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: 0.9 }}>Coupon</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Start</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>End</div>
            <div style={{ ...HEADER_CELL, flex: 1.6 }}>Payment ID</div>
          </div>

          {subscriptions.map((sub) => {
            const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;
            return (
              <div
                key={sub._id}
                className="admin-table-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                {/* Vendor */}
                <div style={{ flex: 1.6, minWidth: 140, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                  {sub.vendorId?.businessName || 'Unknown vendor'}
                </div>

                {/* Plan */}
                <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                  {sub.planName}
                </div>

                {/* Price */}
                <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                  {formatINR(sub.planPrice)}
                </div>

                {/* Status */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 8px',
                    borderRadius: 20, color: badge.color, background: badge.bg,
                  }}>
                    {badge.label}
                  </span>
                </div>

                {/* Coupon */}
                <div style={{ flex: 0.9, fontSize: 12, color: 'var(--color-text-hint)' }}>
                  {sub.couponCode || '—'}
                </div>

                {/* Start date */}
                <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-hint)' }}>
                  {sub.startDate ? formatDate(sub.startDate) : '—'}
                </div>

                {/* End date */}
                <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-hint)' }}>
                  {sub.endDate ? formatDate(sub.endDate) : '—'}
                </div>

                {/* Razorpay payment ID */}
                <div style={{
                  flex: 1.6, fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--color-text-hint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {sub.razorpayPaymentId || '—'}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
