import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export const metadata = { title: 'Enquiry Submitted | Intrafer' };

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
