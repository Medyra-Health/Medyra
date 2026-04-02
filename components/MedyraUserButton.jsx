'use client'

import { UserButton } from '@clerk/nextjs'

// Inline SVG icons for Clerk's labelIcon (must be a React SVG element)
const PricingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
)

const BlogIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

export default function MedyraUserButton({ signOutUrl = '/' }) {
  return (
    <UserButton signOutUrl={signOutUrl}>
      <UserButton.MenuItems>
        <UserButton.Link label="Pricing" href="/pricing" labelIcon={<PricingIcon />} />
        <UserButton.Link label="Blog" href="/blog" labelIcon={<BlogIcon />} />
      </UserButton.MenuItems>
    </UserButton>
  )
}
