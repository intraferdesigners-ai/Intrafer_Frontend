import { absoluteUrl } from '@/lib/siteUrl';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/vendor/dashboard', '/auth'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
