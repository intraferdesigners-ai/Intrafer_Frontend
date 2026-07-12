'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Award, Target, Star, ArrowRight, AlertCircle, CheckCircle,
} from 'lucide-react';
import api from '../../../lib/api';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import OnboardingChecklist from '../../../components/vendor/OnboardingChecklist';
import { formatDate } from '../../../lib/utils';

const LABEL = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
};

export default function VendorDashboard() {
  const [analytics,    setAnalytics]    = useState(null);
  const [leads,        setLeads]        = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [vendor,       setVendor]       = useState(null);
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/vendor/analytics'),
      api.get('/leads/vendor?limit=5'),
      api.get('/subscriptions/my-plan'),
      api.get('/vendor/profile'),
      api.get('/vendor/projects'),
    ]).then(([aRes, lRes, sRes, vRes, pRes]) => {
      if (aRes.status === 'fulfilled') setAnalytics(aRes.value.data.data);
      if (lRes.status === 'fulfilled') {
        const d = lRes.value.data.data;
        setLeads(Array.isArray(d) ? d : d.leads || []);
      }
      if (sRes.status === 'fulfilled') setSubscription(sRes.value.data.data);
      if (vRes.status === 'fulfilled') setVendor(vRes.value.data.data?.vendor);
      if (pRes.status === 'fulfilled') {
        const d = pRes.value.data.data;
        setProjects(Array.isArray(d) ? d : d.projects || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: 'Total leads', value: analytics?.totalLeads ?? '—', icon: Target },
    { label: 'Won',         value: analytics?.wonLeads ?? '—',   icon: Award  },
    { label: 'Win rate',    value: analytics?.winRate  ?? '—',   icon: TrendingUp },
    { label: 'Rating',      value: analytics?.rating   || 'New', icon: Star  },
  ];

  return (
    <div>
      {/* Page header */}
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 24px',
      }}>
        Dashboard
      </h1>

      {/* Subscription banner */}
      {!loading && (
        <>
          {!subscription?.isActive ? (
            <div style={{
              background: 'var(--color-warning-bg)', border: '1px solid var(--color-accent-bg)',
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, marginBottom: 20, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-warning)' }}>
                <AlertCircle size={18} />
                Your listing is not active. Subscribe to receive leads.
              </div>
              <Link href="/vendor/dashboard/subscription">
                <button style={{
                  padding: '8px 16px', fontSize: 12, fontWeight: 600,
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}>
                  Subscribe now →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-success-bg)',
              borderRadius: 'var(--radius-lg)', padding: '12px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, marginBottom: 20, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-success)' }}>
                <CheckCircle size={16} />
                <span>
                  <strong>{subscription.subscription?.planName || 'Active Plan'}</strong>
                  {subscription.subscription?.endDate && (
                    <> &middot; Active until {formatDate(subscription.subscription.endDate)}</>
                  )}
                </span>
              </div>
              <Link
                href="/vendor/dashboard/subscription"
                style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 500, textDecoration: 'none' }}
              >
                Manage plan
              </Link>
            </div>
          )}
        </>
      )}

      {/* Onboarding checklist */}
      {!loading && (
        <OnboardingChecklist vendor={vendor} projects={projects} subscription={subscription} />
      )}

      {/* Lead credits bar */}
      {!loading && analytics?.creditsTotal > 0 && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                Lead credits this month
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
                {analytics.creditsRemaining} of {analytics.creditsTotal} remaining
              </span>
            </div>
            <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 8 }}>
              <div style={{
                background: analytics.creditsRemaining === 0 ? 'var(--color-danger)' : 'var(--color-primary)',
                width: `${Math.min(100, (analytics.creditsUsed / analytics.creditsTotal) * 100)}%`,
                borderRadius: 4, height: '100%', transition: 'width 600ms ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-hint)', marginTop: 4 }}>
              {analytics.creditsRemaining === 0
                ? 'No credits left — upgrade your plan to accept more leads this month'
                : `${analytics.creditsUsed} leads accepted · resets on plan renewal`}
            </div>
          </div>
          {analytics.creditsRemaining === 0 && (
            <Link href="/vendor/dashboard/subscription">
              <Button variant="primary" size="sm">Upgrade plan</Button>
            </Link>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12, marginBottom: 36,
      }}>
        {STATS.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center',
          }}>
            <Icon size={20} color="var(--color-primary)" style={{ marginBottom: 8 }} />
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300,
              color: 'var(--color-text)', lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{ ...LABEL, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300,
          color: 'var(--color-text)', margin: 0,
        }}>
          Recent leads
        </h2>
        <Link
          href="/vendor/dashboard/leads"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '32px 0' }}><Spinner size="md" /></div>
      ) : leads.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No leads yet. Make sure your profile is complete and listing is active.
        </div>
      ) : (
        leads.map((lead) => (
          <Link key={lead._id} href={`/vendor/dashboard/leads/${lead._id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'border-color 150ms ease-out',
            }}
              className="lead-row"
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                  ENQ-{lead._id?.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                  {lead.projectType}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                  {[lead.city, lead.budget].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <Badge status={lead.status} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                  {formatDate(lead.createdAt)}
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
