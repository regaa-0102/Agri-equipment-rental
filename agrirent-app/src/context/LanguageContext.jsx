import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../data/translations'
import { ta } from '../lib/translations'

const STORAGE_KEY = 'agrirent-language'
const ALT_STORAGE_KEY = 'agrirent-lang'
const LanguageContext = createContext(null)

function translateRawText(text, lang) {
  if (lang === 'en') return text
  const trimmed = text?.trim()
  if (!trimmed) return text
  if (translations.ta && translations.ta[trimmed]) return text.replace(trimmed, translations.ta[trimmed])
  if (ta && ta[trimmed]) return text.replace(trimmed, ta[trimmed])
  return text
}

function useDomObserverTranslation(lang) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    if (lang === 'en') {
      document.querySelectorAll('[data-i18n-orig]').forEach(el => {
        const orig = el.getAttribute('data-i18n-orig')
        if (orig !== null) el.textContent = orig
        el.removeAttribute('data-i18n-orig')
      })
      document.querySelectorAll('input[data-ph-orig], textarea[data-ph-orig]').forEach(el => {
        const orig = el.getAttribute('data-ph-orig')
        if (orig !== null) el.setAttribute('placeholder', orig)
        el.removeAttribute('data-ph-orig')
      })
      return
    }

    const apply = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes = []
      let n = walker.nextNode()
      while (n) {
        nodes.push(n)
        n = walker.nextNode()
      }
      for (const node of nodes) {
        const parent = node.parentElement
        if (!parent) continue
        const tag = parent.tagName
        if (tag === 'SCRIPT' || tag === 'STYLE') continue
        const original = node.nodeValue ?? ''
        const translated = translateRawText(original, 'ta')
        if (translated !== original) {
          if (!parent.hasAttribute('data-i18n-orig')) {
            parent.setAttribute('data-i18n-orig', parent.textContent ?? '')
          }
          node.nodeValue = translated
        }
      }
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        const ph = el.getAttribute('placeholder') ?? ''
        const tr = translateRawText(ph, 'ta')
        if (tr !== ph) {
          if (!el.hasAttribute('data-ph-orig')) {
            el.setAttribute('data-ph-orig', ph)
          }
          el.setAttribute('placeholder', tr)
        }
      })
    }

    apply()
    const observer = new MutationObserver(() => {
      observer.disconnect()
      apply()
      observer.observe(document.body, { childList: true, subtree: true })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [lang])
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(ALT_STORAGE_KEY) || 'en'
  })

  const setLanguage = value => {
    const next = value === 'ta' ? 'ta' : 'en'
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
      window.localStorage.setItem(ALT_STORAGE_KEY, next)
    } catch {}
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'ta' ? 'ta' : 'en'
    }
  }, [language])

  useDomObserverTranslation(language)

  const value = useMemo(
    () => ({
      language,
      lang: language,
      setLanguage,
      setLang: setLanguage,
      isTamil: language === 'ta',
      t: keyOrText => {
        if (!keyOrText) return ''
        if (language === 'en') {
          return translations.en?.[keyOrText] || keyOrText
        }
        return (
          translations.ta?.[keyOrText] ||
          ta?.[keyOrText] ||
          translations.en?.[keyOrText] ||
          keyOrText
        )
      },
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
