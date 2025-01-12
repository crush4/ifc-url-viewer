import i18next from "i18next";
import { en } from "./translations/en";
import { de } from "./translations/de";
import { fr } from "./translations/fr";
import { it } from "./translations/it";

export const initI18n = async () => {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  const validLangs = ["en", "de", "fr", "it"];

  const storedLang = localStorage.getItem("preferred-language");
  const browserLang = navigator.language.split("-")[0];
  let initialLang = "en";

  if (urlLang && validLangs.includes(urlLang)) {
    initialLang = urlLang;
  } else if (storedLang && validLangs.includes(storedLang)) {
    initialLang = storedLang;
  } else if (validLangs.includes(browserLang)) {
    initialLang = browserLang;
  }

  // Update URL if needed
  if (urlLang !== initialLang) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("lang", initialLang);
    window.history.replaceState({}, "", newUrl);
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

export const changeLanguage = (lang: string) => {
  localStorage.setItem("preferred-language", lang);
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("lang", lang);
  window.history.pushState({}, "", newUrl);
  return i18next.changeLanguage(lang);
};

export const i18n = i18next;
