import type { Metadata } from 'next';
import { Notice } from '@/components/ui/Notice';
import { loginAction } from './actions';

export const metadata: Metadata = {
  title: 'Connexion administration',
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  identifiants: 'Identifiants incorrects.',
  trop_de_tentatives: 'Trop de tentatives. Patientez quelques minutes.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { erreur } = await searchParams;

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-3xl">Administration</h1>
      <p className="mt-2 text-sm">Accès réservé au personnel autorisé.</p>

      {erreur && MESSAGES[erreur] && (
        <div className="mt-6">
          <Notice tone="error">{MESSAGES[erreur]}</Notice>
        </div>
      )}

      <form action={loginAction} className="card mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <button type="submit" className="btn-primary w-full">Se connecter</button>
      </form>
    </div>
  );
}
