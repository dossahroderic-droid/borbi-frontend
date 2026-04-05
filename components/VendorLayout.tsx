import VendorSidebar from './VendorSidebar';
import OnlineStatus from './OnlineStatus';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'next-i18next';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const isRtl = router.locale === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="flex-1 ml-64">
        <div className="bg-white border-b p-4 flex justify-end items-center gap-4">
          <LanguageSwitcher />
          <OnlineStatus />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
