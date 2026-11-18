# Décisions, hypothèses et points à confirmer

Ce document recense les choix faits pour le développement initial. Chaque hypothèse doit être
validée ou corrigée par le client avant la mise en production.

## Identité et contexte

| # | Décision | Statut |
|---|---|---|
| D1 | Nom de la marque : **Le Parfum d’Eden** (confirmé par le client). Le titre du site reprend ce nom. | Confirmé |
| D2 | Projet entre la France et le Niger : commercialisation et livraison au Niger ; siège et facturation possiblement en France. | **À confirmer** : pays de la société, régime fiscal et TVA, droit applicable aux CGV |
| D3 | Langue : français uniquement. | Hypothèse (cahier des charges rédigé en français) |
| D4 | Devise : FCFA (XOF), montants en entiers, sans décimales. | Cahier des charges, section 9 |

## Couleurs

Palette **choisie par le client** à partir d’une maquette UI de référence (mise en page et couleurs
reprises ; ni textes ni marque de la maquette). Remplace le nuancier Olive/Sand/Rose/Taupe/Ivory et
le thème crème/or des versions précédentes.

| Jeton | HEX | Usage |
|---|---|---|
| canvas | `#FCFBFB` | fond de page |
| petal | `#E8DADF` (light `#F5EEF1`) | barre d’avantages, sections claires, vignettes produits |
| mauve | `#CFB7C4` (light `#E4CEDA`) | hero, bandeau quiz, newsletter, cartes de gammes, filets |
| plum | `#7A5A6C` (deep `#5E4353`) | boutons, liens, petits textes d’accent |
| ink | `#222222` (soft `#4A3F45`) | titres, pied de page ; texte courant (soft) |

Contrastes : ink-soft sur canvas ≈ 10:1 ; plum sur canvas ≈ 6:1 ; blanc sur plum ≈ 6:1 ;
ink-soft sur mauve ≈ 5:1. Mauve et petal ne portent jamais de texte sur fond clair.

Visuels produits : illustrations vectorielles de flacons (`BottleArt`), forme selon la gamme,
mentionnées « visuel indicatif » en attendant les photos de la marque.

## Périmètre et architecture

| # | Décision | Motif |
|---|---|---|
| D5 | Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion (non utilisé à ce stade). | Stack recommandée (cahier des charges, section 8) |
| D6 | Données : PostgreSQL via Supabase, schéma et RLS fournis ; adaptateur en attente. | Permet de développer et tester sans base |
| D7 | Toute logique de prix, stock et statut dans le serveur. | Cahier des charges, sections 5.1 et 7 |
| D8 | Commande en invité ; compte client reporté. | Périmètre de la première version |
| D9 | Recommandations : questionnaire simple, uniquement sur les attributs du catalogue. | Pas de données olfactives fiables pour l’instant |

## Commande, stock et paiement

| # | Décision | Statut |
|---|---|---|
| D10 | **Stock décrémenté à la validation** de la commande (et non au paiement). Remis en vente à l’annulation. | Choix de lancement, à confirmer |
| D11 | **Paiement à la livraison** activé par défaut (`PAYMENT_COD_ENABLED`). | À confirmer : capacité de livraison et d’encaissement |
| D12 | Mobile money et carte **désactivés** tant que l’éligibilité du marchand n’est pas confirmée par écrit. | Cahier des charges, section 10.1 |
| D13 | L’encaissement à la livraison est confirmé **manuellement** et tracé. Il n’est pas présenté comme une confirmation automatique. | Cahier des charges, section 10.2 |
| D14 | Statuts : en attente, confirmée, en préparation, expédiée (en livraison), livrée, annulée, retournée. | Cahier des charges, section 6.2 |
| D15 | Frais de livraison par zone, avec seuil de gratuité facultatif. | Cahier des charges, section 10.4 |

**Zones et montants d’exemple** (à remplacer) : Niamey centre 1 000 FCFA (offerte dès 25 000 FCFA),
Niamey périphérie 1 500 FCFA (offerte dès 30 000 FCFA), autres villes désactivées tant qu’elles ne
sont pas définies.

## Administration

| # | Décision |
|---|---|
| D16 | Quatre rôles : administrateur principal, gestionnaire, préparateur, lecture seule. Matrice dans `src/lib/auth/permissions.ts`. |
| D17 | Un compte administrateur de démarrage, défini par variables d’environnement. La gestion multi-comptes reste à faire. |
| D18 | Export CSV des commandes réservé aux rôles autorisés, avec journalisation. |

## Catalogue de lancement (`src/lib/store/seed.ts`)

D’après la liste « Notre collection de lancement » fournie par la marque : 10 parfums en 4 gammes
(Musc Tahara 12 ml, El Nabil pour homme 5 ml, Huile concentrée mixte 12 ml, Kenzie eaux de parfum 30 ml).
La gamme est portée par le champ `family` et affichée « Gamme » sur le site.

**Provisoire, à fournir par la marque** : prix (valeurs de travail 5 ml = 5 000, 12 ml = 8 000,
30 ml = 15 000 FCFA), stocks (10 par défaut), genre de Musc Tahara et Kenzie (« mixte » par défaut),
photos des flacons. Les zones et le code `BIENVENUE10` restent des exemples.
Les tests unitaires utilisent un jeu fictif distinct : `tests/fixtures/example-seed.ts`.

## International et devises

| # | Décision | Statut |
|---|---|---|
| D19 | Clientèle internationale : les textes ne ciblent plus uniquement le Niger. | Demande du client |
| D20 | Prix stockés et calculés en FCFA ; affichés en **euros et FCFA** avec la parité fixe 1 € = 655,957 FCFA. | Demande du client |
| D21 | Téléphone : tout numéro international accepté (+indicatif). Raccourcis : 8 chiffres → +227, 0X XX XX XX XX → +33. | À confirmer |
| D22 | Devise d’encaissement : FCFA. Paiement et livraison hors Niamey : **zones à définir** par la marque. | **À confirmer** |
| D23 | Newsletter : inscription (e-mail + consentement explicite) tracée dans le journal d’administration (`newsletter.inscription`), en attendant le choix d’un service d’e-mailing. | **Provisoire** |
| D24 | Section « Suivez-nous » de l’accueil : compte Instagram à renseigner ; les vignettes renvoient aux fiches produits. | **À compléter** |
| D25 | **Photos produits** (`public/products`, liste et sources dans `src/lib/product-images.ts`) récupérées sur les sites officiels des marques : Gris Montaigne (Musc Tahara), Maison El Nabil, Arabiyat / My Perfumes, Volaré (Kenzie). **Droits d’utilisation à obtenir** auprès des marques ou du distributeur avant la mise en ligne, sinon les remplacer par des photos de la boutique. | **Bloquant avant production** |
| D27 | Vidéo Musc Tahara : vidéo YouTube « Tout sur le Musc Tahara » (chaîne MUSC TAHARA INTIME), **intégrée** (non copiée) via youtube-nocookie, chargée au clic seulement, avec crédit. Vidéo générale sur le musc Tahara : les flacons montrés ne sont pas ceux de Gris Montaigne (mention affichée). À remplacer par une vidéo de la marque ou de la boutique si disponible. Aucune vidéo produit trouvée sur le site officiel Gris Montaigne. | À confirmer |
| D26 | Écarts relevés entre la liste de lancement et les fiches des marques : « Arabiyat Elhem » s’écrit **Elham** ; Kenzie : **Exotic Apple Crush**, **Amber Lychee**, **Marshmallow Dream**, vendus en **100 ml** par Volaré (la liste indique 30 ml) ; El Nabil présente Elixir of Dubai comme **mixte**. | **À confirmer** |

## Textes

Toutes les pages légales et d’information portent un bandeau « brouillon ». Aucun texte juridique
n’est considéré comme validé. Le cahier des charges précise que la rédaction doit être faite par un
professionnel compétent.

## Points à confirmer par le client (annexe B du cahier des charges)

1. Nom de domaine.
2. Raison sociale et coordonnées officielles (y compris le pays d’immatriculation).
3. Nombre initial de produits et de variantes ; catalogue et droits sur les photos.
4. Zone de livraison initiale et ville de lancement ; frais et délais.
5. Politique d’annulation, de retour et de remboursement.
6. Prestataire de paiement mobile, compte de règlement, éligibilité du marchand.
7. Canaux de notification : e-mail, SMS, WhatsApp Business ou combinaison.
8. Personne responsable de la maintenance ; durée de garantie corrective.
9. Catégories de navigation (Femme, Homme, Mixte, Coffrets) selon le catalogue réel.
10. Accroche et textes de présentation de la marque.
11. Réseaux sociaux officiels (à renseigner dans le pied de page).
