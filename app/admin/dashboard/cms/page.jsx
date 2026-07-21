'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

const DEFAULT_HERO_SUBTITLE = "Compare vetted interior designers by city, style, and budget. Every portfolio shown is real, completed work — submit one enquiry and hear back within two days.";

export default function AdminCmsPage() {
  const [heroSubtext, setHeroSubtext] = useState(DEFAULT_HERO_SUBTITLE);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => {
        const settings = res.data.data?.settings;
        setHeroSubtext(settings?.homepage_hero_subtitle ?? DEFAULT_HERO_SUBTITLE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', { homepage_hero_subtitle: heroSubtext });
      toast.success('CMS updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
          animation: 'spin 600ms linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 6px', letterSpacing: '-.02em',
      }}>
        CMS — Homepage Content
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-hint)', margin: '0 0 28px' }}>
        Manage visible content on the public homepage.
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Hero section */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', margin: 0 }}>
              HERO SECTION
            </p>
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 500,
              color: 'var(--color-text-sub)', marginBottom: '6px',
            }}>
              Hero subtext
            </label>
            <textarea
              value={heroSubtext}
              onChange={(e) => setHeroSubtext(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)', outline: 'none',
                resize: 'vertical', lineHeight: 1.6,
                boxSizing: 'border-box',
                fontFamily: 'var(--font-ui)',
              }}
            />
          </div>
        </div>

        {/* Featured vendors note */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '20px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '10px' }}>
            FEATURED DESIGNERS
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-sub)', margin: 0, lineHeight: 1.6 }}>
            Top 3 vendors by rating are automatically featured on the homepage.
            Approve vendors to include them in featured results.
          </p>
        </div>

        {/* Blog note */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '20px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', marginBottom: '10px' }}>
            BLOG CONTENT
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-sub)', margin: 0, lineHeight: 1.6 }}>
            Blog posts are managed via <code style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--color-surface-alt)', padding: '1px 5px', borderRadius: '4px' }}>lib/blog-data.js</code>.
            Deploy a new build after editing to update the live site.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
        >
          Save CMS changes
        </Button>
      </form>
    </div>
  );
}
