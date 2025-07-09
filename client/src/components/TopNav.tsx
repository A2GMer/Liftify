import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut } from "lucide-react";
import { type Language, t } from "@/lib/i18n";

interface TopNavProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showSignOut?: boolean;
}

export function TopNav({ currentLanguage, onLanguageChange, showSignOut = false }: TopNavProps) {
  const languages = [
    { code: 'en' as Language, label: '🇺🇸 English' },
    { code: 'ja' as Language, label: '🇯🇵 日本語' },
    { code: 'fr' as Language, label: '🇫🇷 Français' },
    { code: 'de' as Language, label: '🇩🇪 Deutsch' },
  ];

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

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
      
      {showSignOut && (
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-black text-white border-gray-600 hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("auth.signOut", currentLanguage)}
        </Button>
      )}
    </div>
  );
}