'use client';

import ImageField from './ImageField';
import { TextField } from './Fields';
import { CARD, SECTION_LABEL, LIMITS } from './shared';

export default function BannerFields({ banner, onChange, errors }) {
  const set = (key) => (value) => onChange({ ...banner, [key]: value });
  return (
    <section style={CARD}>
      <span style={SECTION_LABEL}>Banner</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ImageField
          label="Banner image"
          value={banner.imageUrl}
          onChange={set('imageUrl')}
          error={errors['banner.imageUrl']}
          hint="Wide image, at least 1600 × 500. No image = brand-colour background."
        />
        <TextField label="Headline" value={banner.headline} onChange={set('headline')} max={LIMITS.headline} counter error={errors['banner.headline']} />
        <TextField label="Subheadline" value={banner.subheadline} onChange={set('subheadline')} max={LIMITS.subheadline} counter error={errors['banner.subheadline']} />
        <div className="form-row" style={{ gap: 12 }}>
          <TextField label="CTA label" value={banner.ctaLabel} onChange={set('ctaLabel')} max={LIMITS.ctaLabel} counter error={errors['banner.ctaLabel']} placeholder="e.g. Get free quotes" />
          <TextField label="CTA URL" value={banner.ctaUrl} onChange={(v) => set('ctaUrl')(v.trim())} error={errors['banner.ctaUrl']} placeholder="/contact/ or https://…" hint="https:// or a path starting with /" />
        </div>
      </div>
    </section>
  );
}
