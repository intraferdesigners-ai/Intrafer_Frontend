'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 14,
};

const CARD = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24,
};

export default function AccountSettings() {
  const { user, updateUser } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingEmail,    setTogglingEmail]    = useState(false);

  const emailNotifications = user?.emailNotifications !== false;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
    setChangingPassword(false);
  };

  const handleToggleEmailNotifications = async () => {
    const next = !emailNotifications;
    setTogglingEmail(true);
    updateUser({ emailNotifications: next });
    try {
      await api.put('/auth/profile', { emailNotifications: next });
      toast.success(next ? 'Email notifications turned on.' : 'Email notifications turned off.');
    } catch (err) {
      updateUser({ emailNotifications: !next });
      toast.error(err.response?.data?.message || 'Failed to update preference.');
    }
    setTogglingEmail(false);
  };

  return (
    <div>
      {/* Change password */}
      <div style={CARD}>
        <span style={SECTION_LABEL}>Change password</span>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            hint="Minimum 8 characters"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" size="md" loading={changingPassword} style={{ alignSelf: 'flex-start' }}>
            Update password
          </Button>
        </form>
      </div>

      {/* Email notifications */}
      <div style={CARD}>
        <span style={SECTION_LABEL}>Notifications</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
              Email notifications
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-hint)', marginTop: 2 }}>
              Receive email updates about your leads, appointments, and account activity.
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleEmailNotifications}
            disabled={togglingEmail}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: emailNotifications ? 'var(--color-primary)' : 'var(--color-border)',
              border: 'none', cursor: togglingEmail ? 'not-allowed' : 'pointer', position: 'relative',
              transition: 'background 200ms', flexShrink: 0,
              opacity: togglingEmail ? 0.6 : 1,
            }}
          >
            <div style={{
              position: 'absolute', top: 2,
              left: emailNotifications ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 200ms',
              boxShadow: '0 1px 4px rgba(0,0,0,.2)',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
