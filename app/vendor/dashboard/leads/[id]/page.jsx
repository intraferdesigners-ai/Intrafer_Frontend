'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Banknote, Calendar, Phone, Mail, User, ChevronLeft,
  CheckCircle, Lock, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/Button';
import Spinner from '../../../../../components/ui/Spinner';
import useAuthStore from '../../../../../store/authStore';
import { formatDate, LEAD_STATUS } from '../../../../../lib/utils';

const LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 4,
};

const CONTACT_REVEALED = new Set(['accepted', 'contacted', 'quotation_sent', 'won', 'lost']);

const STATUS_TRANSITIONS = {
  new:            [],
  accepted:       ['contacted'],
  contacted:      ['quotation_sent'],
  quotation_sent: ['won', 'lost'],
  won:            [],
  lost:           [],
};

const PIPELINE = ['new', 'accepted', 'contacted', 'quotation_sent', 'won', 'lost'];

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div>
      <span style={LABEL}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={14} color="var(--color-text-hint)" />}
        <span style={{ fontSize: 14, color: 'var(--color-text)' }}>{value}</span>
      </div>
    </div>
  );
}

export default function VendorLeadDetailPage() {
  const params = useParams();
  const { user } = useAuthStore();

  const [lead,           setLead]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [accepting,      setAccepting]      = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error,          setError]          = useState('');

  // Notes state
  const [notes,       setNotes]       = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved,  setNotesSaved]  = useState(false);

  useEffect(() => {
    api.get(`/leads/${params.id}`)
      .then(({ data }) => {
        const l = data.data?.lead || data.data || data.lead;
        setLead(l);
        setNotes(l?.vendorNotes || '');
      })
      .catch(() => setError('Failed to load lead details.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await api.put(`/leads/${lead._id}/accept`);
      setLead(data.data?.lead || data.data || data.lead);
      toast.success('Lead accepted! Client contact details are now visible.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept lead.');
    }
    setAccepting(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.put(`/leads/${lead._id}/status`, { status: newStatus });
      setLead(data.data?.lead || data.data || data.lead);
      toast.success('Status updated to ' + LEAD_STATUS[newStatus].label);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/leads/${lead._id}/notes`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {
      toast.error('Failed to save notes.');
    }
    setSavingNotes(false);
  };

  const isContactRevealed = lead && CONTACT_REVEALED.has(lead.status);
  const currentStageIndex = lead ? PIPELINE.indexOf(lead.status) : -1;
  const nextStatuses      = lead ? (STATUS_TRANSITIONS[lead.status] || []) : [];
  const isTerminal        = lead?.status === 'won' || lead?.status === 'lost';

  const waMessage = lead ? encodeURIComponent(
    `Hi ${lead.userId?.name?.split(' ')[0] || 'there'},\n\nI'm ${user?.name || 'your designer'} from Intrafer. I received your enquiry about ${lead.projectType} in ${lead.city}.\n\nWould you be available for a quick call to discuss your requirements?\n\nLooking forward to connecting!`
  ) : '';

  return (
    <div>
      {/* Back */}
      <Link
        href="/vendor/dashboard/leads"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 24,
        }}
      >
        <ChevronLeft size={14} /> Leads
      </Link>

      {loading && <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>}

      {error && (
        <div style={{
          background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
          padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {lead && (
        <div className="lead-detail-layout">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                ENQ-{lead._id?.slice(-8).toUpperCase()}
              </span>
              <Badge status={lead.status} />
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 300,
              color: 'var(--color-text)', margin: '0 0 20px',
            }}>
              {lead.projectType}
            </h1>

            {/* Details grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginBottom: 24,
            }}>
              <DetailItem icon={MapPin}   label="City"        value={lead.city}              />
              <DetailItem icon={Banknote} label="Budget"      value={lead.budget}            />
              <DetailItem icon={Calendar} label="Submitted"   value={formatDate(lead.createdAt)} />
              <DetailItem icon={User}     label="Client name" value={lead.userId?.name}      />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />

            {/* Requirements */}
            <div style={{ marginBottom: 24 }}>
              <span style={LABEL}>Requirements</span>
              <p style={{ fontSize: 14, color: 'var(--color-text-sub)', lineHeight: 1.7, margin: 0 }}>
                {lead.requirements}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />

            {/* Client contact section */}
            <div>
              <span style={{ ...LABEL, color: isContactRevealed ? 'var(--color-success)' : 'var(--color-text-hint)' }}>
                Client contact
              </span>

              {!isContactRevealed ? (
                <div style={{
                  background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center',
                }}>
                  <Lock size={32} color="var(--color-text-hint)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0 }}>
                    Client contact details will be revealed once you accept this lead.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'var(--color-success-bg)',
                  border: '1px solid rgba(45, 106, 79, 0.3)',
                  borderRadius: 'var(--radius-lg)', padding: 16,
                }}>
                  {[
                    { icon: User,  value: lead.userId?.name,  href: null,                           weight: 500, size: 15 },
                    { icon: Phone, value: lead.userId?.phone, href: `tel:${lead.userId?.phone}`,    weight: 400, size: 14 },
                    { icon: Mail,  value: lead.userId?.email, href: `mailto:${lead.userId?.email}`, weight: 400, size: 14 },
                  ].filter(r => r.value).map((row, i, arr) => (
                    <div
                      key={row.href || i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(45,106,79,0.15)' : 'none',
                      }}
                    >
                      <row.icon size={14} color="var(--color-success)" />
                      {row.href ? (
                        <a
                          href={row.href}
                          style={{ fontSize: row.size, color: 'var(--color-text)', fontWeight: row.weight, textDecoration: 'none' }}
                        >
                          {row.value}
                        </a>
                      ) : (
                        <span style={{ fontSize: row.size, color: 'var(--color-text)', fontWeight: row.weight }}>
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* WhatsApp button */}
                  {lead.userId?.phone && (
                    <a
                      href={`https://wa.me/91${lead.userId.phone}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 8, width: '100%', padding: 11,
                        marginTop: 12, borderRadius: 'var(--radius-md)',
                        background: '#25D366', color: '#fff',
                        fontSize: 13, fontWeight: 500, textDecoration: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.82L.057 23.882l6.22-1.634A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 01-5.012-1.375l-.36-.214-3.732.979.996-3.638-.234-.374A9.782 9.782 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                      </svg>
                      Message {lead.userId?.name?.split(' ')[0] || 'client'} on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Private notes section */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={LABEL}>Private notes</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Only visible to you</span>
              </div>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                placeholder="Add private notes — client preferences, follow-up reminders, budget flexibility..."
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-alt)',
                  fontSize: 13, color: 'var(--color-text)',
                  resize: 'vertical', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                {notesSaved
                  ? <span style={{ fontSize: 12, color: 'var(--color-success)' }}>✓ Saved</span>
                  : <span />
                }
                <Button variant="secondary" size="sm" loading={savingNotes} onClick={handleSaveNotes}>
                  Save notes
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Actions + Timeline ── */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 24, position: 'sticky', top: 88,
          }}>
            {/* Accept section */}
            {lead.status === 'new' && (
              <>
                <span style={LABEL}>Action required</span>
                <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 20, marginTop: 6 }}>
                  Accept this lead to reveal the client&apos;s contact details.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  loading={accepting}
                  onClick={handleAccept}
                  style={{ width: '100%' }}
                >
                  Accept lead →
                </Button>
                <p style={{ fontSize: 11, color: 'var(--color-text-hint)', marginTop: 8, textAlign: 'center' }}>
                  Accepting uses 1 lead from your monthly allowance.
                </p>
              </>
            )}

            {/* Status update buttons */}
            {isContactRevealed && nextStatuses.length > 0 && (
              <>
                <span style={LABEL}>Update status</span>
                <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 16, marginTop: 6 }}>
                  Keep the lead status up to date.
                </p>
                {nextStatuses.map((s) => (
                  <Button
                    key={s}
                    variant={s === 'won' ? 'success' : s === 'lost' ? 'danger' : 'secondary'}
                    size="md"
                    loading={updatingStatus}
                    onClick={() => handleStatusUpdate(s)}
                    style={{ width: '100%', marginBottom: 8 }}
                  >
                    Mark as {LEAD_STATUS[s]?.label}
                  </Button>
                ))}
              </>
            )}

            {/* Terminal state */}
            {isTerminal && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                {lead.status === 'won'
                  ? <CheckCircle size={28} color="var(--color-success)" style={{ marginBottom: 8 }} />
                  : <X size={28} color="var(--color-danger)" style={{ marginBottom: 8 }} />
                }
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 400,
                  color: 'var(--color-text)', margin: 0,
                }}>
                  This lead is {LEAD_STATUS[lead.status]?.label.toLowerCase()}.
                </p>
              </div>
            )}

            {(lead.status === 'new' || isContactRevealed) && (
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />
            )}

            {/* Timeline */}
            <span style={LABEL}>Timeline</span>
            <div style={{ marginTop: 12 }}>
              {PIPELINE.map((stage, i) => {
                const inHistory = lead.statusHistory?.find((h) => h.status === stage);
                const isCurrent = lead.status === stage;
                const isPast    = currentStageIndex > i;
                const isFuture  = !inHistory && !isCurrent;

                return (
                  <div key={stage} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                        background: (inHistory || isCurrent) ? 'var(--color-primary)' : 'transparent',
                        border: isFuture ? '1.5px solid var(--color-border)' : '1.5px solid var(--color-primary)',
                      }} />
                      {i < PIPELINE.length - 1 && (
                        <div style={{
                          width: 1, height: 24, marginTop: 2,
                          background: isPast ? 'var(--color-primary)' : 'var(--color-border)',
                          opacity: isPast ? 0.35 : 1,
                        }} />
                      )}
                    </div>
                    <div>
                      <p style={{
                        fontSize: 12, margin: '0 0 2px',
                        fontWeight: isCurrent ? 600 : 400,
                        color: isFuture ? 'var(--color-text-hint)' : 'var(--color-text)',
                      }}>
                        {LEAD_STATUS[stage]?.label || stage}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: 'var(--color-text-hint)', margin: '0 0 4px',
                        fontStyle: inHistory ? 'normal' : 'italic',
                      }}>
                        {inHistory?.createdAt ? formatDate(inHistory.createdAt) : 'Pending'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
