import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';
import { sortPlans } from '@/lib/plans';
import ForDesignersClient from './ForDesignersClient';

// Cached (ISR, 5 min). Prices come only from the backend's plans endpoint
// and the backend purges the plans tag on every boot, i.e. on every deploy
// that could change them. A failing fetch throws at runtime so the last good
// page stays up (see lib/cachedFetch.js); during `next build` the page falls
// back to no plans and is replaced at its next regeneration.
export const revalidate = 300;
const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchPlans() {
  const json = await cachedJson(`${API}/subscriptions/plans`, { revalidate: LIST_WINDOW, tags: [TAGS.PLANS] });
  return sortPlans(json?.data?.plans);
}

export default async function ForDesignersPage() {
  return <ForDesignersClient plans={await fetchPlans()} />;
}
