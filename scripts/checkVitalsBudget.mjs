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
// Two checks per page:
// - GOOD: Google's "good" thresholds (LCP 2500 ms, CLS 0.1; TBT 200 ms as
//   the lab stand-in for INP) — reported, so it's visible which pages still
//   miss them;
// - BASELINE (--budget exits 1 on any): no regression beyond +10% of the
//   2026-11-01 baseline for LCP, JS and font KB, CLS <= 0.1, TBT <= 200 ms,
//   no unsized images. The baselines were measured on a local production
//   build (seeded DB, 40 ms API latency); against production, judge the
//   GOOD column and use --budget only to compare like with like.
// Needs Chrome and network access for `npx lighthouse` (pinned below).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { client, links, sitemapUrls } from './lib/crawl.mjs';

const LIGHTHOUSE = 'lighthouse@12.8.2';
export const GOOD = Object.freeze({ lcp: 2500, cls: 0.1, tbt: 200 });
// Medians after the font/JS work (perf(cwv): trim fonts and defer non-critical JS).
export const BASELINE = Object.freeze({
  home: { lcp: 4300, jsKb: 209, fontKb: 207 },
  'category hub': { lcp: 2760, jsKb: 164, fontKb: 85 },
  'city (authored)': { lcp: 3460, jsKb: 164, fontKb: 85 },
  'city (programmatic)': { lcp: 4210, jsKb: 164, fontKb: 85 },
  vendor: { lcp: 3760, jsKb: 169, fontKb: 168 },
  project: { lcp: 2940, jsKb: 160, fontKb: 85 },
  gallery: { lcp: 3080, jsKb: 156, fontKb: 85 },
  plans: { lcp: 3010, jsKb: 125, fontKb: 168 },
});
const TOLERANCE = 1.1;

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

const kb = (items, type) => Math.round(items.filter((r) => r.resourceType === type).reduce((n, r) => n + (r.transferSize || 0), 0) / 1024);

function lighthouse(url) {
  const out = join(dir, 'lh.json');
  // Retried up to twice: Chrome occasionally drops the DevTools connection
  // ("Connection closed") — an environment hiccup, not a page result.
  for (let attempt = 1; ; attempt += 1) {
    try {
      execFileSync('npx', ['-y', LIGHTHOUSE, url, '--only-categories=performance', '--output=json', `--output-path=${out}`,
        '--chrome-flags=--headless=new --no-sandbox', '--quiet'], { stdio: ['ignore', 'ignore', 'pipe'] });
      break;
    } catch (err) {
      if (attempt >= 3) throw err;
      console.error(`lighthouse failed on ${url} (attempt ${attempt}), retrying`);
    }
  }
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
    // Transfer sizes (KB): JS requested before the load event (the page's
    // own bundle — not route prefetches or lazy chunks fetched after it),
    // and every font file.
    jsKb: kb(a['network-requests'].details.items.filter((r) => r.networkRequestTime <= a.metrics.details.items[0].observedLoad), 'Script'),
    fontKb: kb(a['network-requests'].details.items, 'Font'),
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
    jsKb: median(runs.map((r) => r.jsKb)),
    fontKb: median(runs.map((r) => r.fontKb)),
  };
  row.notGood = [row.lcp > GOOD.lcp && 'LCP', row.cls > GOOD.cls && 'CLS', row.tbt > GOOD.tbt && 'TBT'].filter(Boolean);
  const baseline = BASELINE[label];
  row.over = [
    baseline && row.lcp > baseline.lcp * TOLERANCE && `LCP ${Math.round(row.lcp)} > ${Math.round(baseline.lcp * TOLERANCE)} ms`,
    baseline && row.jsKb > baseline.jsKb * TOLERANCE && `JS ${row.jsKb} > ${Math.round(baseline.jsKb * TOLERANCE)} KB`,
    baseline && row.fontKb > baseline.fontKb * TOLERANCE && `fonts ${row.fontKb} > ${Math.round(baseline.fontKb * TOLERANCE)} KB`,
    row.cls > GOOD.cls && 'CLS', row.tbt > GOOD.tbt && 'TBT', row.unsized > 0 && 'unsized images',
  ].filter(Boolean);
  rows.push(row);
  console.error(`measured ${label} ${path}`);
}
rmSync(dir, { recursive: true, force: true });

console.log(`Lighthouse ${LIGHTHOUSE.split('@')[1]}, mobile, simulated throttling, median of ${RUNS} run(s) — ${base}\n`);
console.log('| Page | Path | Perf | LCP | CLS | TBT | FCP | JS KB | Font KB | Unsized imgs | LCP element |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.label} | ${r.path} | ${r.score} | ${(r.lcp / 1000).toFixed(2)} s | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} ms | ${(r.fcp / 1000).toFixed(2)} s | ${r.jsKb} | ${r.fontKb} | ${r.unsized} | ${r.lcpElement.replace(/\|/g, '\\|')} |`);
}
if (opts.json) writeFileSync(opts.json, JSON.stringify(rows, null, 2));
const notGood = rows.filter((r) => r.notGood.length);
console.log(notGood.length
  ? `\nnot yet "good" (LCP ${GOOD.lcp} ms, CLS ${GOOD.cls}, TBT ${GOOD.tbt} ms): ${notGood.map((r) => `${r.label} [${r.notGood.join(', ')}]`).join('; ')}`
  : '\nevery page meets the "good" thresholds');
const over = rows.filter((r) => r.over.length);
console.log(over.length
  ? `regressions vs baseline (+${Math.round((TOLERANCE - 1) * 100)}%): ${over.map((r) => `${r.label} [${r.over.join(', ')}]`).join('; ')}`
  : 'no regression vs baseline');
process.exit(opts.budget && over.length ? 1 : 0);
