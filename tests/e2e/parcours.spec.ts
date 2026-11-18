import { expect, test } from '@playwright/test';

// Parcours de bout en bout. Nécessite un serveur lancé (npm run build && npm run start)
// et les navigateurs Playwright installés (npx playwright install).
// Non exécuté dans l'environnement de livraison : à lancer sur la machine du développeur.

test('la page d’accueil et la boutique sont accessibles', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Le Parfum d’Eden/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('parfum signature');
  await page.goto('/boutique');
  await expect(page.getByRole('heading', { level: 1, name: 'Boutique' })).toBeVisible();
});

test('ajout au panier, puis commande en paiement à la livraison', async ({ page }) => {
  await page.goto('/parfum/nuage-sucre');
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(page.getByText('Article ajouté au panier.')).toBeVisible();

  await page.goto('/commande');
  await page.getByLabel('Nom complet').fill('Test Parcours');
  await page.getByLabel('Téléphone').fill('90123456');
  await page.getByLabel('Zone de livraison').selectOption('zone-niamey-centre');
  await page.getByLabel('Quartier').fill('Plateau');
  await page.getByLabel('Adresse et repères').fill('Rue de test, près du marché');
  await page.getByRole('checkbox', { name: /conditions générales/ }).check();
  await page.getByRole('button', { name: 'Valider ma commande' }).click();

  await expect(page).toHaveURL(/\/commande\/confirmation\?ref=PE-/);
  await expect(page.getByText(/PE-[A-Z2-9]{8}/)).toBeVisible();
});

test('l’administration redirige vers la connexion sans session', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});
