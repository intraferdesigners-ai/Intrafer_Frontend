'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { User, Mail, Phone, Heart, Building2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 14,
};

export default function UserProfilePage() {
  const { updateUser } = useAuthStore();

  const [form,        setForm]        = useState({ name: '', email: '', phone: '' });
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);

  // Saved designers from localStorage
  const [saved,       setSaved]       = useState([]);
  const [savedVendors, setSavedVendors] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Fetch real profile from API
  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        const u = data.data?.user;
        if (u) setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load saved designers from localStorage
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('intrafer_saved') || '[]');
      setSaved(ids);
      if (ids.length > 0) {
        setLoadingSaved(true);
        Promise.allSettled(ids.map((id) => api.get(`/public/vendors/${id}`)))
          .then((results) => {
            const vendors = results
              .filter((r) => r.status === 'fulfilled')
              .map((r) => r.value.data?.data?.vendor)
              .filter(Boolean);
            setSavedVendors(vendors);
          })
          .finally(() => setLoadingSaved(false));
      }
    } catch {}
  }, []);

  const handleRemoveSaved = (vendorId) => {
    const updated = saved.filter((id) => id !== vendorId);
    setSaved(updated);
    setSavedVendors((prev) => prev.filter((v) => v._id !== vendorId));
    localStorage.setItem('intrafer_saved', JSON.stringify(updated));
    toast.success('Removed from saved.');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: form.name.trim(), phone: form.phone.trim() });
      const u = data.data?.user;
      if (u) {
        setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
        // Update Zustand store
        updateUser(u);
      }
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const initials = form.name
    ? form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  if (loading) return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 6px',
      }}>My profile</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: '0 0 28px' }}>
        Manage your account details.
      </p>

      {/* Avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px', border: '2px solid var(--color-accent)',
      }}>
        {initials}
      </div>

      {/* Form card */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 16,
      }}>
        <span style={SECTION_LABEL}>Account details</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full name"
            icon={User}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
          />
          <Input
            label="Email address"
            icon={Mail}
            value={form.email}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            label="Phone number"
            icon={Phone}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="10-digit mobile number"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          loading={saving}
          onClick={handleSave}
          style={{ width: '100%', marginTop: 20 }}
        >
          Save changes
        </Button>
      </div>

      {/* Saved designers */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Heart size={16} color="var(--color-primary)" />
          <span style={{ ...SECTION_LABEL, marginBottom: 0 }}>Saved designers</span>
        </div>

        {loadingSaved ? (
          <div style={{ padding: '16px 0' }}><Spinner size="sm" /></div>
        ) : savedVendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Building2 size={32} color="var(--color-text-hint)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: '0 0 12px' }}>
              No saved designers yet.
            </p>
            <Link
              href="/vendors"
              style={{
                fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              Browse designers →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedVendors.map((vendor) => (
              <div key={vendor._id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-alt)',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                  fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {vendor.businessName?.[0]?.toUpperCase() || 'D'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                    {vendor.businessName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                    {[vendor.city, vendor.specializations?.[0]].filter(Boolean).join(' · ')}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link
                    href={`/vendors/${vendor._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 500, color: 'var(--color-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    View <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => handleRemoveSaved(vendor._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-danger)', fontSize: 12, padding: '2px 6px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
              My enquiries
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
              View all submitted enquiries
            </div>
          </div>
        </div>
        <Link
          href="/user/dashboard/enquiries"
          style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
        >
          View →
        </Link>
      </div>
    </div>
  );
}
