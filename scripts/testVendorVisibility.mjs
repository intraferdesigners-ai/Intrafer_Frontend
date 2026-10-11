// Run: node scripts/testVendorVisibility.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { vendorVisibilityIssue } from '../lib/vendorVisibility.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const v = (o) => ({ _id: 'x', businessName: 'S', isApproved: true, isListingEnabled: true, approvalStatus: 'approved', ...o });

test('public vendor (approved + listed) -> no label', () => {
  assert.equal(vendorVisibilityIssue(v({})), null);
});
test('taken down / rejected -> "Vendor taken down"', () => {
  assert.equal(vendorVisibilityIssue(v({ isApproved: false, approvalStatus: 'rejected' })).label, 'Vendor taken down');
});
test('unapproved (pending), unlisted, or missing vendor -> "Vendor hidden"', () => {
  for (const vendor of [v({ isApproved: false, approvalStatus: 'pending' }), v({ isListingEnabled: false }), null, undefined, 'abc']) {
    assert.equal(vendorVisibilityIssue(vendor).label, 'Vendor hidden', JSON.stringify(vendor));
  }
});
test('every issue has an explanatory title', () => {
  for (const vendor of [null, v({ isApproved: false, approvalStatus: 'rejected' }), v({ isApproved: false }), v({ isListingEnabled: false })]) {
    assert.ok(vendorVisibilityIssue(vendor).title.length > 20);
  }
});
test('the admin projects list shows it only next to an Approved project', () => {
  const src = readFileSync(new URL('../app/admin/dashboard/projects/page.jsx', import.meta.url), 'utf8');
  assert.match(src, /const vendorIssue = project\.moderationStatus === 'approved' \? vendorVisibilityIssue\(project\.vendorId\) : null;/);
});
console.log(`\n${passed} passed`);
