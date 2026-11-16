import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Shield,
  BarChart3,
  Target,
  DollarSign,
  Clock,
  Download,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  PieChart,
  RefreshCw,
  CheckCircle2,
  Star,
  X,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { useReviews, useSubmitReview, useVoteReview } from '@/hooks/useReviews'
import type { Review } from '@/services/reviews.service'

const VOTE_KEY = 'ft_review_votes'

function getVotes(): Record<string, 'UP' | 'DOWN'> {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) ?? '{}') } catch { return {} }
}
function saveVote(id: string, type: 'UP' | 'DOWN') {
  localStorage.setItem(VOTE_KEY, JSON.stringify({ ...getVotes(), [id]: type }))
}

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              i <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ r }: { r: Review }) {
  const { mutate: vote, isPending } = useVoteReview()
  const [localVotes, setLocalVotes] = useState<Record<string, 'UP' | 'DOWN'>>(getVotes)
  const myVote = localVotes[r.id]

  function handleVote(type: 'UP' | 'DOWN') {
    if (myVote || isPending) return
    saveVote(r.id, type)
    setLocalVotes((v) => ({ ...v, [r.id]: type }))
    vote({ id: r.id, type })
  }

  return (
    <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <StarRating rating={r.rating} />
        <span className="text-xs text-gray-400">{formatTimeAgo(r.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">"{r.text}"</p>
      <div>
        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
        <p className="text-xs text-gray-400">{r.role}</p>
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400 mr-auto">Helpful?</span>
        <button
          onClick={() => handleVote('UP')}
          disabled={!!myVote || isPending}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
            myVote === 'UP'
              ? 'bg-green-50 text-green-600 font-medium'
              : 'text-gray-400 hover:bg-gray-50 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {r.helpfulCount + (myVote === 'UP' ? 0 : 0)}
        </button>
        <button
          onClick={() => handleVote('DOWN')}
          disabled={!!myVote || isPending}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
            myVote === 'DOWN'
              ? 'bg-red-50 text-red-500 font-medium'
              : 'text-gray-400 hover:bg-gray-50 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          {r.notHelpfulCount}
        </button>
      </div>
    </div>
  )
}

function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [paused, setPaused] = useState(false)
  const items = [...reviews, ...reviews]

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-5"
        style={{
          animation: `reviews-scroll 40s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          width: 'max-content',
        }}
      >
        {items.map((r, i) => <ReviewCard key={`${r.id}-${i}`} r={r} />)}
      </div>
    </div>
  )
}

function SubmitReviewModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', role: '', rating: 0, text: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const { mutate, isPending } = useSubmitReview()

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (form.role.trim().length < 2) e.role = 'Role / location required'
    if (form.rating === 0) e.rating = 'Please select a rating'
    if (form.text.trim().length < 20) e.text = 'Review must be at least 20 characters'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    mutate(
      { name: form.name, role: form.role, rating: form.rating, text: form.text },
      { onSuccess: () => setSubmitted(true) },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Thanks for your review!</h3>
            <p className="text-sm text-gray-500">
              Your review has been submitted and will appear shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-sm text-blue-600 hover:underline font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Write a Review</h2>
            <p className="text-sm text-gray-500 mb-6">Share your experience with FinanceTracker</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    placeholder="Arjun Mehta"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={inputCls(errors.name)}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Role / Location</label>
                  <input
                    type="text"
                    placeholder="Engineer, Mumbai"
                    value={form.role}
                    onChange={(e) => set('role', e.target.value)}
                    className={inputCls(errors.role)}
                  />
                  {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <StarPicker value={form.rating} onChange={(v) => set('rating', v)} />
                {errors.rating && <p className="text-xs text-red-600">{errors.rating}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Your Review</label>
                <textarea
                  rows={4}
                  placeholder="Share what you love about FinanceTracker..."
                  value={form.text}
                  onChange={(e) => set('text', e.target.value)}
                  className={`${inputCls(errors.text)} resize-none`}
                />
                <div className="flex justify-between">
                  {errors.text
                    ? <p className="text-xs text-red-600">{errors.text}</p>
                    : <span />}
                  <p className="text-xs text-gray-400">{form.text.length}/1000</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </>
        )}
      </div>
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

export function LandingPage() {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const { data: reviews = [] } = useReviews()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {showReviewModal && <SubmitReviewModal onClose={() => setShowReviewModal(false)} />}
      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Finance<span className="text-blue-600">Tracker</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
            <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
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

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4">
              Personal Finance, Simplified
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
              Know your <span className="text-blue-600">true wealth</span> at a glance.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
              Track net worth, assets, liabilities, and transactions in one place.
              No bank connections required. Just you and your data.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started Free <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Multi-currency</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> All asset types</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 100% private</span>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Window chrome */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">financetracker.app/overview</span>
              </div>
              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Net worth banner */}
                <div className="bg-blue-600 rounded-xl p-4 text-white">
                  <p className="text-xs font-medium text-blue-200 mb-0.5">Net Worth</p>
                  <p className="text-2xl font-bold">₹1,24,850</p>
                  <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1">
                    <ArrowUpRight className="w-3 h-3" /> +12.4% this year
                  </span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Total Assets</p>
                    <p className="font-bold text-gray-900">₹1,42,300</p>
                    <p className="text-xs text-green-600">8 assets</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Liabilities</p>
                    <p className="font-bold text-gray-900">₹17,450</p>
                    <p className="text-xs text-amber-600">2 loans</p>
                  </div>
                </div>
                {/* Mini chart placeholder */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Net Worth Over Time</p>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 45, 42, 55, 60, 58, 70, 75, 72, 85, 90, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-200 rounded-sm transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Mar</span><span>Jun</span><span>Sep</span><span>Feb</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Monthly savings</p>
                <p className="text-sm font-bold text-green-600">+₹2,840</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">Simple as 1-2-3</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get your net worth in under 5 minutes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                color: 'bg-blue-600',
                light: 'bg-blue-50',
                icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
                title: 'Create your account',
                desc: 'Register with email and password. Your account is ready in seconds, no credit card needed.',
              },
              {
                step: 2,
                color: 'bg-violet-600',
                light: 'bg-violet-50',
                icon: <Wallet className="w-6 h-6 text-violet-600" />,
                title: 'Add your finances',
                desc: 'Enter your bank accounts, assets, liabilities, and transactions manually or via CSV import.',
              },
              {
                step: 3,
                color: 'bg-emerald-600',
                light: 'bg-emerald-50',
                icon: <PieChart className="w-6 h-6 text-emerald-600" />,
                title: 'See your full picture',
                desc: 'Your dashboard shows net worth, allocation breakdown, income vs expenses, and goal progress instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="relative p-7 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                {/* Connector line between cards */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                    <span className="text-white font-extrabold text-base">{item.step}</span>
                  </div>
                  <div className={`flex-1 h-0.5 ${item.step < 3 ? 'bg-gray-100 hidden md:block' : 'hidden'}`} />
                </div>
                <div className={`w-10 h-10 ${item.light} rounded-xl flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              All your finances, one dashboard
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From savings accounts to real estate, income to expenses — FinanceTracker gives you the complete picture.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
                bg: 'bg-blue-50',
                title: 'Net Worth Dashboard',
                desc: 'See your total assets minus liabilities in real time. Track growth with snapshots over time.',
              },
              {
                icon: <Wallet className="w-5 h-5 text-green-600" />,
                bg: 'bg-green-50',
                title: 'Asset & Liability Tracking',
                desc: 'Add any asset — real estate, savings, investments, crypto, vehicles. Track all your debts too.',
              },
              {
                icon: <RefreshCw className="w-5 h-5 text-purple-600" />,
                bg: 'bg-purple-50',
                title: 'Transaction History',
                desc: 'Log income and expenses, categorize them, and see where your money is going every month.',
              },
              {
                icon: <DollarSign className="w-5 h-5 text-amber-600" />,
                bg: 'bg-amber-50',
                title: 'Multi-Currency Support',
                desc: 'Track assets in any currency. Live FX conversion so your net worth is always accurate.',
              },
              {
                icon: <Target className="w-5 h-5 text-rose-600" />,
                bg: 'bg-rose-50',
                title: 'Financial Goals',
                desc: 'Set goals like an emergency fund or retirement target. Monitor real progress against your timeline.',
              },
              {
                icon: <Clock className="w-5 h-5 text-cyan-600" />,
                bg: 'bg-cyan-50',
                title: 'Net Worth Snapshots',
                desc: 'Freeze your financial state at any moment. Compare changes month over month with full detail.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
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

      {/* ── Reviews ────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <style>{`
          @keyframes reviews-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">What users say</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Loved by people who take their finances seriously
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            Hover over any review to pause and read at your own pace.
          </p>
          <button
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 border border-blue-200 text-blue-600 font-medium px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4" /> Write a Review
          </button>
        </div>
        {reviews.length > 0 && <ReviewsCarousel reviews={reviews} />}
      </section>

      {/* ── Privacy ────────────────────────────────────── */}
      <section id="privacy" className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">Your data, your rules</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Privacy is not a feature.<br className="hidden sm:block" /> It's the foundation.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              FinanceTracker is built from the ground up to protect your financial privacy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="w-5 h-5 text-blue-400" />,
                title: 'No Bank Access',
                desc: 'We never connect to your bank or brokerage. You control exactly what gets entered.',
              },
              {
                icon: <DollarSign className="w-5 h-5 text-green-400" />,
                title: 'No Data Selling',
                desc: 'Your financial data is yours alone. We never sell, share, or monetize it.',
              },
              {
                icon: <Download className="w-5 h-5 text-purple-400" />,
                title: 'Full Data Export',
                desc: 'Export all your assets, liabilities, transactions, and snapshots as CSV or JSON any time.',
              },
              {
                icon: <Trash2 className="w-5 h-5 text-rose-400" />,
                title: 'Delete Any Time',
                desc: 'One click permanently deletes your account and all data. No retention, no dark patterns.',
              },
            ].map((p) => (
              <div key={p.title} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start tracking your wealth today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Free to get started. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-base"
          >
            Get Started for Free <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">Takes less than 30 seconds to sign up.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">FinanceTracker</span>
              <span className="text-gray-500 text-sm">— Privacy-first wealth tracking</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-gray-300 transition-colors">Get Started</Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800" />

          {/* Bottom row — legal links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} FinanceTracker. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="/support" className="hover:text-gray-300 transition-colors">Support</Link>
              <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-gray-300 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
