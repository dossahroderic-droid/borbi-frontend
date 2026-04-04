import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/lib/adminApi';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Audit Logs</h1>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Date/Heure</th>
                  <th className="p-3 text-left">Utilisateur</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3">{log.userEmail}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3">{log.ip || '-'}</td>
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
