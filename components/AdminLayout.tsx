import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-72 p-6">
        <div className="bg-white rounded-lg shadow p-6">{children}</div>
      </div>
    </div>
  );
}
