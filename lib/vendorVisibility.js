// Why an approved project isn't on the public site because of its vendor —
// mirrors the backend's public rule (Intrafer_Backend/src/utils/
// publicVisibility.js: approved AND listing-enabled). Pure, so
// scripts/testVendorVisibility.mjs can test it directly.
//
// `vendor`: the project's populated vendorId (admin projects list).
// -> null when the vendor is public; otherwise { label, title }.
export function vendorVisibilityIssue(vendor) {
  if (!vendor || typeof vendor !== 'object') {
    return { label: 'Vendor hidden', title: "This project's vendor no longer exists, so it isn't shown publicly." };
  }
  if (vendor.isApproved === false && vendor.approvalStatus === 'rejected') {
    return { label: 'Vendor taken down', title: 'The vendor was rejected or taken down by an admin, so this project isn’t shown publicly.' };
  }
  if (vendor.isApproved === false) {
    return { label: 'Vendor hidden', title: 'The vendor isn’t approved, so this project isn’t shown publicly.' };
  }
  if (vendor.isListingEnabled === false) {
    return { label: 'Vendor hidden', title: 'The vendor’s listing is off (unlisted or subscription lapsed), so this project isn’t shown publicly.' };
  }
  return null;
}
