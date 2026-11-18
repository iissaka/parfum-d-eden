import type { ReactNode } from 'react';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Gabarit des pages d'information. Le bandeau signale que le texte est un brouillon
 * à faire valider : aucun contenu juridique n'est publié sans relecture professionnelle.
 */
export function InfoPage({
  title,
  intro,
  draft = true,
  children,
}: {
  title: string;
  intro?: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader
        title={title}
        eyebrow="Informations"
        intro={intro}
        crumbs={[{ href: '/', label: 'Accueil' }, { label: title }]}
      />
      <div className="container-page max-w-3xl py-12 md:py-16">
        {draft && (
          <div className="mb-10">
            <Notice>Brouillon de travail : ce texte doit être validé par le client avant mise en ligne.</Notice>
          </div>
        )}
        <div className="prose-eden">{children}</div>
      </div>
    </>
  );
}
