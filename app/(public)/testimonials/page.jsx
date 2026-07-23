import Link from 'next/link';
import TestimonialsGrid from './TestimonialsGrid';
import Reveal from '../../../components/ui/Reveal';

export const metadata = {
  title: 'Testimonials | What Homeowners Say | Intrafer',
  description: 'Read verified reviews from homeowners who transformed their spaces with Intrafer designers.',
};

async function fetchSiteReviews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/site-reviews`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return { reviews: json.data?.reviews || [], stats: json.data?.stats || null };
  } catch {
    return { reviews: [], stats: null };
  }
}

export default async function TestimonialsPage() {
  const { reviews, stats } = await fetchSiteReviews();
  const hasReviews = !!stats && stats.totalCount > 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px,10vw,108px) clamp(16px,4vw,40px) 80px' }}>
      <Reveal>
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>VERIFIED REVIEWS</p>
        <h1 className="section-heading" style={{ marginBottom: '8px' }}>What homeowners say</h1>
      </Reveal>

      {hasReviews ? (
        <>
          <Reveal style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--primary)', lineHeight: 1 }}>{stats.avgRating}★</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                {stats.totalCount} verified review{stats.totalCount !== 1 ? 's' : ''}
              </p>
              <div style={{ fontSize: '20px', color: 'var(--primary)', letterSpacing: '3px' }}>★★★★★</div>
            </div>
          </Reveal>

          <TestimonialsGrid reviews={reviews} />

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/vendors" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Find your designer →
            </Link>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>No reviews yet</p>
          <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
            Be the first to work with a verified designer and share your experience.
          </p>
          <Link href="/vendors" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            Browse designers →
          </Link>
        </div>
      )}
    </div>
  );
}
