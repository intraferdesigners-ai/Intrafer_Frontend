import Image from 'next/image';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteUrl';
import Breadcrumb from '@/components/seo/Breadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import { GUIDES } from '@/lib/guides-data';
import { guidePath, guidesIndexJsonLd } from '@/lib/structuredData';

export const metadata = {
  title: 'Interior Design Guides | Room-by-Room Expertise',
  description: 'Free interior design guides for every room. Kitchen, bedroom, living room, bathroom, and more.',
  alternates: { canonical: `${SITE_URL}/guides/` },
};

export default function GuidesPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '108px clamp(16px,4vw,40px) 80px' }}>
      {/* CollectionPage + ItemList, not Blog: the guides are undated,
          evergreen how-to articles, not a chronological blog. */}
      <JsonLd data={guidesIndexJsonLd({ name: metadata.title, description: metadata.description, guides: GUIDES })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Guides' }]} />
      <p className="caps-label-primary" style={{ marginBottom: '10px' }}>DESIGN GUIDES</p>
      <h1 className="section-heading" style={{ marginBottom: '8px' }}>Room-by-room design expertise</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '48px' }}>
        Free guides written by interior design professionals.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '16px' }}>
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={guidePath(guide)} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }} className="card-hover">
              <div style={{ position: 'relative', height: '160px' }}>
                <Image src={guide.image} alt={guide.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 25vw" />
              </div>
              <div style={{ padding: '14px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '.08em',
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                  padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase',
                  display: 'inline-block', marginBottom: '8px',
                }}>
                  {guide.category}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: '6px' }}>
                  {guide.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: '8px' }}>
                  {guide.desc}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{guide.readTime} read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '60px', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Ready to start your project?</p>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '20px' }}>Find a verified designer who specialises in your room type.</p>
        <Link href="/vendors" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px',
          fontWeight: 500, textDecoration: 'none',
        }}>
          Find designers →
        </Link>
      </div>
    </div>
  );
}
