'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Star, Building2, ShieldCheck, ShieldX, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { getInitials, formatDate } from '@/lib/utils';

const STATUS_BADGE = {
  approved: { label: 'Live',             Icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  rejected: { label: 'Taken down',       Icon: XCircle,     color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)'  },
};

// No vendor can be in a 'pending' state today — see the matching comment in
// ../page.jsx.
function getApprovalStatus(vendor) {
  return vendor.approvalStatus || (vendor.isApproved ? 'approved' : 'rejected');
}

export default function AdminVendorDetailPage() {
  const { id }                        = useParams();
  const [vendor,    setVendor]        = useState(null);
  const [projects,  setProjects]      = useState([]);
  const [loading,   setLoading]       = useState(true);
  const [updating,  setUpdating]      = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/admin/vendors/${id}`).catch(() => ({ data: { data: { vendor: null } } })),
      api.get(`/public/vendors/${id}/projects`).catch(() => ({ data: { data: { projects: [] } } })),
    ])
      .then(([vendorRes, projectsRes]) => {
        setVendor(vendorRes.data?.data?.vendor || null);
        setProjects(projectsRes.data?.data?.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async (approve, reason = '') => {
    if (!approve && !reason.trim()) {
      toast.error('A rejection reason is required.');
      return;
    }
    setUpdating(true);
    try {
      const { data } = await api.put(`/admin/vendors/${id}/approve`, { approve, rejectionReason: reason });
      const updated = data.data?.vendor;
      setVendor((v) => ({
        ...v,
        isApproved: approve,
        approvalStatus: approve ? 'approved' : 'rejected',
        rejectionReason: updated?.rejectionReason ?? (approve ? v.rejectionReason : reason),
        reviewedAt: updated?.reviewedAt || new Date().toISOString(),
      }));
      toast.success(approve ? 'Vendor reinstated.' : 'Vendor taken down.');
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <Building2 size={48} color="var(--color-text-hint)" />
        <p style={{ marginTop: '16px', color: 'var(--color-text-hint)' }}>Vendor not found.</p>
        <Link href="/admin/dashboard/vendors" style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
          ← Back to vendors
        </Link>
      </div>
    );
  }

  const user      = vendor.userId || {};
  const location  = [vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || '—';
  const specs     = vendor.specializations || [];

  return (
    <>
      <Link
        href="/admin/dashboard/vendors"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 24 }}
      >
        <ChevronLeft size={16} /> Vendors
      </Link>

      {/* Profile header */}
      <div className="admin-detail-header" style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
        display: 'flex', alignItems: 'center', gap: '20px',
        marginBottom: '20px', flexWrap: 'wrap',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--primary-bg)', color: 'var(--primary)',
          fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--primary-light)',
        }}>
          {getInitials(vendor.businessName || 'V')}
        </div>
        <div className="admin-detail-header-info" style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--color-text)', margin: '0 0 4px' }}>
            {vendor.businessName}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: '0 0 8px', fontFamily: 'monospace' }}>
            {user.email || '—'} · {user.phone || '—'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {(() => {
              const { label, color, bg } = STATUS_BADGE[getApprovalStatus(vendor)];
              return (
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 500, letterSpacing: '.02em',
                  background: bg, color,
                }}>
                  {label}
                </span>
              );
            })()}
            {vendor.isListingEnabled && <Badge variant="info">Listing active</Badge>}
            {vendor.rating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-hint)' }}>
                <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" />
                {Number(vendor.rating).toFixed(1)} ({vendor.reviewCount || 0} reviews)
              </span>
            )}
          </div>
        </div>
        <div className="admin-detail-header-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {getApprovalStatus(vendor) !== 'approved' ? (
            <Button variant="success" size="sm" loading={updating} onClick={() => handleApprove(true)}>
              <ShieldCheck size={14} /> Reinstate
            </Button>
          ) : (
            <Button variant="danger" size="sm" loading={updating} onClick={() => setShowRejectForm((s) => !s)}>
              <ShieldX size={14} /> Take down
            </Button>
          )}
        </div>
      </div>

      {/* Inline reject-with-reason form */}
      {showRejectForm && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-xl)', padding: '20px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Reason for takedown
          </p>
          <textarea
            rows={3}
            placeholder="Explain why this vendor's listing is being taken down..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)',
              fontSize: 13, color: 'var(--color-text)', resize: 'vertical',
              fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              marginBottom: 14,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={updating} onClick={() => handleApprove(false, rejectionReason)}>
              Take down
            </Button>
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className="lead-detail-layout">

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Rejection reason — prominent, not just in the reject-modal write path */}
          {getApprovalStatus(vendor) === 'rejected' && vendor.rejectionReason && (
            <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-danger)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Taken down{vendor.reviewedAt ? ` · ${formatDate(vendor.reviewedAt)}` : ''}
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
                {vendor.rejectionReason}
              </p>
            </div>
          )}

          {/* Previously rejected — kept as historical context after a later approval */}
          {getApprovalStatus(vendor) === 'approved' && vendor.rejectionReason && (
            <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '14px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-hint)', margin: 0, lineHeight: 1.6 }}>
                Previously rejected: {vendor.rejectionReason}
              </p>
            </div>
          )}

          {/* Description */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '12px' }}>About</p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--color-text-sub)', margin: 0 }}>
              {vendor.description || 'No description provided.'}
            </p>
          </div>

          {/* Location + Specializations */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '12px' }}>Location</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-sub)', marginBottom: '16px' }}>
              <MapPin size={14} /> {location}
              {vendor.location?.pincode && <span style={{ color: 'var(--color-text-hint)' }}>· {vendor.location.pincode}</span>}
            </div>
            {specs.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '10px' }}>Specializations</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {specs.map((s) => (
                    <span key={s} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'var(--primary-bg)', color: 'var(--primary)' }}>{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>
                Portfolio ({projects.length} projects)
              </p>
              <div className="gallery-grid-auto">
                {projects.map((p) => (
                  <div key={p._id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <div style={{ height: '100px', background: 'var(--color-surface-alt)', position: 'relative' }}>
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-hint)', margin: 0 }}>{p.projectType} · {p.completedYear}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Stats & subscription */}
        <div className="lead-timeline-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>Stats</p>
            {[
              ['Total leads',  vendor.totalLeads ?? '—'],
              ['Won leads',    vendor.wonLeads ?? '—'],
              ['Rating',       vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)} / 5` : '—'],
              ['Reviews',      vendor.reviewCount ?? 0],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-hint)' }}>{label}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>Subscription</p>
            {vendor.subscriptionId ? (
              <Badge label="Active subscription" variant="success" />
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: 0 }}>No active subscription</p>
            )}
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>Account</p>
            {[
              ['User ID',   (user._id || vendor.userId || '—').toString().slice(-8)],
              ['Joined',    vendor.createdAt ? formatDate(vendor.createdAt) : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-text-hint)' }}>{label}</span>
                <span style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
