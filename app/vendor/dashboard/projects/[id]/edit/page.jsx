'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../../lib/api';
import Button from '../../../../../../components/ui/Button';
import Input from '../../../../../../components/ui/Input';
import Spinner from '../../../../../../components/ui/Spinner';

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

export default function EditProjectPage() {
  const router  = useRouter();
  const params  = useParams();
  const projectId = params.id;
  const fileInputRef = useRef(null);

  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    title: '', description: '', projectType: 'Residential',
    location: '', completedYear: new Date().getFullYear(), isPublished: false,
  });

  // Images already saved on the project (real server URLs)
  const [existingImages, setExistingImages] = useState([]);
  // Newly picked files for this edit (local blob previews only)
  const [newFiles,    setNewFiles]    = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Before/after selection: { kind: 'existing', url } | { kind: 'new', index } | null
  const [beforeSel, setBeforeSel] = useState(null);
  const [afterSel,  setAfterSel]  = useState(null);

  useEffect(() => {
    api.get(`/vendor/projects/${projectId}`)
      .then(({ data }) => {
        const project = data.data?.project;
        if (!project) { setNotFound(true); return; }
        setForm({
          title: project.title || '',
          description: project.description || '',
          projectType: project.projectType || 'Residential',
          location: project.location || '',
          completedYear: project.completedYear || new Date().getFullYear(),
          isPublished: !!project.isPublished,
        });
        setExistingImages(project.images || []);
        if (project.beforeImage) setBeforeSel({ kind: 'existing', url: project.beforeImage });
        if (project.afterImage)  setAfterSel({ kind: 'existing', url: project.afterImage });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [projectId]);

  const totalImageCount = existingImages.length + newPreviews.length;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - totalImageCount;
    const toAdd = files.slice(0, remaining);
    setNewFiles((prev)    => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setBeforeSel((sel) => (sel?.kind === 'existing' && sel.url === url ? null : sel));
    setAfterSel((sel)  => (sel?.kind === 'existing' && sel.url === url ? null : sel));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev)    => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    const shift = (sel) => {
      if (sel?.kind !== 'new') return sel;
      if (sel.index === index) return null;
      return sel.index > index ? { kind: 'new', index: sel.index - 1 } : sel;
    };
    setBeforeSel(shift);
    setAfterSel(shift);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',         form.title.trim());
      fd.append('description',   form.description.trim());
      fd.append('projectType',   form.projectType);
      fd.append('location',      form.location.trim());
      fd.append('completedYear', form.completedYear);
      fd.append('isPublished',   form.isPublished);
      fd.append('existingImages', JSON.stringify(existingImages));
      newFiles.forEach((file) => fd.append('images', file));

      if (beforeSel?.kind === 'existing') fd.append('beforeImage', beforeSel.url);
      else if (beforeSel?.kind === 'new') fd.append('beforeImageIndex', beforeSel.index);

      if (afterSel?.kind === 'existing') fd.append('afterImage', afterSel.url);
      else if (afterSel?.kind === 'new') fd.append('afterImageIndex', afterSel.index);

      setUploadProgress(0);
      await api.put(`/vendor/projects/${projectId}`, fd, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setUploadProgress(100);
      toast.success('Project updated.');
      router.push('/vendor/dashboard/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project.');
    }
    setSaving(false);
  };

  const pillStyle = (active) => ({
    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 150ms ease-out',
    ...(active
      ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
      : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
    ),
  });

  if (loading) {
    return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;
  }

  if (notFound) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--color-text)', marginBottom: 16 }}>Project not found.</p>
        <Link href="/vendor/dashboard/projects" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
          ← Back to portfolio
        </Link>
      </div>
    );
  }

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
        Edit project
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

            {existingImages.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 8, marginBottom: 12,
              }}>
                {existingImages.map((url) => (
                  <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={url}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
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
                Click to upload more photos
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: 0 }}>
                10 max total · JPEG, PNG, WebP · 5MB each
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

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6, marginTop: 12 }}>
                <div style={{
                  background: 'var(--color-primary)', width: `${uploadProgress}%`,
                  borderRadius: 4, height: '100%', transition: 'width 300ms ease',
                }} />
              </div>
            )}

            {newPreviews.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 8, marginTop: 12,
              }}>
                {newPreviews.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={url}
                      alt={`New ${i + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
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

            {totalImageCount >= 2 && (
              <div style={{ marginTop: 20 }}>
                <span style={SECTION_LABEL}>Before &amp; after selection</span>
                <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: '-6px 0 12px' }}>
                  Select which photos to use for the before/after comparison slider on your public profile.
                </p>

                <BeforeAfterPicker
                  label="Before image"
                  activeColor="var(--color-primary)"
                  badge="BEFORE"
                  existingImages={existingImages}
                  newPreviews={newPreviews}
                  selection={beforeSel}
                  otherSelection={afterSel}
                  onSelect={setBeforeSel}
                />

                <BeforeAfterPicker
                  label="After image"
                  activeColor="var(--color-success)"
                  badge="AFTER"
                  existingImages={existingImages}
                  newPreviews={newPreviews}
                  selection={afterSel}
                  otherSelection={beforeSel}
                  onSelect={setAfterSel}
                />
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
          <Button type="submit" variant="primary" size="lg" loading={saving} style={{ width: '100%' }}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function BeforeAfterPicker({ label, activeColor, badge, existingImages, newPreviews, selection, otherSelection, onSelect }) {
  const isSelected = (kind, key) =>
    selection?.kind === kind && (kind === 'existing' ? selection.url === key : selection.index === key);
  const isOther = (kind, key) =>
    otherSelection?.kind === kind && (kind === 'existing' ? otherSelection.url === key : otherSelection.index === key);

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={FIELD_LABEL}>{label}</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {existingImages.map((url) => (
          <div
            key={`existing-${url}`}
            onClick={() => onSelect({ kind: 'existing', url })}
            style={{
              width: 80, height: 80, borderRadius: 'var(--radius-md)',
              overflow: 'hidden', cursor: 'pointer',
              border: isSelected('existing', url) ? `3px solid ${activeColor}` : '3px solid transparent',
              position: 'relative', flexShrink: 0,
              opacity: isOther('existing', url) ? 0.4 : 1,
            }}
          >
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {isSelected('existing', url) && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: activeColor, color: '#fff',
                fontSize: 9, fontWeight: 700, textAlign: 'center', padding: 2,
              }}>
                {badge}
              </div>
            )}
          </div>
        ))}
        {newPreviews.map((url, i) => (
          <div
            key={`new-${url}`}
            onClick={() => onSelect({ kind: 'new', index: i })}
            style={{
              width: 80, height: 80, borderRadius: 'var(--radius-md)',
              overflow: 'hidden', cursor: 'pointer',
              border: isSelected('new', i) ? `3px solid ${activeColor}` : '3px solid transparent',
              position: 'relative', flexShrink: 0,
              opacity: isOther('new', i) ? 0.4 : 1,
            }}
          >
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {isSelected('new', i) && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: activeColor, color: '#fff',
                fontSize: 9, fontWeight: 700, textAlign: 'center', padding: 2,
              }}>
                {badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
