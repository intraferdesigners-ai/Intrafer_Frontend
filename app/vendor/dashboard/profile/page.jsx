'use client';

import { useEffect, useState, useRef } from 'react';
import { Building2, Tag, Camera, Wrench, Plus, Trash2, CalendarClock } from 'lucide-react';
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
  const fileInputRef = useRef(null);

  const [form,    setForm]    = useState({
    businessName: '', description: '',
    city: '', state: '', pincode: '',
    specializations: [], profilePhoto: '',
    services: [],
  });
  const [availability, setAvailability] = useState({
    startTime: '10:00', endTime: '18:00', slotDurationMinutes: 60,
  });
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [uploadingPhoto, setUploadingPhoto]  = useState(false);
  const [specOptions,    setSpecOptions]     = useState(SPECIALIZATION_OPTIONS);

  // Prefer admin-managed categories when available; silently keep the
  // hardcoded fallback list if the endpoint fails or returns nothing.
  useEffect(() => {
    api.get('/public/categories')
      .then(({ data }) => {
        const names = (data.data?.categories || []).map((c) => c.name);
        if (names.length > 0) setSpecOptions(names);
      })
      .catch(() => {});
  }, []);

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
          profilePhoto:    v.profilePhoto     || '',
          services:        v.services         || [],
        });
        if (v.availability) {
          setAvailability({
            startTime: v.availability.startTime || '10:00',
            endTime: v.availability.endTime || '18:00',
            slotDurationMinutes: v.availability.slotDurationMinutes || 60,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.post('/upload/avatar', fd, {
        headers: { 'Content-Type': undefined },
      });
      const url = data.data?.url || data.url;
      // Persist immediately so a photo change survives even if the user
      // navigates away before hitting "Save changes" below.
      await api.put('/vendor/profile', { profilePhoto: url });
      setForm((p) => ({ ...p, profilePhoto: url }));
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    }
    setUploadingPhoto(false);
    e.target.value = '';
  };

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
        services: form.services
          .filter((s) => s.name.trim())
          .map((s) => ({
            ...s,
            startingPrice: s.startingPrice === '' || s.startingPrice == null ? undefined : Number(s.startingPrice),
          })),
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    }
    setSaving(false);
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await api.put('/vendor/availability', availability);
      toast.success('Availability updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save availability.');
    }
    setSavingAvailability(false);
  };

  const toggleSpec = (spec) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', startingPrice: '', priceUnit: 'flat' }],
    }));
  };

  const updateService = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const removeService = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
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

        {/* Profile photo */}
        <div>
          <span style={SECTION_LABEL}>Profile photo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploadingPhoto ? 'wait' : 'pointer', flexShrink: 0,
                opacity: uploadingPhoto ? 0.6 : 1,
              }}
            >
              {form.profilePhoto ? (
                <img src={form.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={26} color="var(--color-text-hint)" />
              )}
            </div>
            <div>
              <Button
                variant="secondary" size="sm" loading={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} /> {form.profilePhoto ? 'Change photo' : 'Upload photo'}
              </Button>
              <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: '8px 0 0' }}>
                JPEG, PNG, or WebP · up to 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

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
          <div className="form-row-3" style={{ gap: 12 }}>
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
            {specOptions.map((spec) => (
              <button key={spec} type="button" style={specPillStyle(spec)} onClick={() => toggleSpec(spec)}>
                {spec}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Services */}
        <div>
          <span style={SECTION_LABEL}>
            <Wrench size={10} style={{ display: 'inline', marginRight: 4 }} />
            Services
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {form.services.map((service, i) => (
              <div key={i} style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                background: 'var(--color-surface-alt)',
              }}>
                <div className="form-row" style={{ gap: 10 }}>
                  <Input
                    label="Service name"
                    value={service.name}
                    onChange={(e) => updateService(i, 'name', e.target.value)}
                    placeholder="e.g. Modular Kitchen Design"
                  />
                  <Input
                    label="Starting price (₹)"
                    type="number"
                    value={service.startingPrice}
                    onChange={(e) => updateService(i, 'startingPrice', e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label style={FIELD_LABEL}>Price unit</label>
                  <select
                    className="form-input-styled"
                    value={service.priceUnit}
                    onChange={(e) => updateService(i, 'priceUnit', e.target.value)}
                  >
                    <option value="flat">Flat rate</option>
                    <option value="per_sqft">Per sq. ft.</option>
                    <option value="per_room">Per room</option>
                  </select>
                </div>

                <div>
                  <label style={FIELD_LABEL}>Description (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={service.description}
                    onChange={(e) => updateService(i, 'description', e.target.value)}
                    placeholder="Briefly describe what's included…"
                    style={TEXTAREA_STYLE}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeService(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', marginLeft: 'auto',
                    color: 'var(--color-danger)',
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}

            <Button variant="secondary" size="sm" type="button" onClick={addService} style={{ alignSelf: 'flex-start' }}>
              <Plus size={14} /> Add service
            </Button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Availability */}
        <div>
          <span style={SECTION_LABEL}>
            <CalendarClock size={10} style={{ display: 'inline', marginRight: 4 }} />
            Availability
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row-3" style={{ gap: 12 }}>
              <div>
                <label style={FIELD_LABEL}>Start time</label>
                <input
                  type="time"
                  className="form-input-styled"
                  value={availability.startTime}
                  onChange={(e) => setAvailability((p) => ({ ...p, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>End time</label>
                <input
                  type="time"
                  className="form-input-styled"
                  value={availability.endTime}
                  onChange={(e) => setAvailability((p) => ({ ...p, endTime: e.target.value }))}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>Slot duration</label>
                <select
                  className="form-input-styled"
                  value={availability.slotDurationMinutes}
                  onChange={(e) => setAvailability((p) => ({ ...p, slotDurationMinutes: Number(e.target.value) }))}
                >
                  <option value={30}>30 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
            </div>

            <Button
              variant="secondary" size="sm" type="button"
              loading={savingAvailability} onClick={handleSaveAvailability}
              style={{ alignSelf: 'flex-start' }}
            >
              Save availability
            </Button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Save */}
        <Button variant="primary" size="lg" loading={saving} onClick={handleSave} style={{ width: '100%' }}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
