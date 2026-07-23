import Image from 'next/image';
import Link from 'next/link';
import { GUIDES, getGuide } from '../../../../lib/guides-data';
import { notFound } from 'next/navigation';
import Reveal from '../../../../components/ui/Reveal';

export async function generateMetadata({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `${guide.title} | Intrafer Design Guides`,
    description: guide.desc,
  };
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default function GuideDetailPage({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const paragraphs = guide.content.split('\n\n');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '108px 40px 80px' }}>
      <Reveal style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '60px', alignItems: 'start' }} className="guide-grid">
        {/* Main content */}
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
              {guide.category}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{guide.readTime} read</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: 'var(--text)', letterSpacing: '-.02em', marginBottom: '24px', lineHeight: 1.2 }}>
            {guide.title}
          </h1>

          <div style={{ position: 'relative', height: '320px', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px' }}>
            <Image src={guide.image} alt={guide.title} fill style={{ objectFit: 'cover' }} priority sizes="(max-width:768px) 100vw, 700px" />
          </div>

          {/* Prose content */}
          <div style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.8 }}>
            {paragraphs.map((para, i) => {
              if (para.startsWith('# ')) {
                return null;
              }
              if (para.startsWith('## ')) {
                return <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginTop: '36px', marginBottom: '12px', letterSpacing: '-.01em' }}>{para.replace('## ', '')}</h2>;
              }
              if (para.startsWith('**') && para.includes(':**')) {
                const [bold, ...rest] = para.split(':**');
                return <p key={i} style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text)', fontWeight: 600 }}>{bold.replace('**', '')}:</strong>{rest.join(':**')}</p>;
              }
              if (para.startsWith('| ')) {
                const rows = para.split('\n').filter((r) => !r.startsWith('|--'));
                return (
                  <div key={i} style={{ overflowX: 'auto', marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      {rows.map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: ri === 0 ? 'var(--primary-bg)' : 'transparent' }}>
                          {row.split('|').filter(Boolean).map((cell, ci) => (
                            <td key={ci} style={{ padding: '10px 14px', color: ri === 0 ? 'var(--primary)' : 'var(--text-sub)', fontWeight: ri === 0 ? 600 : 400 }}>
                              {cell.trim()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </table>
                  </div>
                );
              }
              if (para.startsWith('- **') || para.startsWith('- ')) {
                const items = para.split('\n');
                return (
                  <ul key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {items.map((item, ii) => (
                      <li key={ii} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{ __html: item.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>') }} />
                    ))}
                  </ul>
                );
              }
              if (para.startsWith('☐')) {
                const items = para.split('\n');
                return (
                  <ul key={i} style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
                    {items.map((item, ii) => (
                      <li key={ii} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-sub)' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>☐</span>
                        {item.replace('☐ ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>') }} />;
            })}
          </div>

          {/* CTA */}
          <div className="cta-always-dark" style={{ borderRadius: '16px', padding: '32px', marginTop: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 500, color: '#FAFAF8', marginBottom: '8px' }}>Ready to start your project?</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: '20px' }}>Find a verified {guide.category.toLowerCase()} specialist near you.</p>
            <Link href="/vendors" style={{
              display: 'inline-block', background: 'var(--primary)', color: '#fff',
              padding: '11px 28px', borderRadius: 'var(--r-md)', fontSize: '13px',
              fontWeight: 500, textDecoration: 'none',
            }}>
              Find designers →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: '16px' }}>MORE GUIDES</p>
          {related.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }} className="card-hover">
                <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={g.image} alt={g.title} fill style={{ objectFit: 'cover' }} sizes="64px" />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: '4px' }}>{g.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{g.readTime} read</p>
                </div>
              </div>
            </Link>
          ))}

          <div style={{ marginTop: '24px', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Get expert advice</p>
            <p style={{ fontSize: '12px', color: 'var(--text-mid)', marginBottom: '14px' }}>Connect with a verified {guide.category.toLowerCase()} specialist.</p>
            <Link href="/enquiry" style={{
              display: 'block', textAlign: 'center', background: 'var(--primary)', color: '#fff',
              padding: '10px', borderRadius: 'var(--r-sm)', fontSize: '13px',
              fontWeight: 500, textDecoration: 'none',
            }}>
              Get free quote
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
