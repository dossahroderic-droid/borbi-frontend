import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VendorLayout from '@/components/VendorLayout';
import VoiceInput from '@/components/VoiceInput';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { createClient } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewClientPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+221');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredLanguage: 'fr',
    consentGiven: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      toast.error(t('consent'));
      return;
    }
    const fullPhone = countryCode + formData.phone.replace(/\s/g, '');
    setLoading(true);
    try {
      await createClient({ ...formData, phone: fullPhone });
      toast.success(t('success'));
      router.push('/vendor/clients');
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{t('new_client')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('name')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <VoiceInput onTranscript={(text) => setFormData({ ...formData, name: text })} buttonText="🎤" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('phone')}</label>
            <div className="flex gap-2">
              <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
              <input
                type="tel"
                className="flex-1 p-2 border rounded"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="77 000 00 00"
                required
              />
              <VoiceInput onTranscript={(text) => setFormData({ ...formData, phone: text })} buttonText="🎤" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('email')}</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('language')}</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="wo">Wolof</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
              />
              <span className="text-sm">{t('consent')}</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? t('loading') : t('create')}
          </button>
        </form>
      </div>
    </VendorLayout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
