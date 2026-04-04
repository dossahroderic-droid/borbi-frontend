import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getCommissions, markCommissionCollected } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommissions()
      .then(setCommissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (id: string) => {
    await markCommissionCollected(id);
    toast.success('Commission marquée comme collectée');
    setCommissions(commissions.map((c: any) => c.id === id ? { ...c, status: 'COLLECTED' } : c));
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  const totalCollected = commissions.filter((c: any) => c.status === 'COLLECTED').reduce((s: number, c: any) => s + c.amountCents, 0) / 100;
  const totalPending = commissions.filter((c: any) => c.status === 'PENDING').reduce((s: number, c: any) => s + c.amountCents, 0) / 100;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Commissions</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-sm text-green-800">Total collecté</div>
              <div className="text-2xl font-bold text-green-800">{totalCollected} FCFA</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="text-sm text-orange-800">Total en attente</div>
              <div className="text-2xl font-bold text-orange-800">{totalPending} FCFA</div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Montant TX</th>
                  <th className="p-3 text-left">Commission</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c: any) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{c.type}</td>
                    <td className="p-3">{c.transactionId ? 'Vente' : 'Commande'}</td>
                    <td className="p-3">{c.amountCents / 100} FCFA</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'COLLECTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status === 'COLLECTED' ? 'Collectée' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-3">
                      {c.status === 'PENDING' && (
                        <button onClick={() => handleCollect(c.id)} className="bg-primary text-white px-3 py-1 rounded text-sm">
                          Marquer collectée
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
