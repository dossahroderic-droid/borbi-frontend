import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    setUser(userData ? JSON.parse(userData) : null);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue {user?.email || user?.phone || 'Utilisateur'} !</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Ventes du jour</h3>
            <p className="text-2xl font-bold text-success">0 FCFA</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Clients</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Dettes</h3>
            <p className="text-2xl font-bold text-danger">0 FCFA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
