const { IMAGE_REMOTE_PATTERNS } = require('./lib/imageRemotePatterns');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Step 14 of the SEO restructuring project (spec section 14): trailing
  // slash is now the canonical URL form site-wide. This app runs as a
  // normal Next.js server (no `output: 'export'`), so Next's own router
  // handles the redirect automatically — a request for a non-trailing-slash
  // path gets a 308 to the trailing-slash form before it ever reaches a
  // page. No hand-written redirects() rule needed; verified directly
  // against the dev server (see the Step 14 commit's test notes).
  trailingSlash: true,
  // Single source of truth shared with lib/imageHost.js (canOptimize).
  images: { remotePatterns: IMAGE_REMOTE_PATTERNS },
  // /refer-a-friend promised referral rewards with no backend behind them
  // (no Referral model, no crediting/redemption) and was taken down in
  // 3ae84b3; it 404'd since. Old links and bookmarks now land on the
  // homepage. Both spellings are listed, but with trailingSlash on, Next's
  // own slash redirect runs first, so /refer-a-friend takes two 308 hops
  // (-> /refer-a-friend/ -> /); /refer-a-friend/ takes one.
  async redirects() {
    return [
      { source: '/refer-a-friend', destination: '/', permanent: true },
      { source: '/refer-a-friend/', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
