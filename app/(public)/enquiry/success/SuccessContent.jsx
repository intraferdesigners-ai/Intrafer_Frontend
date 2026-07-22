'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

const PIPELINE = [
  { label: 'Enquiry submitted', time: 'Just now' },
  { label: 'Designer reviews',  time: 'Within 24 hours' },
  { label: 'Designer contacts you', time: 'Within 48 hours' },
];

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const enquiryId    = searchParams.get('enquiryId');
  const vendorId     = searchParams.get('vendorId');

  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/vendors/${vendorId}`)
      .then(r => r.json())
      .then(d => setVendor(d.data?.vendor || null))
      .catch(() => {});
  }, [vendorId]);

  const shortId = enquiryId
    ? 'ENQ-' + enquiryId.slice(-6).toUpperCase()
    : 'ENQ-XXXXXX';

  return (
    <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      {/* Animated check */}
      <div className="scale-in" style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'var(--success-bg)', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle size={44} color="var(--success)" strokeWidth={1.5} />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400,
        color: 'var(--text)', letterSpacing: '-.02em', marginTop: '24px', marginBottom: '8px',
      }}>
        Enquiry sent!
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '28px', lineHeight: 1.7 }}>
        Your enquiry has been submitted successfully. A verified designer will be in touch soon.
      </p>

      {/* ENQ ID box */}
      <div style={{
        background: 'var(--bg-parchment)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: '28px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: '8px' }}>
          YOUR ENQUIRY ID
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color: 'var(--primary)', margin: '0 0 6px', letterSpacing: '.04em' }}>
          {shortId}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-hint)', margin: 0 }}>Save this for reference</p>
      </div>

      {/* Timeline */}
      <div style={{ textAlign: 'left', marginBottom: '28px' }}>
        {PIPELINE.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < PIPELINE.length - 1 ? '16px' : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: i === 0 ? 'var(--primary)' : 'transparent',
                border: i === 0 ? 'none' : '2px solid var(--border-emp)',
              }} />
              {i < PIPELINE.length - 1 && (
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', marginTop: '3px' }} />
              )}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: i === 0 ? 500 : 400, color: i === 0 ? 'var(--text)' : 'var(--text-mid)', margin: '0 0 2px' }}>
                {step.label}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-hint)', margin: 0 }}>{step.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor card */}
      {vendor && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: '16px',
          display: 'flex', gap: '14px', textAlign: 'left', marginBottom: '20px',
        }}>
          {vendor.portfolioImages?.[0] && (
            <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              <Image src={vendor.portfolioImages[0]} alt={vendor.businessName} fill style={{ objectFit: 'cover' }} sizes="56px" />
            </div>
          )}
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-hint)', margin: '0 0 4px' }}>Your enquiry was sent to</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>{vendor.businessName}</p>
            {vendor.location?.city && (
              <p style={{ fontSize: '12px', color: 'var(--text-hint)', margin: '2px 0 0' }}>{vendor.location.city}</p>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp CTA */}
      {vendor && (
        <div style={{ marginBottom: '28px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '10px' }}>
            While you wait, you can also reach out directly:
          </p>
          <a
            href={`https://wa.me/919876500000?text=${encodeURIComponent(
              `Hi ${vendor.businessName}! I just submitted an enquiry on Intrafer (${shortId}). Would love to discuss my project.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#25D366', color: '#fff',
              borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.82L.057 23.882l6.22-1.634A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 01-5.012-1.375l-.36-.214-3.732.979.996-3.638-.234-.374A9.782 9.782 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/user/dashboard" style={{
          padding: '12px 24px', background: 'var(--primary)', color: '#fff',
          borderRadius: 'var(--r-md)', fontSize: '14px', fontWeight: 500,
          textDecoration: 'none',
        }}>
          View my dashboard →
        </Link>
        <Link href="/vendors" style={{
          padding: '12px 20px', background: 'var(--surface)', color: 'var(--text-sub)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          fontSize: '14px', textDecoration: 'none',
        }}>
          Browse more designers
        </Link>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '16px', lineHeight: 1.6 }}>
        This also set up your free Intrafer account — no password to remember. Next time, just enter your email on the sign-in page and we&apos;ll send you a code.
      </p>

      <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '12px', lineHeight: 1.6 }}>
        🔒 Your contact details are only shared after the designer accepts your enquiry.
      </p>
    </div>
  );
}
