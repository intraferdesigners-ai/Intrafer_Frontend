import api from './api';
import { getSavedContact, markVendorEngaged, clearSavedContact } from './session';

// Shared by every vendor-targeted lead-capture entry point (VendorEnquiryOverlay,
// QuickEnquiryModal via VendorCard) — silently creates a Lead for `vendor`
// using contact details this browser already OTP-verified once (see
// session.js), with no popup and no repeat OTP. Callers are responsible for
// their own hasEngagedVendor(vendorId) check before calling this — it does
// not re-check dedup itself, only the backend's own defense-in-depth check.
export async function autoSendVendorEnquiry(vendor) {
  const vendorId = vendor?._id ? String(vendor._id) : '';
  if (!vendorId) return null;

  const saved = getSavedContact();
  if (!saved) return null;

  try {
    const { data } = await api.post('/enquiry/auto-submit', {
      name: saved.name,
      phone: saved.phone,
      email: saved.email,
      contactToken: saved.contactToken,
      vendorId,
      city: vendor?.location?.city || '',
    });
    markVendorEngaged(vendorId, 'auto');
    return data?.data?.lead || null;
  } catch (err) {
    // A rejected contactToken (401) means the server no longer vouches for
    // this cached contact (e.g. the signing secret rotated) — clear it so
    // the next enquiry anywhere on the site goes through OTP again instead
    // of failing silently forever.
    if (err?.response?.status === 401) clearSavedContact();
    return null;
  }
}
