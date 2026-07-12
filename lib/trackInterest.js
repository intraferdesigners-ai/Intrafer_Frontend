import { getSessionId } from './session';

export async function trackVendorInterest(vendorId, source = 'card') {
  try {
    const sessionId = getSessionId();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visitor/track-interest`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sessionId, vendorId, source }),
    });
  } catch {
    // fail silently
  }
}
