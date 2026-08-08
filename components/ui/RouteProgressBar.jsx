'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Thin top-of-viewport progress bar giving instant feedback the moment a
// visitor clicks into a page-navigating link or filter — independent of how
// long the destination actually takes to load. Added after measuring that
// /vendors and /vendors/[vendorId] (fully dynamic, cache:'no-store' routes,
// no static shell) don't stream their loading.js fallback ahead of the real
// content in this Next 14.2 setup — confirmed via TTFB≈total-time on both
// dev and prod servers, with and without an async generateMetadata — so a
// click into a vendor card previously left the old page frozen with zero
// feedback for the full ~150-250ms (or longer on a cold, unprefetched first
// visit) round trip. This bar starts on the click itself, not on data
// arrival, so the click always feels acknowledged immediately.
//
// Two start triggers, one completion signal:
// - A capture-phase click listener on same-tab internal <a> navigations
//   (vendor cards, nav links, "Submit enquiry", homepage -> /vendors, etc).
// - A custom 'intrafer:nav-start' window event for router.push()-driven
//   navigations that don't originate from a real <a> click (VendorSearch's
//   filter/sort "Search" button) — dispatched from that one call site
//   rather than trying to intercept history.pushState globally, whose
//   timing relative to data-arrival isn't guaranteed across Next versions.
// - Completion is just the pathname/searchParams actually changing.
export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const key = `${pathname}?${searchParams.toString()}`;
  const prevKeyRef = useRef(key);

  useEffect(() => {
    const start = () => setActive(true);

    const handleClick = (e) => {
      // Not checking e.defaultPrevented: next/link's own onClick handler
      // always calls preventDefault() as part of normal client-side routing
      // (that's how it swaps the native navigation for its own), and by the
      // time this bubbles up to document, that already happened — checking
      // it here would skip every single real Link click, not just the
      // intentionally-cancelled ones this was meant to filter out.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.target === '_blank') return;
      start();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('intrafer:nav-start', start);
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('intrafer:nav-start', start);
    };
  }, []);

  useEffect(() => {
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;
    setActive(false);
  }, [key]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="route-progress-bar"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
            height: '3px', background: 'var(--primary)',
            transformOrigin: 'left', boxShadow: '0 0 8px rgba(59,130,246,.5)',
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.8 }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.2 } }}
          transition={{ duration: shouldReduceMotion ? 0 : 4, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}
