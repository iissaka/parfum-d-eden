import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/InfoPage';
import { formatPrice } from '@/lib/utils/money';
import { getStore } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Livraison et retours',
  description: 'Zones de livraison, frais, délais et politique de retour.',
};

export default async function LivraisonPage() {
  const zones = (await getStore().listZones()).filter((z) => z.isActive);

  return (
    <InfoPage title="Livraison et retours">
      <h2 className="font-serif text-2xl">Zones et frais</h2>
      <ul className="space-y-2">
        {zones.map((zone) => (
          <li key={zone.id}>
            <span className="font-medium">{zone.name}</span> : {formatPrice(zone.fee)}
            {zone.freeShippingFrom !== null && ` (offerte dès ${formatPrice(zone.freeShippingFrom)})`}
            {zone.delayText && ` · ${zone.delayText}`}
          </li>
        ))}
      </ul>
      <p className="text-sm">Les zones desservies et les frais sont gérés par la boutique et peuvent évoluer.</p>

      <h2 className="font-serif text-2xl">Retours et remboursements</h2>
      <p className="italic">
        Conditions de retour, délais et modalités de remboursement : à définir par la marque avant lancement.
      </p>
    </InfoPage>
  );
}
