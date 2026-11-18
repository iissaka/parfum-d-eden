import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/InfoPage';

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description: 'Commande, livraison, paiement et suivi.',
};

const QUESTIONS = [
  {
    q: 'Comment passer commande ?',
    a: 'Ajoutez les parfums souhaités à votre panier, puis suivez les étapes de commande : coordonnées, zone de livraison, mode de paiement, validation.',
  },
  {
    q: 'Quels modes de paiement sont proposés ?',
    a: 'Le paiement à la livraison est proposé. Les autres modes ne sont affichés que lorsqu’ils sont réellement disponibles.',
  },
  {
    q: 'Comment connaître les frais de livraison ?',
    a: 'Les frais dépendent de la zone choisie. Ils sont affichés dans le formulaire avant la validation ; le total final est calculé par le serveur.',
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Utilisez la page « Suivre ma commande » avec la référence reçue et le numéro de téléphone utilisé lors de la commande.',
  },
  {
    q: 'Puis-je annuler ma commande ?',
    a: 'Les conditions d’annulation et de retour figurent dans les conditions générales de vente. (Texte à valider.)',
  },
];

export default function FaqPage() {
  return (
    <InfoPage title="Questions fréquentes" intro="Commande, livraison, paiement et suivi : l’essentiel en quelques réponses.">
      <div className="border-t border-petal">
        {QUESTIONS.map((item, i) => (
          <details key={item.q} className="accordion" open={i === 0}>
            <summary>{item.q}</summary>
            <p className="pb-5 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
