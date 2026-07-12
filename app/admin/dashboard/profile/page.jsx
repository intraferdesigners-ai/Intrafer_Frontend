'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function AdminProfilePage() {
  const [user, setUser]         = useState(null);
  const [form, setForm]         = useState({ name: '', phone: '' });
  const [pwForm, setPwForm]     = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/admin/profile')
      .then((res) => {
        const u = res.data.data?.user;
        setUser(u);
        setForm({ name: u?.name || '', phone: u?.phone || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim())
      return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      await api.put('/admin/profile', form);
      toast.success('Profile updated!');
      setUser((prev) => ({ ...prev, ...form }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current)
      return toast.error('Enter your current password');
    if (pwForm.new.length < 8)
      return toast.error('New password must be at least 8 characters');
    if (pwForm.new !== pwForm.confirm)
      return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await api.put('/admin/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
      });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
        animation: 'spin 600ms linear infinite',
      }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }}>

      {/* Page heading */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '28px',
          fontWeight: 400, color: 'var(--text)', marginBottom: '4px',
        }}>Admin profile</div>
        <div style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
          Manage your admin account details and security settings.
        </div>
      </div>

      {/* Avatar + role badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '28px',
        background: 'var(--bg-parchment)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '20px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(59,130,246,.3)',
        }}>
          <span style={{
            fontSize: '22px', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>
            {getInitials(user?.name || 'Admin')}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
            {user?.name}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'var(--primary-bg)', color: 'var(--primary)',
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 600, marginTop: '4px',
          }}>
            <Shield size={11} />
            Super Admin
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '4px' }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Personal details card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '24px', marginBottom: '16px',
      }}>
        <div className="caps-label" style={{ marginBottom: '16px' }}>
          PERSONAL DETAILS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Full name"
            icon={User}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Admin name"
          />
          <Input
            label="Email address"
            icon={Mail}
            value={user?.email || ''}
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
          style={{ width: '100%', marginTop: '20px' }}
        >
          Save changes
        </Button>
      </div>

      {/* Change password card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '24px',
      }}>
        <div className="caps-label" style={{ marginBottom: '4px' }}>
          CHANGE PASSWORD
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginBottom: '16px' }}>
          Use a strong password with at least 8 characters.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Current password */}
          <div>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-hint)', letterSpacing: '.05em',
              textTransform: 'uppercase', marginBottom: '6px',
            }}>Current password</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-hint)',
              }}>
                <Lock size={15} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                placeholder="Enter current password"
                className="form-input-styled"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
              />
              <button onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--text-hint)', cursor: 'pointer',
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-hint)', letterSpacing: '.05em',
              textTransform: 'uppercase', marginBottom: '6px',
            }}>New password</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-hint)',
              }}>
                <Lock size={15} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.new}
                onChange={(e) => setPwForm((f) => ({ ...f, new: e.target.value }))}
                placeholder="Min 8 characters"
                className="form-input-styled"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-hint)', letterSpacing: '.05em',
              textTransform: 'uppercase', marginBottom: '6px',
            }}>Confirm new password</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-hint)',
              }}>
                <Lock size={15} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="form-input-styled"
                style={{ paddingLeft: '42px' }}
              />
            </div>
            {/* Match indicator */}
            {pwForm.new && pwForm.confirm && (
              <div style={{
                fontSize: '11px', marginTop: '4px',
                color: pwForm.new === pwForm.confirm
                  ? 'var(--success)' : 'var(--danger)',
              }}>
                {pwForm.new === pwForm.confirm
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </div>
            )}
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          loading={savingPw}
          onClick={handleChangePassword}
          style={{ width: '100%', marginTop: '20px' }}
        >
          Change password
        </Button>
      </div>
    </div>
  );
}
