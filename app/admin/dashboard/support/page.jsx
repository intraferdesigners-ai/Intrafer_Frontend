'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

const FILTERS = [
  { key: 'all',         label: 'All'          },
  { key: 'open',        label: 'Open'         },
  { key: 'in_progress', label: 'In progress'  },
  { key: 'resolved',    label: 'Resolved'     },
  { key: 'closed',      label: 'Closed'       },
];

const STATUS_STYLE = {
  open:        { label: 'Open',         bg: 'var(--color-info-bg)',     color: 'var(--color-info)'      },
  in_progress: { label: 'In progress',  bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)'   },
  resolved:    { label: 'Resolved',     bg: 'var(--color-success-bg)',  color: 'var(--color-success)'   },
  closed:      { label: 'Closed',       bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
};

const COL = {
  from:    { flex: 2 },
  subject: { flex: 2 },
  status:  { flex: 1 },
  date:    { flex: 1 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const CAPS_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 10,
};

export default function AdminSupportPage() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const [selected,   setSelected]   = useState(null);
  const [statusDraft, setStatusDraft] = useState('open');
  const [notesDraft,  setNotesDraft]  = useState('');
  const [saving,      setSaving]      = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    const url = filter === 'all' ? '/admin/support-tickets' : `/admin/support-tickets?status=${filter}`;
    api.get(url)
      .then(({ data }) => setTickets(data.data?.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const openTicket = (ticket) => {
    setSelected(ticket);
    setStatusDraft(ticket.status);
    setNotesDraft(ticket.adminNotes || '');
  };

  const closeModal = () => setSelected(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/support-tickets/${selected._id}`, {
        status: statusDraft,
        adminNotes: notesDraft,
      });
      const updated = data.data?.ticket;
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast.success('Ticket updated.');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket.');
    }
    setSaving(false);
  };

  const tabStyle = (key) => key === filter
    ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-accent)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }
    : { background: 'var(--color-surface)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };

  const statusPillStyle = (key) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
    background: statusDraft === key ? 'var(--color-primary-bg)' : 'var(--color-surface)',
    color: statusDraft === key ? 'var(--color-primary)' : 'var(--color-text-sub)',
    border: statusDraft === key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
  });

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
          Support
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
            {tickets.length} total
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(key)} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No {filter === 'all' ? '' : filter.replace('_', ' ') + ' '}tickets.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.from.flex }}>From</div>
            <div style={{ ...HEADER_CELL, flex: COL.subject.flex }}>Subject</div>
            <div style={{ ...HEADER_CELL, flex: COL.status.flex }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: COL.date.flex }}>Submitted</div>
          </div>

          {/* Data rows */}
          {tickets.map((ticket) => {
            const statusInfo = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
            return (
              <div
                key={ticket._id}
                className="admin-table-row"
                onClick={() => openTicket(ticket)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
                }}
              >
                <div style={{ flex: COL.from.flex, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ticket.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-hint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ticket.email}
                  </div>
                </div>

                <div style={{ flex: COL.subject.flex, minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {ticket.subject}
                  </span>
                </div>

                <div style={{ flex: COL.status.flex }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                    background: statusInfo.bg, color: statusInfo.color,
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                <div style={{ flex: COL.date.flex }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Ticket detail modal */}
      {selected && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)', padding: 28, maxWidth: 560, width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--color-text)', marginBottom: 4 }}>
                  {selected.subject}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
                  {selected.name}
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-hint)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-sub)' }}>
                <Mail size={14} color="var(--color-text-hint)" /> {selected.email}
              </div>
              {selected.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-sub)' }}>
                  <Phone size={14} color="var(--color-text-hint)" /> {selected.phone}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-sub)' }}>
                <Calendar size={14} color="var(--color-text-hint)" /> {formatDate(selected.createdAt)}
              </div>
            </div>

            {/* Message */}
            <span style={CAPS_LABEL}>Message</span>
            <p style={{
              fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7,
              background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 20, whiteSpace: 'pre-wrap',
            }}>
              {selected.message}
            </p>

            {/* Status pills */}
            <span style={CAPS_LABEL}>Status</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {FILTERS.filter((f) => f.key !== 'all').map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusDraft(key)}
                  style={statusPillStyle(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Admin notes */}
            <span style={CAPS_LABEL}>Admin notes</span>
            <textarea
              rows={4}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Internal notes — not visible to the submitter…"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)',
                fontSize: 13, color: 'var(--color-text)', resize: 'vertical',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                marginBottom: 20,
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
