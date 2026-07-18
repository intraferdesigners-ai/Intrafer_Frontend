import Link from 'next/link';

export default function EnquiryCard({ vendor, location, specs }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      borderRadius: '16px', padding: '24px',
      boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
    }}>
      <h2 style={{
        fontFamily: 'var(--v2-font-display)', fontSize: '20px', fontWeight: 500,
        color: '#0F172A', margin: '0 0 4px',
      }}>Get a quote</h2>
      <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>
        Free · No commitment · Verified designer
      </p>

      <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
        {[
          ['Location', location],
          ['Specializations', specs.length ? `${specs.length} area${specs.length !== 1 ? 's' : ''}` : 'General'],
          ['Rating', vendor.rating > 0 ? `${Number(vendor.rating).toFixed(1)} / 5` : 'New designer'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
            <span style={{ color: '#64748B' }}>{label}</span>
            <span style={{ color: '#0F172A', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ height: '1px', background: '#E2E8F0', margin: '0 0 16px' }} />

      <Link href={`/enquiry?vendorId=${vendor._id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <button style={{
          width: '100%', height: '48px', borderRadius: '10px',
          background: '#3B82F6', color: '#FFFFFF', border: 'none',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--v2-font-ui)', marginBottom: '10px',
        }}>Submit enquiry →</button>
      </Link>

      <a
        href={`https://wa.me/919876500000?text=${encodeURIComponent(
          `Hi! I found ${vendor.businessName} on Intrafer and I'm interested in discussing my interior design project. Could we connect?`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          width: '100%', height: '48px', borderRadius: '10px',
          background: '#25D366', color: '#FFFFFF', textDecoration: 'none',
          fontSize: '13px', fontWeight: 600, boxSizing: 'border-box',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.82L.057 23.882l6.22-1.634A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 01-5.012-1.375l-.36-.214-3.732.979.996-3.638-.234-.374A9.782 9.782 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
        Chat on WhatsApp
      </a>

      <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', margin: '12px 0 0' }}>
        Free to enquire · No commitment · Verified designer
      </p>
    </div>
  );
}
