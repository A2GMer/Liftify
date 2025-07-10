import { LanguageSwitcher } from "./LanguageSwitcher";
import { type Language } from "@/lib/i18n";

interface TopNavProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function TopNav({ currentLanguage, onLanguageChange }: TopNavProps) {
  return (
    <LanguageSwitcher 
      currentLanguage={currentLanguage} 
      onLanguageChange={onLanguageChange} 
    />
  );
}