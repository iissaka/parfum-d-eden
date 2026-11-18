import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrackingForm } from '@/components/checkout/TrackingForm';

export const metadata: Metadata = {
  title: 'Suivi de commande',
  description: 'Consultez le statut de votre commande avec votre référence et votre téléphone.',
};

export default function SuiviPage() {
  return (
    <>
      <PageHeader
        title="Suivre ma commande"
        eyebrow="Suivi"
        crumbs={[{ href: '/', label: 'Accueil' }, { label: 'Suivi de commande' }]}
        intro="Saisissez la référence reçue à la commande et le numéro de téléphone utilisé lors de l’achat."
      />
      <div className="container-page max-w-3xl py-12 md:py-16">
        <TrackingForm />
      </div>
    </>
  );
}
