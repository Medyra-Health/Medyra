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

// Languages that appear in the URL path for Lexikon (all except 'de' which uses /lexikon/slug directly)
const LEXIKON_URL_LANGS = new Set(['en','tr','bn','fr','ar','es','it','pt','nl','pl','zh','ja','ko','hi','ur','ru']);

// Detect current language from the URL (for Lexikon pages)
function getLangFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  // /lexikon/[lang]/[termSlug]
  if (parts[0] === 'lexikon' && parts.length === 3 && LEXIKON_URL_LANGS.has(parts[1])) {
    return parts[1];
  }
  // /lexikon/[termSlug] — German entry
  if (parts[0] === 'lexikon' && parts.length === 2 && !LEXIKON_URL_LANGS.has(parts[1])) {
    return 'de';
  }
  // /lexikon index — don't force 'de', let it use the saved preference
  return null; // use cookie/localStorage
}

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState('de');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Sync displayed locale with URL (for Lexikon) or with saved preference (everywhere else)
  useEffect(() => {
    const urlLang = getLangFromPath(pathname);
    if (urlLang) {
      setLocale(urlLang);
      applyDir(urlLang);
    } else {
      const saved = localStorage.getItem('preferredLanguage') || 'en';
      setLocale(saved);
      applyDir(saved);
    }
  }, [pathname]);

  function applyDir(lang) {
    const rtl = lang === 'ar' || lang === 'ur';
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  function setLocaleCookie(lang) {
    localStorage.setItem('preferredLanguage', lang);
    document.cookie = `locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }

  const changeLanguage = (newLocale) => {
    setLocaleCookie(newLocale);
    setLocale(newLocale);
    applyDir(newLocale);
    setIsOpen(false);

    // Smart Lexikon navigation: switch URL to the translated version
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] === 'lexikon' && parts.length === 3 && LEXIKON_URL_LANGS.has(parts[1])) {
      // Currently on /lexikon/[lang]/[termSlug] — swap language
      const termSlug = parts[2];
      if (newLocale === 'de') {
        router.push(`/lexikon/${termSlug}`);
      } else {
        router.push(`/lexikon/${newLocale}/${termSlug}`);
      }
      return;
    }

    if (parts[0] === 'lexikon' && parts.length === 2 && !LEXIKON_URL_LANGS.has(parts[1])) {
      // Currently on /lexikon/[termSlug] — German entry page
      const termSlug = parts[1];
      if (newLocale !== 'de') {
        router.push(`/lexikon/${newLocale}/${termSlug}`);
        return;
      }
      // Switching to DE on a DE page — just refresh UI language
      router.refresh();
      return;
    }

    // All other pages: just refresh so the server re-reads the cookie
    router.refresh();
  };

  const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.code === 'en');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-emerald-400/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 transition-all font-semibold"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-emerald-500" />
        <span>{currentLang.short}</span>
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
