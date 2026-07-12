'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, Banknote, Building2, Phone, Mail, ChevronLeft, Info,
} from 'lucide-react';
import api from '../../../../../lib/api';
import Badge from '../../../../../components/ui/Badge';
import Spinner from '../../../../../components/ui/Spinner';
import { formatDate } from '../../../../../lib/utils';

const LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 4,
};

const PIPELINE = [
  { key: 'new',            label: 'Enquiry submitted'   },
  { key: 'accepted',       label: 'Accepted by designer' },
  { key: 'contacted',      label: 'Designer contacted'   },
  { key: 'quotation_sent', label: 'Quotation sent'       },
  { key: 'won',            label: 'Project confirmed'     },
];

function getStageIndex(status) {
  if (status === 'lost') return -1;
  return PIPELINE.findIndex((s) => s.key === status);
}

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
  const router = useRouter();

  const [lead,    setLead]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/leads/${params.id}`)
      .then(({ data }) => setLead(data.data?.lead))
      .catch((err) => {
        if (err.response?.status === 404) setError('Enquiry not found.');
        else setError('Failed to load enquiry details.');
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const stageIndex = lead ? getStageIndex(lead.status) : -1;
  const isLost     = lead?.status === 'lost';
  const CONTACT_STATUSES = new Set(['accepted', 'contacted', 'quotation_sent', 'won']);
  const contactRevealed  = lead && CONTACT_STATUSES.has(lead.status);

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
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px',
              marginBottom: 28,
            }}>
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
            <div>
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
                    <div style={{
                      background: 'var(--color-info-bg)', border: '1px solid var(--color-info)',
                      borderRadius: 'var(--radius-md)', padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                      color: 'var(--color-info)',
                    }}>
                      <Info size={14} />
                      Designer will contact you once they accept your enquiry.
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0 }}>
                  No designer assigned yet.
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Timeline ── */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 24, position: 'sticky', top: 88,
          }}>
            <span style={LABEL}>Enquiry timeline</span>

            {isLost ? (
              <div style={{
                marginTop: 16, background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)', padding: '12px 14px',
                fontSize: 13, color: 'var(--color-danger)',
              }}>
                This enquiry was marked as lost.
              </div>
            ) : (
              <div style={{ marginTop: 16, position: 'relative' }}>
                {PIPELINE.map((stage, i) => {
                  const isPast    = i <  stageIndex;
                  const isCurrent = i === stageIndex;
                  const isFuture  = i >  stageIndex;

                  const histEntry = lead.statusHistory?.find((h) => h.status === stage.key);

                  return (
                    <div key={stage.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {/* Dot + connector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                          background: (isPast || isCurrent) ? 'var(--color-primary)' : 'transparent',
                          border: isFuture ? '1.5px solid var(--color-border)' : '1.5px solid var(--color-primary)',
                        }} />
                        {i < PIPELINE.length - 1 && (
                          <div style={{
                            width: 1, height: 28, marginTop: 2,
                            background: isPast ? 'var(--color-primary)' : 'var(--color-border)',
                            opacity: isPast ? 0.4 : 1,
                          }} />
                        )}
                      </div>

                      {/* Label + timestamp */}
                      <div style={{ paddingBottom: i < PIPELINE.length - 1 ? 0 : 0 }}>
                        <p style={{
                          fontSize: 13, margin: '0 0 2px',
                          fontWeight: isCurrent ? 600 : 400,
                          color: isFuture ? 'var(--color-text-hint)' : 'var(--color-text)',
                        }}>
                          {stage.label}
                        </p>
                        {histEntry?.createdAt && (
                          <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10,
                            color: 'var(--color-text-hint)', margin: '0 0 6px',
                          }}>
                            {formatDate(histEntry.createdAt)}
                          </p>
                        )}
                        {!histEntry && (
                          <p style={{
                            fontSize: 10, color: 'var(--color-text-hint)',
                            margin: '0 0 6px', fontStyle: 'italic',
                          }}>
                            Pending
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
