import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getAffiliateLinks, createAffiliateLink } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminAffiliationPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ partnerName: '', type: 'loan', url: '' });

  useEffect(() => {
    getAffiliateLinks()
      .then(setLinks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddLink = async () => {
    await createAffiliateLink(formData);
    toast.success('Lien ajouté');
    setShowModal(false);
    const updated = await getAffiliateLinks();
    setLinks(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Affiliation</h1>
            <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg">
              + Générer un lien
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Partenaire</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Lien</th>
                  <th className="p-3 text-left">Clics</th>
                  <th className="p-3 text-left">Revenus</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link: any) => (
                  <tr key={link.id} className="border-t">
                    <td className="p-3">{link.partnerName}</td>
                    <td className="p-3">{link.type}</td>
                    <td className="p-3 text-blue-600 truncate max-w-xs">{link.url}</td>
                    <td className="p-3">{link.clicks || 0}</td>
                    <td className="p-3">{link.revenue || 0} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Générer un lien d'affiliation</h2>
                <input type="text" placeholder="Nom du partenaire" className="w-full p-2 border rounded mb-2" value={formData.partnerName} onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })} />
                <select className="w-full p-2 border rounded mb-2" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="loan">Prêt</option>
                  <option value="insurance">Assurance</option>
                  <option value="supplier">Fournisseur</option>
                </select>
                <input type="url" placeholder="URL du partenaire" className="w-full p-2 border rounded mb-4" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                <div className="flex gap-3">
                  <button onClick={handleAddLink} className="flex-1 bg-primary text-white py-2 rounded">Générer</button>
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
