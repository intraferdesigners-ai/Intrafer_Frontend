import { cookies, draftMode } from 'next/headers';
import { PREVIEW_COOKIE } from './landingPreviewEntry';

// The admin preview token for this request, or null. Only ever non-null in
// draft mode (Next validates its cookie against a per-build secret), and
// cookies are read ONLY then — so the cached public render never depends on
// a cookie. The backend still verifies the token (signature, expiry, that
// it belongs to this exact page) before returning any draft content.
export function landingPreviewToken() {
  if (!draftMode().isEnabled) return null;
  return cookies().get(PREVIEW_COOKIE)?.value || null;
}
