import { useRouter } from 'next/router';
import fr from '../public/locales/fr.json';
import en from '../public/locales/en.json';
import wo from '../public/locales/wo.json';
import ar from '../public/locales/ar.json';

const translations: Record<string, any> = {
  fr,
  en,
  wo,
  ar,
};

export function useTranslation() {
  const { locale = 'fr' } = useRouter();
  return { t: (key: string) => translations[locale][key] || key };
}
