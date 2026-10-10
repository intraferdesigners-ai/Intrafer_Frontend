'use client';

import ImageField from './ImageField';
import SerpPreview from './SerpPreview';
import { TextField, TextArea } from './Fields';
import { CARD, SECTION_LABEL, HINT, LIMITS } from './shared';

const THRESHOLD = 3; // backend MIN_VENDORS_TO_INDEX (src/utils/indexThreshold.js)

// `vendorCount`: from match-check (null while loading/unknown).
// `snippet`: { categoryName, city, state, path } for the Google preview.
export default function SeoFields({ seo, onChange, errors, vendorCount, snippet }) {
  const set = (key) => (value) => onChange({ ...seo, [key]: value });

  const autoNote = vendorCount == null
    ? null
    : `${vendorCount} vendor${vendorCount === 1 ? '' : 's'} now — ${vendorCount >= THRESHOLD ? 'indexed' : 'not indexed'}`;

  const OPTIONS = [
    { value: 'auto', label: 'Auto', help: `Follows the ${THRESHOLD}-vendor rule: indexed once ${THRESHOLD}+ vendors are listed.`, note: autoNote },
    { value: 'index', label: 'Force index', help: 'Always indexed and listed in the sitemap, whatever the vendor count.' },
    { value: 'noindex', label: 'Noindex', help: 'Never indexed and kept out of the sitemap.' },
  ];

  return (
    <section style={CARD} id="seo">
      <span style={SECTION_LABEL}>SEO</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField
          label="Meta title"
          value={seo.metaTitle}
          onChange={set('metaTitle')}
          max={LIMITS.metaTitle}
          counter
          error={errors['seo.metaTitle']}
          hint="Blank = “{Category} in {City}, {State}”. “| Intrafer” is added automatically"
        />
        <TextArea
          label="Meta description"
          value={seo.metaDescription}
          onChange={set('metaDescription')}
          max={LIMITS.metaDescription}
          counter
          rows={3}
          error={errors['seo.metaDescription']}
        />
        <SerpPreview seo={seo} vendorCount={vendorCount} {...snippet} />
        <ImageField
          label="Social share (OG) image"
          value={seo.ogImage}
          onChange={set('ogImage')}
          error={errors['seo.ogImage']}
          hint="Blank = the banner image. 1200 × 630 works best."
        />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: 8 }}>
            Indexing
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPTIONS.map((o) => {
              const checked = (seo.indexing || 'auto') === o.value;
              return (
                <label
                  key={o.value}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: checked ? 'var(--color-primary-bg)' : 'transparent',
                  }}
                >
                  <input type="radio" name="indexing" value={o.value} checked={checked} onChange={() => set('indexing')(o.value)} style={{ marginTop: 3 }} />
                  <span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{o.label}</span>
                    {o.note && <span style={{ fontSize: 11, color: 'var(--color-text-hint)', marginLeft: 8 }}>({o.note})</span>}
                    <span style={{ ...HINT, display: 'block', marginTop: 2 }}>{o.help}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors['seo.indexing'] && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors['seo.indexing']}</p>}
        </fieldset>
      </div>
    </section>
  );
}
