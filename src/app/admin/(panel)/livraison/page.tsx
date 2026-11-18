import { saveZoneAction } from '@/app/admin/actions';
import { Notice } from '@/components/ui/Notice';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Livraison' };

export default async function LivraisonAdminPage() {
  const session = await requireAdmin('orders:read');
  const zones = await getStore().listZones();
  const canWrite = hasPermission(session.role, 'zones:write');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Zones et frais de livraison</h1>
      <Notice>Les montants ci-dessous sont des valeurs d’exemple à confirmer par la marque.</Notice>

      {zones.map((zone) => (
        <form key={zone.id} action={saveZoneAction} className="card grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={zone.id} />
          <div>
            <label className="label" htmlFor={`name-${zone.id}`}>Nom de la zone</label>
            <input id={`name-${zone.id}`} name="name" defaultValue={zone.name} disabled={!canWrite} className="field" />
          </div>
          <div>
            <label className="label" htmlFor={`city-${zone.id}`}>Ville</label>
            <input id={`city-${zone.id}`} name="city" defaultValue={zone.city} disabled={!canWrite} className="field" />
          </div>
          <div>
            <label className="label" htmlFor={`fee-${zone.id}`}>Frais (FCFA)</label>
            <input id={`fee-${zone.id}`} name="fee" type="number" min={0} step={100} defaultValue={zone.fee} disabled={!canWrite} className="field" />
          </div>
          <div>
            <label className="label" htmlFor={`free-${zone.id}`}>Livraison offerte dès (FCFA, vide = jamais)</label>
            <input id={`free-${zone.id}`} name="freeShippingFrom" type="number" min={0} step={100} defaultValue={zone.freeShippingFrom ?? ''} disabled={!canWrite} className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor={`delay-${zone.id}`}>Délai indicatif</label>
            <input id={`delay-${zone.id}`} name="delayText" defaultValue={zone.delayText ?? ''} disabled={!canWrite} className="field" />
          </div>
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked={zone.isActive} disabled={!canWrite} className="h-4 w-4 accent-plum" />
            <span>Zone active (proposée aux clients)</span>
          </label>
          {canWrite && (
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary px-4 py-2 text-sm">Enregistrer la zone</button>
            </div>
          )}
        </form>
      ))}

      {canWrite && (
        <form action={saveZoneAction} className="card grid gap-4 md:grid-cols-2">
          <h2 className="font-serif text-xl md:col-span-2">Ajouter une zone</h2>
          <div>
            <label className="label" htmlFor="new-name">Nom</label>
            <input id="new-name" name="name" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="new-city">Ville</label>
            <input id="new-city" name="city" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="new-fee">Frais (FCFA)</label>
            <input id="new-fee" name="fee" type="number" min={0} required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="new-free">Offerte dès (FCFA)</label>
            <input id="new-free" name="freeShippingFrom" type="number" min={0} className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="new-delay">Délai indicatif</label>
            <input id="new-delay" name="delayText" className="field" />
          </div>
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-plum" />
            <span>Zone active</span>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">Ajouter la zone</button>
          </div>
        </form>
      )}
    </div>
  );
}
