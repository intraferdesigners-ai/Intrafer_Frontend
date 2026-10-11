import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export const metadata = { title: 'Enquiry Submitted' };

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
