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
};

module.exports = nextConfig;
