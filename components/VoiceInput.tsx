import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  buttonText?: string;
}

export default function VoiceInput({ onTranscript, buttonText = "🎤 Dictée vocale" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'fr-FR';
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        toast.success('Texte dicté : ' + transcript);
      };
      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast.error('Erreur de reconnaissance vocale');
      };
      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const startListening = () => {
    if (!recognition) {
      toast.error('Reconnaissance vocale non supportée sur ce navigateur');
      return;
    }
    recognition.start();
    setIsListening(true);
  };

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className="flex items-center gap-2 px-4 py-2 bg-premium text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
    >
      <span className="text-lg">{isListening ? '⏺️ Écoute...' : buttonText}</span>
    </button>
  );
}
