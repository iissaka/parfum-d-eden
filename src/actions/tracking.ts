'use server';

import { headers } from 'next/headers';
import { lookupOrder, type TrackingResult } from '@/lib/orders/tracking';
import { clientKeyFrom } from '@/lib/utils/request';

export async function lookupOrderAction(
  _previous: TrackingResult | null,
  formData: FormData,
): Promise<TrackingResult> {
  const clientKey = clientKeyFrom(await headers());
  return lookupOrder(
    {
      reference: formData.get('reference'),
      phone: formData.get('phone'),
    },
    clientKey,
  );
}
