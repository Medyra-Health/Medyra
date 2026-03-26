import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/upload(.*)',
  '/:locale/reports(.*)',
  '/dashboard(.*)',
  '/upload(.*)',
  '/reports(.*)'
]);

const intlMiddleware = createMiddleware({
  locales: ['en', 'de', 'bn', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'ur', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
