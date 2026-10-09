export type Lang = 'en' | 'ta'

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ta', label: 'தமிழ்', short: 'த' },
]

export { LanguageProvider, useLanguage } from '../context/LanguageContext'
