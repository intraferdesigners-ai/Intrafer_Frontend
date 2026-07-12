const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const BASE = path.join(__dirname, '..', 'public', 'images');

const IMAGES = [
  // ── Hero ──────────────────────────────────────────────────────────────────
  ['hero/hero-main.jpg',    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=85'],
  ['hero/hero-kitchen.jpg', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=85'],
  ['hero/hero-bedroom.jpg', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=85'],

  // ── Vendors ───────────────────────────────────────────────────────────────
  ['vendors/studio-1/cover.jpg',    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'],
  ['vendors/studio-1/project-1.jpg','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],
  ['vendors/studio-1/project-2.jpg','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],

  ['vendors/studio-2/cover.jpg',    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80'],
  ['vendors/studio-2/project-1.jpg','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
  ['vendors/studio-2/project-2.jpg','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80'],

  ['vendors/studio-3/cover.jpg',    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'],
  ['vendors/studio-3/project-1.jpg','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
  ['vendors/studio-3/project-2.jpg','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],

  ['vendors/studio-4/cover.jpg',    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
  ['vendors/studio-4/project-1.jpg','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'],
  ['vendors/studio-4/project-2.jpg','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'],

  ['vendors/studio-5/cover.jpg',    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
  ['vendors/studio-5/project-1.jpg','https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'],
  ['vendors/studio-5/project-2.jpg','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],

  // ── Gallery — Kitchen ─────────────────────────────────────────────────────
  ['gallery/kitchen/k1.jpg','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
  ['gallery/kitchen/k2.jpg','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80'],
  ['gallery/kitchen/k3.jpg','https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80'],
  ['gallery/kitchen/k4.jpg','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'],

  // ── Gallery — Living Room ─────────────────────────────────────────────────
  ['gallery/living-room/l1.jpg','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
  ['gallery/living-room/l2.jpg','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
  ['gallery/living-room/l3.jpg','https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'],
  ['gallery/living-room/l4.jpg','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],

  // ── Gallery — Bedroom ─────────────────────────────────────────────────────
  ['gallery/bedroom/b1.jpg','https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80'],
  ['gallery/bedroom/b2.jpg','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],
  ['gallery/bedroom/b3.jpg','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
  ['gallery/bedroom/b4.jpg','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'],

  // ── Gallery — Bathroom ────────────────────────────────────────────────────
  ['gallery/bathroom/ba1.jpg','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'],
  ['gallery/bathroom/ba2.jpg','https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80'],
  ['gallery/bathroom/ba3.jpg','https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'],
  ['gallery/bathroom/ba4.jpg','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80'],

  // ── Gallery — Dining ──────────────────────────────────────────────────────
  ['gallery/dining/d1.jpg','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80'],
  ['gallery/dining/d2.jpg','https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&q=80'],
  ['gallery/dining/d3.jpg','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
  ['gallery/dining/d4.jpg','https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&q=80'],

  // ── Gallery — Office ──────────────────────────────────────────────────────
  ['gallery/office/o1.jpg','https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
  ['gallery/office/o2.jpg','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'],
  ['gallery/office/o3.jpg','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'],
  ['gallery/office/o4.jpg','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'],

  // ── Blog ──────────────────────────────────────────────────────────────────
  ['blog/modular-kitchen.jpg',  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
  ['blog/false-ceiling.jpg',    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
  ['blog/bedroom-design.jpg',   'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80'],
  ['blog/living-room-tips.jpg', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'],
  ['blog/bathroom-trends.jpg',  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'],
  ['blog/cost-guide.jpg',       'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],

  // ── Styles ────────────────────────────────────────────────────────────────
  ['styles/modern.jpg',       'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],
  ['styles/scandinavian.jpg', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
  ['styles/traditional.jpg',  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
  ['styles/minimalist.jpg',   'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'],
  ['styles/bohemian.jpg',     'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'],
  ['styles/industrial.jpg',   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
  ['styles/luxury.jpg',       'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80'],
  ['styles/contemporary.jpg', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],

  // ── Banners ───────────────────────────────────────────────────────────────
  ['banners/how-it-works.jpg',  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85'],
  ['banners/for-designers.jpg', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85'],
  ['banners/about.jpg',         'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=85'],
  ['banners/cta-bg.jpg',        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1400&q=85'],

  // ── Style hero pages ──────────────────────────────────────────────────────
  ['styles/modern-hero.jpg',        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85'],
  ['styles/scandinavian-hero.jpg',  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=85'],
  ['styles/traditional-hero.jpg',   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85'],
  ['styles/minimalist-hero.jpg',    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=85'],
  ['styles/bohemian-hero.jpg',      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=85'],
  ['styles/industrial-hero.jpg',    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85'],
  ['styles/luxury-hero.jpg',        'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=85'],
  ['styles/contemporary-hero.jpg',  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85'],

  // ── City pages ────────────────────────────────────────────────────────────
  ['cities/bangalore.jpg', 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1200&q=85'],
  ['cities/mumbai.jpg',    'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1200&q=85'],
  ['cities/delhi.jpg',     'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=85'],

  // ── Design guides ─────────────────────────────────────────────────────────
  ['guides/kitchen-guide.jpg',     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
  ['guides/bedroom-guide.jpg',     'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80'],
  ['guides/living-room-guide.jpg', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'],
  ['guides/bathroom-guide.jpg',    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'],
  ['guides/dining-guide.jpg',      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80'],
  ['guides/kids-room-guide.jpg',   'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80'],
  ['guides/study-room-guide.jpg',  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'],
  ['guides/balcony-guide.jpg',     'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'],

  // ── Packages ──────────────────────────────────────────────────────────────
  ['packages/essential.jpg', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
  ['packages/premium.jpg',   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
  ['packages/luxury.jpg',    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80'],

  // ── Before/After pairs ────────────────────────────────────────────────────
  ['before-after/living-before.jpg',   'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80'],
  ['before-after/living-after.jpg',    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
  ['before-after/kitchen-before.jpg',  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80'],
  ['before-after/kitchen-after.jpg',   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
  ['before-after/bedroom-before.jpg',  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'],
  ['before-after/bedroom-after.jpg',   'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80'],
  ['before-after/bathroom-before.jpg', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'],
  ['before-after/bathroom-after.jpg',  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80'],

  // ── How it works steps ────────────────────────────────────────────────────
  ['how-it-works/step1.jpg', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'],
  ['how-it-works/step2.jpg', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80'],
  ['how-it-works/step3.jpg', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'],
  ['how-it-works/step4.jpg', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'],
  ['how-it-works/step5.jpg', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80'],

  // ── Testimonial avatars ───────────────────────────────────────────────────
  ['testimonials/r1.jpg', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&q=80'],
  ['testimonials/r2.jpg', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'],
  ['testimonials/r3.jpg', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'],
  ['testimonials/r4.jpg', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'],
  ['testimonials/r5.jpg', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80'],
  ['testimonials/r6.jpg', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'],
];

function download(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const parsed   = new url.URL(imgUrl);
    const options  = { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: { 'User-Agent': 'Mozilla/5.0' } };

    const request = (opts) => {
      https.get(opts, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirected = new url.URL(res.headers.location);
          return request({ hostname: redirected.hostname, path: redirected.pathname + redirected.search, headers: options.headers });
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
      }).on('error', reject);
    };

    request(options);
  });
}

async function main() {
  const total    = IMAGES.length;
  let downloaded = 0;
  let skipped    = 0;
  let failed     = 0;

  console.log(`\nIntrafer image downloader — ${total} images\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    const [rel, imgUrl] = IMAGES[i];
    const dest = path.join(BASE, rel);

    if (fs.existsSync(dest)) {
      console.log(`  SKIP  (${i + 1}/${total}): ${rel}`);
      skipped++;
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    process.stdout.write(`  ↓ (${i + 1}/${total}): ${rel} ... `);

    try {
      await download(imgUrl, dest);
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`${kb} KB`);
      downloaded++;
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`  Downloaded : ${downloaded}`);
  console.log(`  Skipped    : ${skipped}`);
  console.log(`  Failed     : ${failed}`);
  console.log(`  Total      : ${total}`);
  console.log(`────────────────────────────────────────`);
  console.log(`  Done! Images saved to public/images/\n`);
}

main();
