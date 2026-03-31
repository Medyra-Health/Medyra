import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Medyra — the AI medical report explanation service.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 text-sm">← Back to Medyra</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm font-medium">Terms of Service</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: 30 March 2026</p>

        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-10">
          <p className="text-red-800 font-semibold text-sm mb-1">⚠️ Important Medical Disclaimer</p>
          <p className="text-red-700 text-sm">Medyra is an <strong>educational tool only</strong>. It does not provide medical advice, diagnosis, or treatment recommendations. The AI-generated explanations are for informational purposes only. <strong>Always consult a licensed physician or healthcare professional</strong> before making any health decisions.</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account or using the Medyra service at medyra.de, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What Medyra Is (and Is Not)</h2>
            <p className="mb-2">Medyra is an AI-powered tool that helps you <strong>understand the terminology</strong> in your medical lab reports. It:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>✅ Explains what medical terms and values mean in plain language</li>
              <li>✅ Flags values that appear outside standard reference ranges</li>
              <li>✅ Suggests questions you might ask your doctor</li>
              <li>✅ Supports follow-up questions about your results</li>
            </ul>
            <p className="mb-2">Medyra does <strong>not</strong>:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>❌ Provide medical diagnoses</li>
              <li>❌ Recommend medications or treatments</li>
              <li>❌ Replace the advice of a qualified healthcare professional</li>
              <li>❌ Guarantee the accuracy of AI-generated explanations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Eligibility</h2>
            <p>You must be at least 16 years old to use Medyra. By using the service, you confirm that you meet this age requirement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Your Account</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>You may not share your account with others or use another person's account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload documents that are not medical reports or that belong to other people without their consent</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the service</li>
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious files or attempt to compromise system security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Subscriptions and Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free plan:</strong> 1 report per month at no cost. No credit card required.</li>
              <li><strong>Paid plans:</strong> Billed monthly via Stripe. Prices shown include VAT where applicable.</li>
              <li><strong>Cancellation:</strong> You can cancel your subscription at any time from your dashboard. Access continues until the end of the billing period.</li>
              <li><strong>Refunds:</strong> We do not offer refunds for partial months. For one-time purchases, contact us within 7 days if there is a technical issue.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="mb-2">To the maximum extent permitted by law, Medyra shall not be liable for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any health decisions made based on AI-generated explanations</li>
              <li>Inaccuracies in AI-generated content</li>
              <li>Any indirect, incidental, or consequential damages</li>
            </ul>
            <p className="mt-3">Our total liability to you shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>The Medyra platform, logo, and software are our intellectual property. Your uploaded documents remain your property. The AI-generated explanations are provided to you for personal use and may not be redistributed commercially.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time from your account settings. Upon termination, your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of the Federal Republic of Germany. Any disputes shall be subject to the jurisdiction of German courts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these terms: <a href="mailto:contact@medyra.de" className="text-emerald-600 hover:underline">contact@medyra.de</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gray-50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          <div className="flex justify-center gap-6 mb-2">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="text-emerald-600">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          © 2026 Medyra. Made with care in Germany.
        </div>
      </footer>
    </div>
  )
}
