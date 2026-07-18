import BlogPageClient from './BlogPageClient';

export const metadata = {
  title: 'Design Knowledge | Intrafer Blog',
  description: 'Guides, tips, and ideas for your home from India\'s top interior designers.',
  openGraph: {
    title: 'Design Knowledge | Intrafer Blog',
    description: 'Guides, tips, and ideas for your home from India\'s top interior designers.',
    url: 'https://intrafer.in/blog',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
