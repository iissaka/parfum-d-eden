import { isRole, type Role } from './permissions';

export interface AdminConfig {
  email: string;
  passwordHash: string;
  role: Role;
}

/**
 * Compte administrateur de démarrage, lu depuis les variables d'environnement.
 * La gestion multi-utilisateurs (table admin_users) reste à implémenter.
 */
export function getAdminConfig(): AdminConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const role = process.env.ADMIN_ROLE ?? 'owner';
  if (!email || !passwordHash || !isRole(role)) {
    return null;
  }
  return { email, passwordHash, role };
}
