'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const BHK_OPTIONS = ['All', '1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

export default function VendorBHKFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get('bhk') || 'All';

  function select(bhk) {
    const q = new URLSearchParams(searchParams.toString());
    if (bhk === 'All') {
      q.delete('bhk');
    } else {
      q.set('bhk', bhk);
    }
    q.delete('page');
    router.push(`${pathname}?${q.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-hint)', alignSelf: 'center', marginRight: '4px' }}>BHK type:</span>
      {BHK_OPTIONS.map((bhk) => (
        <button
          key={bhk}
          onClick={() => select(bhk)}
          style={{
            padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
            cursor: 'pointer', border: '1.5px solid',
            borderColor: current === bhk ? 'var(--primary)' : 'var(--border)',
            background: current === bhk ? 'var(--primary-bg)' : 'var(--surface)',
            color: current === bhk ? 'var(--primary)' : 'var(--text-sub)',
          }}
        >
          {bhk}
        </button>
      ))}
    </div>
  );
}
