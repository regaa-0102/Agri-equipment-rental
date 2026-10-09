import { Globe2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  return <div className="language-selector" aria-label="Language selector"><Globe2 size={15} /><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button><span>|</span><button className={language === 'ta' ? 'active' : ''} onClick={() => setLanguage('ta')}>தமிழ்</button></div>
}
