// Transient OAuth hand-off. It answers 200 to a crawler, so keep it out of the
// index explicitly rather than relying on robots.txt alone.
export const metadata = {
  title: 'Anmeldung wird abgeschlossen',
  robots: { index: false, follow: false },
}

export default function SSOCallbackLayout({ children }) {
  return children
}
