import { Link } from 'react-router-dom'
import { TrendingUp, ArrowLeft } from 'lucide-react'

function LegalLayout({ title, lastUpdated, children }: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Finance<span className="text-blue-600">Tracker</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
        </div>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} FinanceTracker. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="/support" className="hover:text-gray-700 transition-colors">Support</Link>
            <Link to="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-gray-700 transition-colors">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Support ──────────────────────────────────────────────────────────────────

export function SupportPage() {
  return (
    <LegalLayout title="Support" lastUpdated="March 2026">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">How can we help?</h2>
        <p>
          FinanceTracker is a self-hosted, privacy-first personal finance application. If you're running
          your own instance or using a shared deployment, the information below should answer most questions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
        <p>
          For bug reports, feature requests, or general questions, reach us at:{' '}
          <a href="mailto:support@financetracker.app" className="text-blue-600 hover:underline font-medium">
            support@financetracker.app
          </a>
        </p>
        <p className="mt-2 text-sm text-gray-400">
          We aim to respond within 2 business days.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {[
            {
              q: 'Is FinanceTracker free to use?',
              a: 'Yes. FinanceTracker is currently free to use. You can register, add all your financial data, and access all features at no cost.',
            },
            {
              q: 'Does the app connect to my bank?',
              a: 'No. FinanceTracker does not connect to any bank, brokerage, or financial institution. All data is entered manually by you, which means your credentials are never shared.',
            },
            {
              q: 'Where is my data stored?',
              a: 'Your data is stored in the PostgreSQL database of the server running FinanceTracker. If you are self-hosting, that is your own infrastructure. No data is sent to third-party services.',
            },
            {
              q: 'How do I delete my account?',
              a: 'Go to Settings → Security → Delete Account. This permanently removes all your data — accounts, assets, liabilities, transactions, and goals — with no recovery possible.',
            },
            {
              q: 'I forgot my password. How do I reset it?',
              a: 'Password reset by email is not yet available. Contact your instance administrator or the support email above to reset your account.',
            },
            {
              q: 'Can I export my data?',
              a: 'CSV export is on the roadmap and will be available in a future release. In the meantime, you can use the Prisma Studio GUI (if you have server access) to export data directly.',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold text-gray-800 mb-1">{q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Self-Hosting Support</h2>
        <p>
          If you are running your own instance of FinanceTracker, refer to the{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">README.md</code> in the
          repository for setup instructions, environment variable reference, and database migration guides.
        </p>
      </section>
    </LegalLayout>
  )
}

// ─── Privacy Policy ───────────────────────────────────────────────────────────

export function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="March 2026">
      <section>
        <p>
          FinanceTracker ("we", "us", or "our") is committed to protecting your financial privacy.
          This policy explains what data we collect, how it is used, and your rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">1. What Data We Collect</h2>
        <p>We collect only the data you explicitly enter:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
          <li>Account details: name, email address, and hashed password.</li>
          <li>Financial data you add: accounts, assets, liabilities, insurance policies, transactions, goals, and budgets.</li>
          <li>Usage preferences: selected currency, display theme.</li>
        </ul>
        <p className="mt-3">
          We do <strong>not</strong> collect browsing behaviour, device fingerprints, advertising identifiers, or any
          data beyond what is needed to provide the application.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">2. How Your Data Is Used</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>To display your financial dashboard and reports.</li>
          <li>To authenticate you securely using JWT access tokens and hashed refresh tokens.</li>
          <li>To perform live currency conversion using a third-party exchange rate API (open.er-api.com) — only the currency code is sent, never any financial amounts.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Sharing</h2>
        <p>
          We do <strong>not</strong> sell, rent, or share your personal or financial data with any third party for
          marketing or commercial purposes. The only external service contacted is the currency exchange
          rate API, which receives no personal data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Storage & Security</h2>
        <p>
          All data is stored in a PostgreSQL database. Passwords are never stored in plaintext — they are
          hashed using bcrypt. Refresh tokens are stored as SHA-256 hashes. Connections are secured using HTTPS.
        </p>
        <p className="mt-2">
          If you are self-hosting FinanceTracker, the security of your deployment (server, database, backups)
          is your responsibility.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
        <p>
          Your data is retained for as long as your account exists. You may delete your account at any time
          from Settings → Security → Delete Account, which permanently and immediately removes all associated data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Access:</strong> You can view all your data within the application at any time.</li>
          <li><strong>Correction:</strong> You can update your profile, accounts, and financial records at any time.</li>
          <li><strong>Deletion:</strong> You can permanently delete your account and all data from Settings.</li>
          <li><strong>Portability:</strong> CSV export is on the roadmap for a future release.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:privacy@financetracker.app" className="text-blue-600 hover:underline">
            privacy@financetracker.app
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}

// ─── Terms of Service ─────────────────────────────────────────────────────────

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="March 2026">
      <section>
        <p>
          By creating an account and using FinanceTracker, you agree to the following terms. Please read
          them carefully before using the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Use of the Service</h2>
        <p>
          FinanceTracker is a personal finance tracking tool intended for lawful, personal, non-commercial use.
          You must be at least 18 years old to create an account. You are responsible for maintaining the
          confidentiality of your login credentials.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Your Data</h2>
        <p>
          You own all financial data you enter into FinanceTracker. By using the service, you grant us a
          limited licence to store and process your data solely to provide the application to you. We do not
          claim ownership of your data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">3. No Financial Advice</h2>
        <p>
          FinanceTracker is a data entry and visualization tool only. Nothing in this application constitutes
          financial, investment, tax, or legal advice. Always consult a qualified professional before making
          financial decisions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Accuracy of Data</h2>
        <p>
          All financial figures displayed are based on the data you manually enter. We do not connect to
          banks or financial institutions and cannot verify the accuracy of your data. You are solely
          responsible for ensuring the data you enter is correct.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
          <li>Use the service for any unlawful purpose.</li>
          <li>Attempt to gain unauthorised access to other users' accounts.</li>
          <li>Reverse-engineer, scrape, or abuse the API.</li>
          <li>Upload malicious code or attempt to disrupt the service.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Availability</h2>
        <p>
          We aim to keep the service available at all times but do not guarantee uninterrupted access.
          We reserve the right to perform maintenance, apply updates, or suspend accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, FinanceTracker shall not be liable for any indirect,
          incidental, or consequential damages arising from use of the service, including data loss,
          financial loss, or loss of profits.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the service after changes are
          published constitutes acceptance of the updated terms. The "last updated" date at the top of this
          page will reflect any changes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
        <p>
          Questions about these terms? Email us at{' '}
          <a href="mailto:legal@financetracker.app" className="text-blue-600 hover:underline">
            legal@financetracker.app
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}

// ─── Refund Policy ────────────────────────────────────────────────────────────

export function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="March 2026">
      <section>
        <p>
          FinanceTracker is currently provided <strong>free of charge</strong>. No payment is required to
          register or access any feature of the application.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Free Tier</h2>
        <p>
          All current features — net worth tracking, asset and liability management, transaction history,
          budgets, goals, and insurance tracking — are available at no cost. No credit card is required,
          and no subscription is charged.
        </p>
        <p className="mt-2">
          Since no payment is collected, no refunds are applicable for the free tier.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Future Paid Plans</h2>
        <p>
          If paid plans are introduced in the future, the following refund terms will apply:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
          <li>
            <strong>Monthly subscriptions:</strong> Eligible for a full refund if requested within 7 days
            of the initial charge and no premium features have been extensively used.
          </li>
          <li>
            <strong>Annual subscriptions:</strong> Eligible for a pro-rated refund for the unused portion
            of the subscription period if requested within 30 days of the charge.
          </li>
          <li>
            <strong>After the refund window:</strong> No refunds will be issued after the stated period.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">How to Request a Refund</h2>
        <p>
          To request a refund (if applicable), email{' '}
          <a href="mailto:billing@financetracker.app" className="text-blue-600 hover:underline">
            billing@financetracker.app
          </a>{' '}
          with your registered email address and the reason for the request. We will process eligible
          refunds within 5–10 business days.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Account Deletion</h2>
        <p>
          Deleting your account does not automatically trigger a refund. Please request a refund before
          deleting your account to ensure we can verify your payment history.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
        <p>
          For billing or refund questions:{' '}
          <a href="mailto:billing@financetracker.app" className="text-blue-600 hover:underline">
            billing@financetracker.app
          </a>
        </p>
      </section>
    </LegalLayout>
  )
}
