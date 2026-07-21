'use client';

import AccountSettings from '../../../../components/dashboard/AccountSettings';

export default function UserSettingsPage() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 28px',
      }}>
        Settings
      </h1>
      <AccountSettings />
    </div>
  );
}
