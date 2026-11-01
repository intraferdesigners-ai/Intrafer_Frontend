// The ONE place the business's own contact and brand details live. The
// footer, the contact page, the floating WhatsApp / call buttons, the legal
// pages and the Organization JSON-LD all read from here, so what the site
// shows and what its structured data says can never disagree. Pure (no
// React, no env), so scripts/testStructuredData.mjs imports it directly.
//
// Every value below was already live on the site before this module
// existed (contact page, footer, legal pages); nothing here is new data.

export const SITE_NAME = 'Intrafer';

// Public file under /public; absolute URLs are built with lib/siteUrl.js.
export const LOGO_PATH = '/images/logo/logo.png';

// Support line. Shown on /contact/ with its hours; also the WhatsApp number.
export const PHONE = Object.freeze({
  e164: '+919217211408',
  display: '+91 92172 11408',
  hoursLabel: 'Mon–Sat, 9am–6pm',
  // Same hours as hoursLabel, machine-readable (ContactPoint.hoursAvailable).
  hours: Object.freeze({ days: Object.freeze(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']), opens: '09:00', closes: '18:00' }),
});

export const WHATSAPP_URL = `https://wa.me/${PHONE.e164.replace(/^\+/, '')}`;
export const TEL_URL = `tel:${PHONE.e164}`;

// Two addresses are live today and they differ: the contact page lists
// CONTACT_EMAIL, the privacy/terms pages list LEGAL_EMAIL. Both are kept
// exactly as they were (which one is canonical is a business decision);
// the Organization's ContactPoint uses CONTACT_EMAIL, the one the contact
// page shows next to the phone number.
export const CONTACT_EMAIL = 'Intraferpvtltd@gmail.com';
export const LEGAL_EMAIL = 'support@intrafer.in';

// The site's UI language (root layout: <html lang="en">).
export const AVAILABLE_LANGUAGES = Object.freeze(['English']);
export const AREA_SERVED = 'IN';

// Footer social icons, in display order; also Organization.sameAs.
export const SOCIAL_PROFILES = Object.freeze([
  Object.freeze({ label: 'Instagram', url: 'https://instagram.com/intrafer' }),
  Object.freeze({ label: 'LinkedIn', url: 'https://linkedin.com/company/intrafer' }),
]);
