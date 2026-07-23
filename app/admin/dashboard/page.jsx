'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2, Users, FileText, Crown, TrendingUp, ArrowRight, AlertCircle, X,
} from 'lucide-react';
import api from '../../../lib/api';
import Spinner from '../../../components/ui/Spinner';
import { formatINR } from '../../../lib/utils';
import HoverLift from '../../../components/ui/HoverLift';

const QUICK_ACTIONS = [
  {
    href:    '/admin/dashboard/vendors',
    icon:    Building2,
    label:   'Manage vendors',
    sub:     'Approve and review designer profiles',
  },
  {
    href:    '/admin/dashboard/leads',
    icon:    FileText,
    label:   'View all leads',
    sub:     'Monitor lead pipeline and assignments',
  },
  {
    href:    '/admin/dashboard/users',
    icon:    Users,
    label:   'User directory',
    sub:     'View all registered homeowners',
  },
  {
    href:    '/admin/dashboard/analytics',
    icon:    TrendingUp,
    label:   'Analytics',
    sub:     'Revenue and performance metrics',
  },
];

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const KPI_CARDS = stats ? [
    { label: 'Active vendors',        value: stats.totalVendors,        icon: Building2,  iconBg: 'var(--color-info-bg)',     iconColor: 'var(--color-info)'    },
    { label: 'Registered users',      value: stats.totalUsers,          icon: Users,      iconBg: 'var(--color-success-bg)',  iconColor: 'var(--color-success)' },
    { label: 'Total leads',           value: stats.totalLeads,          icon: FileText,   iconBg: 'var(--color-warning-bg)',  iconColor: 'var(--color-warning)' },
    { label: 'Active subscriptions',  value: stats.activeSubscriptions, icon: Crown,      iconBg: 'var(--color-accent-bg)',   iconColor: 'var(--color-primary)' },
    { label: 'Total revenue',         value: formatINR(stats.totalRevenue || 0), icon: TrendingUp, iconBg: 'var(--color-primary-bg)', iconColor: 'var(--color-primary)' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Admin dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          Platform overview and management.
        </p>
      </div>

      {/* Pending items banner */}
      {!loading && !dismissed && (stats?.pendingVendors > 0 || stats?.pendingPortfolio > 0) && (
        <div style={{
          background: 'var(--color-warning-bg)', border: '1px solid var(--color-accent-bg)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 20, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {stats.pendingVendors > 0 && (
              <Link href="/admin/dashboard/vendors?filter=pending" style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                color: 'var(--color-warning)', textDecoration: 'none',
              }}>
                <AlertCircle size={18} />
                {stats.pendingVendors} vendor verification{stats.pendingVendors === 1 ? '' : 's'} awaiting review →
              </Link>
            )}
            {stats.pendingPortfolio > 0 && (
              <Link href="/admin/dashboard/portfolio-approvals" style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                color: 'var(--color-warning)', textDecoration: 'none',
              }}>
                <AlertCircle size={18} />
                {stats.pendingPortfolio} portfolio submission{stats.pendingPortfolio === 1 ? '' : 's'} awaiting review →
              </Link>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-hint)', flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : (
        <>
          {/* KPI grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 40,
          }}>
            {KPI_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <HoverLift key={label} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: 20,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Icon size={18} color={iconColor} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300,
                  color: 'var(--color-text)', lineHeight: 1, marginBottom: 4,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--color-text-hint)',
                }}>
                  {label}
                </div>
              </HoverLift>
            ))}
          </div>

          {/* Quick actions */}
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300,
            color: 'var(--color-text)', margin: '0 0 16px',
          }}>
            Quick actions
          </h2>
          <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <HoverLift
                  className="lead-row"
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color 150ms ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Icon size={20} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--color-text-hint)" />
                </HoverLift>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
