'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const BHK_OPTIONS = ['All', '1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

export default function VendorBHKFilterV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get('bhk') || 'All';

  function select(bhk) {
    const q = new URLSearchParams(searchParams.toString());
    if (bhk === 'All') q.delete('bhk');
    else q.set('bhk', bhk);
    q.delete('page');
    router.push(`${pathname}?${q.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#64748B', marginRight: '4px' }}>BHK type:</span>
      {BHK_OPTIONS.map(bhk => {
        const active = current === bhk;
        return (
          <button
            key={bhk}
            onClick={() => select(bhk)}
            style={{
              padding: '7px 18px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--v2-font-ui)',
              border: active ? '1.5px solid #3B82F6' : '1.5px solid #CBD5E1',
              background: active ? '#3B82F6' : 'transparent',
              color: active ? '#FFFFFF' : '#64748B',
              transition: 'all 150ms',
            }}
          >
            {bhk}
          </button>
        );
      })}
    </div>
  );
}
