import { createCookie } from "react-router";

import type { Language } from "~/i18n/types";

let cookie = createCookie("headplane_lang", {
  maxAge: 34560000,
  sameSite: "lax",
});

export function isValidLanguage(val: unknown): val is Language {
  return typeof val === "string" && (val === "zh" || val === "en");
}

export async function getLanguage(request: Request): Promise<Language> {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  if (isValidLanguage(vals?.language)) {
    return vals.language;
  }

  // Fallback: check Accept-Language header
  const acceptLang = request.headers.get("Accept-Language");
  if (acceptLang?.toLowerCase().includes("zh")) {
    return "zh";
  }

  // Default to zh for headplane-chinese
  return "zh";
}

export function setLanguageCookie(language: Language) {
  return cookie.serialize({ language });
}
