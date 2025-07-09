import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Language } from "@/lib/i18n";

interface TopNavProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function TopNav({ currentLanguage, onLanguageChange }: TopNavProps) {
  const languages = [
    { code: 'en' as Language, label: '🇺🇸 English' },
    { code: 'ja' as Language, label: '🇯🇵 日本語' },
    { code: 'fr' as Language, label: '🇫🇷 Français' },
    { code: 'de' as Language, label: '🇩🇪 Deutsch' },
  ];

  

  return (
    <div className="flex items-center space-x-3">
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-40 bg-black text-white border-gray-600">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      
    </div>
  );
}