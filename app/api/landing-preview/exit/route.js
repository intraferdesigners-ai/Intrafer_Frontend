import { cookies, draftMode } from 'next/headers';
import { createPreviewExit } from '@/lib/landingPreviewEntry';

// Leaves the admin preview (see lib/landingPreviewEntry.js).
export const dynamic = 'force-dynamic';

export const GET = createPreviewExit({
  draftMode,
  cookies,
});
