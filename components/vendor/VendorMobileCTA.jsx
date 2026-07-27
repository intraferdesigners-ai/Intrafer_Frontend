'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

export default function VendorMobileCTA({ vendorId }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let pastHero = false;
    let ctaVisible = false;
    const update = () => setShow(pastHero && !ctaVisible);

    const onScroll = () => {
      pastHero = window.scrollY > 420;
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const ctaEl = document.querySelector('.vendor-profile-sticky');
    let observer;
    if (ctaEl) {
      observer = new IntersectionObserver(([entry]) => {
        ctaVisible = entry.isIntersecting;
        update();
      }, { threshold: 0 });
      observer.observe(ctaEl);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (observer) observer.disconnect();
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @media (min-width: 769px) { .vendor-mobile-cta { display: none !important; } }
      `}</style>
      <div
        className="vendor-mobile-cta slide-down"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '10px 16px max(10px, env(safe-area-inset-bottom))',
        }}
      >
        <Link href={`/enquiry?vendorId=${vendorId}`} style={{ display: 'block' }}>
          <Button variant="primary" size="lg" style={{ width: '100%' }}>
            Submit enquiry →
          </Button>
        </Link>
      </div>
    </>
  );
}
