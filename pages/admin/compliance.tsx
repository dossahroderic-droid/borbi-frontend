import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getDeletionRequests, anonymizeClient } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminCompliancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeletionRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAnonymize = async (id: string) => {
    if (confirm('Anonymiser ce client ?')) {
      await anonymizeClient(id);
      toast.success('Client anonymisé');
      const updated = await getDeletionRequests();
      setRequests(updated);
    }
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Conformité</h1>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Vendeur</th>
                  <th className="p-3 text-left">Demandé le</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req: any) => (
                  <tr key={req.id} className="border-t">
                    <td className="p-3">{req.clientName}</td>
                    <td className="p-3">{req.vendorName}</td>
                    <td className="p-3">{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td className="p-3">{req.status}</td>
                    <td className="p-3">
                      {req.status === 'PENDING' && (
                        <button onClick={() => handleAnonymize(req.id)} className="bg-primary text-white px-3 py-1 rounded text-sm">
                          Anonymiser
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
