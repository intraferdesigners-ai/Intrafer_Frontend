// Display helpers for subscription plans. Every plan, price and duration
// comes from the backend (GET /subscriptions/plans, whose table lives in
// Intrafer_Backend/src/config/plans.js) — never hardcode one in the frontend.
// The helpers also accept the older API shape without displayName/period.

// Highlighted on the pricing cards when it's on offer.
export const POPULAR_PLAN = '6 Month';

const months = (plan) => Math.max(1, Math.round((plan.durationDays || 0) / 30));

export const sortPlans = (plans) =>
  [...(Array.isArray(plans) ? plans : [])].sort((a, b) => a.durationDays - b.durationDays);

export const planLabel = (plan) => plan.displayName || plan.name;

export function planPeriod(plan) {
  if (plan.period) return plan.period;
  const m = months(plan);
  return `${m} month${m === 1 ? '' : 's'}`;
}

// "3, 6, or 12" for plans of 3, 6 and 12 months.
export function termList(plans) {
  const ms = sortPlans(plans).map(months);
  if (ms.length <= 1) return ms.join('');
  if (ms.length === 2) return `${ms[0]} or ${ms[1]}`;
  return `${ms.slice(0, -1).join(', ')}, or ${ms.at(-1)}`;
}

export const cheapestPlan = (plans) =>
  sortPlans(plans).reduce((min, p) => (min === null || p.price < min.price ? p : min), null);
