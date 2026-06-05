"use client";

import { useEffect, useMemo, useState } from "react";
import { Language, defaultLanguage, isLanguage } from "@/lib/i18n";

const STORAGE_KEY = "ma-petite-compta-language";

const readStoredLanguage = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(saved) ? saved : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // localStorage is only available after mount, so this hydration step is intentionally effect-driven.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(readStoredLanguage());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return useMemo(() => ({ language, setLanguage }), [language]);
};
