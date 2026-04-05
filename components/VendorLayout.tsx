import VendorSidebar from './VendorSidebar';
import OnlineStatus from './OnlineStatus';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="flex-1 ml-64">
        <div className="bg-white border-b p-4 flex justify-end items-center gap-4">
          <OnlineStatus />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
