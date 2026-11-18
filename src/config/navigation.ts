/**
 * Navigation du site : source unique pour l'en-tête, le menu mobile, le pied de page et la recherche.
 * Les gammes correspondent aux collections du catalogue (slugs dans src/lib/store/seed.ts).
 */
export type NavLink = { href: string; label: string };

export const LINE_LINKS: NavLink[] = [
  { href: '/collections/musc-tahara', label: 'Musc Tahara' },
  { href: '/collections/el-nabil', label: 'El Nabil' },
  { href: '/collections/huile-concentree', label: 'Huile concentrée' },
  { href: '/collections/kenzie', label: 'Kenzie' },
];

/** En-tête, grand écran : libellés courts. */
export const MAIN_NAV: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/collections/lancement', label: 'Collection' },
  { href: '/#gammes', label: 'Gammes' },
  { href: '/trouver-mon-parfum', label: 'Conseil' },
  { href: '/contact', label: 'Contact' },
];

/** Menu mobile : libellés complets. */
export const MOBILE_NAV: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/collections/lancement', label: 'Collection de lancement' },
  { href: '/#gammes', label: 'Nos gammes' },
  { href: '/trouver-mon-parfum', label: 'Trouver mon parfum' },
];

export const HELP_LINKS: NavLink[] = [
  { href: '/suivi-commande', label: 'Suivre ma commande' },
  { href: '/livraison', label: 'Livraison et retours' },
  { href: '/faq', label: 'Questions fréquentes' },
  { href: '/contact', label: 'Contact' },
];

export const LEGAL_LINKS: NavLink[] = [
  { href: '/cgv', label: 'Conditions générales de vente' },
  { href: '/confidentialite', label: 'Politique de confidentialité' },
];

/** Menu mobile, partie secondaire. */
export const MOBILE_SECONDARY: NavLink[] = [
  ...LINE_LINKS,
  { href: '/recherche', label: 'Rechercher' },
  ...HELP_LINKS,
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: 'Boutique',
    links: [{ href: '/collections/lancement', label: 'Collection de lancement' }, ...LINE_LINKS, { href: '/trouver-mon-parfum', label: 'Trouver mon parfum' }],
  },
  { title: 'Aide', links: HELP_LINKS },
  { title: 'Informations', links: LEGAL_LINKS },
];
