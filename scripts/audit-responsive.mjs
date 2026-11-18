// Audit responsive : pour chaque page et chaque largeur d'écran, détecte le débordement horizontal,
// liste les éléments qui dépassent, vérifie que le bouton menu (mobile) est visible et ouvre le menu.
// Usage : node scripts/audit-responsive.mjs [baseUrl] [dossierCaptures]
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const SHOTS = process.argv[3] ?? '';
const PAGES = ['/', '/boutique', '/parfum/nuage-sucre', '/collections/musc-tahara', '/panier', '/commande', '/trouver-mon-parfum', '/suivi-commande', '/recherche', '/faq', '/contact'];
const WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1280];

const browser = await chromium.launch();
let problems = 0;

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, hasTouch: width < 1024 });
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const report = await page.evaluate((vw) => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - vw;
      const offenders = [];
      if (overflow > 0) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Ignore les éléments dont un ancêtre coupe le débordement.
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (s.overflowX !== 'visible' || s.overflow === 'hidden') { clipped = true; break; }
          }
          if (!clipped && (r.right > vw + 1 || r.left < -1)) {
            const cls = (el.getAttribute('class') ?? '').split(' ').slice(0, 6).join(' ');
            offenders.push(`${el.tagName.toLowerCase()}.${cls} → droite ${Math.round(r.right)}px`);
          }
        }
      }
      const btn = document.querySelector('button[aria-label="Ouvrir le menu"]');
      let menu = 'absent';
      if (btn) {
        const r = btn.getBoundingClientRect();
        const visible = getComputedStyle(btn).display !== 'none' && r.width > 0 && r.right <= vw && r.left >= 0;
        menu = visible ? 'visible' : `masqué ou hors écran (x=${Math.round(r.left)}..${Math.round(r.right)})`;
      }
      return { overflow, offenders: offenders.slice(0, 6), menu };
    }, width);

    let menuCheck = '';
    if (width < 1024) {
      if (report.menu === 'visible') {
        await page.click('button[aria-label="Ouvrir le menu"]');
        const opened = await page.locator('[role="dialog"][aria-label="Menu"]').isVisible();
        menuCheck = opened ? 'menu OK' : 'MENU NE S’OUVRE PAS';
        if (!opened) problems++;
        if (opened) await page.keyboard.press('Escape');
      } else {
        menuCheck = `BOUTON MENU ${report.menu}`;
        problems++;
      }
    }
    const status = report.overflow > 0 ? `DÉBORDE de ${report.overflow}px` : 'ok';
    if (report.overflow > 0) problems++;
    console.log(`${String(width).padStart(4)}px ${path.padEnd(26)} ${status.padEnd(18)} ${menuCheck}`);
    for (const o of report.offenders) console.log(`        ↳ ${o}`);
    if (SHOTS && (path === '/' || report.overflow > 0)) {
      await page.screenshot({ path: `${SHOTS}/${width}${path.replace(/\W+/g, '_') || '_'}.png`, fullPage: false });
    }
  }
  await context.close();
}
await browser.close();
console.log(problems === 0 ? '\nAucun problème détecté.' : `\n${problems} problème(s) détecté(s).`);
process.exit(problems === 0 ? 0 : 1);
