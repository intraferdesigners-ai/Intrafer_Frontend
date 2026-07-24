// VendorNavbar's fixed-header height, measured via getBoundingClientRect on
// the live dev server. Desktop shows the nav row + trust-bar row (103px);
// below 768px the trust bar is hidden (it wraps to 2-3 lines and balloons
// header height otherwise), leaving just the 64px nav row.
//
// The actual top padding on vendor-site pages is applied via the
// `.vendor-page-offset` CSS class in globals.css (not these JS values
// directly), since the mobile/desktop split needs a media query. These
// exports exist so the numbers are documented in one place — keep both in
// sync with globals.css if VendorNavbar's markup changes.
export const HEADER_HEIGHT = '103px';
export const HEADER_HEIGHT_MOBILE = '64px';
