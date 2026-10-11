import { cookies, draftMode } from 'next/headers';
import { createPreviewEntry } from '@/lib/landingPreviewEntry';

// Admin landing-page preview entry (see lib/landingPreviewEntry.js). Never
// cached; the token is never logged or put in the redirect.
export const dynamic = 'force-dynamic';

export const GET = createPreviewEntry({
  api: process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: (url, options) => fetch(url, options),
  draftMode,
  cookies,
});
