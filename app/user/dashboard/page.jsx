'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle, TrendingUp, Inbox, X } from 'lucide-react';
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

function EnquirySuccessBanner() {
  const searchParams   = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('enquiry') === 'success') setShow(true);
  }, [searchParams]);

  if (!show) return null;

  return (
    <div style={{
      background: 'var(--color-success-bg)', border: '1px solid var(--color-success)',
      borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: '24px',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <CheckCircle size={36} color="var(--color-success)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px' }}>
          Enquiry submitted successfully! 🎉
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-sub)', margin: '0 0 2px' }}>
          Your designer will review and respond within 48 hours.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-hint)', margin: 0 }}>
          Check your enquiries below to track the status.
        </p>
      </div>
      <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)', flexShrink: 0 }}>
        <X size={18} />
      </button>
    </div>
  );
}

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
    { label: 'Total enquiries',  value: stats.total  },
    { label: 'Awaiting response', value: stats.new   },
    { label: 'In progress',       value: stats.active },
    { label: 'Closed',            value: stats.closed },
  ];

  return (
    <div>
      <Suspense fallback={null}>
        <EnquirySuccessBanner />
      </Suspense>

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
          {/* Section heading */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
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
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: '48px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
                color: 'var(--color-text)', margin: '0 0 8px',
              }}>
                Start your interior design journey
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: '0 0 32px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                Connect with expert interior designers in your city and transform your space.
              </p>

              {/* 3-step guide */}
              <div className="stats-grid-3" style={{
                marginBottom: 32, maxWidth: 480, margin: '0 auto 32px',
              }}>
                {[
                  { step: '1', title: 'Browse designers', desc: 'Explore portfolios and find your style' },
                  { step: '2', title: 'Submit enquiry',   desc: 'Share your requirements and budget'    },
                  { step: '3', title: 'Get connected',    desc: 'Designer reaches out within 48 hours'  },
                ].map(({ step, title, desc }) => (
                  <div key={step} style={{
                    padding: '16px 12px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                      fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 10px',
                    }}>
                      {step}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 4 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>{desc}</div>
                  </div>
                ))}
              </div>

              <Link href="/vendors">
                <button style={{
                  padding: '12px 28px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)', color: '#fff',
                  fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}>
                  Browse designers →
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
                  <div style={{
                    textAlign: 'right', display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-end', gap: 6,
                  }}>
                    <Badge status={lead.status} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
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
