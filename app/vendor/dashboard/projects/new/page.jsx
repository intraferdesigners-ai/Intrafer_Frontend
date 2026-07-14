'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import Button from '../../../../../components/ui/Button';
import Input from '../../../../../components/ui/Input';

const PROJECT_TYPES = [
  'Residential', 'Modular Kitchen', 'Living Room', 'Office Interiors',
  'Commercial', 'Bedroom', 'Bathroom', 'Full Home Interior',
];

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

const FIELD_LABEL = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: 6, letterSpacing: '0.01em',
};

const SELECT_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
};

const TEXTAREA_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
  fontFamily: 'var(--font-ui)',
  transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
};

export default function NewProjectPage() {
  const router     = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', projectType: 'Residential',
    location: '', completedYear: new Date().getFullYear(), isPublished: false,
  });
  const [imageFiles,      setImageFiles]      = useState([]);
  const [imagePreviews,   setImagePreviews]   = useState([]);
  const [beforeIndex,     setBeforeIndex]     = useState(null);
  const [afterIndex,      setAfterIndex]      = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const remaining = 10 - imageFiles.length;
    const toAdd = newFiles.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev)   => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    const shift = (idx) => (idx === null ? null : idx === index ? null : idx > index ? idx - 1 : idx);
    setBeforeIndex(shift);
    setAfterIndex(shift);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',         form.title.trim());
      fd.append('description',   form.description.trim());
      fd.append('projectType',   form.projectType);
      fd.append('location',      form.location.trim());
      fd.append('completedYear', form.completedYear);
      fd.append('isPublished',   form.isPublished);
      imageFiles.forEach((file) => fd.append('images', file));
      if (beforeIndex !== null) fd.append('beforeImageIndex', beforeIndex);
      if (afterIndex  !== null) fd.append('afterImageIndex',  afterIndex);

      setUploadProgress(0);
      await api.post('/vendor/projects', fd, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setUploadProgress(100);
      toast.success('Project added to your portfolio!');
      router.push('/vendor/dashboard/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add project.');
    }
    setLoading(false);
  };

  const pillStyle = (active) => ({
    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 150ms ease-out',
    ...(active
      ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
      : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
    ),
  });

  return (
    <div>
      <Link
        href="/vendor/dashboard/projects"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ChevronLeft size={14} /> Portfolio
      </Link>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 24px',
      }}>
        Add project
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 28,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>

          {/* Project details */}
          <div>
            <span style={SECTION_LABEL}>Project details</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Project title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Modern Living Room Redesign"
                required
              />
              <div>
                <label style={FIELD_LABEL}>Project type</label>
                <select
                  className="form-select"
                  value={form.projectType}
                  onChange={(e) => setForm((p) => ({ ...p, projectType: e.target.value }))}
                  style={SELECT_STYLE}
                >
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ gap: 12 }}>
                <Input
                  label="Location"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Bangalore, Karnataka"
                />
                <Input
                  label="Completed year"
                  type="number"
                  value={form.completedYear}
                  onChange={(e) => setForm((p) => ({ ...p, completedYear: e.target.value }))}
                  min={2000}
                  max={2030}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>Description</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the project scope, style, and outcome…"
                  style={TEXTAREA_STYLE}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Photos */}
          <div>
            <span style={SECTION_LABEL}>Photos</span>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: 32, textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 150ms ease-out',
              }}
            >
              <Upload size={32} color="var(--color-text-hint)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-sub)', margin: '0 0 4px' }}>
                Click to upload photos
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: 0 }}>
                10 max · JPEG, PNG, WebP · 5MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* Upload progress bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6, marginTop: 12 }}>
                <div style={{
                  background: 'var(--color-primary)', width: `${uploadProgress}%`,
                  borderRadius: 4, height: '100%', transition: 'width 300ms ease',
                }} />
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 8, marginTop: 12,
              }}>
                {imagePreviews.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--color-danger)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length >= 2 && (
              <div style={{ marginTop: 20 }}>
                <span style={SECTION_LABEL}>Before &amp; after selection</span>
                <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: '-6px 0 12px' }}>
                  Select which photos to use for the before/after comparison slider on your public profile.
                </p>

                <div style={{ marginBottom: 12 }}>
                  <label style={FIELD_LABEL}>Before image</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {imagePreviews.map((url, i) => (
                      <div
                        key={url}
                        onClick={() => setBeforeIndex(i)}
                        style={{
                          width: 80, height: 80, borderRadius: 'var(--radius-md)',
                          overflow: 'hidden', cursor: 'pointer',
                          border: beforeIndex === i ? '3px solid var(--color-primary)' : '3px solid transparent',
                          position: 'relative', flexShrink: 0,
                          opacity: afterIndex === i ? 0.4 : 1,
                        }}
                      >
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {beforeIndex === i && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'var(--color-primary)', color: '#fff',
                            fontSize: 9, fontWeight: 700, textAlign: 'center', padding: 2,
                          }}>
                            BEFORE
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={FIELD_LABEL}>After image</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {imagePreviews.map((url, i) => (
                      <div
                        key={url}
                        onClick={() => setAfterIndex(i)}
                        style={{
                          width: 80, height: 80, borderRadius: 'var(--radius-md)',
                          overflow: 'hidden', cursor: 'pointer',
                          border: afterIndex === i ? '3px solid var(--color-success)' : '3px solid transparent',
                          position: 'relative', flexShrink: 0,
                          opacity: beforeIndex === i ? 0.4 : 1,
                        }}
                      >
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {afterIndex === i && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'var(--color-success)', color: '#fff',
                            fontSize: 9, fontWeight: 700, textAlign: 'center', padding: 2,
                          }}>
                            AFTER
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Visibility */}
          <div>
            <span style={SECTION_LABEL}>Visibility</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={pillStyle(form.isPublished)}
                onClick={() => setForm((p) => ({ ...p, isPublished: true }))}
              >
                Publish immediately
              </button>
              <button
                type="button"
                style={pillStyle(!form.isPublished)}
                onClick={() => setForm((p) => ({ ...p, isPublished: false }))}
              >
                Save as draft
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
            Add to portfolio
          </Button>
        </div>
      </form>
    </div>
  );
}
