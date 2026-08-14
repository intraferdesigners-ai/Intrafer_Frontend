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

  // A Google-signup vendor account has no phone number until this is filled
  // in — Google doesn't supply one (see the Google OAuth Enablement plan,
  // §02/§05; User.phone is sparse, not required, for exactly this case).
  // Pre-filled for everyone else since PUT /auth/profile already supports
  // updating it.
  const [phone,        setPhone]        = useState(user?.phone || '');
  const [savingPhone,  setSavingPhone]  = useState(false);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSavingPhone(true);
    try {
      const { data } = await api.put('/auth/profile', { phone: phone.trim() });
      updateUser({ phone: data.data.user.phone });
      toast.success('Phone number saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save phone number.');
    }
    setSavingPhone(false);
  };

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

  return (
    <div>
      {/* Phone number */}
      <div style={CARD}>
        <span style={SECTION_LABEL}>Phone number</span>
        <form onSubmit={handleSavePhone} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            maxLength={10}
            hint="10-digit Indian mobile number"
          />
          <Button type="submit" variant="primary" size="md" loading={savingPhone} style={{ alignSelf: 'flex-start' }}>
            Save phone number
          </Button>
        </form>
      </div>

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
    </div>
  );
}
