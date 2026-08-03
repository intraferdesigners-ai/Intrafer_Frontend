'use client';

import { useEffect, useState, useRef } from 'react';
import { Building2, Tag, Camera, Wrench, Plus, Trash2, CalendarClock, MapPin, MapPinned, Pencil, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import CitySelect from '../../../../components/ui/CitySelect';
import { getStateForCity } from '../../../../lib/cityStateMap';

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
    serviceLocations: [],
  });
  const [availability, setAvailability] = useState({
    startTime: '10:00', endTime: '18:00', slotDurationMinutes: 60,
  });
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [uploadingPhoto, setUploadingPhoto]  = useState(false);
  const [fieldErrors,    setFieldErrors]     = useState({});
  const [specOptions,    setSpecOptions]     = useState(SPECIALIZATION_OPTIONS);
  // True once the state field has been auto-filled from a CitySelect pick —
  // via the legacy CITY_STATE_MAP (small hand-curated list, kept for the
  // synchronous same-render lock the disabled prop below wants) or, for any
  // of the ~740 real cities that map doesn't cover, via onSelectPlace's
  // authoritative place.state. Either source locks the field the same way.
  const [stateAutoFilled, setStateAutoFilled] = useState(false);
  // Read-only by default once there's an existing profile to show; a brand
  // new vendor with nothing saved yet starts straight in edit mode (see the
  // profile-fetch effect below), since there'd be nothing to view. Cancel
  // restores from this snapshot rather than re-fetching, so it also discards
  // an in-progress (unsaved) photo upload's effect on `form` — though the
  // photo itself was already persisted server-side by handlePhotoChange.
  const [editMode, setEditMode] = useState(false);
  const savedFormRef = useRef(null);

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
        const loaded = {
          businessName:    v.businessName    || '',
          description:     v.description     || '',
          city:            v.location?.city  || '',
          state:           v.location?.state || '',
          pincode:         v.location?.pincode || '',
          specializations: v.specializations || [],
          profilePhoto:    v.profilePhoto     || '',
          services:        v.services         || [],
          serviceLocations: v.serviceLocations || [],
        };
        setForm(loaded);
        savedFormRef.current = loaded;
        // Nothing saved yet — go straight to the form instead of an empty
        // read-only view with no obvious way in.
        setEditMode(!v.businessName);
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

  // City -> state is many-to-one in this app's city list, so state auto-fills
  // and locks whenever the selected city has a known mapping. This also
  // silently corrects any stale mismatched state from old freeform data
  // (e.g. a city saved with the wrong state) the next time the profile loads
  // or the vendor picks a new city — falls back to the freeform field only
  // for a custom-typed city that isn't in the map.
  useEffect(() => {
    const mapped = getStateForCity(form.city);
    if (mapped) {
      setForm((p) => (p.state === mapped ? p : { ...p, state: mapped }));
      setStateAutoFilled(true);
    }
  }, [form.city]);

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
      // navigates away before hitting "Save changes" below. Also updates
      // the saved-snapshot ref, since it's already committed server-side —
      // hitting Cancel afterward shouldn't revert a photo that's already
      // saved, only the other still-unsaved form fields.
      await api.put('/vendor/profile', { profilePhoto: url });
      setForm((p) => ({ ...p, profilePhoto: url }));
      if (savedFormRef.current) savedFormRef.current = { ...savedFormRef.current, profilePhoto: url };
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    }
    setUploadingPhoto(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
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
        serviceLocations: form.serviceLocations.filter((l) => l.city.trim() && l.state.trim()),
      });
      savedFormRef.current = form;
      setEditMode(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const byField = {};
        errors.forEach((e) => { byField[e.field] = e.message; });
        setFieldErrors(byField);
        toast.error(errors.length === 1 ? errors[0].message : `${errors.length} fields need attention — see highlighted fields below.`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save profile.');
      }
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    if (savedFormRef.current) setForm(savedFormRef.current);
    setFieldErrors({});
    setEditMode(false);
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

  const addServiceLocation = () => {
    setForm((prev) => ({
      ...prev,
      serviceLocations: [...prev.serviceLocations, { city: '', state: '', pincode: '', placeId: null }],
    }));
  };

  const updateServiceLocation = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      serviceLocations: prev.serviceLocations.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    }));
  };

  const removeServiceLocation = (index) => {
    setForm((prev) => ({
      ...prev,
      serviceLocations: prev.serviceLocations.filter((_, i) => i !== index),
    }));
  };

  // Pincode is exactly 6 digits, so there's no ambiguity about when it's
  // "done" — the lookup fires the moment the 6th digit lands, no debounce
  // timer needed. A miss (no matching Locality) is silent: city/state just
  // stay whatever they already were, editable as normal, rather than
  // blocking entry for a pincode our India Post-derived dataset doesn't
  // happen to cover.
  const handlePincodeChange = async (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 6);
    updateServiceLocation(index, 'pincode', digits);
    if (digits.length !== 6) return;

    try {
      const { data } = await api.get(`/public/pincode/${digits}`);
      const { city, state, placeId } = data.data;
      setForm((prev) => ({
        ...prev,
        serviceLocations: prev.serviceLocations.map((l, i) =>
          i === index ? { ...l, city, state, placeId } : l
        ),
      }));
    } catch {
      // No matching pincode in the dataset — leave city/state as-is.
    }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: 0,
        }}>
          Business profile
        </h1>
        {editMode ? (
          savedFormRef.current && (
            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
              <X size={14} /> Cancel
            </Button>
          )
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>
            <Pencil size={14} /> Edit
          </Button>
        )}
      </div>

      {!editMode && (
        <ProfileSummary form={form} availability={availability} />
      )}

      {editMode && (
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
              onChange={(e) => { setForm((p) => ({ ...p, businessName: e.target.value })); setFieldErrors((fe) => ({ ...fe, businessName: undefined })); }}
              placeholder="Your studio or business name"
              error={fieldErrors.businessName}
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
                onChange={(city) => { setForm((p) => ({ ...p, city })); setStateAutoFilled(false); }}
                onSelectPlace={(place) => {
                  setForm((p) => ({ ...p, state: place.state }));
                  setStateAutoFilled(true);
                }}
                placeholder="Search or type city..."
              />
            </div>
            <Input
              label="State"
              value={form.state}
              onChange={(e) => { setForm((p) => ({ ...p, state: e.target.value })); setFieldErrors((fe) => ({ ...fe, 'location.state': undefined })); }}
              placeholder="e.g. Karnataka"
              disabled={stateAutoFilled}
              hint={stateAutoFilled ? 'Auto-filled from city' : undefined}
              error={fieldErrors['location.state']}
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) => { setForm((p) => ({ ...p, pincode: e.target.value })); setFieldErrors((fe) => ({ ...fe, 'location.pincode': undefined })); }}
              placeholder="560001"
              inputMode="numeric"
              maxLength={6}
              error={fieldErrors['location.pincode']}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        {/* Service locations — cities/areas served beyond the business
            address above (e.g. a Bengaluru-based studio that also takes
            projects in Mysuru). Entering a pincode looks up its city/state
            from the same India Post-derived dataset CitySelect searches, but
            the fields stay fully editable afterward — the lookup is a
            starting point, not a lock. */}
        <div>
          <span style={SECTION_LABEL}>
            <MapPinned size={10} style={{ display: 'inline', marginRight: 4 }} />
            Service locations <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </span>
          <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: '-6px 0 12px' }}>
            Other cities or areas you take on projects in, beyond your business address above.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {form.serviceLocations.map((loc, i) => (
              <div key={i} style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                background: 'var(--color-surface-alt)',
              }}>
                <div className="form-row-3" style={{ gap: 10 }}>
                  <Input
                    label="Pincode"
                    value={loc.pincode}
                    onChange={(e) => handlePincodeChange(i, e.target.value)}
                    placeholder="560034"
                    inputMode="numeric"
                    maxLength={6}
                    hint="Type to auto-fill city/state"
                  />
                  <Input
                    label="City"
                    value={loc.city}
                    onChange={(e) => updateServiceLocation(i, 'city', e.target.value)}
                    placeholder="e.g. Mysuru"
                  />
                  <Input
                    label="State"
                    value={loc.state}
                    onChange={(e) => updateServiceLocation(i, 'state', e.target.value)}
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeServiceLocation(i)}
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

            <Button variant="secondary" size="sm" type="button" onClick={addServiceLocation} style={{ alignSelf: 'flex-start' }}>
              <Plus size={14} /> Add service location
            </Button>
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
      )}
    </div>
  );
}

function formatTime12h(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

const PRICE_UNIT_LABEL = { flat: 'flat rate', per_sqft: '/ sq. ft.', per_room: '/ room' };

// Read-only counterpart to the form above — shown by default once a profile
// exists, so the page reads as a finished business listing rather than a
// permanently-open form. "Edit" (in the header) switches back to the form.
function ProfileSummary({ form, availability }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)', padding: 28,
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
          background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {form.profilePhoto ? (
            <img src={form.profilePhoto} alt={form.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Building2 size={26} color="var(--color-text-hint)" />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400,
            color: 'var(--color-text)', margin: '0 0 4px',
          }}>
            {form.businessName}
          </h2>
          {(form.city || form.state) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-sub)' }}>
              <MapPin size={13} />
              {[form.city, form.state].filter(Boolean).join(', ')}
              {form.pincode ? ` · ${form.pincode}` : ''}
            </div>
          )}
        </div>
      </div>

      {form.description && (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-sub)', margin: 0 }}>
          {form.description}
        </p>
      )}

      {form.specializations.length > 0 && (
        <div>
          <span style={SECTION_LABEL}>
            <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />
            Specializations
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.specializations.map((spec) => (
              <span key={spec} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                border: '1px solid var(--color-accent)',
              }}>
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {form.services.length > 0 && (
        <div>
          <span style={SECTION_LABEL}>
            <Wrench size={10} style={{ display: 'inline', marginRight: 4 }} />
            Services
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.services.map((service, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{service.name}</span>
                {service.startingPrice != null && service.startingPrice !== '' && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-hint)', whiteSpace: 'nowrap' }}>
                    from ₹{Number(service.startingPrice).toLocaleString('en-IN')} {PRICE_UNIT_LABEL[service.priceUnit] || ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {form.serviceLocations.length > 0 && (
        <div>
          <span style={SECTION_LABEL}>
            <MapPinned size={10} style={{ display: 'inline', marginRight: 4 }} />
            Service locations
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.serviceLocations.map((loc, i) => (
              <span key={i} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)',
                border: '1px solid var(--color-border)',
              }}>
                {[loc.city, loc.state].filter(Boolean).join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <span style={SECTION_LABEL}>
          <CalendarClock size={10} style={{ display: 'inline', marginRight: 4 }} />
          Availability
        </span>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: 0 }}>
          {formatTime12h(availability.startTime)} – {formatTime12h(availability.endTime)} · {availability.slotDurationMinutes} min slots
        </p>
      </div>
    </div>
  );
}
