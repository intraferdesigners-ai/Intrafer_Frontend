'use client';

import { useEffect, useState } from 'react';
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

const EVENT_LABELS = {
  leadAssigned:          'New lead notifications',
  leadAccepted:          'Lead accepted notifications',
  appointmentConfirmed:  'Appointment confirmed notifications',
  paymentSuccess:        'Payment confirmation notifications',
};

const VENDOR_EVENT_KEYS = ['leadAssigned', 'paymentSuccess'];
const USER_EVENT_KEYS   = ['leadAccepted', 'appointmentConfirmed'];

function ToggleSwitch({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative',
        transition: 'background 200ms', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 200ms',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
      }} />
    </button>
  );
}

export default function AccountSettings() {
  const { user, role, updateUser } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingEmail,    setTogglingEmail]    = useState(false);

  const [preferences,    setPreferences]    = useState({});
  const [loadingPrefs,   setLoadingPrefs]   = useState(true);
  const [savingPrefKey,  setSavingPrefKey]  = useState(null);

  const emailNotifications = user?.emailNotifications !== false;

  // There's no GET endpoint for notificationPreferences yet — PUT
  // /auth/notification-preferences already returns the full current object
  // on every call, and an empty body is a documented no-op merge (nothing
  // gets $set), so this reads current state without any backend change.
  useEffect(() => {
    api.put('/auth/notification-preferences', {})
      .then(({ data }) => setPreferences(data.data?.notificationPreferences || {}))
      .catch(() => {})
      .finally(() => setLoadingPrefs(false));
  }, []);

  const isChannelOn = (eventKey, channel) => {
    const pref = preferences?.[eventKey]?.[channel];
    if (pref !== undefined) return pref;
    return channel === 'email' ? emailNotifications : true;
  };

  const handleTogglePreference = async (eventKey, channel) => {
    const current = isChannelOn(eventKey, channel);
    const next = !current;
    const prefKey = `${eventKey}.${channel}`;

    setSavingPrefKey(prefKey);
    setPreferences((prev) => ({
      ...prev,
      [eventKey]: { ...prev[eventKey], [channel]: next },
    }));
    try {
      await api.put('/auth/notification-preferences', { [eventKey]: { [channel]: next } });
      toast.success('Preference updated.');
    } catch (err) {
      setPreferences((prev) => ({
        ...prev,
        [eventKey]: { ...prev[eventKey], [channel]: current },
      }));
      toast.error(err.response?.data?.message || 'Failed to update preference.');
    }
    setSavingPrefKey(null);
  };

  const visibleEventKeys = role === 'vendor' ? VENDOR_EVENT_KEYS : role === 'user' ? USER_EVENT_KEYS : [];

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
          <ToggleSwitch on={emailNotifications} onClick={handleToggleEmailNotifications} disabled={togglingEmail} />
        </div>

        {/* Per-event notification preferences */}
        {!loadingPrefs && visibleEventKeys.length > 0 && visibleEventKeys.map((eventKey) => {
          const emailKey    = `${eventKey}.email`;
          const whatsappKey = `${eventKey}.whatsapp`;
          return (
            <div
              key={eventKey}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                paddingTop: 16, marginTop: 16, borderTop: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                {EVENT_LABELS[eventKey]}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ToggleSwitch
                    on={isChannelOn(eventKey, 'email')}
                    onClick={() => handleTogglePreference(eventKey, 'email')}
                    disabled={savingPrefKey === emailKey}
                  />
                  <span style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>Email</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ToggleSwitch
                    on={isChannelOn(eventKey, 'whatsapp')}
                    onClick={() => handleTogglePreference(eventKey, 'whatsapp')}
                    disabled={savingPrefKey === whatsappKey}
                  />
                  <span style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>WhatsApp</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
