import { requireAdmin } from '@/lib/auth/guard';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Journal d’activité' };

export default async function JournalPage() {
  await requireAdmin('audit:read');
  const entries = await getStore().listAudit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Journal d’activité</h1>
      <p className="text-sm">200 dernières actions sensibles. Aucun mot de passe, jeton ou secret n’est enregistré.</p>
      {entries.length === 0 ? (
        <p className="card">Aucune entrée.</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Actions sensibles</caption>
            <thead className="border-b border-petal text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Acteur</th>
                <th scope="col" className="px-4 py-3">Action</th>
                <th scope="col" className="px-4 py-3">Cible</th>
                <th scope="col" className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={`${e.at}-${i}`} className="border-b border-petal/60 align-top">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(e.at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-2">{e.actor}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.target ?? '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{Object.keys(e.details).length ? JSON.stringify(e.details) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
