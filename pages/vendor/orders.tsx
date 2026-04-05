import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/orders/vendor')
      .then(setOrders)
      .catch(err => toast.error('Erreur chargement commandes'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmée';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  if (loading) return <VendorLayout><div>Chargement...</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Commandes grossistes</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Aucune commande pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Commande #{order.id.slice(0, 8)}</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
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
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
