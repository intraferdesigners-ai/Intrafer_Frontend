import Link from 'next/link';
import { Building2 } from 'lucide-react';

// The 404 for /vendors/[vendorId]/ (thrown from its layout.jsx): the same
// "Designer not found" view the page used to return with a 200.
export default function VendorNotFound() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <Building2 size={48} color="var(--text-hint)" />
      <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text)', margin: '16px 0 8px' }}>
        Designer not found
      </h1>
      <Link href="/vendors/" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
        ← Browse all designers
      </Link>
    </main>
  );
}
