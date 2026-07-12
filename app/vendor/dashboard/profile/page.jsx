'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Tag, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import CitySelect from '../../../../components/ui/CitySelect';

const SPECIALIZATION_OPTIONS = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

const TEXTAREA_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
  fontFamily: 'var(--font-ui)',
  transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
};

const FIELD_LABEL = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: 6, letterSpacing: '0.01em',
};

export default function VendorProfilePage() {
  const [form,    setForm]    = useState({
    businessName: '', description: '',
    city: '', state: '', pincode: '',
    specializations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/vendor/profile')
      .then(({ data }) => {
        const v = data.data?.vendor || data.vendor;
        if (!v) return;
        setForm({
          businessName:    v.businessName    || '',
          description:     v.description     || '',
          city:            v.location?.city  || '',
          state:           v.location?.state || '',
          pincode:         v.location?.pincode || '',
          specializations: v.specializations || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/vendor/profile', {
        businessName: form.businessName,
        description:  form.description,
        location: {
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
        },
        specializations: form.specializations,
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    }
    setSaving(false);
  };

  const toggleSpec = (spec) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const specPillStyle = (spec) => {
    const active = form.specializations.includes(spec);
    return {
      padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', letterSpacing: '0.01em',
      transition: 'all 150ms ease-out',
      ...(active
        ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
        : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
      ),
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>Loading profile…</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 28px',
      }}>
        Business profile
      </h1>

      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 28,
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>

        {/* Business details */}
        <div>
          <span style={SECTION_LABEL}>Business details</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Business name"
              icon={Building2}
              value={form.businessName}
              onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
              placeholder="Your studio or business name"
            />
            <div>
              <label style={FIELD_LABEL}>Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your studio, experience, and design philosophy…"
                style={TEXTAREA_STYLE}
              />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Location */}
        <div>
          <span style={SECTION_LABEL}>Location</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--color-text-hint)',
              }}>
                City
              </label>
              <CitySelect
                value={form.city}
                onChange={(city) => setForm((p) => ({ ...p, city }))}
                placeholder="Search or type city..."
              />
            </div>
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="e.g. Karnataka"
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
              placeholder="560001"
              inputMode="numeric"
              maxLength={6}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Specializations */}
        <div>
          <span style={SECTION_LABEL}>
            <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />
            Specializations
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <button key={spec} type="button" style={specPillStyle(spec)} onClick={() => toggleSpec(spec)}>
                {spec}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Save */}
        <Button variant="primary" size="lg" loading={saving} onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
