// Matrice des permissions. Appliquée côté serveur (voir guard.ts) : masquer un bouton
// dans l'interface n'est pas un contrôle d'accès.

export const ROLES = ['owner', 'manager', 'preparer', 'reader'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'catalog:write',
  'stock:write',
  'promotions:write',
  'zones:write',
  'orders:read',
  'orders:update_status',
  'orders:cancel',
  'orders:mark_paid',
  'orders:export',
  'audit:read',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const MATRIX: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  manager: [
    'catalog:write',
    'stock:write',
    'promotions:write',
    'zones:write',
    'orders:read',
    'orders:update_status',
    'orders:cancel',
    'orders:mark_paid',
    'orders:export',
    'audit:read',
  ],
  // Préparateur : voit les commandes et fait avancer la préparation, sans annuler ni encaisser.
  preparer: ['orders:read', 'orders:update_status'],
  reader: ['orders:read', 'audit:read'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
