'use client';

import dynamic from 'next/dynamic';

// Interaction-only widgets, loaded in their own chunks after hydration
// (ssr: false) instead of in every page's first-load JS. Each renders
// nothing until the visitor acts (navigates, picks vendors to compare, or
// the enquiry prompt's own timer fires), so the server HTML and the first
// paint are identical either way; they keep their framer-motion
// enter/exit animations inside those chunks.
export const RouteProgressBar = dynamic(() => import('./RouteProgressBar'), { ssr: false });
export const CompareBar = dynamic(() => import('../vendor/CompareBar'), { ssr: false });
export const VendorEnquiryOverlay = dynamic(() => import('../vendor/VendorEnquiryOverlay'), { ssr: false });
