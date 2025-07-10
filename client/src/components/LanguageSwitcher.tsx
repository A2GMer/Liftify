import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Language } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const languages = [
    { code: 'en' as Language, label: '🇺🇸 English' },
    { code: 'ja' as Language, label: '🇯🇵 日本語' },
    { code: 'fr' as Language, label: '🇫🇷 Français' },
    { code: 'de' as Language, label: '🇩🇪 Deutsch' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
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
