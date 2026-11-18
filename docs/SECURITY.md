# Sécurité

## Contrôles en place

| Exigence (cahier des charges, section 10 et 11) | Mise en œuvre | Emplacement |
|---|---|---|
| Montants recalculés côté serveur | `buildCartView`, `placeOrder` ; le navigateur ne transmet que des identifiants | `src/lib/cart-view.ts`, `src/lib/checkout.ts` |
| Ne pas faire confiance au navigateur | Test : un champ `price` ou `total` ajouté au formulaire est ignoré | `tests/commerce.test.ts` |
| Validation serveur des entrées | Schémas Zod pour commande, panier, suivi, administration | `src/lib/domain/validation.ts`, `src/app/admin/actions.ts` |
| Contrôle des rôles côté serveur | `requireAdmin(permission)` dans chaque page et action | `src/lib/auth/guard.ts` |
| Matrice de permissions | Owner, manager, preparer, reader ; le préparateur ne peut ni annuler ni encaisser | `src/lib/auth/permissions.ts` |
| Session sécurisée | Jeton HMAC-SHA256, expiration 8 h, cookie httpOnly, SameSite strict | `src/lib/auth/session.ts` |
| Mots de passe | scrypt avec sel aléatoire, comparaison à temps constant | `src/lib/auth/password.ts` |
| Limitation des tentatives | Connexion : 5 essais / 15 min ; commande : 10 / 10 min ; suivi : 10 / 15 min | `src/lib/rate-limit.ts` |
| Notifications de paiement vérifiées | Signature HMAC, tolérance de 5 min (rejeu), idempotence par identifiant d’événement, contrôle du montant | `src/lib/webhook.ts`, `src/app/api/webhooks/payments/route.ts` |
| Statut « payé » seulement après confirmation | Aucun chemin public ; encaissement manuel tracé | `src/app/admin/actions.ts` |
| Pas de doublons de commande | Clé d’idempotence générée par formulaire | `src/app/commande/page.tsx` |
| Référence non devinable | 8 caractères aléatoires sans ambiguïté | `src/lib/ids.ts` |
| Suivi protégé | Référence **et** téléphone exigés ; message d’échec générique | `src/lib/tracking.ts` |
| Journalisation | Connexions, échecs, changements de statut, encaissements, exports, notifications rejetées | `src/lib/audit.ts` |
| Export contrôlé | Réservé à `orders:export` ; neutralisation des formules CSV | `src/app/admin/(panel)/commandes/export/route.ts`, `src/lib/csv.ts` |
| En-têtes HTTP | X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS en production | `next.config.mjs` |
| Secrets hors du code | Variables d’environnement ; `.env*` exclus de Git ; modèle sans valeurs | `.env.example`, `.gitignore` |
| Erreurs sans détail | Messages génériques vers l’utilisateur ; erreur interne journalisée sans contenu sensible | `src/app/commande/actions.ts` |
| Pas de carte bancaire stockée | Aucun champ de carte dans l’application | — |

## Points restants (à traiter avant production)

1. **Stockage en mémoire** : le journal, les sessions de limitation et les événements de notification
   sont perdus au redémarrage. Remplacer par le SupabaseStore.
2. **Limitation de débit locale** : à remplacer par un stockage partagé en cas de plusieurs instances.
3. **Politique de sécurité du contenu (CSP)** : non définie. À ajouter avec des nonces pour les scripts
   (JSON-LD et Next.js).
4. **Gestion des comptes administrateurs** : compte unique depuis l’environnement. Ajouter la gestion
   des utilisateurs, la révocation des sessions et la double authentification.
5. **Sauvegardes** : procédure et test de restauration à documenter avec l’hébergeur.
6. **Dépendances** : lancer `npm audit` avant chaque livraison et mettre à jour régulièrement.
7. **Conservation des données personnelles** : durées et procédure de suppression à définir (voir
   la politique de confidentialité, à valider).
8. **Test d’accès croisés** : vérifier en préproduction qu’un client ne peut pas consulter la commande
   d’un autre (la consultation publique exige déjà référence et téléphone).
9. **Rate limit sur la route de notification** : non appliqué, car le prestataire doit pouvoir la
   joindre ; la signature suffit à rejeter les appels frauduleux.

## Signalement

Tout incident de sécurité doit être traité selon la procédure de réponse à définir (section 11.1 du
cahier des charges) : révocation rapide des accès, journal des actions, information du responsable.
