'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate, getInitials } from '@/lib/utils';

const COL = {
  vendor:  { flex: 2 },
  plan:    { flex: 1 },
  status:  { flex: 1 },
  period:  { flex: 1.5 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
};

export default function AdminSubscriptionsPage() {
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/admin/vendors')
      .then(({ data }) => {
        const all = data.data?.vendors || [];
        setVendors(all.filter((v) => v.subscriptionId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: 'var(--color-text)', margin: '0 0 4px' }}>
            Subscriptions
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: 0 }}>
            {loading ? '…' : `${vendors.length} active subscription${vendors.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Spinner size={28} />
        </div>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <CreditCard size={48} color="var(--color-text-hint)" />
          <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--color-text-hint)' }}>
            No active subscriptions yet.
          </p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div style={{
            display: 'flex', gap: '12px',
            padding: '10px 16px', marginBottom: '8px',
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ ...COL.vendor,  ...HEADER_CELL }}>VENDOR</div>
            <div style={{ ...COL.plan,    ...HEADER_CELL }}>PLAN</div>
            <div style={{ ...COL.status,  ...HEADER_CELL }}>STATUS</div>
            <div style={{ ...COL.period,  ...HEADER_CELL }}>PERIOD</div>
          </div>

          {vendors.map((vendor) => {
            const sub     = vendor.subscriptionId || {};
            const user    = vendor.userId || {};
            const isActive = sub.isActive ?? vendor.isListingEnabled;

            return (
              <div
                key={vendor._id}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'center',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px', marginBottom: '8px',
                }}
              >
                {/* Vendor */}
                <div style={{ ...COL.vendor, display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--primary-bg)', color: 'var(--primary)',
                    fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getInitials(vendor.businessName || 'V')}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {vendor.businessName}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-hint)', margin: 0, fontFamily: 'monospace' }}>
                      {user.email || vendor.location?.city || '—'}
                    </p>
                  </div>
                </div>

                {/* Plan */}
                <div style={{ ...COL.plan }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '3px 10px',
                    background: 'var(--primary-bg)', color: 'var(--primary)',
                    borderRadius: '20px',
                  }}>
                    {sub.planName || 'Basic'}
                  </span>
                </div>

                {/* Status */}
                <div style={{ ...COL.status }}>
                  <Badge
                    label={isActive ? 'Active' : 'Expired'}
                    variant={isActive ? 'success' : 'danger'}
                  />
                </div>

                {/* Period */}
                <div style={{ ...COL.period }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-sub)', margin: '0 0 2px' }}>
                    {sub.startDate ? formatDate(sub.startDate) : '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-hint)', margin: 0 }}>
                    → {sub.endDate ? formatDate(sub.endDate) : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </>
      )}
    </DashboardLayout>
  );
}
