'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Palette, ShieldCheck, ChevronRight, LogIn } from 'lucide-react';
import AuthSplitCard from '../../../components/auth/AuthSplitCard';

// No homeowner card — that role has no login surface anymore (see the
// homeowner-removal plan, Phase 4).
const ROLE_CARDS = [
  { role: 'vendor', label: 'Vendor',    desc: 'Manage your studio profile, leads, and subscription.', Icon: Palette },
  { role: 'admin',  label: 'Admin',     desc: 'Access the operations console.',                       Icon: ShieldCheck },
];

export default function AuthPortalPage() {
  useEffect(() => { document.title = 'Sign in | Intrafer'; }, []);

  return (
    <AuthSplitCard>
      <style>{`
        .role-card { transition: border-color 150ms, box-shadow 150ms, transform 150ms; }
        .role-card:hover { border-color: var(--primary-light); box-shadow: var(--shadow-md); transform: translateY(-1px); }
      `}</style>

      {/* White backing box, same as every other logo.png placement sitewide
          (Sidebar, VendorNavbar, Footer, RegisterSuccessScreen, etc.) — the
          icon's line-work is dark navy with no fill, so without a light
          backing it disappears against a dark page background. */}
      <Link href="/" style={{ display: 'inline-flex', marginBottom: '20px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          background: '#FFFFFF', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,.12)',
        }}>
          <Image src="/images/logo/logo.png" alt="Intrafer" width={26} height={26} style={{ objectFit: 'contain' }} />
        </div>
      </Link>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <LogIn size={20} color="var(--primary)" strokeWidth={1.8} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
          letterSpacing: '-.01em', color: 'var(--text)', margin: '0 0 6px',
        }}>
          Sign in to Intrafer
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', margin: 0 }}>
          Choose the type of account you&apos;re signing into
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ROLE_CARDS.map(({ role, label, desc, Icon }) => (
          <Link key={role} href={`/auth/login?role=${role}`} style={{ textDecoration: 'none' }}>
            <div className="role-card" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color="var(--primary)" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '2px', lineHeight: 1.5 }}>{desc}</div>
              </div>
              <ChevronRight size={16} color="var(--text-hint)" style={{ flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-sub)', marginTop: '24px' }}>
        New to Intrafer?{' '}
        <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>
          Create an account
        </Link>
      </p>
    </AuthSplitCard>
  );
}
