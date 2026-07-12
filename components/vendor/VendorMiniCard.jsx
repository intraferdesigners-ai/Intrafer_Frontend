import { Building2 } from 'lucide-react';

export default function VendorMiniCard({ vendor }) {
  const specs = vendor.specializations || [];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--color-surface-alt)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
    }}>
      {/* Icon circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'var(--color-accent-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Building2 size={20} color="var(--color-primary)" />
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
          {vendor.businessName}
        </p>
        {(vendor.city || vendor.location) && (
          <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--color-text-sub)' }}>
            {vendor.city || vendor.location}
          </p>
        )}
        {specs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {specs.slice(0, 2).map((s) => (
              <span key={s} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: 'var(--color-border)', color: 'var(--color-text-sub)',
                letterSpacing: '0.02em',
              }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
