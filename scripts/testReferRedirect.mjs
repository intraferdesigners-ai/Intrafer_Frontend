// Run: node scripts/testReferRedirect.mjs
// /refer-a-friend is gone (no referral feature behind it): nothing may link
// to it, no page may exist for it, and both spellings must 308 to /.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log(`ok - ${name}`); };

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(m?js|jsx|ts|tsx|css|md|json)$/.test(name) ? [p] : [];
  });
}

await test('no source file links to or mentions /refer-a-friend', () => {
  const hits = ['app', 'components', 'lib', 'context', 'public']
    .filter((d) => existsSync(join(ROOT, d)))
    .flatMap((d) => sourceFiles(join(ROOT, d)))
    .filter((p) => /refer-a-friend/i.test(readFileSync(p, 'utf8')))
    .map((p) => relative(ROOT, p));
  assert.deepEqual(hits, []);
});

await test('no app/**/refer-a-friend route exists', () => {
  const dirs = sourceFiles(join(ROOT, 'app')).filter((p) => /[\\/]refer-a-friend[\\/]/.test(p));
  assert.deepEqual(dirs, []);
});

await test('next.config.js permanently redirects /refer-a-friend and /refer-a-friend/ to /', async () => {
  const config = require(join(ROOT, 'next.config.js'));
  assert.equal(typeof config.redirects, 'function');
  const rules = await config.redirects();
  for (const source of ['/refer-a-friend', '/refer-a-friend/']) {
    const rule = rules.find((r) => r.source === source);
    assert.ok(rule, `missing redirect for ${source}`);
    assert.equal(rule.destination, '/');
    assert.equal(rule.permanent, true);
  }
});

console.log(`\n${passed} passed`);
