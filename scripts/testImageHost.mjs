// Run: node scripts/testImageHost.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { canOptimize, IMAGE_REMOTE_PATTERNS } from '../lib/imageHost.js';

const require = createRequire(import.meta.url);
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

test('allowed https hosts optimize', () => {
  assert.equal(canOptimize('https://res.cloudinary.com/demo/image/upload/v1/a.jpg'), true);
  assert.equal(canOptimize('https://images.unsplash.com/photo-1?w=800'), true);
  assert.equal(canOptimize('https://cdn.intrafer.com/x.png'), true);
  assert.equal(canOptimize('https://api.intrafer.in/uploads/x.png'), true);
  assert.equal(canOptimize('https://RES.Cloudinary.com/a.jpg'), true); // hostnames are case-insensitive
  assert.equal(canOptimize('  https://res.cloudinary.com/a.jpg  '), true);
});

test('** wildcards: any subdomain depth, never the bare or a lookalike domain', () => {
  assert.equal(canOptimize('https://intrafer-backend.up.railway.app/uploads/a.jpg'), true);
  assert.equal(canOptimize('https://bucket.s3.ap-south-1.amazonaws.com/a.jpg'), true);
  assert.equal(canOptimize('https://railway.app/a.jpg'), false);
  assert.equal(canOptimize('https://evilrailway.app/a.jpg'), false);
  assert.equal(canOptimize('https://amazonaws.com.evil.com/a.jpg'), false);
});

test('lookalike / suffix / prefix hosts do not match', () => {
  assert.equal(canOptimize('https://res.cloudinary.com.evil.com/a.jpg'), false);
  assert.equal(canOptimize('https://evilres.cloudinary.com/a.jpg'), false);
  assert.equal(canOptimize('https://x.res.cloudinary.com/a.jpg'), false);
  assert.equal(canOptimize('https://cdn.intrafer.com.attacker.net/a.jpg'), false);
  assert.equal(canOptimize('https://user:pw@res.cloudinary.com/a.jpg'), false);
});

test('http is never optimized (including the dev-only http://localhost entry)', () => {
  assert.equal(canOptimize('http://res.cloudinary.com/a.jpg'), false);
  assert.equal(canOptimize('http://localhost:5001/uploads/a.jpg'), false);
  assert.equal(canOptimize('http://localhost/uploads/a.jpg'), false);
});

test('unknown hosts, relative and protocol-relative paths, data/blob URLs', () => {
  assert.equal(canOptimize('https://example.com/a.jpg'), false);
  assert.equal(canOptimize('/uploads/a.jpg'), false);
  assert.equal(canOptimize('uploads/a.jpg'), false);
  assert.equal(canOptimize('//res.cloudinary.com/a.jpg'), false);
  assert.equal(canOptimize('data:image/png;base64,iVBORw0KGgo='), false);
  assert.equal(canOptimize('blob:https://intrafer.in/1234'), false);
});

test('malformed and empty values never throw', () => {
  for (const v of ['', '   ', 'not a url', 'https://', 'https://exa mple.com/a.jpg', 'javascript:alert(1)', undefined, null, 42, {}, []]) {
    assert.equal(canOptimize(v), false, String(v));
  }
});

test('next.config.js uses the shared list (single source of truth)', () => {
  const config = require('../next.config.js');
  assert.equal(config.images.remotePatterns, IMAGE_REMOTE_PATTERNS);
  assert.ok(!('domains' in config.images), 'images.domains would bypass the shared list');
});

test('LandingBanner and ProjectImageSlider use canOptimize, not a private copy', () => {
  for (const file of ['../components/seo/LandingBanner.jsx', '../components/vendor/ProjectImageSlider.jsx']) {
    const src = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(src, /from '@\/lib\/imageHost'/, file);
    assert.match(src, /unoptimized=\{!canOptimize\(/, file);
    assert.doesNotMatch(src, /railway\\?\.app|cloudinary/, `${file} must not keep its own host list`);
  }
});

console.log(`\n${passed} passed`);
