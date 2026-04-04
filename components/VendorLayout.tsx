import VendorSidebar from './VendorSidebar';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="bg-white rounded-lg shadow p-6">{children}</div>
      </div>
    </div>
  );
}
