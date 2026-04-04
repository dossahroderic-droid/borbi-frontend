import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getDataInsights, getSubscribers, addSubscriber } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', contactEmail: '', monthlyFee: 0 });

  useEffect(() => {
    Promise.all([getDataInsights(), getSubscribers()])
      .then(([data, subs]) => {
        setInsights(data);
        setSubscribers(subs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddSubscriber = async () => {
    await addSubscriber(formData);
    toast.success('Abonné ajouté');
    setShowModal(false);
    const updated = await getSubscribers();
    setSubscribers(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Data Insights</h1>
            <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg">
              + Ajouter abonné
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Top produits</h3>
              <ul className="text-sm text-gray-600">
                <li>Aucune donnée pour le moment</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Top catégories</h3>
              <ul className="text-sm text-gray-600">
                <li>Aucune donnée pour le moment</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Entreprise</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Depuis</th>
                  <th className="p-3 text-left">Frais/mois</th>
                  <th className="p-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s: any) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.companyName}</td>
                    <td className="p-3">{s.contactEmail}</td>
                    <td className="p-3">{new Date(s.startDate).toLocaleDateString()}</td>
                    <td className="p-3">{s.monthlyFee} FCFA</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${s.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {s.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Ajouter un abonné</h2>
                <input type="text" placeholder="Nom entreprise" className="w-full p-2 border rounded mb-2" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-2" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
                <input type="number" placeholder="Frais mensuels (FCFA)" className="w-full p-2 border rounded mb-4" value={formData.monthlyFee} onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) })} />
                <div className="flex gap-3">
                  <button onClick={handleAddSubscriber} className="flex-1 bg-primary text-white py-2 rounded">Ajouter</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Annuler</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
