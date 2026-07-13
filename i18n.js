import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en','de','bn','fr','es','it','pt','nl','pl','tr','ar','zh','ja','ko','hi','ur','ru'];

// This app selects locale via a `locale` cookie (set by the language switcher
// and by middleware on first visit), not next-intl's URL-based routing, so we
// read it directly here instead of relying on `requestLocale`.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('locale')?.value;
  const locale = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : 'en';
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
