import Image from 'next/image';
import Link from 'next/link';
import VendorCard from '../../../../components/vendor/VendorCard';

const CITY_DATA = {
  bangalore: {
    name: 'Bangalore', state: 'Karnataka',
    image: '/images/cities/bangalore.jpg',
    description: 'Find the best interior designers in Bangalore. From modern apartments in Whitefield to luxury villas in Sarjapur, our verified designers cover every neighbourhood and style.',
  },
  mumbai: {
    name: 'Mumbai', state: 'Maharashtra',
    image: '/images/cities/mumbai.jpg',
    description: 'Top-rated interior designers in Mumbai. Whether you need a compact sea-facing flat redesigned or a luxury Bandra home transformed, our Mumbai designers deliver.',
  },
  delhi: {
    name: 'Delhi NCR', state: 'Delhi',
    image: '/images/cities/delhi.jpg',
    description: 'Discover interior designers in Delhi NCR. From South Delhi farmhouses to Gurgaon high-rises, find designers who know the city\'s unique aesthetic sensibility.',
  },
  hyderabad: {
    name: 'Hyderabad', state: 'Telangana',
    image: '/images/cities/bangalore.jpg',
    description: 'Find interior designers in Hyderabad. HITEC City apartments, Jubilee Hills villas, and everything in between — our designers know Hyderabad intimately.',
  },
  chennai: {
    name: 'Chennai', state: 'Tamil Nadu',
    image: '/images/cities/mumbai.jpg',
    description: 'Interior designers in Chennai who blend Tamil craftsmanship with contemporary design. From Adyar to OMR, find designers who understand Chennai homes.',
  },
  pune: {
    name: 'Pune', state: 'Maharashtra',
    image: '/images/cities/delhi.jpg',
    description: 'Connect with Pune\'s best interior designers. Aundh, Koregaon Park, Hinjewadi — our designers bring style to every Pune neighbourhood.',
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
      <div style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h1>City not found</h1>
        <Link href="/vendors">Browse all designers →</Link>
      </div>
    );
  }

  const [vendors, stats] = await Promise.all([fetchVendors(cityData.name), fetchStats()]);

  const coords = CITY_MAP_COORDS[params.city] || CITY_MAP_COORDS.bangalore;
  const mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${Math.round(50000 / coords.zoom)}!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1234567890`;

  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
        <Image src={cityData.image} alt={cityData.name} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.2), rgba(0,0,0,.65))' }} />
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '.14em', color: 'rgba(255,255,255,.7)', marginBottom: '8px' }}>INTERIOR DESIGNERS IN</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 400, color: '#fff', letterSpacing: '-.02em' }}>
            {cityData.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '15px' }}>{cityData.state}</p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px clamp(16px,4vw,40px) 80px' }}>
        {/* Stats strip */}
        <div className="city-stats-grid" style={{ marginBottom: '48px' }}>
          {[
            { label: 'Designers', value: vendors.length > 0 ? vendors.length : 'New' },
            { label: 'Avg rating', value: stats ? `${stats.avgRating}★` : '4.9★' },
            { label: 'Response', value: '48h' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', padding: 'clamp(14px,3vw,20px)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-hint)', letterSpacing: '.08em', marginTop: '4px' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '16px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '64px' }}>
          {cityData.description}
        </p>

        {/* Vendors */}
        <p className="caps-label-primary" style={{ marginBottom: '10px' }}>VERIFIED DESIGNERS</p>
        <h2 className="section-heading" style={{ marginBottom: '32px' }}>Interior designers in {cityData.name}</h2>

        {vendors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '20px', marginBottom: '48px' }}>
            {vendors.map((v) => <VendorCard key={v._id} vendor={v} />)}
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '16px' }}>
              We are onboarding designers in {cityData.name}. Meanwhile, browse our Bangalore designers.
            </p>
            <Link href="/vendors" style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>Browse all designers →</Link>
          </div>
        )}

        {/* Cost calc strip */}
        <div style={{
          background: 'var(--primary-bg)', border: '1px solid var(--primary-light)',
          borderRadius: '16px', padding: '32px', marginBottom: '48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
              What will interior design cost in {cityData.name}?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Get a personalised estimate in under 60 seconds.</p>
          </div>
          <Link href="/cost-calculator" style={{
            background: 'var(--primary)', color: '#fff', padding: '11px 24px',
            borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', flexShrink: 0,
          }}>
            Calculate cost →
          </Link>
        </div>

        {/* Map — designers in this city */}
        <section style={{ marginTop: '60px' }}>
          <div className="caps-label-primary" style={{ marginBottom: '8px' }}>
            DESIGNERS IN {cityData.name.toUpperCase()}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '26px',
            fontWeight: 400, color: 'var(--text)', marginBottom: '20px',
          }}>
            Find verified designers near you
          </h2>
          <div className="map-embed" style={{
            width: '100%',
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
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
          <p style={{
            fontSize: '12px', color: 'var(--text-hint)',
            marginTop: '10px', textAlign: 'center',
          }}>
            Map shows approximate area. Designer locations vary within the city.
          </p>
        </section>

        {/* CTA */}
        <div className="cta-always-dark" style={{ borderRadius: 'var(--r-xl)', padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#FAFAF8', fontWeight: 400, marginBottom: '12px' }}>
            Ready to transform your {cityData.name} home?
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.5)', marginBottom: '24px' }}>Free to browse. Free to enquire. No commitment.</p>
          <Link href="/enquiry" style={{
            display: 'inline-block', background: 'var(--primary)', color: '#fff',
            padding: '13px 32px', borderRadius: 'var(--r-md)', fontSize: '14px',
            fontWeight: 500, textDecoration: 'none',
          }}>
            Submit an enquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
