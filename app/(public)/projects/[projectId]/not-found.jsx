import Link from 'next/link';
import { Building2 } from 'lucide-react';

// Rendered with a real 404 status when page.jsx calls notFound() — the same
// "Project not found" view the page used to return with a 200.
export default function ProjectNotFound() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <Building2 size={48} color="var(--text-hint)" />
      <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text)', margin: '16px 0 8px' }}>
        Project not found
      </h1>
      <Link href="/vendors/" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>
        ← Browse designers
      </Link>
    </main>
  );
}
