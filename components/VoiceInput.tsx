import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  buttonText?: string;
  language?: string; // fr, wo, en, ar
}

export default function VoiceInput({ onTranscript, buttonText = "🎤", language = "fr" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getSpeechLang = (lang: string) => {
    switch (lang) {
      case 'fr': return 'fr-FR';
      case 'wo': return 'wo-SN';
      case 'en': return 'en-US';
      case 'ar': return 'ar-EG';
      default: return 'fr-FR';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getSpeechLang(language);
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        if (event.error !== 'no-speech') {
          toast.error('Erreur de reconnaissance vocale');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Reconnaissance vocale non supportée sur ce navigateur');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success('Dictée arrêtée');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Dictée en cours... Parlez maintenant');
      } catch (error) {
        console.error(error);
        toast.error('Erreur démarrage dictée');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isListening 
          ? 'bg-red-600 text-white animate-pulse' 
          : 'bg-premium text-white hover:bg-purple-700'
      }`}
    >
      <span className="text-lg">{isListening ? '⏹️ Arrêter' : buttonText}</span>
    </button>
  );
}
