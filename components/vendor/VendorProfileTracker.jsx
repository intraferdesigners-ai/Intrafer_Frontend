'use client';
import { useEffect } from 'react';
import { trackVendorInterest } from '@/lib/trackInterest';

export default function VendorProfileTracker({ vendorId }) {
  useEffect(() => {
    if (vendorId) trackVendorInterest(vendorId, 'profile');
  }, [vendorId]);
  return null;
}
