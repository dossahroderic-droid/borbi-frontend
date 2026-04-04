import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/admin-login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.email === 'pauledoux@protonmail.com' || user.role === 'ADMIN') {
        setIsAdmin(true);
      } else {
        router.push('/admin-login');
      }
    } catch {
      router.push('/admin-login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!isAdmin) return null;
  return <>{children}</>;
}
