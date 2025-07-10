import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { type Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  
  const languages = [
    { code: 'en' as Language, label: '🇺🇸 English' },
    { code: 'ja' as Language, label: '🇯🇵 日本語' },
    { code: 'fr' as Language, label: '🇫🇷 Français' },
    { code: 'de' as Language, label: '🇩🇪 Deutsch' },
  ];

  return (
    <Select value={language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-40 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
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
  );
}
