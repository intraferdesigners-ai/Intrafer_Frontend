import { notFound } from 'next/navigation';
import { fetchVendor } from './vendorData';

// Real 404 for a missing / suspended / unlisted vendor. This check lives in
// the segment's layout because ./loading.js wraps only page.jsx: the layout
// resolves before that Suspense boundary starts streaming a 200, so
// notFound() here still sets the status (rendered by ../not-found.jsx),
// while valid vendors keep the skeleton for the page's slower lists.
export default async function VendorLayout({ children, params }) {
  if (!(await fetchVendor(params.vendorId))) notFound();
  return children;
}
