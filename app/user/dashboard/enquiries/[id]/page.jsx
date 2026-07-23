'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, Banknote, Building2, Phone, Mail, ChevronLeft, Info, XCircle, Star,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import Badge from '../../../../../components/ui/Badge';
import Spinner from '../../../../../components/ui/Spinner';
import ReviewModal from '../../../../../components/user/ReviewModal';
import MessageThread from '../../../../../components/shared/MessageThread';
import { formatDate } from '../../../../../lib/utils';
import { PIPELINE, getStageIndex } from '../../../../../lib/leadPipeline';

const LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 4,
};

const STATUS_BANNERS = {
  new: {
    bg: 'var(--color-primary-bg)', color: 'var(--color-primary)',
    text: 'Your enquiry has been submitted and is awaiting review by the designer.',
  },
  accepted: {
    bg: 'var(--color-info-bg)', color: 'var(--color-info)',
    text: 'The designer has accepted your enquiry! They will contact you shortly.',
  },
  contacted: {
    bg: '#EDE9FE', color: '#5B21B6',
    text: 'The designer has reached out to you. Check your phone/email for their message.',
  },
  quotation_sent: {
    bg: 'var(--color-warning-bg)', color: 'var(--color-warning)',
    text: 'A quotation has been sent to you. Review the details and get in touch with the designer.',
  },
  won: {
    bg: 'var(--color-success-bg)', color: 'var(--color-success)',
    text: 'Project confirmed! Your interior design project is underway.',
  },
  lost: {
    bg: 'var(--color-danger-bg)', color: 'var(--color-danger)',
    text: 'This enquiry was not progressed. You can submit a new enquiry to another designer.',
  },
  cancelled: {
    bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)',
    text: 'You have cancelled this enquiry.',
  },
};

function DetailRow({ icon: Icon, label, value }) {
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

export default function EnquiryDetailPage() {
  const params = useParams();

  const [lead,          setLead]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [cancelling,    setCancelling]    = useState(false);
  const [showReview,    setShowReview]    = useState(false);
  const [hasReviewed,   setHasReviewed]   = useState(false);

  const fetchLead = () => {
    api.get(`/leads/${params.id}`)
      .then(({ data }) => setLead(data.data?.lead))
      .catch((err) => {
        if (err.response?.status === 404) setError('Enquiry not found.');
        else setError('Failed to load enquiry details.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLead(); }, [params.id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this enquiry? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await api.put(`/leads/${params.id}/cancel`);
      toast.success('Enquiry cancelled.');
      fetchLead();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to cancel enquiry.');
    }
    setCancelling(false);
  };

  const stageIndex = lead ? getStageIndex(lead.status) : -1;
  const isLost     = lead?.status === 'lost';
  const isCancelled = lead?.status === 'cancelled';
  const CONTACT_STATUSES = new Set(['accepted', 'contacted', 'quotation_sent', 'won']);
  const contactRevealed  = lead && CONTACT_STATUSES.has(lead.status);
  const canCancel = lead && ['new', 'accepted'].includes(lead.status);
  const cancelUnavailable = lead && ['contacted', 'quotation_sent'].includes(lead.status);
  const canReview = lead?.status === 'won' && !hasReviewed;
  const banner = lead ? STATUS_BANNERS[lead.status] : null;

  return (
    <div>
      {/* Back */}
      <Link
        href="/user/dashboard/enquiries"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 24,
        }}
      >
        <ChevronLeft size={14} /> My enquiries
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
        <>
          {/* Status banner */}
          {banner && (
            <div style={{
              background: banner.bg, color: banner.color,
              borderRadius: 'var(--radius-lg)', padding: '14px 18px',
              fontSize: 13, fontWeight: 500, marginBottom: 24,
            }}>
              {banner.text}
            </div>
          )}

          <div className="lead-detail-layout">

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* ID + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  ENQ-{lead._id?.slice(-8).toUpperCase()}
                </span>
                <Badge status={lead.status} />
              </div>

              {/* Project type */}
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
                color: 'var(--color-text)', margin: '0 0 28px',
              }}>
                {lead.projectType}
              </h1>

              {/* Details grid */}
              <div className="form-row" style={{ gap: '16px 24px', marginBottom: 28 }}>
                <DetailRow icon={MapPin}    label="City"      value={lead.city}   />
                <DetailRow icon={Banknote}  label="Budget"    value={lead.budget} />
                <DetailRow icon={Calendar}  label="Submitted" value={formatDate(lead.createdAt)} />
                <DetailRow icon={Building2} label="Designer"  value={lead.vendorId?.businessName} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />

              {/* Requirements */}
              <div style={{ marginBottom: 28 }}>
                <span style={LABEL}>Your requirements</span>
                <p style={{ fontSize: 14, color: 'var(--color-text-sub)', lineHeight: 1.7, margin: 0 }}>
                  {lead.requirements}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />

              {/* Vendor section */}
              <div style={{ marginBottom: 28 }}>
                <span style={LABEL}>Assigned designer</span>
                {lead.vendorId ? (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px' }}>
                      {lead.vendorId.businessName}
                    </p>
                    {lead.vendorId.city && (
                      <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 10px' }}>
                        {lead.vendorId.city}
                      </p>
                    )}
                    {lead.vendorId.specializations?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {lead.vendorId.specializations.map((s) => (
                          <span key={s} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            background: 'var(--color-border)', color: 'var(--color-text-sub)',
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {contactRevealed ? (
                      <div style={{
                        background: 'var(--color-success-bg)',
                        border: '1px solid var(--color-success)',
                        borderRadius: 'var(--radius-md)', padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', gap: 8,
                      }}>
                        {lead.vendorId.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <Phone size={14} color="var(--color-success)" />
                            <span style={{ color: 'var(--color-text)' }}>{lead.vendorId.phone}</span>
                          </div>
                        )}
                        {lead.vendorId.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <Mail size={14} color="var(--color-success)" />
                            <span style={{ color: 'var(--color-text)' }}>{lead.vendorId.email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      !isCancelled && (
                        <div style={{
                          background: 'var(--color-info-bg)', border: '1px solid var(--color-info)',
                          borderRadius: 'var(--radius-md)', padding: '12px 14px',
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: 13, color: 'var(--color-info)',
                        }}>
                          <Info size={14} />
                          Designer will contact you once they accept your enquiry.
                        </div>
                      )
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0 }}>
                    No designer assigned yet.
                  </p>
                )}
              </div>

              {/* Messages */}
              {contactRevealed && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />
                  <div style={{ marginBottom: 28 }}>
                    <span style={LABEL}>Messages</span>
                    <div style={{ marginTop: 8 }}>
                      <MessageThread leadId={lead._id} />
                    </div>
                  </div>
                </>
              )}

              {/* Review section (won only) */}
              {lead.status === 'won' && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 24px' }} />
                  <div>
                    <span style={LABEL}>Rate your experience</span>
                    {hasReviewed ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, color: 'var(--color-success)', marginTop: 8,
                      }}>
                        <Star size={16} fill="var(--color-success)" color="var(--color-success)" />
                        Review submitted. Thank you for your feedback!
                      </div>
                    ) : (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 12px' }}>
                          How was your experience with {lead.vendorId?.businessName || 'the designer'}?
                        </p>
                        <button
                          onClick={() => setShowReview(true)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '8px 18px', borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--color-primary)',
                            background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          }}
                        >
                          <Star size={14} /> Write a review
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Cancel button */}
              {canCancel && (
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-danger)',
                      background: 'none', color: 'var(--color-danger)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      opacity: cancelling ? 0.6 : 1,
                    }}
                  >
                    <XCircle size={14} />
                    {cancelling ? 'Cancelling…' : 'Cancel enquiry'}
                  </button>
                </div>
              )}

              {/* Fallback note — mid-progress enquiries can't be self-cancelled */}
              {cancelUnavailable && (
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0 }}>
                    This enquiry is already in progress and can no longer be cancelled directly.{' '}
                    <Link href="/contact" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      Contact support
                    </Link>{' '}
                    if you need help.
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN — Timeline ── */}
            <div className="lead-timeline-card" style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 24, position: 'sticky', top: 88,
            }}>
              <span style={LABEL}>Enquiry timeline</span>

              {(isLost || isCancelled) ? (
                <div style={{
                  marginTop: 16, background: isCancelled ? 'var(--color-surface-alt)' : 'var(--color-danger-bg)',
                  border: `1px solid ${isCancelled ? 'var(--color-border)' : 'var(--color-danger)'}`,
                  borderRadius: 'var(--radius-md)', padding: '12px 14px',
                  fontSize: 13, color: isCancelled ? 'var(--color-text-hint)' : 'var(--color-danger)',
                }}>
                  {isCancelled ? 'This enquiry was cancelled.' : 'This enquiry was marked as lost.'}
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {PIPELINE.map((stage, i) => {
                    const isPast    = i <  stageIndex;
                    const isCurrent = i === stageIndex;
                    const isFuture  = i >  stageIndex;
                    const histEntry = lead.statusHistory?.find((h) => h.status === stage.key);

                    return (
                      <div key={stage.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                            background: (isPast || isCurrent) ? 'var(--color-primary)' : 'transparent',
                            border: isFuture
                              ? '1.5px solid var(--color-border)'
                              : '1.5px solid var(--color-primary)',
                          }} />
                          {i < PIPELINE.length - 1 && (
                            <div style={{
                              width: 1, height: 28, marginTop: 2,
                              background: isPast ? 'var(--color-primary)' : 'var(--color-border)',
                              opacity: isPast ? 0.4 : 1,
                            }} />
                          )}
                        </div>

                        <div>
                          <p style={{
                            fontSize: 13, margin: '0 0 2px',
                            fontWeight: isCurrent ? 600 : 400,
                            color: isFuture ? 'var(--color-text-hint)' : 'var(--color-text)',
                          }}>
                            {stage.label}
                          </p>
                          <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10,
                            color: 'var(--color-text-hint)', margin: '0 0 6px',
                            fontStyle: histEntry ? 'normal' : 'italic',
                          }}>
                            {histEntry?.changedAt ? formatDate(histEntry.changedAt) : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showReview && lead && (
        <ReviewModal
          leadId={lead._id}
          vendorName={lead.vendorId?.businessName || 'the designer'}
          onClose={() => setShowReview(false)}
          onSubmitted={() => setHasReviewed(true)}
        />
      )}
    </div>
  );
}
