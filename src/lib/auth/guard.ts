import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasPermission, type Permission } from './permissions';
import { verifySession, type SessionPayload } from './session';

export const ADMIN_COOKIE = 'pe_admin';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

/**
 * Contrôle d'accès côté serveur, à appeler dans chaque page et chaque action
 * d'administration. Sans session : redirection vers la connexion.
 * Session sans permission : erreur générique.
 */
export async function requireAdmin(permission?: Permission): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }
  if (permission && !hasPermission(session.role, permission)) {
    throw new Error('Accès refusé');
  }
  return session;
}
