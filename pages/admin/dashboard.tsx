import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getAdminDashboard } from '@/lib/adminApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  const chartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: [0, 0, 0, 0],
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        tension: 0.3,
      },
    ],
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-80">Revenus totaux</div>
              <div className="text-2xl font-bold">{dashboard?.commissions?.total || 0} FCFA</div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-80">Utilisateurs</div>
              <div className="text-2xl font-bold">{dashboard?.users?.total || 0}</div>
              <div className="text-xs">Vendeurs: {dashboard?.users?.vendors || 0} | Grossistes: {dashboard?.users?.wholesalers || 0}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-80">Transactions</div>
              <div className="text-2xl font-bold">{dashboard?.transactions?.total || 0}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-80">Commandes</div>
              <div className="text-2xl font-bold">{dashboard?.transactions?.orders || 0}</div>
            </div>
          </div>

          {/* Graphique */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Évolution des revenus (semaine par semaine)</h2>
            <Line data={chartData} />
          </div>

          {/* Alertes */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-800">⚠️ Commissions en attente de collecte : {dashboard?.commissions?.pending || 0} FCFA</p>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
