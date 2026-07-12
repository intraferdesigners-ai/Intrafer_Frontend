'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';

const CATEGORIES = ['All', 'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Guide'];

function CategoryPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: '20px', fontSize: '12px',
      fontWeight: active ? 600 : 400, cursor: 'pointer',
      background: active ? 'var(--primary)' : 'var(--surface)',
      color:      active ? '#fff'            : 'var(--text-mid)',
      border:     active ? 'none' : '1px solid var(--border)',
      transition: 'all 150ms ease-out',
      boxShadow:  active ? '0 2px 8px rgba(181,84,30,.25)' : 'none',
    }}>
      {label}
    </button>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter((p) => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px,10vw,108px) clamp(16px,4vw,40px) 80px' }}>

      {/* Header */}
      <p className="caps-label-primary" style={{ marginBottom: '8px' }}>THE INTRAFER BLOG</p>
      <h1 className="section-heading" style={{ marginBottom: '10px' }}>Design guides &amp; tips</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '32px' }}>
        Expert advice from India's top interior designers.
      </p>

      {/* Category filter */}
      <div className="scroll-x" style={{ gap: '8px', marginBottom: '40px', paddingBottom: '8px' }}>
        {CATEGORIES.map((c) => (
          <CategoryPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
        ))}
      </div>

      {!featured && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-hint)' }}>No posts in this category yet.</div>
      )}

      {/* Featured post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)', overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'grid', gridTemplateColumns: '55% 45%', gap: 0,
            width: '100%', maxWidth: '100%', boxSizing: 'border-box',
          }} className="grid-mobile-1">
            <div style={{ position: 'relative', minHeight: '320px' }}>
              <Image src={featured.image} alt={featured.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 55vw" />
            </div>
            <div style={{ padding: '40px 48px 40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                  {featured.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{featured.readTime}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.25, margin: '0 0 14px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '20px' }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{featured.date}</span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>Read article →</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Remaining posts */}
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="grid-mobile-1">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
              }} className="card-hover">
                <div style={{ position: 'relative', height: '180px' }}>
                  <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, margin: '0 0 8px' }}>
                    {post.title}
                  </h3>
                  <p className="line-clamp-2" style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '12px' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{post.date}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', marginTop: '64px', padding: '40px', background: 'var(--bg-parchment)', borderRadius: 'var(--r-2xl)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--text)', marginBottom: '10px' }}>
          Find a designer for your next project
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
          500+ verified interior designers across India.
        </p>
        <Link href="/vendors" style={{
          display: 'inline-block', background: 'var(--primary)', color: '#fff',
          padding: '13px 32px', borderRadius: 'var(--r-md)',
          fontSize: '14px', fontWeight: 500, textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(181,84,30,.3)',
        }}>
          Browse designers →
        </Link>
      </div>
    </div>
  );
}
