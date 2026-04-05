import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/VendorLayout';
import { getClients, api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorClientsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentClient, setPaymentClient] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handlePayment = async () => {
    if (!paymentClient) return;
    try {
      await api(`/vendors/clients/${paymentClient.id}/payment`, {
        method: 'POST',
        body: JSON.stringify({ amountCents: paymentAmount * 100 }),
      });
      toast.success(t('success'));
      setPaymentClient(null);
      setPaymentAmount(0);
      loadClients();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleSendSms = async (clientId: string) => {
    try {
      await api(`/vendors/clients/${clientId}/send-sms`, { method: 'POST' });
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  if (loading) return <VendorLayout><div className="p-6">{t('loading')}</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('clients')}</h1>
          <Link href="/vendor/clients/new" className="bg-primary text-white px-4 py-2 rounded-lg">
            + {t('new_client')}
          </Link>
        </div>

        <input
          type="text"
          placeholder={t('search')}
          className="w-full p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">{t('name')}</th>
                <th className="p-3 text-left">{t('phone')}</th>
                <th className="p-3 text-left">{t('debt')}</th>
                <th className="p-3 text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">
                    <span className={c.debtBalance > 0 ? 'text-danger font-semibold' : 'text-success'}>
                      {c.debtBalance / 100} FCFA
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <Link href={`/vendor/client/detail?id=${c.id}`} className="text-primary hover:underline text-sm">{t('view_details')}</Link>
                    <button onClick={() => setPaymentClient(c)} className="text-green-600 hover:underline text-sm">{t('payment')}</button>
                    <button onClick={() => handleSendSms(c.id)} className="text-blue-600 hover:underline text-sm">{t('send_sms')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paymentClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('payment')}</h2>
            <p>{t('client')} : {paymentClient.name}</p>
            <p>{t('debt')} : {paymentClient.debtBalance / 100} FCFA</p>
            <input
              type="number"
              placeholder={t('amount')}
              className="w-full p-2 border rounded my-4"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
            />
            <div className="flex gap-3">
              <button onClick={handlePayment} className="flex-1 bg-primary text-white py-2 rounded">{t('save')}</button>
              <button onClick={() => setPaymentClient(null)} className="flex-1 bg-gray-300 py-2 rounded">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
