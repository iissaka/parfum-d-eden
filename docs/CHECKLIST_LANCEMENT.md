# Checklist de lancement

Reprise de l’annexe A du cahier des charges. Cocher uniquement ce qui a été vérifié sur les
environnements réels.

## Design et contenus

- [ ] Logo et nuancier vérifiés sur les fichiers originaux (codes HEX définitifs dans `tailwind.config.ts`).
- [ ] Maquettes desktop et mobile validées par le client.
- [ ] Polices Cormorant Garamond et Inter auto-hébergées (ou validées autrement).
- [ ] Catalogue, prix, formats et stocks contrôlés (remplacement des données d’exemple).
- [ ] Photos autorisées, optimisées, avec textes alternatifs.
- [ ] Descriptions originales et vérifiées (pas de copie de fiches fabricant).
- [ ] Coordonnées, réseaux sociaux et accroche de marque renseignés.

## Commande et livraison

- [ ] Zones, frais et délais validés ; zones inutilisées désactivées.
- [ ] Politique de retour et d’annulation validée et publiée.
- [ ] Paiement à la livraison confirmé opérationnel (livreurs, encaissement, refus).
- [ ] Commande complète testée sur mobile et ordinateur, en préproduction.
- [ ] Double soumission testée (une seule commande créée).
- [ ] Article épuisé non commandable ; prix modifié dans le navigateur ignoré par le serveur.

## Juridique

- [ ] CGV, politique de confidentialité et retours relus par un professionnel compétent.
- [ ] Durées de conservation des données définies et appliquées.
- [ ] Newsletter : consentement explicite, non coché par défaut.
- [ ] Mentions légales du vendeur complètes.

## Administration et sécurité

- [ ] Rôles administrateur et gestionnaire testés (préparateur sans annulation ni encaisseur).
- [ ] Stockage Supabase branché et migrations appliquées (remplacement du stockage en mémoire).
- [ ] Politiques RLS vérifiées : aucune écriture publique.
- [ ] Variables d’environnement de production renseignées ; aucun secret dans le dépôt.
- [ ] HTTPS et redirection forcée vers HTTPS vérifiés.
- [ ] Sauvegarde et restauration testées.
- [ ] `npm audit` sans vulnérabilité critique ou haute non traitée.
- [ ] Guide administrateur remis et formation réalisée.

## Notifications et mesure

- [ ] Canal de notification choisi et configuré, ou absence de notification annoncée clairement.
- [ ] Mesure d’audience respectueuse des règles applicables, activée après consentement si nécessaire.
- [ ] Événements d’analyse testés (consultation, panier, commande).

## SEO

- [ ] Sitemap et robots.txt vérifiés en production.
- [ ] Titres et descriptions uniques sur les pages principales.
- [ ] Données structurées produit vérifiées (prix et disponibilité exacts).
- [ ] Redirections 301 prévues en cas de changement de slug.

## Procédure

- [ ] Déploiement en préproduction puis en production, avec procédure de retour arrière.
- [ ] Responsable de la maintenance désigné et forfait défini.
- [ ] Surveillance de la disponibilité en production (objectif 99,5 % mensuel).
