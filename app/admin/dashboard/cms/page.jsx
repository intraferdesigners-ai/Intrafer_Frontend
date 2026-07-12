'use client';

import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminCmsPage() {
  const [heroTitle,   setHeroTitle]   = useState('Find designers who bring your vision to life');
  const [heroSubtext, setHeroSubtext] = useState("India's most trusted interior designer marketplace. Browse verified portfolios, compare quotes, and connect with the perfect designer for your home.");
  const [saving,      setSaving]      = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success('CMS updated!');
  };

  return (
    <DashboardLayout>
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

        {/* Info banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          background: 'var(--color-info-bg, #EFF6FF)',
          border: '1px solid var(--color-info, #3B82F6)',
          borderRadius: 'var(--radius-lg)', padding: '14px 16px',
          marginBottom: '24px',
        }}>
          <Info size={16} color="var(--color-info, #3B82F6)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-sub)', margin: 0, lineHeight: 1.6 }}>
            This section lets you update homepage content. Full backend CMS integration coming soon —
            changes here are currently previewed locally only.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Hero section */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-text-hint)', textTransform: 'uppercase', margin: 0 }}>
                HERO SECTION
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 500,
                  color: 'var(--color-text-sub)', marginBottom: '6px',
                }}>
                  Hero headline
                </label>
                <input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '14px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
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
                  }}
                />
              </div>
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
    </DashboardLayout>
  );
}
