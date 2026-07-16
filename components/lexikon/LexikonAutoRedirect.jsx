'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const LEXIKON_URL_LANGS = new Set(['en','tr','bn','fr','ar','es','it','pt','nl','pl','zh','ja','ko','hi','ur','ru'])

export default function LexikonAutoRedirect({ termSlug }) {
  const router = useRouter()
  useEffect(() => {
    // Read saved language from cookie first, then localStorage
    const cookieLang = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('locale='))?.split('=')[1]
    const lang = cookieLang || localStorage.getItem('preferredLanguage')
    if (lang && lang !== 'de' && LEXIKON_URL_LANGS.has(lang)) {
      // scroll: false — the redirect fires after hydration; if the user has
      // already started scrolling, jumping back to the top feels like a glitch
      router.replace('/lexikon/' + lang + '/' + termSlug, { scroll: false })
    }
  }, [termSlug, router])
  return null
}
