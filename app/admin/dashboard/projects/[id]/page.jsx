'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Building2, Star, Clock, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

const MODERATION_BADGE = {
  pending:  { label: 'Pending review', Icon: Clock,        color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  approved: { label: 'Approved',       Icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  rejected: { label: 'Taken down',     Icon: XCircle,      color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)'  },
};

export default function AdminProjectDetailPage() {
  const { id }                          = useParams();
  const [project,     setProject]       = useState(null);
  const [loading,     setLoading]       = useState(true);
  const [updating,    setUpdating]      = useState(false);
  const [showRejectForm,  setShowRejectForm]  = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/projects/${id}`)
      .then(({ data }) => setProject(data.data?.project || null))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleModerate = async (approve, reason) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/admin/projects/${id}/moderate`, { approve, rejectionReason: reason });
      setProject((p) => ({ ...p, ...data.data?.project }));
      toast.success(approve ? 'Project approved.' : 'Project taken down.');
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFeatured = async () => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/admin/projects/${id}/feature`);
      setProject((p) => ({ ...p, isFeatured: data.data?.isFeatured }));
      toast.success(data.data?.isFeatured ? 'Project featured.' : 'Feature removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update featured status.');
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

  if (!project) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <Building2 size={48} color="var(--color-text-hint)" />
        <p style={{ marginTop: '16px', color: 'var(--color-text-hint)' }}>Project not found.</p>
        <Link href="/admin/dashboard/projects" style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
          ← Back to projects
        </Link>
      </div>
    );
  }

  const vendor = project.vendorId || {};
  const badge  = MODERATION_BADGE[project.moderationStatus] || MODERATION_BADGE.approved;
  const BadgeIcon = badge.Icon;

  return (
    <>
      <Link
        href="/admin/dashboard/projects"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 24 }}
      >
        <ChevronLeft size={16} /> All projects
      </Link>

      {/* Header */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
        display: 'flex', alignItems: 'center', gap: '20px',
        marginBottom: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--color-text)', margin: '0 0 4px' }}>
            {project.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: '0 0 8px' }}>
            {vendor.businessName ? (
              <Link href={`/admin/dashboard/vendors/${vendor._id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {vendor.businessName}
              </Link>
            ) : 'Unknown vendor'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 20,
              fontSize: 11, fontWeight: 500, letterSpacing: '.02em',
              background: badge.bg, color: badge.color,
            }}>
              <BadgeIcon size={12} /> {badge.label}
            </span>
            {project.isPublished && <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Published</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <Button variant="secondary" size="sm" loading={updating} onClick={handleToggleFeatured}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} fill={project.isFeatured ? '#F59E0B' : 'none'} color={project.isFeatured ? '#F59E0B' : undefined} />
            {project.isFeatured ? 'Featured' : 'Feature'}
          </Button>
          {project.moderationStatus !== 'rejected' ? (
            <Button variant="danger" size="sm" loading={updating} onClick={() => setShowRejectForm((s) => !s)}>
              Take down
            </Button>
          ) : (
            <Button variant="success" size="sm" loading={updating} onClick={() => handleModerate(true, '')}>
              Restore
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
            placeholder="Explain why this project is being taken down..."
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
            <Button variant="danger" size="sm" loading={updating} disabled={!rejectionReason.trim()} onClick={() => handleModerate(false, rejectionReason)}>
              Take down
            </Button>
          </div>
        </div>
      )}

      {/* Rejection reason — shown when currently taken down */}
      {project.moderationStatus === 'rejected' && project.rejectionReason && (
        <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xl)', padding: '20px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-danger)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Taken down
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
            {project.rejectionReason}
          </p>
        </div>
      )}

      {/* Two-column body */}
      <div className="lead-detail-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '12px' }}>Description</p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--color-text-sub)', margin: 0 }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Images */}
          {project.images?.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>
                Images ({project.images.length})
              </p>
              <div className="gallery-grid-auto">
                {project.images.map((src, i) => (
                  <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', height: 140 }}>
                    <img src={src} alt={`${project.title} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — details */}
        <div className="lead-timeline-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>Details</p>
            {[
              ['Project type',  project.projectType || '—'],
              ['Style',         project.style || '—'],
              ['Budget',        project.budget || '—'],
              ['Timeline',      project.timeline || '—'],
              ['Completed',     project.completedYear || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-hint)' }}>{label}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {project.location && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '12px' }}>Location</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-sub)' }}>
                <MapPin size={14} /> {project.location}
              </div>
            </div>
          )}

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>Meta</p>
            {[
              ['Submitted', project.createdAt ? formatDate(project.createdAt) : '—'],
              ['Updated',   project.updatedAt ? formatDate(project.updatedAt) : '—'],
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
