'use client';

import ImageField from './ImageField';
import SerpPreview from './SerpPreview';
import { TextField, TextArea } from './Fields';
import { CARD, SECTION_LABEL, HINT, LIMITS } from './shared';

const THRESHOLD = 3; // backend MIN_VENDORS_TO_INDEX (src/utils/indexThreshold.js)

// Blank-title hint per page type (lib/landingLevel.js defaultLandingTitle).
const TITLE_HINTS = {
  category: 'Blank = “{Category} in India”. “| Intrafer” is added automatically',
  state: 'Blank = “{Category} in {State}”. “| Intrafer” is added automatically',
  city: 'Blank = “{Category} in {City}, {State}”. “| Intrafer” is added automatically',
};

// `vendorCount`: from match-check (null while loading/unknown).
// `snippet`: { categoryName, city, state, path, level } for the Google preview.
// `level`: city pages keep Auto / Force index / Noindex; state and category
// pages are always indexed unless set to Noindex, so they get two options
// ('auto' and 'index' both show as "Index").
export default function SeoFields({ seo, onChange, errors, vendorCount, snippet, level = 'city' }) {
  const set = (key) => (value) => onChange({ ...seo, [key]: value });
  const hub = level !== 'city';

  const autoNote = vendorCount == null
    ? null
    : `${vendorCount} vendor${vendorCount === 1 ? '' : 's'} now — ${vendorCount >= THRESHOLD ? 'indexed' : 'not indexed'}`;

  const OPTIONS = hub ? [
    { value: 'auto', label: 'Index (default)', help: 'Indexed and listed in the sitemap.' },
    { value: 'noindex', label: 'Noindex', help: 'Never indexed and kept out of the sitemap.' },
  ] : [
    { value: 'auto', label: 'Auto', help: `Follows the ${THRESHOLD}-vendor rule: indexed once ${THRESHOLD}+ vendors are listed.`, note: autoNote },
    { value: 'index', label: 'Force index', help: 'Always indexed and listed in the sitemap, whatever the vendor count.' },
    { value: 'noindex', label: 'Noindex', help: 'Never indexed and kept out of the sitemap.' },
  ];
  // A hub saved as 'index' is the same as 'auto' — shown as "Index (default)".
  const current = hub && seo.indexing === 'index' ? 'auto' : (seo.indexing || 'auto');

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
          hint={TITLE_HINTS[level] || TITLE_HINTS.city}
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
          {hub && (
            <p style={{ ...HINT, marginTop: 0, marginBottom: 8 }}>State and category pages are always indexed unless you choose Noindex.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPTIONS.map((o) => {
              const checked = current === o.value;
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
