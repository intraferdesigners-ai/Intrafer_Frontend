// The ONE list of remote image hosts next/image may optimize. CommonJS so
// next.config.js can require() it; lib/imageHost.js imports the same
// object for its runtime check (canOptimize), which LandingBanner and
// ProjectImageSlider use. Add a host here and every consumer follows.
const IMAGE_REMOTE_PATTERNS = [
  { protocol: 'https', hostname: '**.railway.app' },
  { protocol: 'https', hostname: 'res.cloudinary.com' },
  { protocol: 'https', hostname: '**.amazonaws.com' },
  { protocol: 'https', hostname: 'cdn.intrafer.com' },
  { protocol: 'http', hostname: 'localhost' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'api.intrafer.in' },
];

module.exports = { IMAGE_REMOTE_PATTERNS };
