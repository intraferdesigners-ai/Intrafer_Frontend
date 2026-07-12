'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Star, Building2, ShieldCheck, ShieldX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { getInitials, formatDate } from '@/lib/utils';

export default function AdminVendorDetailPage() {
  const { id }                        = useParams();
  const [vendor,    setVendor]        = useState(null);
  const [projects,  setProjects]      = useState([]);
  const [loading,   setLoading]       = useState(true);
  const [updating,  setUpdating]      = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/admin/vendors`),
      api.get(`/public/vendors/${id}/projects`).catch(() => ({ data: { data: { projects: [] } } })),
    ])
      .then(([vendorsRes, projectsRes]) => {
        const found = (vendorsRes.data?.data?.vendors || []).find((v) => v._id === id);
        setVendor(found || null);
        setProjects(projectsRes.data?.data?.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async (approve) => {
    setUpdating(true);
    try {
      await api.put(`/admin/vendors/${id}/approve`, { approve });
      setVendor((v) => ({ ...v, isApproved: approve }));
      toast.success(approve ? 'Vendor approved.' : 'Vendor revoked.');
    } catch {
      toast.error('Action failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
          <Spinner size={28} />
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <Building2 size={48} color="var(--color-text-hint)" />
          <p style={{ marginTop: '16px', color: 'var(--color-text-hint)' }}>Vendor not found.</p>
          <Link href="/admin/dashboard/vendors" style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
            ← Back to vendors
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const user      = vendor.userId || {};
  const location  = [vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || '—';
  const specs     = vendor.specializations || [];

  return (
    <DashboardLayout>
      <Link
        href="/admin/dashboard/vendors"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none', marginBottom: 24 }}
      >
        <ChevronLeft size={16} /> Vendors
      </Link>

      {/* Profile header */}
      <div style={{
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--color-text)', margin: '0 0 4px' }}>
            {vendor.businessName}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: '0 0 8px', fontFamily: 'monospace' }}>
            {user.email || '—'} · {user.phone || '—'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge
              label={vendor.isApproved ? 'Approved' : 'Pending'}
              variant={vendor.isApproved ? 'success' : 'warning'}
            />
            {vendor.isListingEnabled && <Badge label="Listing active" variant="info" />}
            {vendor.rating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-hint)' }}>
                <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" />
                {Number(vendor.rating).toFixed(1)} ({vendor.reviewCount || 0} reviews)
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {!vendor.isApproved ? (
            <Button variant="success" size="sm" loading={updating} onClick={() => handleApprove(true)}>
              <ShieldCheck size={14} /> Approve
            </Button>
          ) : (
            <Button variant="danger" size="sm" loading={updating} onClick={() => handleApprove(false)}>
              <ShieldX size={14} /> Revoke
            </Button>
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div className="lead-detail-layout">

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>
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
    </DashboardLayout>
  );
}
