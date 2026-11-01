'use client';

import dynamic from 'next/dynamic';

// The lead popup renders nothing until its own timer fires (seconds after
// load), so its code (form, city search, API client) is loaded in a separate
// chunk after hydration instead of in every page's first-load bundle — it
// can't delay the first paint or LCP. Behaviour is unchanged.
const LeadCapturePopup = dynamic(() => import('./LeadCapturePopup'), { ssr: false });

export default function LeadCapturePopupLazy() {
  return <LeadCapturePopup />;
}
