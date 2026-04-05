import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/orders/vendor').catch(() => []),
      api('/wholesalers').catch(() => [])
    ])
      .then(([ordersData, wholesalersData]) => {
        setOrders(ordersData || []);
        setWholesalers(wholesalersData || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <VendorLayout><div>Chargement...</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Commandes grossistes</h1>

        {/* Sélecteur de grossistes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Nouvelle commande</h2>
          <div className="flex gap-4">
            <select
              className="flex-1 p-2 border rounded"
              value={selectedWholesaler}
              onChange={(e) => setSelectedWholesaler(e.target.value)}
            >
              <option value="">Choisir un grossiste</option>
              {wholesalers.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.businessName} - {w.location || 'Localisation inconnue'} ({w.currency})
                  {w.featured && ' ⭐'}
                </option>
              ))}
            </select>
            <Link
              href={selectedWholesaler ? `/vendor/order/new?wholesalerId=${selectedWholesaler}` : '#'}
              className={`bg-primary text-white px-4 py-2 rounded text-center ${!selectedWholesaler ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                if (!selectedWholesaler) {
                  e.preventDefault();
                  toast.error('Sélectionnez un grossiste');
                }
              }}
            >
              Commander
            </Link>
          </div>
        </div>

        {/* Liste des commandes existantes */}
        <div className="space-y-4">
          <h2 className="font-semibold">Mes commandes</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucune commande pour le moment
            </div>
          ) : (
            orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Commande #{order.id.slice(0, 8)}</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'PENDING' ? 'En attente' :
                       order.status === 'CONFIRMED' ? 'Confirmée' :
                       order.status === 'DELIVERED' ? 'Livrée' : 'Annulée'}
                    </span>
                  </div>
                  <span className="font-bold text-primary">{order.totalCents} FCFA</span>
                </div>
                <div className="text-sm text-gray-600">
                  {order.items?.length || 0} produit(s)
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
