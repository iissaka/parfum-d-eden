import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/InfoPage';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contacter Le Parfum d’Eden.',
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact" intro="Une question sur un parfum, une commande ou une livraison ?">
      <ul className="space-y-2">
        <li>Téléphone et WhatsApp Business : <span className="italic">à renseigner par la marque</span></li>
        <li>E-mail : <span className="italic">à renseigner par la marque</span></li>
        <li>Horaires de service client : <span className="italic">à renseigner par la marque</span></li>
        <li>Adresse : <span className="italic">à renseigner par la marque</span></li>
      </ul>
      <p className="text-sm">
        Le formulaire de contact n’est pas encore implémenté. Les coordonnées ci-dessus seront complétées avant la mise en ligne.
      </p>
    </InfoPage>
  );
}
