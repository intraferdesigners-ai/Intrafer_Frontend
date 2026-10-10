'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FIELD_LABEL, HINT } from './shared';

// Image picker for banner/OG images: upload to
// POST /admin/landing-pages/upload, or paste an https URL. The value is
// always just the URL string; nothing is saved until the editor's Save.
export default function ImageField({ label, value, onChange, error, hint }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/admin/landing-pages/upload', fd, {
        headers: { 'Content-Type': undefined },
      });
      onChange(data.data?.url || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    }
    setUploading(false);
  };

  return (
    <div>
      <span style={FIELD_LABEL}>{label}</span>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{
          width: 160, height: 90, flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          {value ? (
            // Arbitrary admin-supplied host — next/image would reject
            // hosts outside next.config.js remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>No image</span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove image"
              aria-label="Remove image"
              style={{
                position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(15,23,42,.7)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={12} color="#fff" />
            </button>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} hidden />
            <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
              <Upload size={13} /> Upload image
            </Button>
          </div>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="…or paste an https:// image URL"
            error={error}
            aria-label={`${label} URL`}
          />
          <p style={{ ...HINT, marginTop: 0 }}>{hint || 'JPEG, PNG or WebP, up to 10 MB.'}</p>
        </div>
      </div>
    </div>
  );
}
