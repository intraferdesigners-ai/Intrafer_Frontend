'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, Clock, CheckCircle, TrendingUp, Inbox } from 'lucide-react';
import api from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { formatRelativeTime } from '../../../lib/utils';

const LABEL = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
};

const STAT_ICONS = [Inbox, Clock, TrendingUp, CheckCircle];
const STAT_COLORS = ['var(--color-primary)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-success)'];

export default function UserDashboard() {
  const { user } = useAuthStore();

  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({ total: 0, new: 0, active: 0, closed: 0 });

  useEffect(() => {
    api.get('/leads/user')
      .then(({ data }) => {
        const list = data.data?.leads || [];
        setLeads(list);
        setStats({
          total:  list.length,
          new:    list.filter((l) => l.status === 'new').length,
          active: list.filter((l) => ['accepted', 'contacted', 'quotation_sent'].includes(l.status)).length,
          closed: list.filter((l) => ['won', 'lost'].includes(l.status)).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: 'Total enquiries', value: stats.total  },
    { label: 'Awaiting response', value: stats.new   },
    { label: 'In progress',       value: stats.active },
    { label: 'Closed',            value: stats.closed },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: 0 }}>
          Here&apos;s an overview of your interior design enquiries.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 40,
      }}>
        {STAT_CARDS.map((card, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div key={card.label} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center',
            }}>
              <Icon size={20} color={STAT_COLORS[i]} style={{ marginBottom: 8 }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
                color: 'var(--color-text)', lineHeight: 1, marginBottom: 4,
              }}>
                {card.value}
              </div>
              <div style={LABEL}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}>
          <Spinner size="md" />
        </div>
      ) : (
        <>
          {/* Recent enquiries heading */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300,
              color: 'var(--color-text)', margin: 0,
            }}>
              Recent enquiries
            </h2>
            <Link
              href="/user/dashboard/enquiries"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {leads.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '56px 24px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <FileText size={40} color="var(--color-text-hint)" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 6px' }}>
                No enquiries yet
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 24px' }}>
                Browse designers and submit your first enquiry.
              </p>
              <Link href="/vendors">
                <button style={{
                  padding: '10px 24px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)', color: '#fff',
                  fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                }}>
                  Browse designers
                </button>
              </Link>
            </div>
          ) : (
            leads.slice(0, 5).map((lead) => (
              <Link
                key={lead._id}
                href={`/user/dashboard/enquiries/${lead._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="lead-row" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
                  transition: 'border-color 150ms ease-out',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--color-text-hint)', letterSpacing: '0.06em',
                      textTransform: 'uppercase', marginBottom: 2,
                    }}>
                      {lead._id?.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                      {lead.projectType}
                    </div>
                    {lead.vendorId?.businessName && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                        {lead.vendorId.businessName}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Badge status={lead.status} />
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--color-text-hint)',
                    }}>
                      {formatRelativeTime(lead.createdAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </>
      )}
    </div>
  );
}
