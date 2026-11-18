import type { Order } from '@/lib/domain/types';

export interface NotifyResult {
  sent: boolean;
  channel: 'none' | 'console';
}

/**
 * Notification de confirmation de commande.
 * Aucun prestataire d'e-mail, de SMS ou de WhatsApp n'est configuré : rien n'est envoyé.
 * En développement, la notification est seulement journalisée dans la console.
 * L'interface ne doit jamais affirmer qu'un message a été envoyé.
 */
export async function sendOrderConfirmation(order: Order): Promise<NotifyResult> {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[notify] confirmation ${order.reference} (aucun envoi réel configuré)`);
    return { sent: false, channel: 'console' };
  }
  return { sent: false, channel: 'none' };
}
