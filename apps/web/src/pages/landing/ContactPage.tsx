import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Mail, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

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
          <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link to="/contact" className="text-blue-600 font-semibold">Contact Us</Link>
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

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState('')

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (form.subject.trim().length < 3) e.subject = 'Subject must be at least 3 characters'
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setStatus('loading')
    setServerError('')
    try {
      await api.post('/api/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setServerError(err?.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-5 gap-12">

          {/* Left — info panel */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">Get in Touch</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">We'd love to hear from you.</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Have a question, a bug report, a feature idea, or just want to say hello? Fill in the form
                and we'll get back to you within 2 business days.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: <Mail className="w-4 h-4 text-blue-600" />,
                  bg: 'bg-blue-50',
                  label: 'Email',
                  value: 'support@financetracker.app',
                  href: 'mailto:support@financetracker.app',
                },
                {
                  icon: <MessageSquare className="w-4 h-4 text-violet-600" />,
                  bg: 'bg-violet-50',
                  label: 'Response Time',
                  value: 'Within 2 business days',
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-blue-600 hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">Helpful Links</p>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/support" className="text-blue-600 hover:underline">FAQ & Support →</Link></li>
                <li><Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy →</Link></li>
                <li><Link to="/terms" className="text-blue-600 hover:underline">Terms of Service →</Link></li>
                <li><Link to="/refund-policy" className="text-blue-600 hover:underline">Refund Policy →</Link></li>
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Message sent!</h2>
                <p className="text-gray-500 max-w-xs">
                  Thanks for reaching out. We'll get back to you at <strong>{form.email || 'your email'}</strong> within 2 business days.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Your Name" error={errors.name}>
                    <input
                      type="text"
                      placeholder="Arjun Mehta"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className={inputCls(errors.name)}
                    />
                  </Field>
                  <Field label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className={inputCls(errors.email)}
                    />
                  </Field>
                </div>

                <Field label="Subject" error={errors.subject}>
                  <input
                    type="text"
                    placeholder="e.g. Feature request — CSV import"
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    className={inputCls(errors.subject)}
                  />
                </Field>

                <Field label="Message" error={errors.message}>
                  <textarea
                    rows={6}
                    placeholder="Describe your question or feedback in detail…"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className={`${inputCls(errors.message)} resize-none`}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/3000</p>
                </Field>

                {status === 'error' && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
                <p className="text-xs text-center text-gray-400">
                  We respect your privacy. Your information will never be shared with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} FinanceTracker. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="/support" className="hover:text-gray-300 transition-colors">Support</Link>
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-gray-300 transition-colors">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function inputCls(error?: string) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-300 bg-red-50 focus:ring-red-200'
      : 'border-gray-200 bg-white focus:ring-blue-100 focus:border-blue-400'
  }`
}
