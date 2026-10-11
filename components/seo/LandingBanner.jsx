import Image from 'next/image';
import Link from 'next/link';
import { safeUrl } from '@/components/seo/LandingMarkdown';
import { canOptimize } from '@/lib/imageHost';

// Banner block at the top of an admin-authored landing page (Phase 2).
// When it has an image, that image is the page's LCP element — hence
// `priority` here and none on the vendor cards below it. No image falls
// back to a brand gradient rather than an empty/broken box. The headline
// is deliberately a <p>, not a heading: the page's single h1 sits below.
//
// The admin can paste any https image URL, but next/image only optimizes
// hosts listed in next.config.js images.remotePatterns (and throws for
// anything else). Hosts on that list (lib/imageRemotePatterns.js, checked
// by canOptimize) are optimized; any other host is served `unoptimized`
// instead of crashing the page.

// `banner`: placeholder-resolved { imageUrl, headline, subheadline, ctaLabel, ctaUrl }.
export default function LandingBanner({ banner }) {
  const { imageUrl, headline, subheadline, ctaLabel } = banner;
  // The backend already only accepts https or site-relative; re-checked so a
  // record written around that validator still can't produce a javascript: link.
  const ctaUrl = safeUrl(banner.ctaUrl) || '';
  const hasCta = Boolean(ctaLabel && ctaUrl);
  if (!imageUrl && !headline && !subheadline && !hasCta) return null;

  const isExternal = /^https?:/i.test(ctaUrl);
  const ctaStyle = {
    display: 'inline-block', marginTop: '18px', padding: '11px 22px',
    // Fixed white, not var(--surface): the banner is dark in both themes.
    borderRadius: 'var(--r-md)', background: '#fff', color: 'var(--primary-dark)',
    fontSize: '14px', fontWeight: 500, textDecoration: 'none',
  };

  return (
    <div
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-xl)',
        // ~220px on phones up to ~320px on desktop, without a media query.
        height: 'clamp(220px, 40vw, 320px)', marginBottom: '32px',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--accent) 100%)',
      }}
    >
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1020px"
            unoptimized={!canOptimize(imageUrl)}
            style={{ objectFit: 'cover' }}
          />
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,.72) 0%, rgba(15,23,42,.35) 100%)' }}
          />
        </>
      )}
      <div
        style={{
          position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 'clamp(20px, 4vw, 48px)', maxWidth: '680px', color: '#fff',
        }}
      >
        {headline && (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.15, fontWeight: 500 }}>
            {headline}
          </p>
        )}
        {subheadline && (
          <p style={{ fontSize: 'clamp(14px, 1.6vw, 16px)', lineHeight: 1.6, marginTop: '10px', opacity: 0.92 }}>
            {subheadline}
          </p>
        )}
        {hasCta && (
          <div>
            {isExternal ? (
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer" style={ctaStyle}>{ctaLabel}</a>
            ) : (
              <Link href={ctaUrl} style={ctaStyle}>{ctaLabel}</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
