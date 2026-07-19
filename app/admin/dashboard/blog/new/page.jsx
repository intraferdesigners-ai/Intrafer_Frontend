'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import Button from '../../../../../components/ui/Button';
import Input from '../../../../../components/ui/Input';

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

const FIELD_LABEL = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: 6, letterSpacing: '0.01em',
};

const TEXTAREA_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
  fontFamily: 'var(--font-ui)',
  transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', category: '',
    content: '', coverImage: '', readTime: '', isPublished: true,
  });
  const [slugTouched,    setSlugTouched]    = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving,         setSaving]         = useState(false);

  const handleTitleChange = (title) => {
    setForm((p) => ({ ...p, title, slug: slugTouched ? p.slug : slugify(title) }));
  };

  const handleSlugChange = (slug) => {
    setSlugTouched(true);
    setForm((p) => ({ ...p, slug }));
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/blog-cover', fd, {
        headers: { 'Content-Type': undefined },
      });
      const url = data.data?.url || data.url;
      setForm((p) => ({ ...p, coverImage: url }));
      toast.success('Cover image uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover image.');
    }
    setUploadingCover(false);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())    { toast.error('Title is required.');    return; }
    if (!form.excerpt.trim())  { toast.error('Excerpt is required.');  return; }
    if (!form.category.trim()) { toast.error('Category is required.'); return; }
    if (!form.content.trim())  { toast.error('Content is required.');  return; }

    setSaving(true);
    try {
      await api.post('/admin/blog', {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category.trim(),
        content: form.content,
        coverImage: form.coverImage,
        readTime: form.readTime.trim(),
        isPublished: form.isPublished,
      });
      toast.success('Post created.');
      router.push('/admin/dashboard/blog');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post.');
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

  return (
    <div>
      <Link
        href="/admin/dashboard/blog"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-text-hint)', textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ChevronLeft size={14} /> Blog
      </Link>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 24px',
      }}>
        New post
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 28,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>

          {/* Post details */}
          <div>
            <span style={SECTION_LABEL}>Post details</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Modular Kitchen Cost Guide 2026"
                required
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated-from-title"
              />
              <div className="form-row" style={{ gap: 12 }}>
                <Input
                  label="Category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Kitchen"
                  required
                />
                <Input
                  label="Read time"
                  value={form.readTime}
                  onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))}
                  placeholder="e.g. 5 min read"
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>Excerpt</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="A short summary shown on the blog listing…"
                  style={TEXTAREA_STYLE}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Cover image */}
          <div>
            <span style={SECTION_LABEL}>Cover image</span>
            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploadingCover && fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: 24, textAlign: 'center', cursor: uploadingCover ? 'wait' : 'pointer',
                transition: 'border-color 150ms ease-out',
              }}
            >
              {form.coverImage ? (
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  style={{ maxHeight: 160, borderRadius: 'var(--radius-md)', margin: '0 auto', display: 'block' }}
                />
              ) : (
                <>
                  <Upload size={28} color="var(--color-text-hint)" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-sub)', margin: '0 0 4px' }}>
                    {uploadingCover ? 'Uploading…' : 'Click to upload a cover image'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: 0 }}>
                    JPEG, PNG, WebP · up to 5MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleCoverChange}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* Content */}
          <div>
            <span style={SECTION_LABEL}>Content (HTML)</span>
            <textarea
              className="form-textarea"
              rows={16}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="<h2>Section heading</h2>&#10;<p>Paragraph text…</p>"
              style={{ ...TEXTAREA_STYLE, fontFamily: 'var(--font-mono)', minHeight: 320 }}
            />
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
            Create post
          </Button>
        </div>
      </form>
    </div>
  );
}
