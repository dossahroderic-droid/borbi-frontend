import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '@/lib/api';

const menuItems = [
  { href: '/vendor/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { href: '/vendor/sales', label: 'Nouvelle Vente', icon: '💰' },
  { href: '/vendor/stock', label: 'Stock', icon: '📦' },
  { href: '/vendor/clients', label: 'Clients', icon: '👥' },
  { href: '/orders', label: 'Commandes Grossistes', icon: '🛒' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/profile', label: 'Mon Profil', icon: '👤' },
];

export default function VendorSidebar() {
  const router = useRouter();
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Bor‑Bi</h2>
        <div className="text-xs text-gray-400 mt-1">{user?.email || user?.phone}</div>
      </div>

      <div className="mb-6 p-3 bg-gray-800 rounded-lg">
        <div className="text-sm font-medium">Vendeur</div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg mb-1 hover:bg-gray-700 transition ${
              router.pathname === item.href ? 'bg-gray-700' : ''
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 w-full flex items-center gap-3 p-3 rounded-lg bg-red-600 hover:bg-red-700 transition"
      >
        <span>🚪</span> Déconnexion
      </button>
    </div>
  );
}
