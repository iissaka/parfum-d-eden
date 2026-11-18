import Link from 'next/link';
import { SiteShell } from '@/components/layout/SiteShell';

/**
 * Page 404 globale. Elle est rendue directement sous le gabarit racine (hors groupe « (site) ») :
 * elle porte donc elle-même l'habillage de la boutique.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
        <p className="font-serif text-8xl text-petal md:text-9xl" aria-hidden="true">404</p>
        <h1 className="heading mt-4">Page introuvable</h1>
        <p className="mt-4 max-w-md">Cette page n’existe pas ou n’est plus disponible.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/boutique" className="btn-primary">Retour à la boutique</Link>
          <Link href="/" className="btn-secondary">Accueil</Link>
        </div>
      </div>
    </SiteShell>
  );
}
