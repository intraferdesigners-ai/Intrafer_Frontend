// Core Web Vitals lab measurement (Lighthouse, mobile emulation, simulated
// throttling: Slow 4G + 4x CPU) for the audited page types, as a table of
// medians. Read-only GETs; works against a local `next start` or production.
//
//   node scripts/checkVitalsBudget.mjs <baseUrl> [--runs 3] [--budget]
//        [--city-authored <path>] [--city-auto <path>] [--vendor <path>] [--project <path>]
//        [--json <file>]
//
// Pages: home, a category hub, an authored and a programmatic city page, a
// vendor, a project, /gallery/, /plans/. Vendor/project/city paths not given
// are discovered from real links and the sitemap (like checkStructuredData).
// Metrics: LCP, CLS and TBT (the lab proxy for INP), plus the LCP element.
// --budget exits 1 when a median exceeds LCP 2500 ms, CLS 0.1 or TBT 200 ms
// (Google's "good" thresholds; TBT 200 ms is Lighthouse's own good mark), or
// when Lighthouse's unsized-images audit finds an image without dimensions.
// Needs Chrome and network access for `npx lighthouse` (pinned below).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { client, links, sitemapUrls } from './lib/crawl.mjs';

const LIGHTHOUSE = 'lighthouse@12.8.2';
export const BUDGET = Object.freeze({ lcp: 2500, cls: 0.1, tbt: 200 });

const args = process.argv.slice(2);
const base = (args.shift() || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('usage: node scripts/checkVitalsBudget.mjs <baseUrl> [--runs 3] [--budget] [--city-authored <path>] [--city-auto <path>] [--vendor <path>] [--project <path>] [--json <file>]');
  process.exit(2);
}
const opts = {};
for (let i = 0; i < args.length; i += 1) {
  const k = args[i].replace(/^--/, '');
  if (k === 'budget') opts.budget = true; else opts[k] = args[(i += 1)];
}
const RUNS = Math.max(1, Number(opts.runs) || 3);
const get = client(base);

async function firstLink(from, re) {
  const r = await get(from);
  const hit = links(r.body, `${base}${from}`).map((u) => u.pathname).find((p) => re.test(p));
  return hit || null;
}
async function cities() {
  if (opts['city-authored'] && opts['city-auto']) return [];
  const { urls } = await sitemapUrls(get);
  return urls.map((u) => new URL(u).pathname)
    .filter((p) => /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(p) && !/^\/(vendors|projects|guides|design-styles|cities|for-designers)\//.test(p));
}
const found = await cities();
const PAGES = [
  ['home', '/'],
  ['category hub', '/interior-designers/'],
  ['city (authored)', opts['city-authored'] || found[0]],
  ['city (programmatic)', opts['city-auto'] || found[1]],
  ['vendor', opts.vendor || await firstLink('/vendors/', /^\/vendors\/[a-f0-9]{24}\/$/i)],
  ['project', opts.project || await firstLink('/gallery/', /^\/projects\/[a-f0-9]{24}\/$/i)],
  ['gallery', '/gallery/'],
  ['plans', '/plans/'],
].filter(([, p]) => p);

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const dir = mkdtempSync(join(tmpdir(), 'cwv-'));

function lighthouse(url) {
  const out = join(dir, 'lh.json');
  execFileSync('npx', ['-y', LIGHTHOUSE, url, '--only-categories=performance', '--output=json', `--output-path=${out}`,
    '--chrome-flags=--headless=new --no-sandbox', '--quiet'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const lhr = JSON.parse(readFileSync(out, 'utf8'));
  const a = lhr.audits;
  const el = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node;
  return {
    score: Math.round((lhr.categories.performance.score || 0) * 100),
    lcp: a['largest-contentful-paint'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    fcp: a['first-contentful-paint'].numericValue,
    lcpElement: el ? `${el.nodeLabel || ''} <${(el.snippet || '').slice(1, 60)}…>`.trim() : '—',
    // Images without explicit dimensions (live counterpart of testImageDimensions).
    unsized: a['unsized-images']?.details?.items?.length ?? 0,
  };
}

const rows = [];
for (const [label, path] of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i += 1) runs.push(lighthouse(`${base}${path}`));
  const row = {
    label, path, runs: RUNS,
    score: median(runs.map((r) => r.score)),
    lcp: median(runs.map((r) => r.lcp)),
    cls: median(runs.map((r) => r.cls)),
    tbt: median(runs.map((r) => r.tbt)),
    fcp: median(runs.map((r) => r.fcp)),
    lcpElement: runs[runs.length - 1].lcpElement,
    unsized: Math.max(...runs.map((r) => r.unsized)),
  };
  row.over = [row.lcp > BUDGET.lcp && 'LCP', row.cls > BUDGET.cls && 'CLS', row.tbt > BUDGET.tbt && 'TBT', row.unsized > 0 && 'unsized images'].filter(Boolean);
  rows.push(row);
  console.error(`measured ${label} ${path}`);
}
rmSync(dir, { recursive: true, force: true });

console.log(`Lighthouse ${LIGHTHOUSE.split('@')[1]}, mobile, simulated throttling, median of ${RUNS} run(s) — ${base}\n`);
console.log('| Page | Path | Perf | LCP | CLS | TBT | FCP | Unsized imgs | LCP element |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.label} | ${r.path} | ${r.score} | ${(r.lcp / 1000).toFixed(2)} s | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} ms | ${(r.fcp / 1000).toFixed(2)} s | ${r.unsized} | ${r.lcpElement.replace(/\|/g, '\\|')} |`);
}
if (opts.json) writeFileSync(opts.json, JSON.stringify(rows, null, 2));
const over = rows.filter((r) => r.over.length);
if (over.length) console.log(`\nover budget (LCP ${BUDGET.lcp} ms, CLS ${BUDGET.cls}, TBT ${BUDGET.tbt} ms): ${over.map((r) => `${r.label} [${r.over.join(', ')}]`).join('; ')}`);
process.exit(opts.budget && over.length ? 1 : 0);
