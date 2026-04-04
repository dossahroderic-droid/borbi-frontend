import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '@/lib/api';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
  { href: '/admin/commissions', label: 'Commissions', icon: '💸' },
  { href: '/admin/insights', label: 'Data Insights', icon: '📈' },
  { href: '/admin/sponsoring', label: 'Sponsoring', icon: '⭐' },
  { href: '/admin/vitrine', label: 'Vitrine', icon: '🏪' },
  { href: '/admin/wholesalers', label: 'Grossistes', icon: '🌍' },
  { href: '/admin/messages', label: 'Messages', icon: '💬' },
  { href: '/admin/affiliation', label: 'Affiliation', icon: '🔗' },
  { href: '/admin/licenses', label: 'Licences', icon: '🏢' },
  { href: '/admin/compliance', label: 'Conformité', icon: '⚖️' },
  { href: '/admin/audit', label: 'Audit Logs', icon: '📜' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-gray-900 text-white p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Bor‑Bi Admin</h2>
        <div className="text-xs text-gray-400 mt-1">Version 1.0</div>
      </div>

      <div className="mb-6 p-3 bg-gray-800 rounded-lg">
        <div className="text-sm font-medium">{user?.email || 'pauledoux@protonmail.com'}</div>
        <div className="inline-block mt-1 px-2 py-0.5 bg-red-600 text-xs rounded-full">ADMIN</div>
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
