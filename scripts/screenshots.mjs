// Captures d'écran pleine page à une largeur donnée (contrôle visuel du responsive).
// Usage : node scripts/screenshots.mjs <dossier> <largeur> <chemin...>
import { chromium } from '@playwright/test';

const [dir, widthArg, ...paths] = process.argv.slice(2);
const width = Number(widthArg ?? 375);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 800 }, hasTouch: width < 1024 });
for (const path of paths.length ? paths : ['/']) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' });
  // Fait apparaître les éléments animés au défilement avant la capture.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 200) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  // Découpe en tranches de 1 400 px pour garder une résolution lisible.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const name = path.replace(/\W+/g, '_') || '_';
  for (let y = 0, part = 1; y < total; y += 1400, part++) {
    const file = `${dir}/${width}${name}-${part}.png`;
    await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y, width, height: Math.min(1400, total - y) } });
    console.log(file);
  }
}
await browser.close();
