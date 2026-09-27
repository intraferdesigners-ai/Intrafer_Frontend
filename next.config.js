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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.intrafer.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.intrafer.in',
      },
    ],
  },
};

module.exports = nextConfig;
