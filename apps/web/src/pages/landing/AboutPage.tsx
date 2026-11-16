import { Link } from 'react-router-dom'
import {
  TrendingUp, Shield, Lock, Globe, Heart,
  BarChart3, Target, Wallet, ChevronRight,
} from 'lucide-react'

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Finance<span className="text-blue-600">Tracker</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <Link to="/#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</Link>
          <Link to="/#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link to="/#privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          <Link to="/about" className="text-blue-600 font-semibold">About</Link>
          <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact Us</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  )
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-widest text-blue-200 uppercase mb-3">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5">
            Built for people who care about their finances.
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
            FinanceTracker was born out of frustration with finance apps that require bank access,
            sell your data, or charge monthly fees for basic features.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Our Mission</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-5">
                Financial clarity without compromise.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We believe everyone deserves a clear picture of their financial health — without giving
                up their privacy, linking their bank accounts, or paying a subscription.
              </p>
              <p className="text-gray-500 leading-relaxed">
                FinanceTracker is a manual-entry, privacy-first wealth tracker. You enter what you know,
                and we show you where you stand. Simple, fast, and completely under your control.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: 'Privacy First', desc: 'No bank links. No data selling. Your numbers stay yours.' },
                { icon: <Lock className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', title: 'Self-Hostable', desc: 'Run it on your own server. Full control, no vendor lock-in.' },
                { icon: <Globe className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', title: 'Multi-Currency', desc: 'Track assets in any currency with live FX conversion.' },
                { icon: <Heart className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50', title: 'Free to Use', desc: 'All features free. No paywalls, no credit card required.' },
              ].map((c) => (
                <div key={c.title} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we track */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">What We Track</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Everything in your financial life.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
                bg: 'bg-blue-50',
                title: 'Net Worth',
                desc: 'Snapshot your wealth at any moment. Watch it grow month over month with automatic history.',
              },
              {
                icon: <Wallet className="w-5 h-5 text-green-600" />,
                bg: 'bg-green-50',
                title: 'Assets & Liabilities',
                desc: '14 asset types and 10 liability types — from real estate and gold to PPF, NPS, and credit cards.',
              },
              {
                icon: <Target className="w-5 h-5 text-rose-600" />,
                bg: 'bg-rose-50',
                title: 'Goals & Budgets',
                desc: 'Set financial goals with deadlines, track progress, and plan monthly budgets per category.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to take control?</h2>
          <p className="text-blue-100 mb-6">Free to get started. No credit card required.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow"
            >
              Get Started Free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} FinanceTracker. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="/support" className="hover:text-gray-300 transition-colors">Support</Link>
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
