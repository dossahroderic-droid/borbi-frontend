interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const countryCodes = [
  // Afrique de l'Ouest
  { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+224', country: 'Guinée', flag: '🇬🇳' },
  { code: '+245', country: 'Guinée-Bissau', flag: '🇬🇼' },
  { code: '+222', country: 'Mauritanie', flag: '🇲🇷' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+229', country: 'Bénin', flag: '🇧🇯' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+231', country: 'Libéria', flag: '🇱🇷' },
  { code: '+234', country: 'Nigéria', flag: '🇳🇬' },
  { code: '+220', country: 'Gambie', flag: '🇬🇲' },
  { code: '+238', country: 'Cap-Vert', flag: '🇨🇻' },

  // Afrique centrale
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+236', country: 'République centrafricaine', flag: '🇨🇫' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'République démocratique du Congo', flag: '🇨🇩' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+240', country: 'Guinée équatoriale', flag: '🇬🇶' },
  { code: '+239', country: 'Sao Tomé-et-Principe', flag: '🇸🇹' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },

  // Afrique de l'Est / autres
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzanie', flag: '🇹🇿' },
  { code: '+256', country: 'Ouganda', flag: '🇺🇬' },
  { code: '+251', country: 'Éthiopie', flag: '🇪🇹' },
  { code: '+252', country: 'Somalie', flag: '🇸🇴' },

  // Afrique du Nord
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
  { code: '+213', country: 'Algérie', flag: '🇩🇿' },
  { code: '+218', country: 'Libye', flag: '🇱🇾' },
  { code: '+20', country: 'Égypte', flag: '🇪🇬' },

  // Europe / Amérique / Asie
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
      className="w-44 p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {countryCodes.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.code} ({c.country})
        </option>
      ))}
    </select>
  );
}
