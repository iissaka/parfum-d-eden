import type { Config } from 'tailwindcss';

/**
 * Palette relevée sur la maquette UI choisie par le client (mauve poudré, rose pâle, fond clair, pied de page noir).
 *  - canvas  : fond de page
 *  - petal   : sections rose pâle (barre d'avantages, cartes)
 *  - mauve   : grands aplats (hero, bandeau quiz, newsletter), filets et accents
 *  - plum    : mauve foncé lisible — boutons, liens, petits textes d'accent (≈ 6:1 sur canvas, texte blanc ≈ 6:1)
 *  - ink     : titres et pied de page ; ink-soft pour le texte courant
 * Voir docs/DECISIONS.md, section « Couleurs ».
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FCFBFB',
        petal: { DEFAULT: '#E8DADF', light: '#F5EEF1' },
        mauve: { DEFAULT: '#CFB7C4', light: '#E4CEDA', deep: '#B898AA' },
        plum: { DEFAULT: '#7A5A6C', deep: '#5E4353' },
        ink: { DEFAULT: '#222222', soft: '#4A3F45' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      // Animations : lentes et douces, dans l'esprit d'une parfumerie.
      // Toutes sont neutralisées si l'utilisateur demande moins de mouvement (voir globals.css).
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'none' },
        },
        'page-in': {
          from: { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-40px, 30px, 0) scale(1.12)' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        petal: {
          '0%': { opacity: '0', transform: 'translate3d(0, -40px, 0) rotate(0deg)' },
          '10%': { opacity: '0.9' },
          '50%': { transform: 'translate3d(40px, 360px, 0) rotate(160deg)' },
          '90%': { opacity: '0.7' },
          '100%': { opacity: '0', transform: 'translate3d(-20px, 760px, 0) rotate(320deg)' },
        },
        'draw-line': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.2, 0.65, 0.25, 1) both',
        'fade-in': 'fade-in 1.2s ease both',
        'scale-in': 'scale-in 1.1s cubic-bezier(0.2, 0.65, 0.25, 1) both',
        'page-in': 'page-in 0.6s cubic-bezier(0.2, 0.65, 0.25, 1) both',
        float: 'float 7s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        'spin-slow': 'spin 24s linear infinite',
        petal: 'petal 14s linear infinite',
        'draw-line': 'draw-line 1.2s cubic-bezier(0.2, 0.65, 0.25, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
