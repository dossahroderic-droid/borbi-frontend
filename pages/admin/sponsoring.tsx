import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getSponsoredProducts, createSponsoredProduct, updateSponsoredProduct, deleteSponsoredProduct, getDefaultProducts } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminSponsoringPage() {
  const [products, setProducts] = useState([]);
  const [defaultProducts, setDefaultProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    defaultProductId: '',
    startDate: '',
    endDate: '',
    homepageOrder: 0,
  });

  useEffect(() => {
    Promise.all([getSponsoredProducts(), getDefaultProducts()])
      .then(([sponsored, defaults]) => {
        setProducts(sponsored);
        setDefaultProducts(defaults);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    try {
      await createSponsoredProduct(formData);
      toast.success('Produit sponsorisé ajouté');
      setShowModal(false);
      setFormData({ defaultProductId: '', startDate: '', endDate: '', homepageOrder: 0 });
      const updated = await getSponsoredProducts();
      setProducts(updated);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateSponsoredProduct(id, { active: !active });
    toast.success('Statut mis à jour');
    const updated = await getSponsoredProducts();
    setProducts(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Sponsoring</h1>
            <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg">
              + Ajouter un produit sponsorisé
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Produit</th>
                  <th className="p-3 text-left">Ordre</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Début</th>
                  <th className="p-3 text-left">Fin</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.defaultProduct?.nameFr}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={p.homepageOrder || 0}
                        onChange={async (e) => {
                          await updateSponsoredProduct(p.id, { homepageOrder: parseInt(e.target.value) });
                          const updated = await getSponsoredProducts();
                          setProducts(updated);
                        }}
                        className="w-20 border rounded p-1"
                      />
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-3">{new Date(p.startDate).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(p.endDate).toLocaleDateString()}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleToggleActive(p.id, p.active)} className="text-blue-600 hover:underline text-sm">
                        {p.active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => deleteSponsoredProduct(p.id).then(() => {
                        toast.success('Supprimé');
                        getSponsoredProducts().then(setProducts);
                      })} className="text-red-600 hover:underline text-sm">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Ajouter un produit sponsorisé</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Produit</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.defaultProductId}
                    onChange={(e) => setFormData({ ...formData, defaultProductId: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {defaultProducts.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nameFr}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date de début</label>
                  <input type="date" className="w-full p-2 border rounded" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date de fin</label>
                  <input type="date" className="w-full p-2 border rounded" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Ordre d'affichage</label>
                  <input type="number" className="w-full p-2 border rounded" value={formData.homepageOrder} onChange={(e) => setFormData({ ...formData, homepageOrder: parseInt(e.target.value) })} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-2 rounded">Ajouter</button>
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
