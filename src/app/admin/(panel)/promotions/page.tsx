import { savePromotionAction } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import { formatFcfa } from '@/lib/utils/money';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Promotions' };

export default async function PromotionsPage() {
  const session = await requireAdmin('orders:read');
  const promotions = await getStore().listPromotions();
  const canWrite = hasPermission(session.role, 'promotions:write');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Codes promotionnels</h1>

      {promotions.length === 0 ? (
        <p className="card">Aucun code promotionnel.</p>
      ) : (
        <ul className="space-y-3">
          {promotions.map((p) => (
            <li key={p.id} className="card text-sm">
              <p className="font-mono text-base font-medium">{p.code}</p>
              <p>
                {p.discountType === 'percent' ? `${p.value} %` : formatFcfa(p.value)}
                {p.minSubtotal > 0 && ` · minimum ${formatFcfa(p.minSubtotal)}`}
                {p.usageLimit !== null && ` · ${p.usedCount} / ${p.usageLimit} utilisations`}
                {` · ${p.isActive ? 'actif' : 'inactif'}`}
              </p>
              {(p.startAt || p.endAt) && (
                <p className="text-xs">
                  {p.startAt && `Du ${new Date(p.startAt).toLocaleDateString('fr-FR')} `}
                  {p.endAt && `au ${new Date(p.endAt).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {canWrite && (
        <form action={savePromotionAction} className="card grid gap-4 md:grid-cols-2">
          <h2 className="font-serif text-xl md:col-span-2">Créer ou modifier un code</h2>
          <p className="text-xs md:col-span-2">Un code existant est mis à jour ; son compteur d’utilisation est conservé.</p>
          <div>
            <label className="label" htmlFor="code">Code</label>
            <input id="code" name="code" required maxLength={40} className="field uppercase" />
          </div>
          <div>
            <label className="label" htmlFor="discountType">Type de remise</label>
            <select id="discountType" name="discountType" className="field" defaultValue="percent">
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe (FCFA)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="value">Valeur</label>
            <input id="value" name="value" type="number" min={1} required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="minSubtotal">Montant minimum du panier (FCFA)</label>
            <input id="minSubtotal" name="minSubtotal" type="number" min={0} defaultValue={0} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="startAt">Début (facultatif)</label>
            <input id="startAt" name="startAt" type="datetime-local" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="endAt">Fin (facultatif)</label>
            <input id="endAt" name="endAt" type="datetime-local" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="usageLimit">Limite d’utilisations (vide = illimitée)</label>
            <input id="usageLimit" name="usageLimit" type="number" min={1} className="field" />
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-plum" />
            <span>Code actif</span>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">Enregistrer le code</button>
          </div>
        </form>
      )}
    </div>
  );
}
