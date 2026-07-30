'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import VendorCard from './VendorCard';
import RevealItem from '../ui/RevealItem';

// Client island so the (public)/vendors Server Component page can keep doing
// its async data fetch — only this grid needs 'use client' for the
// stagger-reveal motion, same pattern as VendorSearch/ConsultationModal on
// this same page. VendorCard's own CSS hover-lift (.vendor-card-hover) is
// left untouched — no hoverLift here.
//
// resultsKey changes whenever the server refetches for new filters/sort/page
// (see page.jsx) — keying the outer motion.div on it makes AnimatePresence
// cross-fade the whole grid instead of the old set jump-cutting to the new
// one. Individual cards still stagger in via RevealItem underneath.
export default function VendorResultsGrid({ vendors, resultsKey }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={resultsKey}
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
      >
        {vendors.map((v, i) => (
          <RevealItem key={v._id} index={i % 6}>
            <VendorCard vendor={v} />
          </RevealItem>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
