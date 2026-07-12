'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import api from '../../../../lib/api';
import Badge from '../../../../components/ui/Badge';
import Spinner from '../../../../components/ui/Spinner';
import { formatRelativeTime } from '../../../../lib/utils';

const FILTERS = [
  { key: 'all',    label: 'All'    },
  { key: 'new',    label: 'New'    },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
];

const ACTIVE_STATUSES = new Set(['accepted', 'contacted', 'quotation_sent']);
const CLOSED_STATUSES = new Set(['won', 'lost', 'cancelled']);

function matchFilter(lead, filter) {
  if (filter === 'all')    return true;
  if (filter === 'new')    return lead.status === 'new';
  if (filter === 'active') return ACTIVE_STATUSES.has(lead.status);
  if (filter === 'closed') return CLOSED_STATUSES.has(lead.status);
  return true;
}

export default function EnquiriesPage() {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    api.get('/leads/user')
      .then(({ data }) => {
        const list = data.data?.leads || [];
        setLeads(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((l) => matchFilter(l, filter));

  const tabStyle = (key) => key === filter
    ? {
        background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
        border: '1px solid var(--color-accent)', borderRadius: 20,
        padding: '6px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }
    : {
        background: 'transparent', color: 'var(--color-text-hint)',
        border: '1px solid transparent', borderRadius: 20,
        padding: '6px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          My enquiries
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: 0 }}>
          All your designer enquiries in one place.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(key)} onClick={() => setFilter(key)}>
            {label}
            {key === 'all' && leads.length > 0 && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>({leads.length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <FileText size={40} color="var(--color-text-hint)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 4px' }}>
            No {filter === 'all' ? '' : filter + ' '}enquiries
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0 }}>
            {filter === 'all' ? 'Submit an enquiry to get started.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        filtered.map((lead) => (
          <div
            key={lead._id}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 12,
            }}
          >
            {/* Top row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                ENQ-{lead._id?.slice(-8).toUpperCase()}
              </span>
              <Badge status={lead.status} />
            </div>

            {/* Project type + vendor */}
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px' }}>
              {lead.projectType}
            </p>
            {lead.vendorId?.businessName && (
              <p style={{ fontSize: 12, color: 'var(--color-text-sub)', margin: '0 0 12px' }}>
                {lead.vendorId.businessName}
              </p>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
              {lead.city && (
                <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>📍 {lead.city}</span>
              )}
              {lead.budget && (
                <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>💰 {lead.budget}</span>
              )}
              <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                🕐 {formatRelativeTime(lead.createdAt)}
              </span>
            </div>

            {/* Requirements preview */}
            {lead.requirements && (
              <p style={{
                fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 14px',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {lead.requirements}
              </p>
            )}

            {/* CTA */}
            <div style={{ textAlign: 'right' }}>
              <Link
                href={`/user/dashboard/enquiries/${lead._id}`}
                style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                View details <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
