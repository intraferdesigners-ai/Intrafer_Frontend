export default function sitemap() {
  const baseUrl = 'https://intrafer.in';
  const now = new Date().toISOString();

  return [
    { url: baseUrl, lastModified: now, priority: 1.0 },
    { url: `${baseUrl}/vendors`, lastModified: now, priority: 0.9 },
    { url: `${baseUrl}/gallery`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/cost-calculator`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/wardrobe-calculator`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/design-styles`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/plans`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/for-designers`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/testimonials`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, priority: 0.3 },
  ];
}
