'use client';

import { useEffect, useState } from 'react';
import { Users, Phone, Mail, TrendingUp } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase', padding: '10px 16px',
};

const TABLE_CELL = {
  fontSize: 13, color: 'var(--text)', padding: '12px 16px',
  borderTop: '1px solid var(--border)',
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 20;

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const [visRes, statsRes] = await Promise.all([
        api.get(`/visitor/all?page=${p}&limit=${LIMIT}`),
        api.get('/visitor/stats'),
      ]);
      setVisitors(visRes.data.data?.visitors || []);
      setTotal(visRes.data.data?.total || 0);
      setStats(statsRes.data.data || null);
    } catch {
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const exportCSV = () => {
    const rows = [
      ['Name', 'Contact', 'Contact Type', 'City', 'Vendors Viewed', 'Joined'],
      ...visitors.map(v => [
        v.name,
        v.contact,
        v.contactType,
        v.city,
        v.vendorInterests?.length || 0,
        formatDate(v.createdAt),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `visitors-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
              color: 'var(--text)', margin: 0,
            }}>Visitors</h1>
            {!loading && (
              <span style={{
                fontSize: 13, color: 'var(--text-hint)',
                background: 'var(--bg-parchment)', padding: '2px 10px',
                borderRadius: 20, fontWeight: 500,
              }}>{total} identified</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-hint)', margin: 0 }}>
            Visitors who submitted the lead capture form.
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            padding: '8px 16px', background: 'var(--primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* KPI cards */}
      {stats && (
        <div className="stats-grid-4" style={{
          gap: 16, marginBottom: 28,
        }}>
          {[
            { label: 'Total sessions',  value: stats.totalVisitors,  icon: Users,     color: 'var(--primary)' },
            { label: 'Identified',      value: stats.identified,     icon: TrendingUp, color: 'var(--success)' },
            { label: 'Phone contacts',  value: stats.phoneContacts,  icon: Phone,     color: '#F59E0B'         },
            { label: 'Email contacts',  value: stats.emailContacts,  icon: Mail,      color: '#8B5CF6'         },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)', padding: '20px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: kpi.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={kpi.color} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--success)',
                    background: 'var(--success-bg)', padding: '2px 8px', borderRadius: 20,
                  }}>{stats.conversionRate}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 6 }}>{kpi.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Top vendors table */}
        {stats?.topVendors?.length > 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Top viewed vendors</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-parchment)' }}>
                  <th style={{ ...HEADER_CELL, textAlign: 'left' }}>Vendor</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'right' }}>Clicks</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'right' }}>Unique</th>
                </tr>
              </thead>
              <tbody>
                {stats.topVendors.map((v, i) => (
                  <tr key={i}>
                    <td style={{ ...TABLE_CELL }}>{v.name || '—'}</td>
                    <td style={{ ...TABLE_CELL, textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{v.totalClicks}</td>
                    <td style={{ ...TABLE_CELL, textAlign: 'right', color: 'var(--text-mid)' }}>{v.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* City breakdown */}
        {stats?.cityBreakdown?.length > 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: '20px',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
              By city
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.cityBreakdown.map(c => (
                <div key={c._id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--primary-bg)', borderRadius: 20,
                  padding: '5px 12px', fontSize: 12, color: 'var(--primary)',
                  border: '1px solid var(--primary-light)',
                }}>
                  <span style={{ fontWeight: 600 }}>{c._id}</span>
                  <span style={{ color: 'var(--text-hint)' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visitors table */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><Spinner /></div>
        ) : visitors.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-hint)', fontSize: 14 }}>
            No identified visitors yet.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-parchment)' }}>
                  <th style={{ ...HEADER_CELL, textAlign: 'left' }}>Name</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'left' }}>Contact</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'left' }}>City</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'center' }}>Vendors viewed</th>
                  <th style={{ ...HEADER_CELL, textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v._id} style={{ cursor: 'default' }}>
                    <td style={{ ...TABLE_CELL, fontWeight: 500 }}>{v.name || '—'}</td>
                    <td style={{ ...TABLE_CELL }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {v.contactType === 'phone'
                          ? <Phone size={12} color="var(--text-hint)" />
                          : v.contactType === 'email'
                            ? <Mail size={12} color="var(--text-hint)" />
                            : null}
                        <span>{v.contact || '—'}</span>
                      </div>
                    </td>
                    <td style={{ ...TABLE_CELL, color: 'var(--text-mid)' }}>{v.city || '—'}</td>
                    <td style={{ ...TABLE_CELL, textAlign: 'center' }}>
                      {v.vendorInterests?.length > 0 ? (
                        <span style={{
                          background: 'var(--primary-bg)', color: 'var(--primary)',
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        }}>
                          {v.vendorInterests.length}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ ...TABLE_CELL, color: 'var(--text-hint)', fontSize: 12 }}>
                      {formatDate(v.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > LIMIT && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '16px',
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: page === 1 ? 'var(--text-hint)' : 'var(--text)',
                    cursor: page === 1 ? 'default' : 'pointer', fontSize: 13,
                  }}
                >← Prev</button>
                <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>
                  Page {page} of {Math.ceil(total / LIMIT)}
                </span>
                <button
                  disabled={page >= Math.ceil(total / LIMIT)}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: page >= Math.ceil(total / LIMIT) ? 'var(--text-hint)' : 'var(--text)',
                    cursor: page >= Math.ceil(total / LIMIT) ? 'default' : 'pointer', fontSize: 13,
                  }}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
