import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getAdminUsers, disableUser, deleteUser } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '' });

  useEffect(() => {
    getAdminUsers(filters)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleDisable = async (userId: string) => {
    if (confirm('Désactiver ce compte ?')) {
      await disableUser(userId);
      toast.success('Compte désactivé');
      setUsers(users.filter((u: any) => u.id !== userId));
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Supprimer définitivement ce compte ?')) {
      await deleteUser(userId);
      toast.success('Compte supprimé');
      setUsers(users.filter((u: any) => u.id !== userId));
    }
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>

          {/* Filtres */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              className="border rounded-lg p-2 flex-1"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="border rounded-lg p-2"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Admin</option>
              <option value="VENDOR">Vendeur</option>
              <option value="WHOLESALER">Grossiste</option>
            </select>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Nom / Email</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">Rôle</th>
                  <th className="p-3 text-left">Inscrit le</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.email || user.phone}</td>
                    <td className="p-3">{user.phone}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'VENDOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">Voir</button>
                      <button onClick={() => handleDisable(user.id)} className="text-orange-600 hover:underline text-sm">Désactiver</button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
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
