import { useRouter } from 'next/router';

// Définition directe des traductions dans le hook (sans import de fichiers JSON)
const translations: Record<string, any> = {
  fr: {
    new_client: "Nouveau client",
    name: "Nom complet",
    phone: "Téléphone",
    email: "Email",
    language: "Langue préférée",
    consent: "J'atteste avoir informé le client de l'utilisation de ses données personnelles et de la possibilité de recevoir des SMS de relance.",
    create: "Créer",
    loading: "Chargement...",
    dashboard: "Tableau de bord",
    stock: "Stock",
    clients: "Clients",
    orders: "Commandes grossistes",
    messages: "Messages",
    logout: "Déconnexion"
  },
  en: {
    new_client: "New client",
    name: "Full name",
    phone: "Phone",
    email: "Email",
    language: "Preferred language",
    consent: "I confirm that I have informed the client about the use of their personal data and the possibility of receiving reminder SMS.",
    create: "Create",
    loading: "Loading...",
    dashboard: "Dashboard",
    stock: "Stock",
    clients: "Clients",
    orders: "Wholesale orders",
    messages: "Messages",
    logout: "Logout"
  },
  wo: {
    new_client: "Nouveau client",
    name: "Nom complet",
    phone: "Téléphone",
    email: "Email",
    language: "Langue préférée",
    consent: "J'atteste avoir informé le client de l'utilisation de ses données personnelles et de la possibilité de recevoir des SMS de relance.",
    create: "Créer",
    loading: "Chargement...",
    dashboard: "Tableau de bord",
    stock: "Stock",
    clients: "Clients",
    orders: "Commandes grossistes",
    messages: "Messages",
    logout: "Déconnexion"
  },
  ar: {
    new_client: "عميل جديد",
    name: "الاسم الكامل",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    language: "اللغة المفضلة",
    consent: "أؤكد أنني أبلغت العميل باستخدام بياناته الشخصية وإمكانية تلقي رسائل تذكيرية عبر SMS.",
    create: "إنشاء",
    loading: "جاري التحميل...",
    dashboard: "لوحة القيادة",
    stock: "المخزون",
    clients: "العملاء",
    orders: "طلبات الجملة",
    messages: "الرسائل",
    logout: "تسجيل الخروج"
  }
};

export function useTranslation() {
  const { locale = 'fr' } = useRouter();
  return { t: (key: string) => translations[locale]?.[key] || key };
}
