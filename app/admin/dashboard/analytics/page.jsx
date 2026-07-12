'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Crown, FileText, Users, Building2 } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import { formatINR } from '../../../../lib/utils';

const PIPELINE_STATUSES = [
  { key: 'new',            label: 'New',             color: 'var(--color-primary)'  },
  { key: 'accepted',       label: 'Accepted',        color: 'var(--color-info)'     },
  { key: 'contacted',      label: 'Contacted',       color: 'var(--purple)'         },
  { key: 'quotation_sent', label: 'Quotation sent',  color: 'var(--color-warning)'  },
  { key: 'won',            label: 'Won',             color: 'var(--color-success)'  },
  { key: 'lost',           label: 'Lost',            color: 'var(--color-danger)'   },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 16,
};

export default function AdminAnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/analytics'),
      api.get('/admin/leads?limit=100'),
    ]).then(([statsRes, leadsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (leadsRes.status === 'fulfilled') {
        const d = leadsRes.value.data.data;
        setLeads(d.leads || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const statusBreakdown = PIPELINE_STATUSES.reduce((acc, { key }) => {
    acc[key] = leads.filter((l) => l.status === key).length;
    return acc;
  }, {});

  const totalLeadsForBars = leads.length || 1;
  const wonCount          = statusBreakdown.won || 0;
  const conversionRate    = leads.length > 0
    ? ((wonCount / leads.length) * 100).toFixed(1) + '%'
    : '0%';

  const PLATFORM_CARDS = stats ? [
    { label: 'Active vendors',       value: stats.totalVendors,        icon: Building2,  iconBg: 'var(--color-info-bg)',    iconColor: 'var(--color-info)'    },
    { label: 'Total users',          value: stats.totalUsers,          icon: Users,      iconBg: 'var(--color-success-bg)', iconColor: 'var(--color-success)' },
    { label: 'Total leads',          value: stats.totalLeads,          icon: FileText,   iconBg: 'var(--color-warning-bg)', iconColor: 'var(--color-warning)' },
    { label: 'Conversion rate',      value: conversionRate,            icon: TrendingUp, iconBg: 'var(--color-primary-bg)', iconColor: 'var(--color-primary)' },
    { label: 'Featured vendors',     value: stats.featuredCount ?? 0,  icon: Crown,      iconBg: 'var(--color-accent-bg)',  iconColor: 'var(--color-primary)' },
  ] : [];

  const planBreakdown = stats?.planBreakdown || [];
  const monthlyLeads  = stats?.monthlyLeads || [];
  const maxCount = Math.max(...monthlyLeads.map((m) => m.count), 1);

  if (loading) {
    return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 6px' }}>
          Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          Platform performance and revenue metrics.
        </p>
      </div>

      {/* Revenue section */}
      <span style={SECTION_LABEL}>Revenue</span>
      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-hint)', marginBottom: 8 }}>
            Total revenue
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--color-text)', lineHeight: 1, marginBottom: 6 }}>
            {formatINR(stats?.totalRevenue || 0)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
            From all-time subscription payments
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-hint)', marginBottom: 8 }}>
            Active subscriptions
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--color-text)', lineHeight: 1, marginBottom: 6 }}>
            {stats?.activeSubscriptions ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
            Vendors currently on a paid plan
          </div>
        </div>
      </div>

      {/* Subscription plan breakdown */}
      <span style={SECTION_LABEL}>Subscription breakdown</span>
      {planBreakdown.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
          fontSize: 13, color: 'var(--color-text-hint)', textAlign: 'center',
        }}>
          No active subscriptions yet.
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12, marginBottom: 40,
        }}>
          {planBreakdown.map(({ _id: planName, count, revenue }) => (
            <div key={planName} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 6 }}>
                {planName || 'Unknown'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--color-text)', lineHeight: 1, marginBottom: 4 }}>
                {count}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)' }}>
                {formatINR(revenue || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly leads bar chart */}
      <span style={SECTION_LABEL}>Leads per month (last 6 months)</span>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
      }}>
        {monthlyLeads.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
            No lead data for the last 6 months.
          </p>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {monthlyLeads.map(({ _id, count }) => {
              const barHeightPct = (count / maxCount) * 100;
              return (
                <div
                  key={`${_id.year}-${_id.month}`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 2 }}>
                    {count}
                  </div>
                  <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%',
                      height: `${barHeightPct}%`,
                      minHeight: count > 0 ? 4 : 0,
                      background: 'var(--color-primary)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 600ms ease-out',
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-hint)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {MONTHS[_id.month - 1]} {String(_id.year).slice(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead pipeline section */}
      <span style={SECTION_LABEL}>Lead pipeline</span>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
      }}>
        {leads.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
            No lead data available yet.
          </p>
        ) : (
          PIPELINE_STATUSES.map(({ key, label, color }) => {
            const count = statusBreakdown[key] || 0;
            const pct   = (count / totalLeadsForBars) * 100;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ minWidth: 120, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                  {label}
                </div>
                <div style={{ flex: 1, background: 'var(--color-surface-alt)', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${pct}%`, minWidth: pct > 0 ? 4 : 0, background: color, borderRadius: 4, height: 8, transition: 'width 400ms ease-out' }} />
                </div>
                <div style={{ minWidth: 40, fontSize: 13, fontWeight: 500, color: 'var(--color-text-sub)', textAlign: 'right' }}>
                  {count}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Platform stats section */}
      <span style={SECTION_LABEL}>Platform overview</span>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12,
      }}>
        {PLATFORM_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: 20,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={18} color={iconColor} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--color-text)', lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-hint)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
