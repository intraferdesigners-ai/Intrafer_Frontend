'use client';

import { useEffect } from 'react';

// Root-layout marker: set once the app has hydrated. Anything rendered
// after that is a client-side navigation (see PageTransition.jsx), which
// may animate in; the server-rendered landing page never does. Renders
// nothing.
export const isHydrated = () => typeof window !== 'undefined' && window.__intraferHydrated === true;

export default function HydrationMarker() {
  useEffect(() => { window.__intraferHydrated = true; }, []);
  return null;
}
