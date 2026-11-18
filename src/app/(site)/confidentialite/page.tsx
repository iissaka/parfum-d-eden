import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/InfoPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
};

export default function ConfidentialitePage() {
  return (
    <InfoPage
      title="Politique de confidentialité"
      intro="Ce texte doit être validé par un professionnel compétent avant publication."
    >
      <p className="font-medium">Données collectées et finalités (projet) :</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Commande : nom, téléphone, adresse de livraison, e-mail facultatif. Finalité : exécution et livraison de la commande.</li>
        <li>Suivi de commande : référence et téléphone, uniquement pour consulter le statut.</li>
        <li>Newsletter : seulement si la personne la demande explicitement ; jamais cochée par défaut.</li>
        <li>Mesure d’audience : à activer uniquement dans le respect des règles applicables et du choix de l’utilisateur.</li>
      </ul>
      <p className="font-medium">À compléter :</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Durées de conservation et procédure d’archivage ou de suppression.</li>
        <li>Droits des personnes et contact pour les exercer.</li>
        <li>Sous-traitants (hébergement, e-mail, paiement) et localisation des données.</li>
        <li>Mesures de sécurité et procédure en cas d’incident.</li>
      </ul>
    </InfoPage>
  );
}
