import { expect, test } from '@playwright/test';

// Garde-fous responsive : ces tests échouent si l'en-tête déborde ou si le menu mobile disparaît.
const PAGES = ['/', '/boutique', '/parfum/nuage-sucre', '/collections/musc-tahara', '/panier', '/commande', '/suivi-commande'];
const PHONES = [320, 360, 375, 390, 414];

for (const width of PHONES) {
  test.describe(`téléphone ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true });

    test('aucun défilement horizontal', async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `débordement sur ${path}`).toBeLessThanOrEqual(0);
      }
    });

    test('le bouton menu est visible et ouvre le menu', async ({ page }) => {
      await page.goto('/');
      const button = page.getByRole('button', { name: 'Ouvrir le menu' });
      await expect(button).toBeInViewport();
      await button.click();
      const menu = page.getByRole('dialog', { name: 'Menu' });
      await expect(menu).toBeVisible();
      await menu.getByRole('link', { name: 'Boutique', exact: true }).click();
      await expect(page).toHaveURL(/\/boutique$/);
      await expect(menu).toBeHidden();
    });
  });
}

test('grand écran : navigation complète, pas de bouton menu', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeHidden();
});

test('l’administration n’affiche pas l’en-tête de la boutique', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('link', { name: 'Voir la boutique' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Panier/ })).toHaveCount(0);
});

test('robots.txt et sitemap.xml répondent', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Disallow: /admin');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/parfum/nuage-sucre');
});
