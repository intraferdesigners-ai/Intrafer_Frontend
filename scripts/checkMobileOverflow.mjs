// Live check: no horizontal overflow at phone/tablet widths. Read-only GETs.
//
//   node scripts/checkMobileOverflow.mjs <baseUrl> [--widths 320,360,390,768] [--path <p>]...
//
// Default pages: /plans/, /for-designers/, /. For each width it loads the
// page in headless Chrome with real mobile emulation (device metrics +
// mobile viewport — a plain --window-size screenshot does NOT emulate a
// phone and lays the page out wider) and asserts
// documentElement.scrollWidth <= clientWidth. globals.css sets
// `html { overflow-x: hidden }`, which would hide clipped content from that
// measurement, so it is lifted while measuring; position:fixed layers (the
// closed off-canvas menu) don't add scrollable width and are ignored. On a
// failure the elements sticking out are listed. Exits 1 on any overflow.
//
// Needs Google Chrome (CHROME_PATH to override) and Node >= 22 (WebSocket).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const base = (args.shift() || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('usage: node scripts/checkMobileOverflow.mjs <baseUrl> [--widths 320,360,390,768] [--path <p>]...');
  process.exit(2);
}
let widths = [320, 360, 390, 768];
const paths = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--widths') widths = args[(i += 1)].split(',').map(Number);
  else if (args[i] === '--path') paths.push(args[(i += 1)]);
}
const PAGES = paths.length ? paths : ['/plans/', '/for-designers/', '/'];
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Minimal Chrome DevTools Protocol client ──
const profile = mkdtempSync(join(tmpdir(), 'overflow-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  chrome.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  chrome.on('exit', () => reject(new Error(`Chrome exited: ${buf.slice(-300)}`)));
});
const browserWs = new WebSocket(wsUrl);
await new Promise((r) => browserWs.addEventListener('open', r, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = [];
browserWs.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
  } else if (msg.method) listeners.forEach((l) => l(msg));
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = (nextId += 1);
  pending.set(id, { resolve, reject });
  browserWs.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
});
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value;
const loaded = () => new Promise((resolve) => {
  const l = (msg) => { if (msg.method === 'Page.loadEventFired' && msg.sessionId === sessionId) { listeners.splice(listeners.indexOf(l), 1); resolve(); } };
  listeners.push(l);
});

const MEASURE = `(() => {
  const de = document.documentElement;
  de.style.setProperty('overflow-x', 'visible', 'important');
  const sw = de.scrollWidth, cw = de.clientWidth;
  const fixedAncestor = (e) => { for (let n = e; n; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true; return false; };
  const out = sw > cw ? [...document.querySelectorAll('body *')]
    .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > cw + 1 && !fixedAncestor(e); })
    .filter((e, _, all) => !all.some((o) => o !== e && e.contains(o)))
    .slice(0, 5)
    .map((e) => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right) + ' "' + (e.textContent || '').trim().slice(0, 40) + '"') : [];
  de.style.removeProperty('overflow-x');
  return { sw, cw, out };
})()`;

let failures = 0;
try {
  for (const width of widths) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 2, mobile: width < 768 }, sessionId);
    for (const path of PAGES) {
      const done = loaded();
      await send('Page.navigate', { url: `${base}${path}` }, sessionId);
      await done;
      await sleep(600); // hydration
      const r = await evaluate(MEASURE);
      const ok = r.sw <= r.cw;
      if (!ok) failures += 1;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(width).padStart(4)}px ${path.padEnd(18)} scrollWidth ${r.sw} / clientWidth ${r.cw}`);
      for (const o of r.out) console.log(`       - ${o}`);
    }
  }
} finally {
  browserWs.close();
  chrome.kill();
  await sleep(200);
  rmSync(profile, { recursive: true, force: true });
}
console.log(failures ? `\n${failures} overflow(s)` : '\nno horizontal overflow');
process.exit(failures ? 1 : 0);
