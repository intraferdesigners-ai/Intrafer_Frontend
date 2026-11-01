import { cachedJson } from '@/lib/cachedFetch';
import { LIST_WINDOW, TAGS } from '@/lib/cacheTags';
import { sortPlans } from '@/lib/plans';
import PlansClient from './PlansClient';
import JsonLd from '@/components/seo/JsonLd';
import { plansJsonLd } from '@/lib/structuredData';

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

// Product + Offer per tier, built from the same `plans` array the price
// cards render (scripts/checkStructuredData.mjs compares the two live).
export default async function PlansPage() {
  const plans = await fetchPlans();
  return (
    <>
      <JsonLd data={plansJsonLd(plans)} />
      <PlansClient plans={plans} />
    </>
  );
}
