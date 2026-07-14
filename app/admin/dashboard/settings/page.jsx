'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import {
  Globe, Mail, Phone, MessageCircle, AlertTriangle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => setSettings(res.data.data?.settings))
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading || !settings) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
        animation: 'spin 600ms linear infinite',
      }} />
    </div>
  );

  const card = (children) => (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: '24px', marginBottom: '16px',
    }}>
      {children}
    </div>
  );

  const sectionLabel = (text) => (
    <div className="caps-label" style={{ marginBottom: '16px' }}>{text}</div>
  );

  const fieldLabel = (text) => (
    <label style={{
      display: 'block', fontSize: '12px', fontWeight: 600,
      color: 'var(--text-hint)', letterSpacing: '.05em',
      textTransform: 'uppercase', marginBottom: '6px',
    }}>{text}</label>
  );

  const toggle = (key, label, description) => (
    <div key={key} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '2px' }}>{description}</div>
      </div>
      <button
        onClick={() => update(key, !settings[key])}
        style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: settings[key] ? 'var(--primary)' : 'var(--border-emp)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 200ms', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '2px',
          left: settings[key] ? '22px' : '2px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#fff', transition: 'left 200ms',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '28px',
          fontWeight: 400, color: 'var(--text)', marginBottom: '4px',
        }}>Platform settings</div>
        <div style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
          Configure platform behaviour, contact details, and limits.
        </div>
      </div>

      {/* Site information */}
      {card(<>
        {sectionLabel('SITE INFORMATION')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Site name" icon={Globe}
            value={settings.site_name}
            onChange={(e) => update('site_name', e.target.value)} />
          <Input label="Tagline" icon={Globe}
            value={settings.site_tagline}
            onChange={(e) => update('site_tagline', e.target.value)} />
          <Input label="Support email" icon={Mail}
            value={settings.support_email}
            onChange={(e) => update('support_email', e.target.value)} />
          <Input label="Support phone" icon={Phone}
            value={settings.support_phone}
            onChange={(e) => update('support_phone', e.target.value)} />
          <Input label="WhatsApp number (with country code)" icon={MessageCircle}
            value={settings.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            hint="e.g. 919876500000 (no + or spaces)" />
        </div>
      </>)}

      {/* Lead settings */}
      {card(<>
        {sectionLabel('LEAD SETTINGS')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            {fieldLabel('Lead expiry (hours)')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number" min="1" max="168"
                value={settings.lead_expiry_hours}
                onChange={(e) => update('lead_expiry_hours', parseInt(e.target.value, 10))}
                className="form-input-styled settings-number-input"
                style={{ maxWidth: '120px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
                hours before auto-reassignment
              </span>
            </div>
          </div>
          <div>
            {fieldLabel('Max leads per vendor / month')}
            <input type="number" min="1" max="500"
              value={settings.max_leads_per_vendor}
              onChange={(e) => update('max_leads_per_vendor', parseInt(e.target.value, 10))}
              className="form-input-styled settings-number-input"
              style={{ maxWidth: '120px' }} />
          </div>
        </div>
      </>)}

      {/* Popup settings */}
      {card(<>
        {sectionLabel('LEAD CAPTURE POPUP')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            {fieldLabel('Show popup after (seconds)')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" min="5" max="120"
                value={settings.popup_delay_seconds}
                onChange={(e) => update('popup_delay_seconds', parseInt(e.target.value, 10))}
                className="form-input-styled settings-number-input"
                style={{ maxWidth: '120px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>seconds</span>
            </div>
          </div>
          <div>
            {fieldLabel('Re-show after dismissal (minutes)')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" min="1" max="60"
                value={settings.popup_retry_minutes}
                onChange={(e) => update('popup_retry_minutes', parseInt(e.target.value, 10))}
                className="form-input-styled settings-number-input"
                style={{ maxWidth: '120px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>minutes</span>
            </div>
          </div>
        </div>
      </>)}

      {/* Platform controls */}
      {card(<>
        {sectionLabel('PLATFORM CONTROLS')}
        {toggle('allow_new_registrations', 'Allow new registrations',
          'When off, vendors and users cannot create new accounts')}
        {toggle('maintenance_mode', 'Maintenance mode',
          'When on, public website shows a maintenance message')}
      </>)}

      {/* Maintenance mode warning */}
      {settings.maintenance_mode && (
        <div style={{
          background: 'var(--warning-bg)', border: '1px solid var(--warning)',
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
          display: 'flex', gap: '10px', marginBottom: '16px',
        }}>
          <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '13px', color: 'var(--warning)' }}>
            <strong>Maintenance mode is ON.</strong> The public website is
            currently unavailable to visitors. Remember to turn this off
            after maintenance is complete.
          </div>
        </div>
      )}

      {/* Save button */}
      <Button
        variant="primary"
        size="lg"
        loading={saving}
        onClick={handleSave}
        style={{ width: '100%' }}
      >
        Save all settings
      </Button>

      <div style={{
        fontSize: '12px', color: 'var(--text-hint)',
        textAlign: 'center', marginTop: '12px',
      }}>
        Settings are saved to the database and apply immediately.
      </div>
    </div>
  );
}
