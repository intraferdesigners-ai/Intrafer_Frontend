import Image from 'next/image';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default function BlogPostPage({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '108px 32px 80px' }}>

      {/* Back */}
      <Link href="/blog" className="back-link">← Blog</Link>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>{post.readTime}</span>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>·</span>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>{post.date}</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4vw,42px)',
          fontWeight: 400, color: '#0F172A', lineHeight: 1.2,
          letterSpacing: '-.02em', margin: '0 0 16px',
        }}>
          {post.title}
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', fontStyle: 'italic', lineHeight: 1.75 }}>
          {post.excerpt}
        </p>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: '480px', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 4px 16px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)' }}>
        <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 800px" />
      </div>

      {/* Article body */}
      <div
        style={{ fontSize: '15px', color: '#334155', lineHeight: 1.9 }}
        dangerouslySetInnerHTML={{ __html: post.content
          .replace(/<h2>/g, '<h2 style="font-family:var(--v2-font-display);font-size:24px;font-weight:400;color:#0F172A;margin:32px 0 14px;">')
          .replace(/<p>/g,  '<p style="margin-bottom:20px;">')
          .replace(/<ul>/g, '<ul style="margin:0 0 20px 24px;">')
          .replace(/<li>/g, '<li style="margin-bottom:8px;">')
        }}
      />

      {/* CTA box */}
      <div style={{
        background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.2)',
        borderRadius: '20px', padding: '28px', textAlign: 'center',
        marginTop: '48px',
      }}>
        <h3 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '22px', fontWeight: 400, color: '#0F172A', marginBottom: '8px' }}>
          Ready to renovate?
        </h3>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
          Find verified designers in your city. Free to enquire.
        </p>
        <Link href="/vendors" style={{
          display: 'inline-block', background: '#3B82F6', color: '#fff',
          padding: '12px 28px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 500, textDecoration: 'none',
        }}>
          Browse designers →
        </Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: '56px' }}>
          <h3 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '24px', fontWeight: 400, color: '#0F172A', marginBottom: '20px' }}>
            More articles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }} className="card-hover">
                  <div style={{ position: 'relative', height: '140px' }}>
                    <Image src={p.image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>{p.category}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', lineHeight: 1.4 }}>{p.title}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
