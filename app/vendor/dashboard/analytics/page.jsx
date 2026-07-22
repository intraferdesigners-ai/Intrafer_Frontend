'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FUNNEL_LABELS = {
  new:            { label: 'New',             color: 'var(--color-primary)'  },
  contacted:      { label: 'Contacted',       color: 'var(--purple)'         },
  quotation_sent: { label: 'Quotation sent',  color: 'var(--color-warning)'  },
  accepted:       { label: 'Accepted',        color: 'var(--color-info)'     },
  won:            { label: 'Won',             color: 'var(--color-success)'  },
  lost:           { label: 'Lost',            color: 'var(--color-danger)'   },
};

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 16,
};

const CARD = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
};

export default function VendorAnalyticsDetailPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/analytics/detail')
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;
  }

  const monthlyLeads     = data?.monthlyLeads || [];
  const funnel           = data?.funnel || [];
  const topProjectTypes  = data?.topProjectTypes || [];
  const cities           = data?.cities || [];
  const avgResponseHours = data?.avgResponseHours;

  const maxMonthlyCount = Math.max(...monthlyLeads.map((m) => m.count), 1);
  const totalFunnelLeads = funnel.reduce((sum, f) => sum + f.count, 0) || 1;
  const hasAnyLeads = totalFunnelLeads > 0 && funnel.some((f) => f.count > 0);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          How your leads are performing over time.
        </p>
      </div>

      {!hasAnyLeads ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No leads yet. Analytics will appear here once you start receiving leads.
        </div>
      ) : (
        <>
          {/* Average response time */}
          <span style={SECTION_LABEL}>Average response time</span>
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 40,
            maxWidth: 260,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <Clock size={18} color="var(--color-primary)" />
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300,
              color: 'var(--color-text)', lineHeight: 1, marginBottom: 4,
            }}>
              {avgResponseHours != null ? `${avgResponseHours.toFixed(1)} hours` : 'Not enough data yet'}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-hint)' }}>
              Time to first response
            </div>
          </div>

          {/* Monthly leads bar chart */}
          <span style={SECTION_LABEL}>Leads per month (last 6 months)</span>
          <div style={CARD}>
            {monthlyLeads.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
                No lead data for the last 6 months.
              </p>
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {monthlyLeads.map(({ _id, count }) => {
                  const barHeightPct = (count / maxMonthlyCount) * 100;
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

          {/* Conversion funnel */}
          <span style={SECTION_LABEL}>Conversion funnel</span>
          <div style={CARD}>
            {funnel.map(({ status, count }) => {
              const meta = FUNNEL_LABELS[status] || { label: status, color: 'var(--color-primary)' };
              const pct  = (count / totalFunnelLeads) * 100;
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ minWidth: 120, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                    {meta.label}
                  </div>
                  <div style={{ flex: 1, background: 'var(--color-surface-alt)', borderRadius: 4, height: 8 }}>
                    <div style={{ width: `${pct}%`, minWidth: pct > 0 ? 4 : 0, background: meta.color, borderRadius: 4, height: 8, transition: 'width 400ms ease-out' }} />
                  </div>
                  <div style={{ minWidth: 40, fontSize: 13, fontWeight: 500, color: 'var(--color-text-sub)', textAlign: 'right' }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top project types + Cities */}
          <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <span style={SECTION_LABEL}>Top project types requested</span>
              <div style={CARD}>
                {topProjectTypes.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
                    No project type data yet.
                  </p>
                ) : (
                  topProjectTypes.map(({ _id, count }, i) => (
                    <div key={_id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{_id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <span style={SECTION_LABEL}>Cities</span>
              <div style={CARD}>
                {cities.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
                    No city data yet.
                  </p>
                ) : (
                  cities.map(({ _id, count }, i) => (
                    <div key={_id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{_id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
