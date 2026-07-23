'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, MapPin, Star, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import Button from '../../../../../components/ui/Button';
import CitySelect from '../../../../../components/ui/CitySelect';
import Spinner from '../../../../../components/ui/Spinner';

const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];

const BUDGET_RANGES = [
  'Below ₹3 Lakhs', '₹3–5 Lakhs', '₹5–10 Lakhs', '₹10–15 Lakhs',
  '₹15–25 Lakhs', '₹25–50 Lakhs', 'Above ₹50 Lakhs',
];

const SPECIALIZATIONS = [
  'All', 'Residential', 'Modular Kitchen', 'Living Room',
  'Office Interiors', 'Commercial', 'Bedroom', 'Bathroom',
];

const LABEL_STYLE = {
  fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
  color: 'var(--color-text-hint)', display: 'block', marginBottom: 6,
};

export default function NewEnquiryPage() {
  const router = useRouter();

  // Step 1 — vendor search/selection
  const [vendor,        setVendor]        = useState(null);
  const [searchCity,    setSearchCity]    = useState('');
  const [searchSpec,    setSearchSpec]    = useState('All');
  const [specOptions,   setSpecOptions]   = useState(SPECIALIZATIONS);
  const [vendors,       setVendors]       = useState([]);
  const [searchLoading, setSearchLoading] = useState(true);

  // Step 2 — requirement details
  const [projectType,  setProjectType]  = useState('');
  const [budget,        setBudget]       = useState('');
  const [city,          setCity]         = useState('');
  const [requirements,  setRequirements] = useState('');
  const [submitting,    setSubmitting]   = useState(false);
  const [error,         setError]        = useState('');

  useEffect(() => {
    api.get('/public/categories')
      .then(({ data }) => {
        const names = (data.data?.categories || []).map((c) => c.name);
        if (names.length > 0) setSpecOptions(['All', ...names]);
      })
      .catch(() => {});
  }, []);

  const runSearch = () => {
    setSearchLoading(true);
    const params = { limit: 12 };
    if (searchCity.trim())                     params.city = searchCity.trim();
    if (searchSpec && searchSpec !== 'All')     params.specialization = searchSpec;
    api.get('/public/vendors', { params })
      .then(({ data }) => setVendors(data.data?.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setSearchLoading(false));
  };

  useEffect(() => { runSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectVendor = (v) => {
    setVendor(v);
    setCity(v.location?.city || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!city.trim()) { setError('Please enter a city.'); return; }

    setSubmitting(true);
    try {
      const { data } = await api.post('/leads', {
        vendorId: vendor._id,
        projectType,
        budget,
        city: city.trim(),
        requirements: requirements.trim(),
      });
      const lead = data.data?.lead;
      toast.success('Enquiry submitted!');
      router.push(`/user/dashboard/enquiries/${lead._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Link
        href="/user/dashboard/enquiries"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ChevronLeft size={14} /> My enquiries
      </Link>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 6px',
      }}>
        New enquiry
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: '0 0 28px' }}>
        {vendor ? 'Tell us about your project.' : 'Pick a designer to send your enquiry to.'}
      </p>

      {!vendor ? (
        <div>
          {/* Search filters */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 160px' }}>
                <label style={LABEL_STYLE}>City</label>
                <CitySelect
                  value={searchCity}
                  onChange={setSearchCity}
                  placeholder="Search city..."
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={LABEL_STYLE}>Specialization</label>
                <select value={searchSpec} onChange={(e) => setSearchSpec(e.target.value)} className="form-select-styled">
                  {specOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button variant="primary" size="md" onClick={runSearch} style={{ flexShrink: 0 }}>
                <Search size={14} /> Search
              </Button>
            </div>
          </div>

          {/* Results */}
          {searchLoading ? (
            <div style={{ padding: '32px 0' }}><Spinner size="md" /></div>
          ) : vendors.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <Building2 size={32} color="var(--color-text-hint)" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0 }}>
                No designers found. Try a different search.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vendors.map((v) => (
                <div
                  key={v._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                    fontSize: 16, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {v.businessName?.[0]?.toUpperCase() || 'D'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                      {v.businessName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                      {v.location?.city && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-hint)' }}>
                          <MapPin size={11} /> {v.location.city}
                        </span>
                      )}
                      {v.rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-hint)' }}>
                          <Star size={11} /> {Number(v.rating).toFixed(1)}{v.reviewCount ? ` (${v.reviewCount})` : ''}
                        </span>
                      )}
                    </div>
                    {v.specializations?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {v.specializations.slice(0, 2).map((s) => (
                          <span key={s} style={{
                            fontSize: 10, background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                            padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button variant="primary" size="sm" onClick={() => handleSelectVendor(v)} style={{ flexShrink: 0 }}>
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Selected vendor confirmation chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-accent)', background: 'var(--color-primary-bg)',
            marginBottom: 24,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-surface)', color: 'var(--color-primary)',
              fontSize: 15, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {vendor.businessName?.[0]?.toUpperCase() || 'D'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                {vendor.businessName}
              </div>
              {vendor.location?.city && (
                <div style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>{vendor.location.city}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setVendor(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                fontSize: 12, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'underline',
              }}
            >
              Change
            </button>
          </div>

          {/* Requirement details */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 24,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL_STYLE}>Project type</label>
              <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="form-select-styled">
                <option value="">No preference</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={LABEL_STYLE}>Budget range</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className="form-select-styled">
                  <option value="">No preference</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>City</label>
                <CitySelect value={city} onChange={setCity} placeholder="e.g. Bangalore" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={LABEL_STYLE}>Requirements</label>
              <textarea
                className="form-textarea-styled"
                rows={4}
                placeholder="Describe your requirements, timeline, special requests..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
                fontSize: 13, padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={submitting} style={{ width: '100%' }}>
              Submit enquiry
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
