import { useEffect, useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

export default function VendorDashboardPage() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/vendors/dashboard')
      .then(setDashboard)
      .catch(err => toast.error(t('error')))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <VendorLayout><div className="p-6">{t('loading')}</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-80">{t('sales_today')}</div>
            <div className="text-2xl font-bold">{dashboard?.sales_today || 0} FCFA</div>
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-80">{t('total_debts')}</div>
            <div className="text-2xl font-bold">{dashboard?.total_debts || 0} FCFA</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-80">{t('active_products')}</div>
            <div className="text-2xl font-bold">{dashboard?.active_products || 0}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-80">{t('low_stock')}</div>
            <div className="text-2xl font-bold">{dashboard?.low_stock_count || 0}</div>
          </div>
        </div>

        {(dashboard?.low_stock_products?.length > 0 || dashboard?.debt_clients?.length > 0 || dashboard?.pending_orders_count > 0) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-800">{t('alerts')}</h3>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              {dashboard.low_stock_products?.slice(0, 3).map((p: any) => (
                <li key={p.id}>⚠️ {p.productDetails?.nameFr} : {t('stock')} {p.stock}</li>
              ))}
              {dashboard.debt_clients?.slice(0, 3).map((c: any) => (
                <li key={c.id}>💰 {c.name} : {t('debt')} {c.debtBalance / 100} FCFA</li>
              ))}
              {dashboard.pending_orders_count > 0 && (
                <li>📦 {dashboard.pending_orders_count} {t('pending')}</li>
              )}
            </ul>
          </div>
        )}

        {dashboard?.sponsored_products?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">{t('featured_products')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dashboard.sponsored_products.slice(0, 4).map((p: any) => (
                <div key={p.id} className="border rounded p-2 text-center">
                  <div className="text-2xl mb-1">📷</div>
                  <div className="font-semibold text-sm">{p.nameFr}</div>
                  <div className="text-xs text-success">{p.defaultPrice} FCFA</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="font-semibold p-4 border-b">{t('recent_sales')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">{t('client')}</th>
                  <th className="p-3 text-left">{t('time')}</th>
                  <th className="p-3 text-left">{t('amount')}</th>
                  <th className="p-3 text-left">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.recent_transactions?.map((tx: any) => (
                  <tr key={tx.id} className="border-t">
                    <td className="p-3">{tx.clientName}</td>
                    <td className="p-3">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3">{tx.totalCents / 100} FCFA</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        tx.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.paymentStatus === 'PAID' ? t('paid') : tx.paymentStatus === 'PARTIAL' ? t('partial') : t('unpaid')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-sm text-gray-500">{t('week_sales')}</div>
            <div className="text-xl font-bold text-primary">{dashboard?.week_sales || 0} FCFA</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-sm text-gray-500">{t('new_clients_week')}</div>
            <div className="text-xl font-bold text-primary">{dashboard?.new_clients_week || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-sm text-gray-500">{t('top_product')}</div>
            <div className="text-sm font-semibold text-primary">{dashboard?.top_product?.nameFr || '-'}</div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
