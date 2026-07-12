'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, FileText } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useAuthStore from '@/store/authStore';
import { getInitials } from '@/lib/utils';

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const [form, setForm]     = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name:  user.name  || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Profile saved');
  };

  const initials = getInitials(form.name || 'U');

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '560px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 28px', letterSpacing: '-.02em',
        }}>
          My profile
        </h1>

        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--primary-bg)', color: 'var(--primary)',
              fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--primary-light)',
            }}>
              {initials}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', marginTop: '8px' }}>
              {form.email}
            </p>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full name"
              icon={User}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              required
            />

            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 500,
                color: 'var(--color-text-sub)', marginBottom: '6px', letterSpacing: '0.01em',
              }}>
                Email <span style={{ color: 'var(--color-text-hint)', fontWeight: 400 }}>(cannot be changed)</span>
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: '13px', color: 'var(--color-text-hint)',
              }}>
                <Mail size={15} color="var(--color-text-hint)" />
                {form.email || '—'}
              </div>
            </div>

            <Input
              label="Phone"
              icon={Phone}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit mobile number"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              style={{ width: '100%', marginTop: '8px' }}
            >
              Save changes
            </Button>
          </form>
        </div>

        {/* Saved enquiries shortcut */}
        <div style={{
          marginTop: '16px',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'var(--primary-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={18} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>
                  My enquiries
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-hint)', margin: 0 }}>
                  View all submitted enquiries
                </p>
              </div>
            </div>
            <Link href="/dashboard/enquiries" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              View →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
