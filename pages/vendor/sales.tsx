import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api, getClients, createClient } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VendorSalesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', preferredLanguage: 'fr', consentGiven: false });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/vendors/products/search'),
      getClients(),
    ])
      .then(([prods, clis]) => {
        setProducts(prods);
        setClients(clis);
      })
      .catch(err => toast.error('Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        productId: product.id,
        productType: product.productType,
        productName: product.productDetails?.nameFr,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const newQty = newCart[index].quantity + delta;
    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQty;
      newCart[index].total = newCart[index].unitPrice * newQty;
    }
    setCart(newCart);
  };

  const totalCart = cart.reduce((sum, item) => sum + item.total, 0);
  const remaining = totalCart - amountPaid;

  const handleCreateClient = async () => {
    try {
      const data = await createClient(newClient);
      toast.success('Client créé');
      setClients([...clients, data]);
      setSelectedClient(data.id);
      setShowNewClient(false);
      setNewClient({ name: '', phone: '', preferredLanguage: 'fr', consentGiven: false });
    } catch (error) {
      toast.error('Erreur création client');
    }
  };

  const handleConfirmSale = async () => {
    if (!selectedClient) {
      toast.error('Sélectionnez un client');
      return;
    }
    if (cart.length === 0) {
      toast.error('Panier vide');
      return;
    }

    try {
      const transaction = await api('/vendors/transactions', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClient,
          items: cart,
          amountPaid,
        }),
      });
      toast.success('Vente enregistrée');
      setCart([]);
      setAmountPaid(0);
      // Afficher reçu
      const receipt = await api(`/vendors/transactions/receipt/${transaction.transactionId}`);
      console.log('Reçu:', receipt);
      alert(`Vente enregistrée ! Hash: ${receipt.hash}\nTotal: ${transaction.total / 100} FCFA`);
    } catch (error) {
      toast.error('Erreur lors de la vente');
    }
  };

  const filteredProducts = products.filter(p =>
    p.productDetails?.nameFr?.toLowerCase().includes(search.toLowerCase()) ||
    p.productDetails?.nameWolof?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <VendorLayout><div>Chargement...</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="flex gap-6">
        {/* Colonne gauche : produits */}
        <div className="flex-1">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full p-2 border rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="border rounded p-3 cursor-pointer hover:shadow-md transition relative"
              >
                {p.isSponsored && <span className="absolute top-1 right-1 text-xs bg-premium text-white px-1 rounded">⭐ À la une</span>}
                <div className="text-3xl mb-1">📷</div>
                <div className="font-semibold text-sm">{p.productDetails?.nameFr}</div>
                <div className="text-success text-sm">{p.price} FCFA</div>
                <div className="text-xs text-gray-500">Stock: {p.stock}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : panier */}
        <div className="w-96 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Panier</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center">Panier vide</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.productName}</div>
                    <div className="text-xs text-gray-500">{item.unitPrice} FCFA x {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 bg-gray-200 rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 bg-gray-200 rounded">+</button>
                  </div>
                  <div className="w-20 text-right font-semibold">{item.total} FCFA</div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{totalCart} FCFA</span>
            </div>
          </div>

          {/* Client */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Sélectionner</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
            <button onClick={() => setShowNewClient(true)} className="text-primary text-sm mt-1">+ Nouveau client</button>
          </div>

          {/* Paiement */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Montant payé (FCFA)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
            />
            <div className={`text-sm mt-1 ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Reste dû : {remaining} FCFA
            </div>
          </div>

          <button
            onClick={handleConfirmSale}
            className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-semibold"
          >
            Confirmer la vente
          </button>
        </div>
      </div>

      {/* Modal nouveau client */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouveau client</h2>
            <input type="text" placeholder="Nom" className="w-full p-2 border rounded mb-2" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
            <input type="tel" placeholder="Téléphone" className="w-full p-2 border rounded mb-2" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
            <select className="w-full p-2 border rounded mb-2" value={newClient.preferredLanguage} onChange={(e) => setNewClient({ ...newClient, preferredLanguage: e.target.value })}>
              <option value="fr">Français</option>
              <option value="wo">Wolof</option>
              <option value="ar">Arabe</option>
            </select>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={newClient.consentGiven} onChange={(e) => setNewClient({ ...newClient, consentGiven: e.target.checked })} />
              <span className="text-sm">J'atteste avoir informé le client de l'utilisation de ses données</span>
            </label>
            <div className="flex gap-3">
              <button onClick={handleCreateClient} className="flex-1 bg-primary text-white py-2 rounded">Créer</button>
              <button onClick={() => setShowNewClient(false)} className="flex-1 bg-gray-300 py-2 rounded">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
