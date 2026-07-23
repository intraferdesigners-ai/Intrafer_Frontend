'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Banknote, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Badge from '../../../../components/ui/Badge';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, formatRelativeTime } from '../../../../lib/utils';
import HoverLift from '../../../../components/ui/HoverLift';

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const FILTER_TABS = [
  { key: 'all',            label: 'All'            },
  { key: 'new',            label: 'New'            },
  { key: 'accepted',       label: 'Accepted'       },
  { key: 'contacted',      label: 'Contacted'      },
  { key: 'quotation_sent', label: 'Quotation sent' },
  { key: 'won',            label: 'Won'            },
  { key: 'lost',           label: 'Lost'           },
];

export default function VendorLeadsPage() {
  const [leads,            setLeads]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [loadError,        setLoadError]        = useState(false);
  const [filter,           setFilter]           = useState('all');
  const [acceptingId,      setAcceptingId]      = useState(null);
  const [confirmingId,     setConfirmingId]     = useState(null);
  const [creditsRemaining, setCreditsRemaining] = useState(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    const url = filter === 'all' ? '/leads/vendor' : `/leads/vendor?status=${filter}`;
    api.get(url)
      .then(({ data }) => {
        const d = data.data;
        setLeads(Array.isArray(d) ? d : d.leads || []);
      })
      .catch(() => {
        setLeads([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Fetch credits on mount
  useEffect(() => {
    api.get('/vendor/analytics')
      .then(({ data }) => {
        const d = data.data;
        if (d?.creditsTotal > 0) setCreditsRemaining(d.creditsRemaining);
      })
      .catch(() => {});
  }, []);

  const handleQuickAccept = async (leadId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Accept this lead? 1 lead credit will be used.')) return;
    setAcceptingId(leadId);
    try {
      await api.put(`/leads/${leadId}/accept`);
      toast.success('Lead accepted! Open lead to see client contact details.');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept lead.');
    }
    setAcceptingId(null);
  };

  const handleConfirmAppointment = async (lead, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lead.preferredDate) {
      toast.error('No preferred date/time was requested for this lead.');
      return;
    }
    setConfirmingId(lead._id);
    try {
      await api.put(`/leads/${lead._id}/confirm-appointment`, { dateTime: lead.preferredDate });
      toast.success('Appointment confirmed.');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm appointment.');
    }
    setConfirmingId(null);
  };

  const tabStyle = (key) => key === filter
    ? {
        background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
        border: '1px solid var(--color-accent)', borderRadius: 20,
        padding: '6px 14px', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
      }
    : {
        background: 'var(--color-surface)', color: 'var(--color-text-sub)',
        border: '1px solid var(--color-border)', borderRadius: 20,
        padding: '6px 14px', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
      };

  return (
    <div>
      {/* Heading + credits counter */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
            color: 'var(--color-text)', margin: 0,
          }}>
            Leads
          </h1>
          {!loading && (
            <span style={{
              fontSize: 13, color: 'var(--color-text-hint)',
              background: 'var(--color-surface-alt)',
              padding: '2px 10px', borderRadius: 20, fontWeight: 500,
            }}>
              {leads.length}
            </span>
          )}
        </div>
        {creditsRemaining !== null && (
          <span style={{
            fontSize: 12, fontWeight: 500,
            background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
            padding: '4px 10px', borderRadius: 20,
          }}>
            {creditsRemaining} leads remaining
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {FILTER_TABS.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(key)} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : loadError ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: '0 0 12px' }}>
            Couldn&apos;t load your leads. Please try again.
          </p>
          <button
            onClick={fetchLeads}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : leads.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No {filter === 'all' ? '' : filter.replace('_', ' ') + ' '}leads found.
        </div>
      ) : (
        leads.map((lead) => (
          <Link key={lead._id} href={`/vendor/dashboard/leads/${lead._id}`} style={{ textDecoration: 'none' }}>
            <HoverLift
              className="lead-row"
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 12,
                transition: 'border-color 150ms ease-out',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    ENQ-{lead._id?.slice(-8).toUpperCase()}
                  </span>
                  <Badge status={lead.status} />
                  {lead.isConsultation && <Badge variant="info">Consultation request</Badge>}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                  {formatRelativeTime(lead.createdAt)}
                </span>
              </div>

              {/* Project type */}
              <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)', margin: '6px 0' }}>
                {lead.projectType}
              </p>

              {/* Details */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {lead.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                    <MapPin size={12} /> {lead.city}
                  </span>
                )}
                {lead.budget && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                    <Banknote size={12} /> {lead.budget}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                  <Calendar size={12} /> {formatDate(lead.createdAt)}
                </span>
              </div>

              {/* Requirements preview */}
              {lead.requirements && (
                <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 8, marginBottom: 0 }}>
                  {lead.requirements.length > 80 ? lead.requirements.slice(0, 80) + '…' : lead.requirements}
                </p>
              )}

              {/* Consultation appointment */}
              {lead.isConsultation && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 10, padding: '10px 12px',
                  background: 'var(--color-primary-bg)', borderRadius: 'var(--radius-md)',
                }}>
                  {lead.confirmedDateTime ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>
                      <Calendar size={13} /> Appointment confirmed: {formatDateTime(lead.confirmedDateTime)}
                    </span>
                  ) : (
                    <>
                      <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                        Requested: {lead.preferredDate ? formatDateTime(lead.preferredDate) : 'No preferred time given'}
                      </span>
                      <button
                        onClick={(e) => handleConfirmAppointment(lead, e)}
                        disabled={confirmingId === lead._id || !lead.preferredDate}
                        style={{
                          padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-primary)', color: '#fff',
                          border: 'none', fontSize: 12, fontWeight: 500,
                          cursor: lead.preferredDate ? 'pointer' : 'not-allowed',
                          opacity: confirmingId === lead._id || !lead.preferredDate ? 0.6 : 1,
                        }}
                      >
                        {confirmingId === lead._id ? '...' : 'Confirm appointment'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Bottom row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                  Client: <strong>{lead.userId?.name || 'Unknown'}</strong>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {lead.status === 'new' && (
                    <button
                      onClick={(e) => handleQuickAccept(lead._id, e)}
                      disabled={acceptingId === lead._id}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary)', color: '#fff',
                        border: 'none', fontSize: 12, fontWeight: 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        opacity: acceptingId === lead._id ? 0.6 : 1,
                      }}
                    >
                      {acceptingId === lead._id ? '...' : '✓ Accept'}
                    </button>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-primary)' }}>
                    View details →
                  </span>
                </div>
              </div>
            </HoverLift>
          </Link>
        ))
      )}
    </div>
  );
}
