'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English',    short: 'EN' },
  { code: 'de', name: 'Deutsch',    short: 'DE' },
  { code: 'fr', name: 'Français',   short: 'FR' },
  { code: 'es', name: 'Español',    short: 'ES' },
  { code: 'it', name: 'Italiano',   short: 'IT' },
  { code: 'pt', name: 'Português',  short: 'PT' },
  { code: 'nl', name: 'Nederlands', short: 'NL' },
  { code: 'pl', name: 'Polski',     short: 'PL' },
  { code: 'tr', name: 'Türkçe',     short: 'TR' },
  { code: 'ru', name: 'Русский',    short: 'RU' },
  { code: 'ar', name: 'العربية',    short: 'AR' },
  { code: 'zh', name: '中文',        short: 'ZH' },
  { code: 'ja', name: '日本語',      short: 'JA' },
  { code: 'ko', name: '한국어',      short: 'KO' },
  { code: 'hi', name: 'हिन्दी',     short: 'HI' },
  { code: 'bn', name: 'বাংলা',       short: 'BN' },
  { code: 'ur', name: 'اردو',        short: 'UR' },
];

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') || 'en';
    setLocale(saved);
    if (saved === 'ar' || saved === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', saved);
  }, []);

  const changeLanguage = (newLocale) => {
    localStorage.setItem('preferredLanguage', newLocale);
    // Set cookie so server components (layout) can read the locale
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(newLocale);
    document.documentElement.setAttribute('dir', (newLocale === 'ar' || newLocale === 'ur') ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
    setIsOpen(false);
    router.refresh();
  };

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">{currentLang.short} {currentLang.name}</span>
        <span className="sm:hidden font-medium">{currentLang.short}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 ${
                    locale === lang.code ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className="w-7 text-xs font-bold text-gray-400">{lang.short}</span>
                  <span>{lang.name}</span>
                  {locale === lang.code && (
                    <span className="ml-auto text-emerald-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
