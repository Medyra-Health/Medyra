'use client'

import { UserButton } from '@clerk/nextjs'

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
)

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
)

const PricingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
)

export default function MedyraUserButton({ signOutUrl = '/' }) {
  return (
    <UserButton signOutUrl={signOutUrl}>
      <UserButton.MenuItems>
        <UserButton.Link label="Dashboard" labelIcon={<DashboardIcon />} href="/dashboard" />
        <UserButton.Link label="Upload Report" labelIcon={<UploadIcon />} href="/upload" />
        <UserButton.Link label="Pricing" labelIcon={<PricingIcon />} href="/pricing" />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  )
}
