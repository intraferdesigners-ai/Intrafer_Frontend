export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/vendor/dashboard', '/auth'],
    },
    sitemap: 'https://intrafer.in/sitemap.xml',
  };
}
