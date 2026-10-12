// Values for the public trust-stat tiles (home, about, footer, auth panel,
// /for-designers), read only from GET /public/stats. Each helper returns
// null when there is no real figure to show — the caller drops that tile —
// so a missing API or an empty database never renders a made-up number.

// Fewer stored reviews than this and a site-wide average says too little to
// headline; the rating tile stays hidden until there are enough.
export const MIN_REVIEWS_FOR_AVG_RATING = 3;

// A count tile is shown only for a real, positive count (exact, no "+").
export function realCount(n) {
  return Number.isInteger(n) && n > 0 ? n : null;
}

// The site-wide average rating, only when it is backed by enough stored
// reviews. Needs the API's reviewCount, so an older backend (which returned
// a hardcoded "4.8" with no reviews) yields null too.
export function realAvgRating(stats) {
  const rating = parseFloat(stats?.avgRating);
  const count = stats?.reviewCount;
  if (!Number.isFinite(rating) || rating <= 0) return null;
  if (!Number.isInteger(count) || count < MIN_REVIEWS_FOR_AVG_RATING) return null;
  return rating;
}
