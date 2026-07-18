import Link from 'next/link';
import RevealOnScroll from '@/components/v2/ui/RevealOnScroll';
import V2Button from '@/components/v2/ui/Button';
import VendorCardV2 from '@/components/v2/vendors/VendorCard';

const CITY_DATA = {
  bangalore: {
    name: 'Bangalore', state: 'Karnataka',
    description: 'Verified interior designers serving Bangalore. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 8,
  },
  mumbai: {
    name: 'Mumbai', state: 'Maharashtra',
    description: 'Verified interior designers serving Mumbai. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 0,
  },
  delhi: {
    name: 'Delhi NCR', state: 'Delhi',
    description: 'Verified interior designers serving Delhi NCR. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 0,
  },
  hyderabad: {
    name: 'Hyderabad', state: 'Telangana',
    description: 'Verified interior designers serving Hyderabad. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 0,
  },
  chennai: {
    name: 'Chennai', state: 'Tamil Nadu',
    description: 'Verified interior designers serving Chennai. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 0,
  },
  pune: {
    name: 'Pune', state: 'Maharashtra',
    description: 'Verified interior designers serving Pune. Browse portfolios, read reviews, get free quotes.',
    vendorCount: 0,
  },
};

const CITY_MAP_COORDS = {
  bangalore: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  mumbai:    { lat: 19.0760, lng: 72.8777, zoom: 12 },
  delhi:     { lat: 28.6139, lng: 77.2090, zoom: 11 },
  hyderabad: { lat: 17.3850, lng: 78.4867, zoom: 12 },
  chennai:   { lat: 13.0827, lng: 80.2707, zoom: 12 },
  pune:      { lat: 18.5204, lng: 73.8567, zoom: 12 },
};

export async function generateMetadata({ params }) {
  const city = CITY_DATA[params.city];
  if (!city) return { title: 'City Not Found | Intrafer' };
  return { title: `Interior Designers in ${city.name} | Intrafer` };
}

export function generateStaticParams() {
  return Object.keys(CITY_DATA).map((city) => ({ city }));
}

async function fetchVendors(cityName) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/vendors?city=${encodeURIComponent(cityName)}&limit=6`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.vendors || json.vendors || [];
  } catch { return []; }
}

async function fetchStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || null;
  } catch { return null; }
}

export default async function CityPage({ params }) {
  const cityData = CITY_DATA[params.city];
  if (!cityData) {
    return (
      <div style={{ background: '#0F172A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--v2-font-display)', fontSize: '28px', color: '#F8F7F4', marginBottom: '16px' }}>City not found</h1>
        <Link href="/vendors" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>Browse all designers →</Link>
      </div>
    );
  }

  const [vendors, stats] = await Promise.all([fetchVendors(cityData.name), fetchStats()]);

  const coords = CITY_MAP_COORDS[params.city] || CITY_MAP_COORDS.bangalore;
  const mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${Math.round(50000 / coords.zoom)}!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1234567890`;

  const stat1 = vendors.length || cityData.vendorCount;
  const stat2 = stats?.totalProjects || stats?.projectsCompleted || 0;
  const stat3 = stats ? `${stats.avgRating}★` : '4.9★';

  return (
    <div style={{ fontFamily: 'var(--v2-font-ui)' }}>
      {/* Hero */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,9vw,96px) clamp(16px,4vw,36px) clamp(48px,6vw,64px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <RevealOnScroll direction="up">
            <p className="v2-eyebrow" style={{ marginBottom: '16px' }}>Interior designers in</p>
            <h1 className="v2-h1" style={{ color: '#F8F7F4', marginBottom: '16px' }}>{cityData.name}</h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7 }}>
              Verified interior designers serving {cityData.name}. Browse portfolios, read reviews, get free quotes.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
        <div className="stats-strip" style={{ maxWidth: '1140px', margin: '0 auto' }}>
          {[
            { label: 'Designers', value: stat1 },
            { label: 'Projects completed', value: stat2 },
            { label: 'Avg rating', value: stat3 },
          ].map((s) => (
            <div key={s.label} style={{ padding: 'clamp(20px,3vw,28px) 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--v2-font-display)', fontSize: '30px', color: '#0F172A', fontWeight: 500 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Designers grid */}
      <section style={{ background: '#F8F7F4', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Verified designers</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '28px' }}>Designers in {cityData.name}</h2>

          {vendors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '20px' }}>
              {vendors.map((v, i) => (
                <RevealOnScroll key={v._id} direction="up" delay={(i % 4) * 100}>
                  <VendorCardV2 vendor={v} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="v2-card" style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '16px' }}>
                We are onboarding designers in {cityData.name}. Meanwhile, browse our Bangalore designers.
              </p>
              <Link href="/vendors" style={{ color: '#3B82F6', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>Browse all designers →</Link>
            </div>
          )}
        </div>
      </section>

      {/* Map section */}
      <section style={{ background: '#F1F5F9', padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,36px)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p className="v2-eyebrow" style={{ marginBottom: '12px' }}>Coverage area</p>
          <h2 className="v2-h3" style={{ color: '#0F172A', marginBottom: '20px' }}>
            Serving {cityData.name} and surrounding areas
          </h2>
          <div className="map-embed" style={{
            width: '100%', borderRadius: '14px', overflow: 'hidden',
            border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
          }}>
            <iframe
              src={mapSrc}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Interior designers in ${cityData.name}`}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: 'clamp(56px,8vw,88px) clamp(16px,4vw,36px)', textAlign: 'center' }}>
        <RevealOnScroll direction="up">
          <h2 className="v2-h2" style={{ color: '#F8F7F4', marginBottom: '12px' }}>
            Looking for a designer in {cityData.name}?
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '28px' }}>
            Free to browse. Free to enquire. No commitment.
          </p>
          <Link href={`/enquiry?city=${encodeURIComponent(cityData.name)}`}>
            <V2Button variant="primary" size="lg">Submit an enquiry →</V2Button>
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
