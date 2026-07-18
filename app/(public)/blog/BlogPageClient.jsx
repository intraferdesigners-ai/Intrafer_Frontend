'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';

const CATEGORIES = ['All', 'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Guide'];

function CategoryPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: '20px', fontSize: '12px',
      fontWeight: active ? 600 : 400, cursor: 'pointer',
      background: active ? '#3B82F6' : '#FFFFFF',
      color:      active ? '#FFFFFF' : '#475569',
      border:     active ? 'none' : '1.5px solid #CBD5E1',
      transition: 'all 150ms ease-out',
      fontFamily: 'var(--v2-font-ui)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

export default function BlogPageClient() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter((p) => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,64px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Design knowledge</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '16px' }}>
              Guides, tips, and ideas for your home.
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7 }}>
              Expert advice from India's top interior designers.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Category filter */}
      <section style={{ background: '#F8F7F4', padding: '28px clamp(16px,4vw,36px) 0' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div className="scroll-x" style={{ gap: '8px', paddingBottom: '8px' }}>
            {CATEGORIES.map((c) => (
              <CategoryPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured post */}
      <section style={{ background: '#F8F7F4', padding: '32px clamp(16px,4vw,36px) clamp(48px,7vw,64px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          {!featured && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>No posts in this category yet.</div>
          )}

          {featured && (
            <RevealOnScroll direction="up">
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="v2-card grid-mobile-1" style={{
                  display: 'grid', gridTemplateColumns: '55% 45%', gap: 0,
                  width: '100%', maxWidth: '100%', boxSizing: 'border-box',
                }}>
                  <div style={{ position: 'relative', minHeight: '320px' }}>
                    <Image src={featured.image} alt={featured.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 55vw" />
                  </div>
                  <div style={{ padding: '40px 48px 40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                        {featured.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{featured.readTime}</span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '28px', fontWeight: 500, color: '#0F172A', lineHeight: 1.25, margin: '0 0 14px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.75, marginBottom: '20px' }}>
                      {featured.excerpt}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{featured.date}</span>
                      <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500, whiteSpace: 'nowrap' }}>Read article →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* Grid */}
      {rest.length > 0 && (
        <section style={{ background: '#F1F5F9', padding: 'clamp(48px,7vw,64px) clamp(16px,4vw,36px)' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="grid-mobile-1">
              {rest.map((post, i) => (
                <RevealOnScroll key={post.slug} direction="up" delay={(i % 3) * 100}>
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="v2-card card-hover" style={{ transition: 'box-shadow 200ms ease, transform 200ms ease' }}>
                      <div style={{ position: 'relative', height: '180px' }}>
                        <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>
                            {post.category}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{post.readTime}</span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', lineHeight: 1.4, margin: '0 0 8px' }}>
                          {post.title}
                        </h3>
                        <p className="line-clamp-2" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '12px' }}>
                          {post.excerpt}
                        </p>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{post.date}</div>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 className="v2-h2" style={{ color: '#F8F7F4', marginBottom: '12px' }}>
            Find a designer for your next project
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '28px' }}>
            500+ verified interior designers across India.
          </p>
          <Link href="/vendors">
            <V2Button variant="primary" size="lg">Browse designers →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
