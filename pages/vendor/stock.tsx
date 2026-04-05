import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api, getDefaultProducts } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VendorStockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [defaultProducts, setDefaultProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'catalog' | 'custom'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customProduct, setCustomProduct] = useState({ name: '', unit: '', price: 0, stock: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadProducts = async () => {
    try {
      const data = await api('/vendors/products');
      setProducts(data);
    } catch (error) {
      toast.error('Erreur chargement stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    getDefaultProducts().then(setDefaultProducts);
  }, []);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await api(`/vendors/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      toast.success('Produit mis à jour');
      loadProducts();
    } catch (error) {
      toast.error('Erreur mise à jour');
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Retirer ce produit du stock ?')) {
      await api(`/vendors/products/${id}`, { method: 'DELETE' });
      toast.success('Produit retiré');
      loadProducts();
    }
  };

  const handleAddFromCatalog = async () => {
    if (!selectedProduct) return;
    try {
      await api('/vendors/products', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProduct.id,
          productType: 'DefaultProduct',
          price: selectedProduct.defaultPrice,
          stock: 0,
        }),
      });
      toast.success('Produit ajouté');
      setShowModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      toast.error('Erreur ajout');
    }
  };

  const handleAddCustom = async () => {
    try {
      const custom = await api('/vendors/custom-products', {
        method: 'POST',
        body: JSON.stringify(customProduct),
      });
      await api('/vendors/products', {
        method: 'POST',
        body: JSON.stringify({
          productId: custom.productId,
          productType: 'CustomProduct',
          price: customProduct.price,
          stock: customProduct.stock,
        }),
      });
      toast.success('Produit personnalisé ajouté');
      setShowModal(false);
      setCustomProduct({ name: '', unit: '', price: 0, stock: 0 });
      loadProducts();
    } catch (error) {
      toast.error('Erreur ajout');
    }
  };

  const filteredProducts = products.filter(p =>
    p.productDetails?.nameFr?.toLowerCase().includes(search.toLowerCase()) &&
    (category ? p.productDetails?.category === category : true)
  );

  if (loading) return <VendorLayout><div>Chargement...</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Stock</h1>
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg">
            + Ajouter un produit
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 p-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Toutes catégories</option>
            <option value="boulangerie">Boulangerie</option>
            <option value="frais_proteines">Frais & Protéines</option>
            <option value="fruits_legumes">Fruits & Légumes</option>
            <option value="epicerie_conserves">Épicerie & Conserves</option>
            <option value="boissons">Boissons</option>
            <option value="hygiene_bazar">Hygiène & Bazar</option>
            <option value="energie_tech">Énergie & Tech</option>
            <option value="quincaillerie">Quincaillerie</option>
            <option value="ustensiles_cuisine">Ustensiles de cuisine</option>
            <option value="materiaux_construction">Matériaux de construction</option>
            <option value="mobilier">Mobilier</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Produit</th>
                <th className="p-3 text-left">Catégorie</th>
                <th className="p-3 text-left">Prix</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Alerte</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.productDetails?.nameFr}</td>
                  <td className="p-3">{p.productDetails?.category}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => handleUpdate(p.id, { price: parseInt(e.target.value) })}
                      className="w-24 border rounded p-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.stock}
                      onChange={(e) => handleUpdate(p.id, { stock: parseInt(e.target.value) })}
                      className="w-20 border rounded p-1"
                    />
                    {p.stock <= p.lowStockAlert && p.stock > 0 && <span className="text-danger ml-1">⚠️</span>}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.lowStockAlert}
                      onChange={(e) => handleUpdate(p.id, { lowStockAlert: parseInt(e.target.value) })}
                      className="w-16 border rounded p-1"
                    />
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleRemove(p.id)} className="text-red-600 hover:underline text-sm">Retirer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex gap-4 mb-4">
                <button onClick={() => setModalType('catalog')} className={`flex-1 py-2 rounded ${modalType === 'catalog' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Catalogue</button>
                <button onClick={() => setModalType('custom')} className={`flex-1 py-2 rounded ${modalType === 'custom' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Personnalisé</button>
              </div>

              {modalType === 'catalog' ? (
                <>
                  <select className="w-full p-2 border rounded mb-4" value={selectedProduct?.id || ''} onChange={(e) => setSelectedProduct(defaultProducts.find(p => p.id === e.target.value))}>
                    <option value="">Sélectionner un produit</option>
                    {defaultProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.nameFr} - {p.defaultPrice} FCFA</option>
                    ))}
                  </select>
                  <button onClick={handleAddFromCatalog} className="w-full bg-primary text-white py-2 rounded">Ajouter</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nom" className="w-full p-2 border rounded mb-2" value={customProduct.name} onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })} />
                  <input type="text" placeholder="Unité (kg, pièce, litre...)" className="w-full p-2 border rounded mb-2" value={customProduct.unit} onChange={(e) => setCustomProduct({ ...customProduct, unit: e.target.value })} />
                  <input type="number" placeholder="Prix (FCFA)" className="w-full p-2 border rounded mb-2" value={customProduct.price} onChange={(e) => setCustomProduct({ ...customProduct, price: parseInt(e.target.value) || 0 })} />
                  <input type="number" placeholder="Stock initial" className="w-full p-2 border rounded mb-4" value={customProduct.stock} onChange={(e) => setCustomProduct({ ...customProduct, stock: parseInt(e.target.value) || 0 })} />
                  <button onClick={handleAddCustom} className="w-full bg-primary text-white py-2 rounded">Créer</button>
                </>
              )}
              <button onClick={() => setShowModal(false)} className="w-full mt-2 bg-gray-300 py-2 rounded">Annuler</button>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
