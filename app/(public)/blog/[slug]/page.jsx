import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const FALLBACK_COVER = '/images/blog/modular-kitchen.jpg';

function formatPublishedDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function normalizePost(post) {
  return {
    ...post,
    image: post.coverImage || FALLBACK_COVER,
    date: formatPublishedDate(post.publishedAt),
  };
}

async function fetchPostBySlug(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/blog/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.post || null;
  } catch { return null; }
}

async function fetchAllPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/blog`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.posts || [];
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }) {
  const rawPost = await fetchPostBySlug(params.slug);
  if (!rawPost) notFound();
  const post = normalizePost(rawPost);

  const allPosts = await fetchAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2).map(normalizePost);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '108px 32px 80px' }}>

      {/* Back */}
      <Link href="/blog" className="back-link">← Blog</Link>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>{post.readTime}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>{post.date}</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)',
          fontWeight: 400, color: 'var(--text)', lineHeight: 1.2,
          letterSpacing: '-.02em', margin: '0 0 16px',
        }}>
          {post.title}
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-mid)', fontStyle: 'italic', lineHeight: 1.75 }}>
          {post.excerpt}
        </p>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: '480px', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: '40px', boxShadow: 'var(--shadow-md)' }}>
        <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 800px" />
      </div>

      {/* Article body */}
      <div
        style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.9 }}
        dangerouslySetInnerHTML={{ __html: post.content
          .replace(/<h2>/g, '<h2 style="font-family:var(--font-display);font-size:24px;font-weight:400;color:var(--text);margin:32px 0 14px;">')
          .replace(/<p>/g,  '<p style="margin-bottom:20px;">')
          .replace(/<ul>/g, '<ul style="margin:0 0 20px 24px;">')
          .replace(/<li>/g, '<li style="margin-bottom:8px;">')
        }}
      />

      {/* CTA box */}
      <div style={{
        background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
        borderRadius: 'var(--r-xl)', padding: '28px', textAlign: 'center',
        marginTop: '48px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>
          Ready to renovate?
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '20px' }}>
          Find verified designers in your city. Free to enquire.
        </p>
        <Link href="/vendors" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '12px 28px', borderRadius: 'var(--r-md)',
          fontSize: '13px', fontWeight: 500, textDecoration: 'none',
        }}>
          Browse designers →
        </Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: '56px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--text)', marginBottom: '20px' }}>
            More articles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }} className="card-hover">
                  <div style={{ position: 'relative', height: '140px' }}>
                    <Image src={p.image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>{p.category}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{p.title}</div>
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
