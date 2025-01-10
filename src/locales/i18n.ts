import i18next from "i18next";
import { en } from "./translations/en";
import { de } from "./translations/de";
import { fr } from "./translations/fr";
import { it } from "./translations/it";

export const initI18n = async () => {
  // Get language from URL path
  const path = window.location.pathname;
  const urlLang = path.split("/")[1];
  const validLangs = ["en", "de", "fr", "it"];

  // Check localStorage first, then URL path, then browser preference, finally fallback to 'en'
  const storedLang = localStorage.getItem("preferred-language");
  const browserLang = navigator.language.split("-")[0];
  let initialLang = "en";
  if (storedLang && validLangs.includes(storedLang)) {
    initialLang = storedLang;
  } else if (validLangs.includes(urlLang)) {
    initialLang = urlLang;
  } else if (validLangs.includes(browserLang)) {
    initialLang = browserLang;
  }

  // If URL doesn't match the determined language, redirect
  if (urlLang !== initialLang) {
    window.location.pathname = `/${initialLang}${window.location.pathname.replace(/^\/(en|de|fr|it)/, "")}`;
    return i18next; // Return early as we're redirecting
  }

  await i18next.init({
    lng: initialLang,
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en,
      de,
      fr,
      it,
    },
  });

  return i18next;
};

// Add language change handler
export const changeLanguage = (lang: string) => {
  // Store the language preference
  localStorage.setItem("preferred-language", lang);
  const newPath = `/${lang}${window.location.pathname.replace(/^\/(en|de|fr|it)/, "")}`;
  window.history.pushState({}, "", newPath);
  return i18next.changeLanguage(lang);
};

export const i18n = i18next;
