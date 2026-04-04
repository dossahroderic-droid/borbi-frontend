import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getSponsoredProducts, updateSponsoredProduct } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminVitrinePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSponsoredProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateOrder = async (id: string, order: number) => {
    await updateSponsoredProduct(id, { homepageOrder: order });
    toast.success('Ordre mis à jour');
    const updated = await getSponsoredProducts();
    setProducts(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Vitrine publique</h1>
          <p className="text-gray-500">Aperçu de la page d'accueil (produits sponsorisés actifs)</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.filter((p: any) => p.active).map((p: any) => (
              <div key={p.id} className="bg-white rounded-lg shadow p-4">
                <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-4xl">📷</div>
                <h3 className="font-semibold">{p.defaultProduct?.nameFr}</h3>
                <p className="text-sm text-gray-600">{p.defaultProduct?.brand}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm">Ordre :</label>
                  <input
                    type="number"
                    value={p.homepageOrder || 0}
                    onChange={(e) => updateOrder(p.id, parseInt(e.target.value))}
                    className="w-16 border rounded p-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
