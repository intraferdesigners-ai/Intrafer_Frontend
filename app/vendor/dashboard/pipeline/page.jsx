'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import { formatRelativeTime } from '../../../../lib/utils';

const COLUMNS = [
  { key: 'new',            label: 'New'            },
  { key: 'accepted',       label: 'Accepted'       },
  { key: 'contacted',      label: 'Contacted'      },
  { key: 'quotation_sent', label: 'Quotation Sent' },
  { key: 'won',            label: 'Won'            },
  { key: 'lost',           label: 'Lost'           },
];

const STATUS_ENDPOINT_TARGETS = ['contacted', 'quotation_sent', 'won', 'lost'];

export default function VendorPipelinePage() {
  const [leads,            setLeads]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [draggedId,        setDraggedId]        = useState(null);
  const [dragOverKey,      setDragOverKey]      = useState(null);
  const [movingId,         setMovingId]         = useState(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    api.get('/leads/vendor')
      .then(({ data }) => {
        const d = data.data;
        const all = Array.isArray(d) ? d : d.leads || [];
        setLeads(all.filter((l) => l.status !== 'cancelled'));
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    api.get('/vendor/analytics')
      .then(({ data }) => {
        const d = data.data;
        if (d?.creditsTotal > 0) setCreditsRemaining(d.creditsRemaining);
      })
      .catch(() => {});
  }, []);

  const handleDragStart = (e, lead) => {
    if (movingId) { e.preventDefault(); return; }
    setDraggedId(lead._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead._id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverKey(null);
  };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverKey(key);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverKey(null);
    const leadId = draggedId;
    setDraggedId(null);
    if (!leadId) return;

    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return;
    const sourceStatus = lead.status;

    if (sourceStatus === targetStatus) return;
    if (targetStatus === 'new') return; // no path back to New

    if (sourceStatus === 'new' && targetStatus !== 'accepted') {
      toast.error('Accept the lead first.');
      return;
    }

    if (targetStatus === 'accepted' && sourceStatus === 'new') {
      if (!window.confirm('Accept this lead? 1 lead credit will be used.')) return;
    }

    // Optimistic move
    setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: targetStatus } : l)));
    setMovingId(leadId);
    try {
      if (targetStatus === 'accepted') {
        await api.put(`/leads/${leadId}/accept`);
        if (sourceStatus === 'new') {
          toast.success('Lead accepted! Open lead to see client contact details.');
        }
      } else if (STATUS_ENDPOINT_TARGETS.includes(targetStatus)) {
        await api.put(`/leads/${leadId}/status`, { status: targetStatus });
      }
    } catch (err) {
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: sourceStatus } : l)));
      toast.error(err.response?.data?.message || 'Failed to update lead status.');
    }
    setMovingId(null);
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
            Pipeline
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

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : leads.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No leads yet.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
          {COLUMNS.map(({ key, label }) => {
            const columnLeads = leads.filter((l) => l.status === key);
            const isDragOver = dragOverKey === key;
            return (
              <div
                key={key}
                onDragOver={(e) => handleDragOver(e, key)}
                onDrop={(e) => handleDrop(e, key)}
                style={{
                  flex: '0 0 280px', width: 280,
                  background: 'var(--color-surface-alt)',
                  border: isDragOver ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: 12,
                  minHeight: 200, transition: 'border-color 150ms ease-out',
                }}
              >
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500,
                    color: 'var(--color-text)',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 20, padding: '1px 8px',
                  }}>
                    {columnLeads.length}
                  </span>
                </div>

                {/* Cards */}
                {columnLeads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable={movingId !== lead._id}
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity: draggedId === lead._id ? 0.4 : 1,
                      cursor: movingId === lead._id ? 'wait' : 'grab',
                      marginBottom: 8,
                    }}
                  >
                    <Link href={`/vendor/dashboard/leads/${lead._id}`} style={{ textDecoration: 'none' }}>
                      <div
                        className="lead-row"
                        style={{
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)', padding: 12,
                          transition: 'border-color 150ms ease-out',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10,
                            color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            ENQ-{lead._id?.slice(-8).toUpperCase()}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-hint)' }}>
                            {formatRelativeTime(lead.createdAt)}
                          </span>
                        </div>

                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', margin: '4px 0' }}>
                          {lead.projectType}
                        </p>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                          {lead.city && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-sub)' }}>
                              <MapPin size={11} /> {lead.city}
                            </span>
                          )}
                          {lead.budget && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-sub)' }}>
                              <Banknote size={11} /> {lead.budget}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--color-text-sub)', paddingTop: 6, borderTop: '1px solid var(--color-border)' }}>
                          Client: <strong>{lead.userId?.name || 'Unknown'}</strong>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
