import { revalidatePath, revalidateTag } from 'next/cache';
import { createRevalidateHandler } from '@/lib/revalidateRequest';

// Backend-triggered cache purge (Intrafer_Backend/src/utils/revalidate.js).
// POST only — no GET handler, so anything else gets 405. Never cached.
export const dynamic = 'force-dynamic';

export const POST = createRevalidateHandler({
  revalidateTag,
  revalidatePath,
  getSecret: () => process.env.REVALIDATE_SECRET,
});
