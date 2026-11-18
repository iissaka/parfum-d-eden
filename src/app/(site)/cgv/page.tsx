import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/InfoPage';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
};

export default function CgvPage() {
  return (
    <InfoPage
      title="Conditions générales de vente"
      intro="Ce document doit être rédigé et vérifié par un professionnel compétent pour le cadre applicable (vente à distance, fiscalité, droit de la consommation au Niger et, le cas échéant, en France)."
    >
      <p className="font-medium">Points à traiter avant publication :</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Identité et coordonnées du vendeur (raison sociale, siège, immatriculation).</li>
        <li>Prix, devise (FCFA), taxes et frais de livraison.</li>
        <li>Modalités de commande, de paiement et de confirmation.</li>
        <li>Zones de livraison, délais indicatifs et risques de transport.</li>
        <li>Droit de rétractation ou politique de retour, annulation et remboursement.</li>
        <li>Garanties et service après-vente.</li>
        <li>Médiation et règlement des litiges.</li>
        <li>Données personnelles : renvoi vers la politique de confidentialité.</li>
      </ul>
    </InfoPage>
  );
}
