interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const countryCodes = [
  { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+86', country: 'Chine', flag: '🇨🇳' },
  { code: '+91', country: 'Inde', flag: '🇮🇳' },
  { code: '+55', country: 'Brésil', flag: '🇧🇷' },
  { code: '+27', country: 'Afrique du Sud', flag: '🇿🇦' },
];

export default function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-28 p-3 border rounded-lg bg-white"
    >
      {countryCodes.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.code} ({c.country})
        </option>
      ))}
    </select>
  );
}
