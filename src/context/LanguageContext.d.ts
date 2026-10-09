import { ReactNode } from 'react'

export interface LanguageContextValue {
  language: string
  lang: string
  setLanguage: (lang: string) => void
  setLang: (lang: string) => void
  isTamil: boolean
  t: (keyOrText: string) => string
}

export function LanguageProvider(props: { children: ReactNode }): React.JSX.Element
export function useLanguage(): LanguageContextValue
