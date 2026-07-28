import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/types';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'kg', label: 'Кыргызча', flag: '🇰🇬' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find((l) => l.code === lang);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-sm font-medium text-secondary hover:text-gold"
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current?.flag}</span>
        <span className="uppercase">{lang}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg py-1 z-50 overflow-hidden border"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                lang === l.code ? 'font-medium text-gold' : 'text-secondary'
              }`}
              style={lang === l.code ? { backgroundColor: 'var(--bg-sunken)' } : undefined}
              onMouseEnter={(e) => { if (lang !== l.code) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
              onMouseLeave={(e) => { if (lang !== l.code) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="text-base">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
