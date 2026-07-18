'use client'
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const PIPELINE = [
  { label: 'Your enquiry is with our verified designers', time: 'Now' },
  { label: 'A designer reviews your brief', time: '2-4h' },
  { label: 'Designer responds with a proposal', time: 'Within 48h' },
  { label: 'Review, connect, transform your space', time: 'You' },
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get('enquiryId');
  const vendorId = searchParams.get('vendorId');
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors/${vendorId}`)
      .then(r => r.json())
      .then(d => setVendor(d.data?.vendor || null))
      .catch(() => {});
  }, [vendorId]);

  const shortId = enquiryId ? 'ENQ-' + enquiryId.slice(-6).toUpperCase() : 'ENQ-XXXXXX';

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', background: '#0F172A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', fontFamily: 'var(--v2-font-ui)',
    }}>
      <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(34,197,94,0.12)', border: '2px solid #22C55E',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px', animation: 'v2CheckIn 500ms cubic-bezier(.34,1.56,.64,1) forwards',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--v2-font-display)', fontSize: 'clamp(28px,4.5vw,36px)',
          fontWeight: 500, color: '#F8F7F4', margin: '0 0 8px',
        }}>Enquiry submitted!</h1>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '28px', lineHeight: 1.7 }}>
          A verified designer will be in touch soon.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '20px', marginBottom: '28px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your enquiry ID
          </p>
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#3B82F6', margin: '0 0 6px', letterSpacing: '.04em' }}>{shortId}</p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Save this for reference</p>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '28px' }}>
          {PIPELINE.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < PIPELINE.length - 1 ? '16px' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: i === 0 ? '#3B82F6' : 'transparent',
                  border: i === 0 ? 'none' : '2px solid #334155',
                }} />
                {i < PIPELINE.length - 1 && <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', marginTop: '3px' }} />}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: i === 0 ? 500 : 400, color: i === 0 ? '#F8F7F4' : '#94A3B8', margin: '0 0 2px' }}>{step.label}</p>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{step.time}</p>
              </div>
            </div>
          ))}
        </div>

        {vendor && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '16px', display: 'flex', gap: '14px',
            textAlign: 'left', marginBottom: '28px',
          }}>
            {vendor.portfolioImages?.[0] && (
              <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={vendor.portfolioImages[0]} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} sizes="56px" />
              </div>
            )}
            <div>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Your enquiry was sent to</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#F8F7F4', margin: 0 }}>{vendor.businessName}</p>
              {vendor.location?.city && <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>{vendor.location.city}</p>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/user/dashboard" style={{
            padding: '12px 24px', background: '#3B82F6', color: '#FFFFFF',
            borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
          }}>Track your enquiry →</Link>
          <Link href="/vendors" style={{
            padding: '12px 20px', background: 'transparent', color: '#CBD5E1',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
            fontSize: '14px', textDecoration: 'none',
          }}>Browse more designers</Link>
        </div>

        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '24px', lineHeight: 1.6 }}>
          🔒 Your contact details are only shared after the designer accepts your enquiry.
        </p>
      </div>

      <style>{`@keyframes v2CheckIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

export default function EnquirySuccessPage() {
  useEffect(() => { document.title = 'Enquiry Sent | Intrafer'; }, []);
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
