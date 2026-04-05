import { useState } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/VendorLayout';
import VoiceInput from '@/components/VoiceInput';
import { createClient } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      toast.error('Vous devez obtenir le consentement du client');
      return;
    }
    setLoading(true);
    try {
      await createClient(formData);
      toast.success('Client créé');
      router.push('/vendor/clients');
    } catch (error) {
      toast.error('Erreur création client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Nouveau client</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nom complet</label>
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
            <label className="block text-gray-700 mb-2">Téléphone</label>
            <div className="flex gap-2">
              <input
                type="tel"
                className="flex-1 p-2 border rounded"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <VoiceInput onTranscript={(text) => setFormData({ ...formData, phone: text })} buttonText="🎤" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email (optionnel)</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Langue préférée</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="wo">Wolof</option>
              <option value="ar">Arabe</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
              />
              <span className="text-sm">
                J'atteste avoir informé le client de l'utilisation de ses données personnelles
                et de la possibilité de recevoir des SMS de relance.
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer le client'}
          </button>
        </form>
      </div>
    </VendorLayout>
  );
}
