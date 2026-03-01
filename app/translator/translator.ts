import EN from "./en";
import IT from "./it";
import RU from "./ru";

const DEFAULT_LOCALE: string = "en";

export default class Translator {
  locale: string;
  translations: Record<string, Record<string, string>>;

  constructor() {
    this.locale = "";
    this.translations = {};

    this.registerTranslation("en", EN);
    this.registerTranslation("it", IT);
    this.registerTranslation("ru", RU);

    let locale: string | null = null;
    let languages: readonly string[] = Translator.getBrowserLanguages();
    for (let i = 0; i < languages.length; i++) {
      let lang: string = languages[i];
      if (this.translations.hasOwnProperty(lang)) {
        locale = lang;
        break;
      }
    }
    locale = locale ? locale : DEFAULT_LOCALE;

    this.setLocale(locale);
  }

  t(phrase: string, ...params: string[]): string {
    return this.translate(phrase, ...params);
  }

  translate(phrase: string, ...params: string[]): string {
    let locale: string = this.locale;

    let translation: Record<string, string> = this.translations[locale];
    if (!translation.hasOwnProperty(phrase)) {
      console.warn(`translation '${phrase}' not found in language '${locale}'`);
      return phrase;
    }

    let translatedPhrase: string = translation[phrase];

    translatedPhrase = translatedPhrase.replace(
      /{(\d+)}/g,
      function (match: string, number: string): string {
        return typeof params[Number(number)] !== "undefined" ? params[Number(number)] : match;
      }
    );

    return translatedPhrase;
  }

  setLocale(locale: string): void {
    locale = locale.toLowerCase();

    if (this.translations.hasOwnProperty(locale)) {
      this.locale = locale;
    } else {
      console.warn(
        `locale '${locale}' not available, switch to ${DEFAULT_LOCALE}`
      );
      this.locale = DEFAULT_LOCALE.toLowerCase();
    }
  }

  registerTranslation(locale: string, translations: Record<string, string>): void {
    if (!this.translations.hasOwnProperty(locale)) {
      this.translations[locale] = translations;
    } else {
      Object.assign(this.translations[locale], translations);
    }
  }

  static getBrowserLanguages(): readonly string[] {
    if (typeof navigator === "undefined") return [];

    return navigator.languages
      ? navigator.languages
      : [navigator.language];
  }
}
