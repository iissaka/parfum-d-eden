import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { CheckIcon } from '@/components/ui/Icons';
import { Notice } from '@/components/ui/Notice';
import { referenceSchema } from '@/lib/domain/validation';
import { firstParam, type SearchParams } from '@/lib/catalog/search-params';

export const metadata: Metadata = {
  title: 'Commande enregistrée',
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  { title: 'Confirmation', text: 'La boutique vérifie votre commande et vous contacte au numéro indiqué.' },
  { title: 'Préparation', text: 'Votre commande est préparée avec soin.' },
  { title: 'Livraison', text: 'Elle vous est livrée dans la zone choisie.' },
];

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const parsed = referenceSchema.safeParse(firstParam(params, 'ref')?.toUpperCase());

  if (!parsed.success) {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <h1 className="heading">Commande</h1>
        <p className="mt-4">Aucune commande à afficher.</p>
        <Link href="/boutique" className="btn-primary mt-8">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <CheckoutSteps current={3} />

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-canvas">
          <CheckIcon width={30} height={30} />
        </span>
        <h1 className="display mt-6">Merci pour votre commande</h1>
        <p className="mt-4">Votre commande est enregistrée. Votre référence :</p>
        <p className="paper mx-auto mt-4 max-w-md break-all rounded-2xl bg-petal-light px-6 py-5 font-mono text-2xl tracking-[0.2em] text-ink-soft ring-1 ring-petal md:text-3xl">
          {parsed.data}
        </p>
        <p className="mt-2 text-xs">Conservez cette référence, elle vous sera demandée pour le suivi.</p>
      </div>

      <section className="mx-auto mt-12 max-w-3xl" aria-labelledby="next">
        <h2 id="next" className="text-center font-serif text-2xl">Et maintenant ?</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.title} className="card">
              <span className="step-dot">{i + 1}</span>
              <p className="mt-3 font-serif text-xl text-plum">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-xs italic">(Déroulé indicatif, à valider par le client.)</p>

        <div className="mt-8 space-y-3">
          <Notice>
            Conservez cette référence. Pour suivre votre commande, rendez-vous sur la page de suivi avec votre référence et votre numéro de téléphone.
          </Notice>
          <Notice>
            Aucune notification n’est envoyée automatiquement pour l’instant. Le message de confirmation dépendra du service de notification retenu par la boutique.
          </Notice>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/suivi-commande" className="btn-primary">Suivre ma commande</Link>
          <Link href="/boutique" className="btn-secondary">Continuer mes achats</Link>
        </div>
      </section>
    </div>
  );
}
