import { SITE_URL } from '@/lib/siteUrl';

// page.jsx here is a client component (no metadata export), so its server-
// rendered title and canonical live in this minimal layout.
// Its privacy/ and terms/ pages set their own title and canonical. A plain
// title string here would reset the root "%s | Intrafer" template for those
// child pages, so this layout repeats the template. `default` is this
// page's own title; the root template still adds the brand to it.
export const metadata = {
  title: { default: 'List Your Interior Design Studio', template: '%s | Intrafer' },
  alternates: { canonical: `${SITE_URL}/for-designers/` },
};

export default function Layout({ children }) {
  return children;
}
