import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useLocation, useSubmit } from "react-router";

import { en } from "./locales/en";
import { zh } from "./locales/zh";
import type { Language, TranslationDict } from "./types";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: TranslationDict;
  isZh: boolean;
}

const locales: Record<Language, TranslationDict> = {
  zh,
  en,
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({
  initialLanguage = "zh",
  children,
}: {
  initialLanguage?: Language;
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const submit = useSubmit();
  const location = useLocation();

  const setLanguage = useCallback(
    (newLang: Language) => {
      setLanguageState(newLang);

      // Set cookie on client immediately
      if (typeof document !== "undefined") {
        document.cookie = `headplane_lang=${newLang}; path=/; max-age=34560000; SameSite=Lax`;
      }

      // Also submit to API to update SSR state & revalidate
      try {
        const returnTo = location.pathname + location.search;
        submit({ language: newLang, returnTo }, { action: "/api/language", method: "POST" });
      } catch {
        // Ignore submit errors if unmounted or offline
      }
    },
    [location, submit],
  );

  const currentDict = locales[language] ?? locales.zh;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = getNestedValue(currentDict, key);

      // Fallback to English, then Chinese
      if (str === undefined) {
        str = getNestedValue(locales.en, key);
      }
      if (str === undefined) {
        str = getNestedValue(locales.zh, key);
      }
      if (str === undefined) {
        return key;
      }

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }

      return str;
    },
    [currentDict],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: currentDict,
        isZh: language === "zh",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "zh" as Language,
      setLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let str = getNestedValue(locales.zh, key) ?? key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          }
        }
        return str;
      },
      translations: locales.zh,
      isZh: true,
    };
  }
  return context;
}
