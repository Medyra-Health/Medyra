'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function useTranslations(namespace = '') {
  const [locale, setLocale] = useState('en');
  
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') || 'en';
    setLocale(saved);
  }, []);

  // Try to use next-intl, but provide fallback
  try {
    const t = useNextIntlTranslations(namespace);
    return t;
  } catch (error) {
    // Fallback function that returns the key if translation fails
    return (key) => {
      console.warn(`Translation missing for key: ${key}`);
      return key.split('.').pop(); // Return last part of key as fallback
    };
  }
}
