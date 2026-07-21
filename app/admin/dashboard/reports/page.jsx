'use client';

import { useEffect, useState } from 'react';
import { IndianRupee, TicketPercent, TrendingUp, Receipt, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatINR } from '../../../../lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 16,
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 12);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

export default function AdminReportsPage() {
  const [range,      setRange]      = useState(defaultRange);
  const [appliedRange, setAppliedRange] = useState(range);
  const [report,     setReport]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/reports/revenue?from=${appliedRange.from}&to=${appliedRange.to}`)
      .then(({ data }) => setReport(data.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [appliedRange]);

  const handleApply = () => setAppliedRange(range);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get(
        `/admin/reports/revenue/export?from=${appliedRange.from}&to=${appliedRange.to}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'revenue-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export report.');
    }
    setExporting(false);
  };

  const summary  = report?.summary || {};
  const monthly  = report?.monthly || [];
  const byPlan   = report?.byPlan  || [];
  const topCoupons = report?.topCoupons || [];
  const maxNetRevenue = Math.max(...monthly.map((m) => m.netRevenue), 1);

  const SUMMARY_CARDS = [
    { label: 'Gross revenue',    value: formatINR(summary.grossRevenue || 0),  icon: TrendingUp,     iconBg: 'var(--color-primary-bg)', iconColor: 'var(--color-primary)' },
    { label: 'Discounts given',  value: formatINR(summary.totalDiscounts || 0), icon: TicketPercent, iconBg: 'var(--color-warning-bg)', iconColor: 'var(--color-warning)' },
    { label: 'Net revenue',      value: formatINR(summary.netRevenue || 0),    icon: IndianRupee,    iconBg: 'var(--color-success-bg)', iconColor: 'var(--color-success)' },
    { label: 'Transactions',     value: summary.transactionCount ?? 0,          icon: Receipt,        iconBg: 'var(--color-info-bg)',    iconColor: 'var(--color-info)'    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 6px' }}>
            Revenue &amp; Reports
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
            Subscription revenue for a selected date range, exportable as CSV.
          </p>
        </div>
        <Button variant="secondary" size="sm" loading={exporting} onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Date range control */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 16, marginBottom: 32,
      }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-sub)', marginBottom: 6 }}>
            From
          </label>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            style={{
              padding: '9px 12px', fontSize: 13,
              background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
              fontFamily: 'var(--font-ui)',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-sub)', marginBottom: 6 }}>
            To
          </label>
          <input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            style={{
              padding: '9px 12px', fontSize: 13,
              background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
              fontFamily: 'var(--font-ui)',
            }}
          />
        </div>
        <Button variant="primary" size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : (
        <>
          {/* Summary cards */}
          <span style={SECTION_LABEL}>Summary</span>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12, marginBottom: 40,
          }}>
            {SUMMARY_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <div key={label} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: 20,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={18} color={iconColor} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 4 }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-hint)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue per month bar chart */}
          <span style={SECTION_LABEL}>Revenue per month</span>
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
          }}>
            {monthly.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0, textAlign: 'center' }}>
                No revenue data for this range.
              </p>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {monthly.map(({ year, month, netRevenue }) => {
                  const barHeightPct = (netRevenue / maxNetRevenue) * 100;
                  return (
                    <div
                      key={`${year}-${month}`}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 2, whiteSpace: 'nowrap' }}>
                        {formatINR(netRevenue)}
                      </div>
                      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                          width: '100%',
                          height: `${barHeightPct}%`,
                          minHeight: netRevenue > 0 ? 4 : 0,
                          background: 'var(--color-primary)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 600ms ease-out',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-hint)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {MONTHS[month - 1]} {String(year).slice(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revenue by plan */}
          <span style={SECTION_LABEL}>Revenue by plan</span>
          {byPlan.length === 0 ? (
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 40,
              fontSize: 13, color: 'var(--color-text-hint)', textAlign: 'center',
            }}>
              No subscriptions in this range.
            </div>
          ) : (
            <div style={{ marginBottom: 40 }}>
              <div className="admin-table-header" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
              }}>
                <div style={{ ...HEADER_CELL, flex: 2 }}>Plan</div>
                <div style={{ ...HEADER_CELL, flex: 1 }}>Transactions</div>
                <div style={{ ...HEADER_CELL, flex: 1.5 }}>Gross Revenue</div>
                <div style={{ ...HEADER_CELL, flex: 1.5 }}>Net Revenue</div>
              </div>
              {byPlan.map((p) => (
                <div
                  key={p.planName}
                  className="admin-table-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 2, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                    {p.planName || 'Unknown'}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                    {p.transactionCount}
                  </div>
                  <div style={{ flex: 1.5, fontSize: 13, color: 'var(--color-text-sub)' }}>
                    {formatINR(p.grossRevenue || 0)}
                  </div>
                  <div style={{ flex: 1.5, fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>
                    {formatINR(p.netRevenue || 0)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top coupons */}
          <span style={SECTION_LABEL}>Top coupons</span>
          {topCoupons.length === 0 ? (
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 24,
              fontSize: 13, color: 'var(--color-text-hint)', textAlign: 'center',
            }}>
              No coupons used in this range.
            </div>
          ) : (
            <div>
              <div className="admin-table-header" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
              }}>
                <div style={{ ...HEADER_CELL, flex: 2 }}>Coupon code</div>
                <div style={{ ...HEADER_CELL, flex: 1 }}>Uses</div>
                <div style={{ ...HEADER_CELL, flex: 1.5 }}>Discount given</div>
              </div>
              {topCoupons.map((c) => (
                <div
                  key={c.couponCode}
                  className="admin-table-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 2, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                    {c.couponCode}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                    {c.useCount}
                  </div>
                  <div style={{ flex: 1.5, fontSize: 13, fontWeight: 500, color: 'var(--color-warning)' }}>
                    {formatINR(c.totalDiscountGiven || 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
