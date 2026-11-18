import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { SITE } from '@/config/site';
import { siteUrl } from '@/lib/config';

/**
 * Gabarit racine, commun à tout le site (boutique publique et administration) :
 * document HTML, polices et métadonnées. L'en-tête et le pied de page de la boutique
 * sont dans app/(site)/layout.tsx ; l'administration a son propre gabarit (app/admin/layout.tsx).
 */

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Active les animations d'apparition uniquement si JavaScript s'exécute. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-clip">{children}</body>
    </html>
  );
}
