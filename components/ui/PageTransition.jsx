'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { isHydrated } from './HydrationMarker';

// Subtle fade-in on client-side route changes (CSS .m-fade-in, `duration`
// seconds). Keyed by pathname so each navigation remounts the wrapper and
// replays the fade. The page the visitor lands on is server-rendered fully
// visible — an opacity:0 start would hide it (and its LCP element) until
// hydration. "Client-side" = rendered after the app hydrated
// (HydrationMarker in the root layout), which also covers arriving from a
// page outside this layout, e.g. the home page. Reduced motion: no fade.
export default function PageTransition({ children, duration = 0.25 }) {
  const pathname = usePathname();
  return <FadeOnMount key={pathname} duration={duration}>{children}</FadeOnMount>;
}

// Decides once per mount (i.e. per pathname): a same-path re-render — a
// filter or query change — never re-triggers the fade.
function FadeOnMount({ children, duration }) {
  const [fade] = useState(isHydrated);
  return (
    <div
      className={fade ? 'm-fade-in' : undefined}
      style={fade ? { '--m-fade-duration': `${duration}s` } : undefined}
    >
      {children}
    </div>
  );
}
