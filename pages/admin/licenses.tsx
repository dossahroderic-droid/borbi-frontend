import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getLicenses, createLicense, renewLicense, cancelLicense } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', contactEmail: '', monthlyFee: 0 });

  useEffect(() => {
    getLicenses()
      .then(setLicenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    await createLicense(formData);
    toast.success('Licence créée');
    setShowModal(false);
    const updated = await getLicenses();
    setLicenses(updated);
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Licences entreprises</h1>
            <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg">
              + Créer une licence
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Entreprise</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Depuis</th>
                  <th className="p-3 text-left">Expire</th>
                  <th className="p-3 text-left">Tarif</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((lic: any) => (
                  <tr key={lic.id} className="border-t">
                    <td className="p-3">{lic.companyName}</td>
                    <td className="p-3">{lic.contactEmail}</td>
                    <td className="p-3">{new Date(lic.startDate).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(lic.endDate).toLocaleDateString()}</td>
                    <td className="p-3">{lic.monthlyFee} FCFA/mois</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${lic.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {lic.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => renewLicense(lic.id)} className="text-green-600 hover:underline text-sm">Renouveler</button>
                      <button onClick={() => cancelLicense(lic.id)} className="text-red-600 hover:underline text-sm">Résilier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Créer une licence</h2>
                <input type="text" placeholder="Nom entreprise" className="w-full p-2 border rounded mb-2" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                <input type="email" placeholder="Email contact" className="w-full p-2 border rounded mb-2" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
                <input type="number" placeholder="Tarif mensuel (FCFA)" className="w-full p-2 border rounded mb-4" value={formData.monthlyFee} onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) })} />
                <div className="flex gap-3">
                  <button onClick={handleCreate} className="flex-1 bg-primary text-white py-2 rounded">Créer</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Annuler</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
