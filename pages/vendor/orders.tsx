import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorOrdersPage() {
  const { t } = useTranslation();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('pending');
      case 'CONFIRMED':
        return t('confirmed');
      case 'DELIVERED':
        return t('delivered');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="p-6">{t('loading')}</div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('orders')}</h1>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('new_order')}</h2>
          <div className="flex gap-4">
            <select
              className="flex-1 p-2 border rounded"
              value={selectedWholesaler}
              onChange={(e) => setSelectedWholesaler(e.target.value)}
            >
              <option value="">{t('choose_wholesaler')}</option>
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
                  toast.error(t('choose_wholesaler'));
                }
              }}
            >
              {t('order')}
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">{t('my_orders')}</h2>
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
            ))
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
