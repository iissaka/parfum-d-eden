# Le Parfum d’Eden — boutique e-commerce

Projet Next.js (TypeScript) de la boutique en ligne **Le Parfum d’Eden**, ouverte à une clientèle
internationale (prix affichés en euros et en FCFA ; exploitation entre la France et le Niger : aspects
juridiques, fiscaux et de paiement à confirmer des deux côtés).

> **Statut : version de développement, non prête pour la production.**
> Le socle métier, l’interface publique, l’administration et les tests sont en place.
> Les données sont en mémoire, aucun prestataire de paiement ou de notification n’est intégré,
> et le catalogue, les zones et les textes légaux sont des **exemples à remplacer**.
> Le détail est dans [docs/DECISIONS.md](docs/DECISIONS.md) et la liste des limites ci-dessous.

---

## 1. Installation dans VS Code

**Prérequis** : Node.js 20 ou plus (testé avec Node 22), VS Code.

1. Dézipper l’archive, puis ouvrir **le dossier `parfum-d-eden`** dans VS Code
   (*Fichier → Ouvrir le dossier*). Ne pas ouvrir le fichier zip ni un sous-dossier.
2. Accepter l’installation des extensions recommandées (fichier `.vscode/extensions.json`).
3. Ouvrir un terminal intégré (*Terminal → Nouveau terminal*) et lancer :

```bash
npm install
cp .env.example .env.local        # Windows : copy .env.example .env.local
```

4. Renseigner `.env.local` :
   - `SESSION_SECRET` : `openssl rand -hex 32` (ou tout texte de 32 caractères minimum) ;
   - `ADMIN_EMAIL` : l’e-mail de l’administrateur ;
   - `ADMIN_PASSWORD_HASH` : généré avec
     `npm run hash-password -- "votre-mot-de-passe-long"` (12 caractères minimum), puis collé tel quel.

5. Lancer le site en local :

```bash
npm run dev
```

Puis ouvrir http://localhost:3000. L’administration est sur http://localhost:3000/admin.

### Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm test` | Tests unitaires et d’intégration (Vitest) |
| `npm run typecheck` | Vérification des types TypeScript |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run test:e2e` | Parcours navigateur (Playwright) — voir section 5 |
| `npm run check` | Tout vérifier d’un coup : types, tests, build de production |
| `npm run audit:responsive` | Audit mobile : débordements et bouton menu, 11 pages × 8 largeurs (serveur lancé) |
| `npm run screenshots -- <dossier> <largeur> /page…` | Captures pleine page pour contrôle visuel |
| `npm run hash-password -- "…"` | Générer un hash de mot de passe administrateur |

> **Node.js** est installé dans `%LOCALAPPDATA%\Programs\nodejs-lts`. Si `npm` est introuvable dans un
> nouveau terminal, ajouter ce dossier à la variable d’environnement `Path` de Windows.

### Dernières vérifications effectuées

- `npm run typecheck` : aucune erreur.
- `npm test` : **56 tests passent** (prix, remises, statuts, rôles, sessions, notifications signées,
  idempotence, stock, promotions, suivi, CSV, conversion euro/FCFA, téléphones internationaux,
  catalogue de lancement, robots.txt et sitemap).
- `npm run build` : build de production réussi (28 routes, lint et types inclus).
- `npm run test:e2e` sur le build de production : **19 tests passent** — parcours d’achat complet
  (ordinateur et téléphone), menu mobile visible et fonctionnel de 320 à 414 px, aucun défilement
  horizontal, administration séparée de la boutique, robots.txt et sitemap.
- `npm run audit:responsive` : aucun problème sur 11 pages × 8 largeurs (320 à 1280 px).

---

## 2. Structure du projet

```
parfum-d-eden/
├── .env.example              Modèle de configuration (sans secrets)
├── .vscode/                  Extensions et réglages recommandés
├── docs/
│   ├── ARCHITECTURE.md       Choix techniques et flux
│   ├── DECISIONS.md          Décisions, hypothèses et points à confirmer
│   ├── SECURITY.md           Contrôles de sécurité et points restants
│   └── CHECKLIST_LANCEMENT.md Checklist de mise en production
├── public/
│   ├── brand/                Logo officiel
│   └── products/             Photos produits (+ cutout/ : flacons détourés) — droits à obtenir (D25)
├── scripts/                  hash-password, audit-responsive, screenshots
├── supabase/migrations/      Schéma PostgreSQL, RLS et décrément de stock atomique
├── src/
│   ├── app/                  Routes uniquement (App Router)
│   │   ├── layout.tsx        Gabarit racine : <html>, polices, métadonnées
│   │   ├── not-found.tsx     Page 404 (avec l’habillage boutique)
│   │   ├── globals.css       Thème, composants CSS, animations
│   │   ├── robots.txt/ sitemap.xml/   Routes SEO (logique dans lib/seo)
│   │   ├── (site)/           Boutique publique — le groupe n’apparaît pas dans l’URL
│   │   │   ├── layout.tsx    En-tête + pied de page (SiteShell)
│   │   │   ├── template.tsx  Transition entre les pages
│   │   │   ├── page.tsx      Accueil
│   │   │   ├── boutique/ collections/[slug]/ parfum/[slug]/ recherche/ trouver-mon-parfum/
│   │   │   ├── panier/ commande/ (+ confirmation/) suivi-commande/
│   │   │   └── contact/ faq/ livraison/ cgv/ confidentialite/
│   │   ├── admin/            Administration, avec son propre gabarit (layout.tsx)
│   │   │   ├── login/        Connexion (page + actions)
│   │   │   ├── (panel)/      Pages protégées : commandes, produits, livraison, promotions, journal
│   │   │   └── actions.ts    Actions serveur de l’administration
│   │   └── api/webhooks/payments/   Notifications de paiement signées
│   ├── actions/              Actions serveur publiques : cart, checkout, tracking, newsletter
│   ├── components/
│   │   ├── layout/           SiteShell, SiteHeader, MobileMenu, SiteFooter, PageHeader, InfoPage
│   │   ├── ui/               Icons, Notice, SubmitButton, Price, Reveal, Ornament
│   │   ├── product/          ProductCard/Grid, ProductImage, PlaceholderImage, BottleArt, ProductTabs, Pedestal
│   │   ├── catalog/          FilterPanel
│   │   ├── checkout/         CheckoutSteps, TrackingForm
│   │   ├── marketing/        Reassurance, NewsletterForm
│   │   ├── media/            VideoEmbed, LineVideoSection
│   │   └── home/             Blossoms (décor)
│   ├── config/               site.ts (identité) · navigation.ts (tous les menus, source unique)
│   └── lib/
│       ├── domain/           Règles métier pures (prix, remises, statuts, validation, panier)
│       ├── store/            Accès aux données (MemoryStore, catalogue de lancement)
│       ├── auth/             Mots de passe, sessions signées, rôles et permissions
│       ├── catalog/          Recherche, fiches, suggestions, photos, vidéos, infos boutique
│       ├── cart/             Cookie panier, panier recalculé côté serveur
│       ├── orders/           Création de commande, suivi, notifications, signatures de webhook
│       ├── seo/              robots.txt et sitemap.xml
│       ├── utils/            Argent (€/FCFA), CSV, identifiants, limitation de débit, requête
│       ├── config.ts         Variables d’environnement
│       └── audit.ts          Journal d’activité
└── tests/                    Unitaires, intégration (fixtures/), bout en bout (e2e/)
```

**Règles de dépendance** (de bas en haut, jamais l’inverse) :
`lib/domain` → `lib/store` → `lib/{catalog,cart,orders,seo}` → `actions/` → `components/` → `app/`.
`config/` est lisible par tous. Les composants n’accèdent jamais directement au stockage, sauf les
composants serveur d’en-tête (panier) via `lib/cart`.

---

## 3. Ce qui est en place

- **Vitrine** : accueil, boutique (recherche, filtres, tri), collections, fiches produits avec variantes,
  page « Trouver mon parfum », pages d’information, SEO de base (titres, sitemap, robots, données structurées).
- **Panier et commande** : panier dans un cookie qui ne contient que des identifiants et des quantités ;
  prix, stocks, remises et frais **recalculés par le serveur** ; commande invité ; référence unique non
  séquentielle ; protection contre les doubles soumissions (clé d’idempotence) ; limitation des tentatives.
- **Règles métier** : statuts de commande et de paiement séparés, transitions contrôlées, stock remis en
  vente à l’annulation, prix et noms figés dans les lignes de commande, promotions avec validité, minimum
  et limite d’usage.
- **Administration** : tableau de bord, commandes (liste, filtres, détail, statuts, encaissement tracé),
  produits (prix et stocks par variante), zones et frais de livraison, codes promotionnels, journal
  d’activité, export CSV contrôlé. Permissions appliquées côté serveur à chaque action.
- **Paiement** : paiement à la livraison, activé par défaut et désactivable (`PAYMENT_COD_ENABLED`).
  Mobile money et carte sont **désactivés** : aucune intégration n’est présentée comme active.
- **Notifications de paiement** : route signée (HMAC-SHA256), protégée contre le rejeu (horodatage),
  idempotente, avec contrôle du montant. Elle refuse tout appel tant que le secret n’est pas configuré.

## 4. Limites connues (à traiter avant production)

1. **Stockage en mémoire** : les données ne sont pas persistantes. Il faut écrire le `SupabaseStore`
   selon `supabase/migrations/0001_init.sql` (voir docs/ARCHITECTURE.md).
2. **Pas de notification réelle** : la confirmation de commande n’est que journalisée dans la console en développement.
   Aucun e-mail, SMS ou WhatsApp n’est envoyé. L’interface ne l’affirme pas.
3. **Création et suppression de produits** non implémentées ; seuls prix et stocks sont modifiables.
4. **Gestion des utilisateurs administrateurs** : un seul compte, défini par variables d’environnement.
   La table `admin_users` est prévue dans le schéma.
5. **Compte client** (`/compte`) et formulaire de contact : non implémentés. Newsletter : inscriptions
   tracées dans le journal d’administration en attendant un service d’e-mailing (D23).
6. **Photos produits** : issues des sites officiels des marques ; **droits d’utilisation à obtenir**
   avant la mise en ligne (D25). Prix et stocks du catalogue de lancement : **provisoires**.
7. **Limitation de débit** en mémoire : suffisante pour une seule instance seulement.
8. **Total affiché avant validation** : les frais par zone sont affichés, mais le total exact n’est
   calculé qu’à la validation côté serveur.
9. **Textes légaux** (CGV, confidentialité, retours) : brouillons à faire valider par un professionnel.
10. **Livraison internationale** : seules les zones de Niamey sont définies ; zones et tarifs hors
    Niger à fournir par la marque (D22).

## 5. Tests de bout en bout

```bash
npx playwright install chromium   # une seule fois
npm run build && npm run start    # dans un terminal
npm run test:e2e                  # dans un autre terminal
```

Les tests `tests/e2e/responsive.spec.ts` verrouillent le responsive : ils échouent si une page déborde
horizontalement sur téléphone (320 à 414 px) ou si le bouton menu n’est plus visible.

## 6. Documents associés

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : architecture, flux de commande, passage à Supabase.
- [docs/DECISIONS.md](docs/DECISIONS.md) : décisions prises, hypothèses et questions au client.
- [docs/SECURITY.md](docs/SECURITY.md) : contrôles en place et points restants.
- [docs/CHECKLIST_LANCEMENT.md](docs/CHECKLIST_LANCEMENT.md) : checklist de mise en production.
