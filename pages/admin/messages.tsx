import AdminGuard from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { getAdminMessages, blockUser } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (userId: string) => {
    if (confirm('Bloquer cet utilisateur ?')) {
      await blockUser(userId);
      toast.success('Utilisateur bloqué');
    }
  };

  if (loading) return <AdminGuard><AdminLayout><div>Chargement...</div></AdminLayout></AdminGuard>;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Messages (modération)</h1>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Expéditeur</th>
                  <th className="p-3 text-left">Destinataire</th>
                  <th className="p-3 text-left">Message</th>
                  <th className="p-3 text-left">Date/Heure</th>
                  <th className="p-3 text-left">Lu</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg: any) => (
                  <tr key={msg.id} className="border-t">
                    <td className="p-3">{msg.senderId}</td>
                    <td className="p-3">{msg.receiverId}</td>
                    <td className="p-3 max-w-md truncate">{msg.content}</td>
                    <td className="p-3">{new Date(msg.createdAt).toLocaleString()}</td>
                    <td className="p-3">{msg.read ? '✅' : '❌'}</td>
                    <td className="p-3">
                      <button onClick={() => handleBlock(msg.senderId)} className="text-red-600 hover:underline text-sm">
                        Bloquer
                      </button>
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
