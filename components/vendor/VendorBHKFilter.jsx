'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const BHK_OPTIONS = ['All', '1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

// Sliding active-pill highlight — same layoutId pattern as the tenure
// switcher in EMICalculator.jsx, reused here for consistency.
export default function VendorBHKFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get('bhk') || 'All';
  const shouldReduceMotion = useReducedMotion();

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
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-hint)', marginRight: '4px' }}>BHK type:</span>
      {BHK_OPTIONS.map((bhk) => {
        const active = current === bhk;
        return (
          <motion.button
            key={bhk}
            onClick={() => select(bhk)}
            aria-pressed={active}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.94 }}
            style={{
              position: 'relative', padding: '7px 18px', borderRadius: '999px',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              border: '1.5px solid', overflow: 'hidden',
              borderColor: active ? 'transparent' : 'var(--border)',
              background: active ? 'transparent' : 'var(--surface)',
              color: active ? '#fff' : 'var(--text-sub)',
              transition: 'color 200ms ease, border-color 200ms ease',
            }}
          >
            {active && (
              <motion.span
                layoutId="bhk-filter-highlight"
                style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  background: 'var(--primary)', borderRadius: '999px',
                  boxShadow: '0 2px 10px rgba(29,78,216,.3)',
                }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{bhk}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
