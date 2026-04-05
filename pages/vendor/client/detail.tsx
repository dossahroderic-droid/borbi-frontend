import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/VendorLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ClientDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api(`/vendors/clients/${id}/full`)
        .then(setClient)
        .catch(err => toast.error('Erreur chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <VendorLayout><div>Chargement...</div></VendorLayout>;
  if (!client) return <VendorLayout><div>Client non trouvé</div></VendorLayout>;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Fiche client</h1>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Informations personnelles</h2>
          <p><strong>Nom :</strong> {client.client.name}</p>
          <p><strong>Téléphone :</strong> {client.client.phone}</p>
          <p><strong>Email :</strong> {client.client.email || '-'}</p>
          <p><strong>Langue :</strong> {client.client.preferredLanguage}</p>
          <p><strong>Dette actuelle :</strong> <span className="text-danger font-bold">{client.current_debt} FCFA</span></p>
          <p><strong>Total acheté :</strong> {client.total_purchased} FCFA</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="font-semibold p-4 border-b">Historique des transactions</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Payé</th>
                <th className="p-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {client.transactions.map((tx: any) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{tx.totalCents / 100} FCFA</td>
                  <td className="p-3">{tx.amountPaid / 100} FCFA</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      tx.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.paymentStatus === 'PAID' ? 'Payé' : tx.paymentStatus === 'PARTIAL' ? 'Partiel' : 'Impayé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="font-semibold p-4 border-b">Historique des paiements</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Nouvelle dette</th>
              </tr>
            </thead>
            <tbody>
              {client.payments.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{p.amountCents / 100} FCFA</td>
                  <td className="p-3">{p.newDebt / 100} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="font-semibold p-4 border-b">Historique des SMS</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Langue</th>
                <th className="p-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {client.sms_logs.map((sms: any) => (
                <tr key={sms.id} className="border-t">
                  <td className="p-3">{new Date(sms.sentAt).toLocaleDateString()}</td>
                  <td className="p-3 max-w-md truncate">{sms.message}</td>
                  <td className="p-3">{sms.language}</td>
                  <td className="p-3">{sms.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VendorLayout>
  );
}
