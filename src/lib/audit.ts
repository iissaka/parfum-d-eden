import { getStore } from '@/lib/store';

/**
 * Journalise une action sensible. Ne jamais passer de mot de passe, jeton ou secret dans details.
 */
export async function audit(
  actor: string,
  action: string,
  target: string | null,
  details: Record<string, unknown> = {},
): Promise<void> {
  await getStore().appendAudit({
    at: new Date().toISOString(),
    actor,
    action,
    target,
    details,
  });
}
