'use client';

import VendorCard from './VendorCard';
import RevealItem from '../ui/RevealItem';

// Client island so the (public)/vendors Server Component page can keep doing
// its async data fetch — only this grid needs 'use client' for the
// stagger-reveal motion, same pattern as VendorSearch/ConsultationModal on
// this same page. VendorCard's own CSS hover-lift (.vendor-card-hover) is
// left untouched — no hoverLift here.
export default function VendorResultsGrid({ vendors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
      {vendors.map((v, i) => (
        <RevealItem key={v._id} index={i % 6}>
          <VendorCard vendor={v} />
        </RevealItem>
      ))}
    </div>
  );
}
