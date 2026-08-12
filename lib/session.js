export function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('intrafer_session_id');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('intrafer_session_id', id);
  }
  return id;
}

export function markPopupDismissed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('intrafer_popup_dismissed_at', Date.now().toString());
}

// The old permanent "already filled" flag is gone — a submission here now
// only requests an OTP (see LeadCapturePopup's handleSubmit), it doesn't
// complete anything by itself, so suppressing the popup forever at that
// point could strand a visitor who never finishes verifying with no way to
// ever be captured. getSavedContact() (only set once OTP is genuinely
// confirmed — see saveContact's comment) is the sole permanent gate now;
// the 5-minute dismissed-cooldown below is the only other one.
export function shouldShowPopup() {
  if (typeof window === 'undefined') return false;
  if (getSavedContact()) return false;
  const ts = localStorage.getItem('intrafer_popup_dismissed_at');
  if (ts) {
    if (Date.now() - parseInt(ts) < 5 * 60 * 1000) return false;
    localStorage.removeItem('intrafer_popup_dismissed_at');
  }
  return true;
}

export function recordFirstVisit() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('intrafer_first_visit')) {
    localStorage.setItem('intrafer_first_visit', Date.now().toString());
  }
}

export function getSecondsSinceFirstVisit() {
  if (typeof window === 'undefined') return 0;
  const firstVisit = localStorage.getItem('intrafer_first_visit');
  if (!firstVisit) return 0;
  return Math.floor((Date.now() - parseInt(firstVisit)) / 1000);
}

// Per-vendor engagement flag for the vendor-profile lead-capture overlay.
// Unlike hasFilledPopup/markPopupDismissed above (which re-arm the site-wide
// popup after a 5-minute cooldown), this is a permanent one-shot flag — but
// only a real submission sets it (VendorEnquiryOverlay's handleSubmit).
// Dismissing without submitting does NOT call markVendorEngaged: the overlay
// is meant to keep reappearing on every fresh visit to that vendor's page
// until the visitor actually submits an enquiry there, not be permanently
// suppressed by closing it once.
const ENGAGED_VENDORS_KEY = 'intrafer_vendor_engaged';

function readEngagedVendors() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(ENGAGED_VENDORS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function hasEngagedVendor(vendorId) {
  if (!vendorId) return false;
  return !!readEngagedVendors()[vendorId];
}

export function markVendorEngaged(vendorId, reason) {
  if (typeof window === 'undefined' || !vendorId) return;
  const all = readEngagedVendors();
  all[vendorId] = { reason, at: Date.now() };
  localStorage.setItem(ENGAGED_VENDORS_KEY, JSON.stringify(all));
}

// Guest contact details (name/phone/email), OTP-verified exactly once per
// browser — after that, every lead-capture entry point (LeadCapturePopup,
// VendorEnquiryOverlay, QuickEnquiryModal) reads this instead of asking the
// visitor to fill in or re-verify anything again. contactToken is the
// backend's proof that this exact name+phone+email triple actually passed
// OTP (see enquiry.controller.js's makeContactToken) — getSavedContact()
// requires it to be present so a contact only ever counts as "saved" once
// it's genuinely verified, not merely typed in. See lib/enquiryFlow.js for
// how this cache drives the silent auto-send-to-a-new-vendor flow.
const SAVED_CONTACT_KEY = 'intrafer_guest_contact';

export function getSavedContact() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY) || 'null');
    if (!saved || !saved.name || !saved.phone || !saved.email || !saved.contactToken) return null;
    return saved;
  } catch {
    return null;
  }
}

// Called only after a real OTP verification succeeds (enquiry/verify's
// handleVerify) — never at send-otp time, even though send-otp is when the
// visitor's typed input is first available. Saving here instead of there is
// what makes "verified" mean verified: a visitor who abandons the flow
// after requesting an OTP but before entering it must not leave behind a
// cache entry that later silently auto-sends leads in their name.
export function saveContact({ name, phone, email, contactToken }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify({ name, phone, email, contactToken }));
}

// Used when the backend rejects a contactToken (e.g. secret rotation) —
// self-heals by sending the visitor back through OTP on their next enquiry
// instead of silently failing every auto-send from then on.
export function clearSavedContact() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVED_CONTACT_KEY);
}
