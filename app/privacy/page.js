import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Medyra collects, uses, and protects your personal data under GDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 text-sm">← Back to Medyra</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm font-medium">Privacy Policy</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: 30 March 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who We Are</h2>
            <p>Medyra ("we", "us", "our") is an AI-powered medical report explanation service accessible at <strong>medyra.de</strong>. We are the data controller responsible for your personal data.</p>
            <p className="mt-2"><strong>Contact:</strong> <a href="mailto:contact@medyra.de" className="text-emerald-600 hover:underline">contact@medyra.de</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> Your email address, name, and authentication credentials collected when you sign up via Clerk.</li>
              <li><strong>Uploaded documents:</strong> Medical reports (PDF, images, or text files) that you upload for analysis.</li>
              <li><strong>Generated explanations:</strong> The AI-generated explanations of your uploaded reports.</li>
              <li><strong>Payment data:</strong> If you purchase a paid plan, payment information is processed by Stripe. We do not store your card details.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, and technical information (IP address, browser type) collected via Google Analytics.</li>
              <li><strong>Cookies:</strong> Authentication cookies (Clerk), analytics cookies (Google Analytics). See Section 7.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Legal Basis for Processing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Contract performance (Art. 6(1)(b) GDPR):</strong> Processing your uploaded documents and generating explanations is necessary to provide the service you requested.</li>
              <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> Analytics cookies are only placed with your consent.</li>
              <li><strong>Legitimate interest (Art. 6(1)(f) GDPR):</strong> Basic security logging and fraud prevention.</li>
            </ul>
            <p className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <strong>Note on health data:</strong> Medical reports may contain health data (special category data under Art. 9 GDPR). By uploading a report, you explicitly consent to processing this data for the sole purpose of generating your explanation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. How Long We Keep Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Uploaded documents and explanations:</strong> Automatically deleted after <strong>30 days</strong>.</li>
              <li><strong>Account data:</strong> Retained until you delete your account.</li>
              <li><strong>Payment records:</strong> Retained for 7 years as required by EU tax law.</li>
              <li><strong>Analytics data:</strong> Retained by Google Analytics for 14 months (standard setting).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Data Processors</h2>
            <p className="mb-3">We share your data with the following processors, each bound by GDPR-compliant data processing agreements:</p>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Processor</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-3 py-2 font-medium">Clerk</td><td className="px-3 py-2">User authentication</td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">MongoDB Atlas</td><td className="px-3 py-2">Data storage</td><td className="px-3 py-2">EU (Frankfurt)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Anthropic (Claude AI)</td><td className="px-3 py-2">AI report analysis</td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Stripe</td><td className="px-3 py-2">Payment processing</td><td className="px-3 py-2">USA/EU (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Vercel</td><td className="px-3 py-2">Website hosting</td><td className="px-3 py-2">EU (Frankfurt)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Google Analytics</td><td className="px-3 py-2">Usage analytics (with consent)</td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">SCCs = Standard Contractual Clauses, the approved EU mechanism for international data transfers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights Under GDPR</h2>
            <p className="mb-3">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right of access (Art. 15):</strong> Request a copy of your data.</li>
              <li><strong>Right to rectification (Art. 16):</strong> Correct inaccurate data.</li>
              <li><strong>Right to erasure (Art. 17):</strong> Delete your account and all associated data.</li>
              <li><strong>Right to data portability (Art. 20):</strong> Receive your data in a machine-readable format.</li>
              <li><strong>Right to object (Art. 21):</strong> Object to processing based on legitimate interest.</li>
              <li><strong>Right to withdraw consent:</strong> You can withdraw consent for analytics at any time via our cookie settings.</li>
            </ul>
            <p className="mt-3">To exercise any right, email us at <a href="mailto:contact@medyra.de" className="text-emerald-600 hover:underline">contact@medyra.de</a>. We will respond within 30 days.</p>
            <p className="mt-2">You also have the right to lodge a complaint with your national data protection authority. In Germany: <strong>Bundesbeauftragte für den Datenschutz (BfDI)</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p className="mb-3">We use the following cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential cookies:</strong> Set by Clerk for authentication. Cannot be disabled as they are necessary for login.</li>
              <li><strong>Analytics cookies (Google Analytics):</strong> Collect anonymous usage data to help us improve the service. Only set with your consent.</li>
            </ul>
            <p className="mt-3">You can withdraw consent for analytics cookies at any time by clearing your browser cookies or contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Data Security</h2>
            <p>All data is transmitted over HTTPS (TLS encryption). Uploaded documents are stored encrypted at rest in MongoDB Atlas (EU Frankfurt region). Access to the database is restricted to authenticated service processes only. We conduct no manual review of your uploaded medical documents.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify registered users by email of any material changes. The "Last updated" date at the top of this page always reflects the most recent version.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For any privacy-related questions or to exercise your rights:</p>
            <p className="mt-2"><strong>Email:</strong> <a href="mailto:contact@medyra.de" className="text-emerald-600 hover:underline">contact@medyra.de</a></p>
            <p><strong>Website:</strong> medyra.de</p>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gray-50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          <div className="flex justify-center gap-6 mb-2">
            <Link href="/privacy" className="text-emerald-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          © 2026 Medyra. Made with care in Germany.
        </div>
      </footer>
    </div>
  )
}
