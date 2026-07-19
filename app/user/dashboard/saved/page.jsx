'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import VendorCard from '../../../../components/vendor/VendorCard';

export default function SavedDesignersPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/saved-vendors')
      .then(({ data }) => setVendors(data.data?.vendors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: '0 0 6px',
        }}>
          Saved designers
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: 0 }}>
          Designers you&apos;ve saved for later.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}>
          <Spinner size="md" />
        </div>
      ) : vendors.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 32px', textAlign: 'center',
        }}>
          <Heart size={40} color="var(--color-text-hint)" style={{ marginBottom: 16 }} />
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
            color: 'var(--color-text)', margin: '0 0 8px',
          }}>
            No saved designers yet
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-sub)', margin: '0 0 32px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            Tap the heart icon on any designer&apos;s profile to save them here for later.
          </p>
          <Link href="/vendors">
            <button style={{
              padding: '12px 28px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)', color: '#fff',
              fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
              letterSpacing: '0.01em',
            }}>
              Browse designers →
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {vendors.map((v) => <VendorCard vendor={v} key={v._id} />)}
        </div>
      )}
    </div>
  );
}
