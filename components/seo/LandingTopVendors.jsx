import RevealItem from '@/components/ui/RevealItem';
import VendorCard from '@/components/vendor/VendorCard';

// Optional "Top vendors" block on an authored state/category hub (Phase
// 4C) — the city page's vendor card grid under its own heading. Renders
// nothing without vendors (the backend sends [] unless the page turned the
// block on). Below the hub's card grid, so no card is the LCP: all lazy.
export default function LandingTopVendors({ title, vendors }) {
  if (!vendors.length) return null;
  return (
    <section style={{ marginTop: '60px' }}>
      <h2 className="page-heading" style={{ marginBottom: '24px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '20px' }}>
        {vendors.map((v, i) => (
          <RevealItem key={v._id} index={i % 6}>
            <VendorCard vendor={v} priority={false} />
          </RevealItem>
        ))}
      </div>
    </section>
  );
}
