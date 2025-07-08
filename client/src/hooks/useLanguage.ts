import { useState, useEffect } from "react";
import { type Language } from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "liftify-language";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage or default to 'en'
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && ["en", "ja", "fr", "de"].includes(stored)) {
        return stored as Language;
      }
    }
    return "en";
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