import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getWholesalers, toggleFeatured } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminWholesalersPage() {
  const [wholesalers, setWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWholesalers()
      .then(setWholesalers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured(id);
    toast.success('Statut mis à jour');
    const updated = await getWholesalers();
    setWholesalers(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Grossistes</h1>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Localisation</th>
                  <th className="p-3 text-left">Devise</th>
                  <th className="p-3 text-left">Mis en avant</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wholesalers.map((w: any) => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3">{w.businessName}</td>
                    <td className="p-3">{w.location || '-'}</td>
                    <td className="p-3">{w.currency}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${w.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                        {w.featured ? '⭐ Mis en avant' : 'Standard'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleFeatured(w.id)} className="bg-primary text-white px-3 py-1 rounded text-sm">
                        {w.featured ? 'Retirer la mise en avant' : 'Mettre en avant'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
