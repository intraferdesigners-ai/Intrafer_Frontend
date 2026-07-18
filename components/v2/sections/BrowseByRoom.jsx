'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2SectionHeader from '@/components/v2/ui/SectionHeader';
import { IMAGES } from '@/lib/images';

const ROOMS = [
  { label: 'Kitchen',      src: IMAGES.gallery.kitchen[0] },
  { label: 'Living Room',  src: IMAGES.gallery.livingRoom[0] },
  { label: 'Bedroom',      src: IMAGES.gallery.bedroom[0] },
  { label: 'Bathroom',     src: IMAGES.gallery.bathroom[0] },
  { label: 'Dining',       src: IMAGES.gallery.dining[0] },
  { label: 'Office',       src: IMAGES.gallery.office[0] },
];

export default function BrowseByRoom() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? '#0F172A' : '#F8F7F4';

  return (
    <section style={{ background: bg, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,36px)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <RevealOnScroll direction="up">
          <V2SectionHeader
            eyebrow="Explore"
            heading="Browse by room"
            dark={isDark}
          />
        </RevealOnScroll>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
        }}>
          {ROOMS.map((room, i) => (
            <RevealOnScroll key={room.label} direction="up" delay={(i % 3) * 100}>
              <Link href="/gallery" style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative', aspectRatio: '4/3',
                  borderRadius: '14px', overflow: 'hidden',
                }}>
                  <Image src={room.src} alt={room.label} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 33vw" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.6))',
                  }} />
                  <span style={{
                    position: 'absolute', bottom: '14px', left: '16px',
                    fontFamily: 'var(--v2-font-display)',
                    fontSize: '18px', fontWeight: 500, color: '#F8F7F4',
                  }}>{room.label}</span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
