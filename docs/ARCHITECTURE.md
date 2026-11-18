# Architecture

## Vue d’ensemble

```
Navigateur  ──►  Next.js (App Router, serveur)  ──►  Couche d’accès aux données (Store)
                 │                                     ├─ MemoryStore (développement, tests)
                 │                                     └─ SupabaseStore (production, à écrire)
                 ├─ Pages publiques (rendu serveur)
                 ├─ Actions serveur (panier, commande, suivi, administration)
                 └─ Route de notification de paiement (signature vérifiée)
```

Règle centrale : **le navigateur n’est jamais source de vérité**. Les prix, remises, frais, stocks
et statuts sont relus et recalculés sur le serveur à chaque écriture.

## Couches

| Couche | Dossier | Dépendances |
|---|---|---|
| Utilitaires | `src/lib/utils/` | aucune (argent €/FCFA, CSV, identifiants, débit) |
| Domaine (règles pures) | `src/lib/domain/` | utilitaires (ni Next.js, ni base de données) |
| Accès aux données | `src/lib/store/` | domaine |
| Services | `src/lib/catalog/`, `cart/`, `orders/`, `seo/` | domaine, store |
| Authentification | `src/lib/auth/` | Node `crypto` |
| Configuration | `src/config/` (identité, navigation), `src/lib/config.ts` (environnement) | aucune |
| Actions serveur publiques | `src/actions/` | services |
| Composants | `src/components/<fonction>/` | services, actions, configuration |
| Routes | `src/app/` : `(site)/` boutique, `admin/` administration, `api/` webhooks | tout ce qui précède |

Aucune couche n’importe une couche supérieure (vérifié : `lib/` n’importe ni `components/`, ni
`actions/`, ni `app/` ; `components/` n’accède jamais directement au stockage).

Le domaine est testé sans serveur. Les services acceptent le store en paramètre, ce qui permet
les tests d’intégration sans base.

### Gabarits

- `app/layout.tsx` : document HTML, polices, métadonnées — commun à tout.
- `app/(site)/layout.tsx` : habillage de la boutique (`SiteShell` : en-tête, contenu, pied de page).
- `app/admin/layout.tsx` : habillage de l’administration, sans panier ni menu client.
- `app/not-found.tsx` : 404 globale, qui porte elle-même `SiteShell`.

## Flux de commande

1. **Ajout au panier** (`addToCartAction`) : vérifie que la variante est active et que la quantité
   totale ne dépasse pas le stock ; écrit `{variantId, quantité}` dans le cookie `pe_cart`.
2. **Affichage du panier** (`buildCartView`) : relit prix et stock sur le serveur, signale
   `stock_insuffisant` ou `indisponible`.
3. **Validation** (`placeOrder`) :
   - limitation de débit par client ;
   - validation Zod du formulaire (téléphone normalisé en +227, consentement obligatoire) ;
   - panier non vide et sans ligne bloquante ;
   - zone active, mode de paiement activé ;
   - code promotionnel évalué (validité, minimum, limite) ;
   - calcul du sous-total, de la remise (plafonnée au sous-total), des frais et du total ;
   - création de la commande avec référence unique et clé d’idempotence.
4. **Écriture atomique** (`store.createOrder`) : vérification du stock, décrément, incrément de
   l’usage promo et insertion, dans une seule opération. Une clé d’idempotence déjà connue renvoie
   la commande existante sans rien décrémenter.
5. **Confirmation** : la page n’affiche que la référence, sans données personnelles.

## Cycle de vie

- Statut de commande : `pending → confirmed → preparing → shipped → delivered`, avec annulation
  possible avant expédition et retour après expédition. Voir `src/lib/domain/orders.ts`.
- Statut de paiement : `unpaid → paid | failed`, puis `paid → refunded`.
- Paiement à la livraison : passage à `paid` par l’administrateur, uniquement après expédition ou
  livraison, et tracé dans le journal sous l’action `order.cash_collected_manual`.
- Paiement électronique (futur) : passage à `paid` uniquement par la route de notification, après
  signature valide, montant identique au total et événement non traité auparavant.

## Passage à Supabase (à réaliser)

1. Appliquer `supabase/migrations/0001_init.sql` dans le projet Supabase.
2. Écrire `src/lib/store/supabase.ts` qui implémente l’interface `Store` avec la clé
   `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement).
3. Pour `createOrder`, appeler la fonction SQL `decrement_stock(lines)` puis insérer la commande,
   les lignes et l’historique dans une même transaction (RPC ou fonction SQL dédiée).
4. Brancher le store dans `src/lib/store/index.ts` selon une variable d’environnement.
5. Vérifier les politiques RLS : aucune écriture publique, lecture publique limitée au catalogue actif.
6. Tester sur un projet de préproduction distinct, avec des données de test.

Le schéma SQL est prêt, mais l’adaptateur n’est pas écrit : le projet ne doit pas être mis en
production avant cette étape.

## Hébergement

Plateforme compatible Next.js (par exemple Vercel) et projet Supabase. Vérifier la région
d’hébergement et la latence depuis Niamey. Les environnements développement, préproduction et
production doivent avoir des clés et des données séparées.
