import { SITE_URL } from '@/lib/siteUrl';

// page.jsx here is a client component (no metadata export), so its server-
// rendered title and canonical live in this minimal layout.
export const metadata = {
  title: 'Contact Us',
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function Layout({ children }) {
  return children;
}
