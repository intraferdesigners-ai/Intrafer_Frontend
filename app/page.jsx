import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import OfferBanner from '../components/ui/OfferBanner';
import StickyMobileCTA from '../components/ui/StickyMobileCTA';
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider';
import EMICalculator from '../components/ui/EMICalculator';
import VendorCard from '../components/vendor/VendorCard';
import { IMAGES } from '../lib/images';
import { BLOG_POSTS } from '../lib/blog-data';
import {
  ArrowRight, Building2, Shield, Lock, Star,
  Clock, Users, ImageIcon,
} from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import StickySearch from '../components/public/StickySearch';
import HeroSearch from '../components/public/HeroSearch';
import HomepageFAQ from '../components/public/HomepageFAQ';

export const metadata = {
  title: 'Intrafer — Vetted Interior Designers Across India',
  description: "Compare interior designers by city, style, and budget. Every portfolio is real, completed work. Submit one enquiry and hear back within 48 hours.",
};

function formatPublishedDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

async function fetchFeaturedBlogPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/blog`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    const posts = json.data?.posts || [];
    return posts.slice(0, 3).map((p) => ({
      ...p,
      image: p.coverImage || '/images/blog/modular-kitchen.jpg',
      date: formatPublishedDate(p.publishedAt),
    }));
  } catch { return []; }
}

async function fetchStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch { return null; }
}

async function fetchFeaturedVendors() {
  try {
    const featuredRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors?featured=true&limit=3`, { cache: 'no-store' });
    if (featuredRes.ok) {
      const json = await featuredRes.json();
      const list = json.data?.vendors || json.vendors || json;
      if (Array.isArray(list) && list.length > 0) return list;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors?limit=3&sort=rating`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    const list = json.data?.vendors || json.vendors || json;
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

const DEFAULT_HERO_SUBTITLE = "Compare vetted interior designers by city, style, and budget. Every portfolio shown is real, completed work — submit one enquiry and hear back within two days.";

async function fetchHomepageContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/homepage-content`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data?.heroSubtitle || DEFAULT_HERO_SUBTITLE;
  } catch { return DEFAULT_HERO_SUBTITLE; }
}

async function fetchFeaturedProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/featured-projects`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data?.projects || [];
  } catch { return []; }
}

const FEATURED_FALLBACK = [
  { _id: 'f1', businessName: 'Priya Design Studio', location: { city: 'Bangalore' }, specializations: ['Residential', 'Modular Kitchen'], rating: 4.9, reviewCount: 42, portfolioImages: [IMAGES.vendors.studio1.cover] },
  { _id: 'f2', businessName: 'The Aesthetic Co.', location: { city: 'Mumbai' }, specializations: ['Living Room', 'Full Home'], rating: 4.7, reviewCount: 28, portfolioImages: [IMAGES.vendors.studio2.cover] },
  { _id: 'f3', businessName: 'Luxe Interiors', location: { city: 'Delhi NCR' }, specializations: ['Luxury', 'Commercial'], rating: 4.8, reviewCount: 67, portfolioImages: [IMAGES.vendors.studio3.cover] },
];

const GALLERY_STRIP = [
  { src: IMAGES.gallery.kitchen[0],    label: 'Kitchen',     alt: 'Kitchen design inspiration'     },
  { src: IMAGES.gallery.livingRoom[0], label: 'Living Room', alt: 'Living room design inspiration' },
  { src: IMAGES.gallery.bedroom[0],    label: 'Bedroom',     alt: 'Bedroom design inspiration'     },
  { src: IMAGES.gallery.bathroom[0],   label: 'Bathroom',    alt: 'Bathroom design inspiration'    },
  { src: IMAGES.gallery.dining[0],     label: 'Dining',      alt: 'Dining room design inspiration' },
  { src: IMAGES.gallery.office[0],     label: 'Office',      alt: 'Office design inspiration'      },
];

const STEPS = [
  { n: '01', title: 'Browse designers',     desc: 'Filter by city, style, and budget — every profile shows completed projects, not stock photography.' },
  { n: '02', title: 'Submit an enquiry',    desc: 'No account required. Share your requirements and verify your number by OTP in under a minute.' },
  { n: '03', title: 'Get matched',          desc: 'Designers commit to replying within 48 hours with a proposal built around your brief.' },
  { n: '04', title: 'Transform your space', desc: 'Agree on scope and pricing directly with your designer, then track progress through to handover.' },
];

const WHY_ITEMS = [
  { Icon: Shield,    title: 'A vetting process, not a signup form', desc: "Designers submit portfolios and credentials for review before they're listed. Most applicants don't make the cut." },
  { Icon: Lock,      title: 'No cost to browse or enquire',         desc: "Homeowners pay nothing to use Intrafer — no subscription, no finder's fee, no obligation to hire." },
  { Icon: Star,      title: 'Reviews tied to finished projects',    desc: "You can only leave a review once a project is marked complete, and we don't remove the honest ones." },
  { Icon: Clock,     title: 'A 48-hour reply, or we reassign it',   desc: "If a designer doesn't respond within two days, your enquiry moves to someone who will." },
  { Icon: ImageIcon, title: 'Portfolios, not brochures',            desc: 'Every image comes from a completed job a designer actually worked on — nothing licensed or staged.' },
  { Icon: Users,     title: 'You decide, we just introduce',        desc: 'Review two or three proposals, compare pricing and style, then choose who you want to work with.' },
];

const REVIEWS = [
  { initials: 'RK', stars: '★★★★★', quote: 'We compared four designers before choosing one. The whole 3BHK — kitchen included — finished within two weeks of the date we agreed on.', name: 'Rahul Kumar', detail: 'Bangalore · 3BHK Residential' },
  { initials: 'SP', stars: '★★★★★', quote: "I only heard from designers once they'd actually looked at my brief. That alone saved me from the usual round of cold calls.", name: 'Sneha Patel', detail: 'Bangalore · Modular Kitchen' },
  { initials: 'AM', stars: '★★★★★', quote: 'Submitted the enquiry on a Sunday night, had three replies by Monday morning. Went with the one whose past projects matched what I wanted.', name: 'Arjun Mehta', detail: 'Mumbai · Office Interior' },
];

const TRUST_STATS_FALLBACK = [
  { value: '500+',  label: 'VERIFIED DESIGNERS' },
  { value: '1200+', label: 'PROJECTS DELIVERED'  },
  { value: '4.8★',  label: 'AVERAGE RATING'      },
  { value: '48h',   label: 'RESPONSE'             },
];

const STYLES_STRIP = [
  { slug:'modern',       label:'Modern',       image: IMAGES.styles.modern       },
  { slug:'scandinavian', label:'Scandinavian', image: IMAGES.styles.scandinavian },
  { slug:'luxury',       label:'Luxury',       image: IMAGES.styles.luxury       },
  { slug:'minimalist',   label:'Minimalist',   image: IMAGES.styles.minimalist   },
  { slug:'bohemian',     label:'Bohemian',     image: IMAGES.styles.bohemian     },
  { slug:'industrial',   label:'Industrial',   image: IMAGES.styles.industrial   },
  { slug:'traditional',  label:'Traditional',  image: IMAGES.styles.traditional  },
  { slug:'contemporary', label:'Contemporary', image: IMAGES.styles.contemporary },
];

const FEATURED_BLOG_FALLBACK = BLOG_POSTS.slice(0, 3);

export default async function Home() {
  const [apiVendors, statsData, apiBlogPosts, featuredProjects, heroSubtitle] = await Promise.all([
    fetchFeaturedVendors(), fetchStats(), fetchFeaturedBlogPosts(), fetchFeaturedProjects(), fetchHomepageContent(),
  ]);
  const vendors = apiVendors.length > 0 ? apiVendors : FEATURED_FALLBACK;
  const FEATURED_BLOG = apiBlogPosts.length > 0 ? apiBlogPosts : FEATURED_BLOG_FALLBACK;

  const trustStats = statsData
    ? [
        { value: `${statsData.vendorCount}+`, label: 'VERIFIED DESIGNERS' },
        { value: `${statsData.projectCount}+`, label: 'PROJECTS DELIVERED' },
        { value: `${statsData.avgRating}★`,    label: 'AVERAGE RATING'     },
        { value: '48h',                         label: 'RESPONSE'           },
      ]
    : TRUST_STATS_FALLBACK;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <OfferBanner />
      <Navbar />
      <StickySearch />

      {/* ── HERO ── */}
      <section style={{ background: 'var(--bg-parchment)', paddingTop: '68px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,5vw,80px) clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '64px', alignItems: 'center' }} className="hero-grid grid-mobile-1">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', border: '1px solid var(--border-sub)', borderRadius: '20px', background: 'var(--surface)', fontSize: '10px', letterSpacing: '.14em', color: 'var(--primary)', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              500+ VERIFIED DESIGNERS · INDIA
            </div>
            <h1 style={{ margin: 0 }}>
              {['Interior design,', null, 'the first time'].map((line, i) =>
                i === 1 ? (
                  <span key={i} style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'clamp(38px,5vw,56px)', fontWeight: 400, color: 'var(--text)', letterSpacing: '-.025em', lineHeight: 1.08 }}>
                    done <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>properly</em>,
                  </span>
                ) : (
                  <span key={i} style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'clamp(38px,5vw,56px)', fontWeight: 400, color: 'var(--text)', letterSpacing: '-.025em', lineHeight: 1.08 }}>{line}</span>
                )
              )}
            </h1>
            <p style={{ maxWidth: '400px', fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.75, marginTop: '18px' }}>
              {heroSubtitle}
            </p>
            <div className="hero-cta-row" style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
              <Link href="/vendors" style={{ flex: '1 1 auto', minWidth: '160px' }}>
                <button style={{ width: '100%', background: 'var(--primary)', color: '#fff', padding: '13px 28px', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(59,130,246,.3)' }}>
                  Browse designers <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/gallery" style={{ flex: '1 1 auto', minWidth: '120px' }}>
                <button style={{ width: '100%', background: 'var(--surface)', color: 'var(--text-sub)', padding: '12px 24px', borderRadius: 'var(--r-md)', fontSize: '14px', border: '1px solid var(--border-sub)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                  View gallery
                </button>
              </Link>
            </div>
            {/* Search widget */}
            <HeroSearch />
          </div>
          {/* Right — hero image collage (hidden on mobile) */}
          <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '300px', borderRadius: 'var(--r-xl)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <Image src={IMAGES.hero.main} alt="Modern interior design" fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="vendor-img-badge" style={{ position: 'absolute', bottom: '12px', left: '12px', borderRadius: 'var(--r-sm)', padding: '7px 12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>Priya Design Studio</div>
                <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '1px' }}>Bangalore · ★ 4.9</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ height: '290px', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <Image src={IMAGES.vendors.studio1.cover} alt="Studio interior" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
              </div>
              <div style={{ height: '290px', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <Image src={IMAGES.vendors.studio2.cover} alt="Studio interior" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── TRUST STATS ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(32px,5vw,48px) clamp(16px,4vw,40px)' }}>
        <div className="stats-strip" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { end: statsData?.vendorCount || 8,                     suffix: '+', label: 'VERIFIED DESIGNERS' },
            { end: statsData?.projectCount || 24,                   suffix: '+', label: 'PROJECTS DELIVERED'  },
            { end: parseFloat(statsData?.avgRating || '4.8'), suffix: '★', decimals: 1, label: 'AVG RATING' },
            { static: '48h',                                                      label: 'RESPONSE'           },
          ].map((s) => (
            <div key={s.label} style={{ padding: 'clamp(16px,3vw,28px) 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,44px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}>
                {s.static
                  ? s.static
                  : <AnimatedCounter end={s.end} suffix={s.suffix} decimals={s.decimals || 0} />}
              </div>
              <div style={{ fontSize: '11px', letterSpacing: '.08em', color: 'var(--text-hint)', marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── OFFER STRIP ── */}
      <section style={{ background: 'var(--bg)', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '40px' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '16px', textAlign: 'center', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
            Limited time: 15% off when you book this month.{' '}
            <Link href="/enquiry" style={{ color: '#fff', textDecoration: 'underline' }}>Book now →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: 'var(--bg)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>HOW IT WORKS</p>
          <h2 className="section-heading">From enquiry to handover</h2>
          <div className="steps-grid" style={{ marginTop: '48px' }}>
            {STEPS.map((step) => (
              <div key={step.n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 400, color: 'var(--border-emp)', lineHeight: 1, marginBottom: '14px' }}>{step.n}</div>
                <div style={{ width: '28px', height: '2px', background: 'var(--primary)', marginBottom: '14px' }} />
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── WHY INTRAFER ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>WHY INTRAFER</p>
          <h2 className="section-heading">Why homeowners trust Intrafer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '48px', marginTop: '44px' }} className="grid-mobile-1">
            {WHY_ITEMS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>{title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── BEFORE/AFTER ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>TRANSFORMATIONS</p>
          <h2 className="section-heading" style={{ marginBottom: '8px' }}>See the transformation</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '40px' }}>
            Drag the slider to compare before and after.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-mobile-1">
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '10px' }}>Living room · Whitefield, Bangalore</p>
              <BeforeAfterSlider
                before={IMAGES.beforeAfter.livingBefore}
                after={IMAGES.beforeAfter.livingAfter}
              />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-sub)', marginBottom: '10px' }}>Modular kitchen · Koramangala, Bangalore</p>
              <BeforeAfterSlider
                before={IMAGES.beforeAfter.kitchenBefore}
                after={IMAGES.beforeAfter.kitchenAfter}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── GALLERY STRIP ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>DESIGN INSPIRATION</p>
              <h2 className="section-heading">Browse by room</h2>
            </div>
            <Link href="/gallery" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>Browse gallery →</Link>
          </div>
          <div className="gallery-strip">
            {GALLERY_STRIP.map(({ src, label, alt }) => (
              <Link key={label} href="/gallery" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: '260px', height: '180px', borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer' }}>
                  <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="260px" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,24,.6) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px', fontSize: '13px', fontWeight: 500, color: '#fff', letterSpacing: '.01em' }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── FEATURED DESIGNERS ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>FEATURED DESIGNERS</p>
              <h2 className="section-heading">This month&apos;s top-rated designers</h2>
            </div>
            <Link href="/vendors" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>View all designers →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
            {vendors.map((v) => <VendorCard key={v._id} vendor={v} />)}
          </div>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <>
          <div className="divider" />

          {/* ── FEATURED PROJECTS ── */}
          <section style={{ background: 'var(--bg)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>FEATURED PROJECTS</p>
              <h2 className="section-heading" style={{ marginBottom: '8px' }}>A closer look at recent work</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '40px' }}>
                Recently completed projects, submitted directly by the designers who built them.
              </p>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {featuredProjects.map((project) => (
                  <Link key={project._id} href={`/projects/${project._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: '280px', height: '210px', borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer' }} className="card-hover">
                      {project.images?.[0] ? (
                        <Image src={project.images[0]} alt={project.title} fill style={{ objectFit: 'cover' }} sizes="280px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={28} color="var(--text-hint)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)' }} />
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', letterSpacing: '.01em' }}>{project.title}</div>
                        {project.vendorId?.businessName && (
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.75)', marginTop: '2px' }}>{project.vendorId.businessName}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <div className="divider" />

      {/* ── DESIGN STYLES STRIP ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>DESIGN STYLES</p>
              <h2 className="section-heading">Browse by design style</h2>
            </div>
            <Link href="/design-styles" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {STYLES_STRIP.map(({ slug, label, image }) => (
              <Link key={slug} href={`/design-styles/${slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} className="card-hover">
                  <Image src={image} alt={label} fill style={{ objectFit: 'cover' }} sizes="200px" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px', fontSize: '14px', fontWeight: 500, color: '#fff' }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── REVIEWS ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>TESTIMONIALS</p>
          <h2 className="section-heading">What homeowners say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '44px' }} className="grid-mobile-1">
            {REVIEWS.map((r) => (
              <div key={r.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: 'var(--primary)', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>{r.stars}</div>
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '16px' }}>&ldquo;{r.quote}&rdquo;</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.initials}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{r.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── BLOG PREVIEW ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>DESIGN KNOWLEDGE</p>
              <h2 className="section-heading">Design guides &amp; tips</h2>
            </div>
            <Link href="/blog" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>View all articles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="grid-mobile-1">
            {FEATURED_BLOG.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }} className="card-hover">
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{post.category}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, margin: '0 0 6px' }}>{post.title}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-hint)' }}>{post.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── EMI CALCULATOR ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }} className="grid-mobile-1">
            <div>
              <p className="caps-label-primary" style={{ marginBottom: '10px' }}>BUDGET PLANNING</p>
              <h2 className="section-heading" style={{ marginBottom: '16px' }}>Plan your budget with EMI</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '24px' }}>
                Renovation loans are available from most major banks at competitive rates — use the calculator to estimate your monthly EMI before setting a budget.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['SBI, HDFC, ICICI, Axis Bank EMI available', 'Loans from ₹1 Lakh to ₹50 Lakhs', 'Tenure up to 36 months', 'Quick approval for verified projects'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-sub)', alignItems: 'center' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <EMICalculator />
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── FAQ ── */}
      <section style={{ background: 'var(--bg-parchment)', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p className="caps-label-primary" style={{ marginBottom: '10px' }}>COMMON QUESTIONS</p>
          <h2 className="section-heading" style={{ marginBottom: '40px' }}>Questions homeowners ask us</h2>
          <HomepageFAQ />
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-section-wrapper" style={{ background: 'var(--bg)', paddingTop: 'clamp(40px,5vw,60px)', paddingLeft: 'clamp(16px,4vw,40px)', paddingRight: 'clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="cta-always-dark" style={{ borderRadius: 'var(--r-2xl)', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: '14px' }}>START TODAY</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, color: '#FAFAF8', letterSpacing: '-.02em', marginBottom: '14px' }}>
              Start with a single enquiry
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 32px' }}>
              Browsing and enquiries are free, with no obligation to hire. Over 500 vetted designers across India are ready to hear about your project.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/vendors"><button style={{ background: 'var(--primary)', color: '#fff', padding: '14px 32px', borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(181,84,30,.4)' }}>Browse designers</button></Link>
              <Link href="/for-designers"><button style={{ background: 'transparent', color: 'rgba(255,255,255,.5)', padding: '13px 28px', borderRadius: 'var(--r-md)', fontSize: '14px', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer' }}>List your studio</button></Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: '80px', background: 'var(--bg)' }} />

      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
    </div>
  );
}
