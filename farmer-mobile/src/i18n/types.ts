export type Language = 'en' | 'ta';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
];

export type NestedTranslationDict = {
  [key: string]: string | NestedTranslationDict;
};
