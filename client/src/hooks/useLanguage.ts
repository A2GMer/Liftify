import { useState, useEffect } from "react";
import { type Language } from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "liftify-language";

// Detect language from browser/location
function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";
  
  // Check localStorage first
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && ["en", "ja", "fr", "de"].includes(stored)) {
    return stored as Language;
  }
  
  // Auto-detect from browser settings
  const browserLanguage = navigator.language || navigator.languages?.[0];
  if (browserLanguage) {
    const lang = browserLanguage.toLowerCase();
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('de')) return 'de';
  }
  
  // Try to detect from timezone (rough approximation)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Tokyo') || timezone.includes('Asia/Tokyo')) return 'ja';
    if (timezone.includes('Paris') || timezone.includes('Europe/Paris')) return 'fr';
    if (timezone.includes('Berlin') || timezone.includes('Europe/Berlin')) return 'de';
  } catch (e) {
    // Fallback to English if timezone detection fails
  }
  
  return "en";
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    return detectLanguage();
  });

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }
  };

  return {
    language,
    changeLanguage,
  };
}