import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Medyra collects, uses, and protects your personal data under GDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader back={{ href: '/', label: 'Back to Medyra' }} title="Privacy Policy" tone="emerald" />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: 11 July 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who We Are</h2>
            <p>Medyra ("we", "us", "our") is an educational service that explains medical documents in plain language, available on the web at <strong>medyra.de</strong> and as a mobile app for Android and iPhone. We are the data controller responsible for your personal data under the EU General Data Protection Regulation (GDPR).</p>
            <p className="mt-2"><strong>Contact:</strong> <a href="mailto:hello@medyra.de" className="text-emerald-600 hover:underline">hello@medyra.de</a></p>
            <p className="mt-1">Our full provider details and postal address are in our <Link href="/impressum" className="text-emerald-600 hover:underline">Impressum</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> Your email address, name, and authentication credentials, collected when you sign up via our authentication provider Clerk. Sign-in with Google or LinkedIn is also supported.</li>
              <li><strong>Uploaded documents:</strong> Medical documents you upload for analysis, such as lab reports, doctor letters, prescriptions, and health insurance letters (PDF, images, or text).</li>
              <li><strong>Extracted health values and explanations:</strong> The values we read from your documents (for example lab results), the plain-language explanations we generate, and, if you save a document to a health profile, the biomarker history used for your trends.</li>
              <li><strong>Health profiles:</strong> Optional profiles you create for yourself or family members (name, date of birth, relationship, gender). These fields are encrypted at rest.</li>
              <li><strong>Payment data:</strong> If you purchase a paid plan, payment is processed by Stripe. We never receive or store your full card details.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, and technical information such as IP address and browser type, collected via Google Analytics only with your consent.</li>
              <li><strong>Cookies:</strong> Essential authentication cookies (Clerk) and, with consent, analytics cookies (Google Analytics). See Section 8.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Legal Basis for Processing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Explicit consent for health data (Art. 6(1)(a) and Art. 9(2)(a) GDPR):</strong> Medical documents contain special category health data. Before your first upload we ask for your explicit consent, and we process this data only to generate your explanation and, if you choose, to build your health history. You can withdraw this consent at any time.</li>
              <li><strong>Contract performance (Art. 6(1)(b) GDPR):</strong> Providing your account, analysing documents, and delivering the features of your plan.</li>
              <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> Analytics cookies are only set with your consent.</li>
              <li><strong>Legal obligation (Art. 6(1)(c) GDPR):</strong> Retaining payment and invoicing records where tax law requires it.</li>
              <li><strong>Legitimate interest (Art. 6(1)(f) GDPR):</strong> Basic security logging and fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. How Long We Keep Your Data</h2>
            <p className="mb-3">You control how long your documents are kept, in your Data &amp; Privacy settings:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Auto-delete after 30 days (default):</strong> Each uploaded document and its explanation are permanently deleted 30 days after upload, automatically.</li>
              <li><strong>Keep as encrypted backup:</strong> If you choose this, your documents and health history stay available until you delete them or switch back. They remain encrypted at rest.</li>
              <li><strong>Account data:</strong> Retained until you delete your account.</li>
              <li><strong>Payment records:</strong> Retained for up to 10 years where required by German tax and commercial law (§ 147 AO, § 257 HGB).</li>
              <li><strong>Analytics data:</strong> Retained by Google Analytics for 14 months.</li>
            </ul>
            <p className="mt-3">You can delete any individual document, or your entire account and all associated data, at any time from within the product.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Data Processors</h2>
            <p className="mb-3">We use the following processors under Art. 28 GDPR. Each operates under a data processing agreement and, for transfers outside the EU/EEA, EU Standard Contractual Clauses. Your medical documents are processed by Anthropic (Claude AI) solely to generate your explanation; Anthropic does not use API data to train its models.</p>
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
                  <tr><td className="px-3 py-2 font-medium">MongoDB Atlas</td><td className="px-3 py-2">Encrypted data storage</td><td className="px-3 py-2">EU (Frankfurt)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Anthropic (Claude AI)</td><td className="px-3 py-2">AI document analysis — <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Privacy Policy</a></td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Stripe</td><td className="px-3 py-2">Payment processing</td><td className="px-3 py-2">USA/EU (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Vercel</td><td className="px-3 py-2">Website hosting</td><td className="px-3 py-2">EU (Frankfurt)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Expo (EAS)</td><td className="px-3 py-2">Mobile app build and delivery</td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Google Analytics</td><td className="px-3 py-2">Usage analytics (with consent)</td><td className="px-3 py-2">USA (SCCs applied)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">SCCs = Standard Contractual Clauses, the approved EU mechanism for international data transfers under Art. 46 GDPR.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights Under GDPR</h2>
            <p className="mb-3">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right of access (Art. 15):</strong> Request a copy of your data.</li>
              <li><strong>Right to rectification (Art. 16):</strong> Correct inaccurate data.</li>
              <li><strong>Right to erasure (Art. 17):</strong> Delete your account and all associated data.</li>
              <li><strong>Right to restriction (Art. 18):</strong> Ask us to limit how we process your data.</li>
              <li><strong>Right to data portability (Art. 20):</strong> Receive your data in a machine-readable format.</li>
              <li><strong>Right to object (Art. 21):</strong> Object to processing based on legitimate interest.</li>
              <li><strong>Right to withdraw consent (Art. 7(3)):</strong> Withdraw any consent, including for health data processing or analytics, at any time, without affecting processing already carried out.</li>
            </ul>
            <p className="mt-3">To exercise any right, email us at <a href="mailto:hello@medyra.de" className="text-emerald-600 hover:underline">hello@medyra.de</a>. We respond within 30 days.</p>
            <p className="mt-2">You also have the right to lodge a complaint with a supervisory authority. The authority competent for us is the <strong>Landesbeauftragte für den Datenschutz und für das Recht auf Akteneinsicht Brandenburg (LDA Brandenburg)</strong>. You may also contact the authority in your own EU country of residence.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Automated Processing</h2>
            <p>Your documents are analysed automatically by AI to produce your explanation. This does not produce a legal or similarly significant decision about you within the meaning of Art. 22 GDPR. The result is educational information, not a diagnosis or a decision, and no human at Medyra reviews your documents manually.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="mb-3">We use the following cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential cookies:</strong> Set by Clerk for authentication. These are necessary for login and cannot be disabled.</li>
              <li><strong>Analytics cookies (Google Analytics):</strong> Collect usage data to help us improve the service. These are only set after you give consent in our cookie banner (Consent Mode; analytics storage is denied by default).</li>
            </ul>
            <p className="mt-3">You can withdraw consent at any time by clearing your browser cookies or contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Data Security</h2>
            <p>All data is transmitted over HTTPS (TLS). Your medical documents, the extracted values, explanations, and health-profile fields are encrypted at rest using AES-256-GCM before they are stored, so the raw data is not readable in the database. Data is stored in the EU (Frankfurt). Access is restricted to authenticated service processes, and we perform no manual review of your uploaded documents. Because we run automated AI analysis on your behalf, the content is briefly processed in plain text in memory during analysis; it is never persisted unencrypted.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Children</h2>
            <p>Medyra is not directed at children under 16. You may add a child as a health profile to manage their documents as their parent or guardian, but the account holder must be an adult.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify registered users by email of any material changes. The "Last updated" date at the top always reflects the current version.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>For any privacy question or to exercise your rights:</p>
            <p className="mt-2"><strong>Email:</strong> <a href="mailto:hello@medyra.de" className="text-emerald-600 hover:underline">hello@medyra.de</a></p>
            <p><strong>Website:</strong> medyra.de</p>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gray-50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          <div className="flex justify-center gap-6 mb-2">
            <Link href="/privacy" className="text-emerald-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
            <Link href="/impressum" className="hover:text-gray-600">Impressum</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          © 2026 Medyra. Made with care in Germany.
        </div>
      </footer>
    </div>
  )
}
