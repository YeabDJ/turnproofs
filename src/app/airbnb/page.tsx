'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Camera, FileText, CheckCircle2, ChevronRight, Sparkles, Check, ChevronDown, HelpCircle, ExternalLink } from 'lucide-react';
import DemoVideoPlayer from './components/DemoVideoPlayer';

export default function AirbnbLanding() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [authHost, setAuthHost] = useState<any>(null);
  const [calcUnits, setCalcUnits] = useState(3);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const calcPrice = calcUnits === 1 
    ? (isAnnual ? '$7.65' : '$9.00') 
    : calcUnits <= 3 
    ? (isAnnual ? '$16.14' : '$18.99') 
    : calcUnits <= 6 
    ? (isAnnual ? '$25.49' : '$29.99') 
    : (isAnnual ? `$${((29.99 + (calcUnits - 6) * 4.99) * 0.85).toFixed(2)}` : `$${(29.99 + (calcUnits - 6) * 4.99).toFixed(2)}`);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function checkAuth() {
      try {
        const res = await fetch('/api/airbnb/auth');
        const data = await res.json();
        if (res.ok && data.success && data.host) {
          setAuthHost(data.host);
        }
      } catch (e) {}
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              TurnProofs
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <button 
              type="button"
              onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <Link 
              href="/features"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </Link>
            <button 
              type="button"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <Link 
              href="/faq"
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {authHost ? (
              <Link 
                href="/airbnb/dashboard" 
                className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Dashboard ({authHost.email})</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/airbnb/login" 
                  className="text-sm font-medium hover:text-rose-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/airbnb/login"
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-sm font-semibold transition-all shadow-md shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.02]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-rose-400 mb-8 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Ultimate Airbnb Dispute Resolution Tool</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-linear-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
          Dispute-Proof Cleaning Proofs For Short-Term Rentals
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Verify checklists, track cleaner GPS coordinates, collect photo proofs, and export beautiful PDF certificates to resolve guest cleanliness claims instantly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/airbnb/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-lg transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/50 hover:scale-[1.03] flex items-center justify-center gap-2 group"
          >
            <span>Sign In to Dashboard</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/airbnb/clean/demo"
            target="_blank"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Try Cleaner Demo</span>
            <ExternalLink className="h-4 w-4 text-rose-400" />
          </Link>
        </div>

        {/* Dashboard Preview Box */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-md shadow-2xl">
          <div className="absolute -inset-0.5 bg-linear-to-r from-rose-500/20 to-orange-500/20 rounded-2xl blur-md -z-10" />
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-800">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="text-xs text-neutral-500 ml-2 font-mono">turnproofs-dashboard-mockup.dmg</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="p-5 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
              <span className="text-xs font-semibold text-rose-400 tracking-wider uppercase block mb-1">Step 1: Assign Checklists</span>
              <h4 className="font-bold text-lg text-white mb-2">Build Detailed Checklists</h4>
              <p className="text-sm text-neutral-400">Hosts create checklists. Select tasks that require high-resolution photos (e.g., making the bed, checking fridge cleaning).</p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase block mb-1">Step 2: Geolocation Check</span>
              <h4 className="font-bold text-lg text-white mb-2">Track GPS Coordinates</h4>
              <p className="text-sm text-neutral-400">Cleaners click to start/finish with zero login. The system logs exact coordinates to verify they cleaned on-site.</p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block mb-1">Step 3: Export Support Certs</span>
              <h4 className="font-bold text-lg text-white mb-2">Export Professional Reports</h4>
              <p className="text-sm text-neutral-400">Generate a branded PDF report showing timestamps, cleaner information, photo grid, and Google Maps verification link.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-neutral-900 bg-neutral-950 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Everything you need to secure your payout
          </h2>
          <p className="mt-4 text-neutral-400">
            Airbnb support requests hard evidence to deny refund requests. TurnProofs arms you with unshakeable compliance certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/50 hover:bg-neutral-900/60 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform mb-6">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">GPS Verification</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Cleaners submit start & stop locations via HTML5 Geolocation to prove exact presence on site.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-900/60 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-6">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Camera Evidence</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Require photos for high-traffic tasks. Cleaners take pictures directly on site via mobile browser camera integration.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900/60 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Official PDF Export</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Branded, printable certification reports structured specifically to submit to Airbnb Support agents.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900/60 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-6">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Zero-Install App</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              No cleaner sign-ups or app downloads. Cleaners just load the magic QR link and check off tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Host Voice / Testimonial Section */}
      <section className="py-24 border-t border-neutral-900 bg-neutral-950 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <span>⭐⭐⭐⭐⭐</span>
            <span>Trusted by 500+ Hosts Managing 10,000+ Clean Turnovers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Loved by Hosts & Professional Cleaners
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            See how TurnProofs helps solve phone storage issues, automates cleaner receipts, and protects hosts from fake refund claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-850 hover:border-rose-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-amber-400 text-xs mb-3">⭐⭐⭐⭐⭐ 5/5</div>
              <p className="text-sm text-neutral-300 italic leading-relaxed">
                "My host uses Breezeway so none of the pictures take any storage on my phone... as a cleaner this is becoming very common for hosts to ask. TurnProofs is even better because I don't have to download any app!"
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900">
              <h5 className="font-bold text-sm text-white">Monique R.</h5>
              <p className="text-xs text-rose-400 mt-0.5">Professional Cleaner • 12 Turnovers/Wk</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-850 hover:border-orange-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-amber-400 text-xs mb-3">⭐⭐⭐⭐⭐ 5/5</div>
              <p className="text-sm text-neutral-300 italic leading-relaxed">
                "We used to save photos in folders by property and check-in date on Google Drive so they're easy to retrieve if Airbnb asks. TurnProofs automatically sorts everything and generates a single-click verification URL. It saves us hours."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900">
              <h5 className="font-bold text-sm text-white">Primal Home Solutions</h5>
              <p className="text-xs text-orange-400 mt-0.5">Superhost, 4 Properties</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-850 hover:border-amber-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-amber-400 text-xs mb-3">⭐⭐⭐⭐⭐ 5/5</div>
              <p className="text-sm text-neutral-300 italic leading-relaxed">
                "I had a guest plant trash and claim a refund. Airbnb denied my review removal twice because loose screenshots in threads get rejected. Official Clean Verification Certificates with GPS plots are the only proof Support accepts."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900">
              <h5 className="font-bold text-sm text-white">Donna L.</h5>
              <p className="text-xs text-amber-400 mt-0.5">Host, Florida Coast • 3 Properties</p>
            </div>
          </div>
        </div>

        {/* Credibility & Security Badges Row */}
        <div className="mt-16 pt-8 border-t border-neutral-900/80 flex flex-wrap items-center justify-center gap-8 text-neutral-400 text-xs font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Airbnb & VRBO Dispute Compatible</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-rose-400" />
            <span>256-Bit SSL Encrypted Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Zero Long-Term Data Storage — Your Files, Your Archive</span>
          </div>
        </div>
      </section>

      {/* Video Demo Walkthrough Section */}
      <section id="workflow" className="py-20 border-t border-neutral-900 bg-neutral-950/60 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>60-Second Interactive Product Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            See How TurnProofs Works in 60 Seconds
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base">
            Watch how cleaners scan door QR codes, check off room accordions, and generate dispute-proof PDF certificates in under a minute.
          </p>
        </div>

        {/* Interactive Walkthrough Demo Video Player */}
        <DemoVideoPlayer />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-neutral-900 bg-neutral-950 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Simple, Transparent Portfolio Pricing
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base">
            No expensive per-clean fees or forced app downloads. Select the tier tailored to your property portfolio.
          </p>

          {/* Annual vs Monthly Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3 select-none">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`text-xs font-semibold cursor-pointer transition-all ${!isAnnual ? 'text-white font-bold scale-105' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing"
              className="w-14 h-7 bg-neutral-900 border border-neutral-800 rounded-full p-1 transition-colors relative cursor-pointer shrink-0"
            >
              <div className={`w-5 h-5 bg-rose-500 rounded-full transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 cursor-pointer transition-all ${isAnnual ? 'text-white font-bold scale-105' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <span className="text-xs font-semibold">Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Unit Calculator */}
        <div className="max-w-xl mx-auto mb-12 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">⚡ Interactive Pricing Calculator</p>
          <h3 className="text-xl font-extrabold text-white mb-4">How many properties do you manage?</h3>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <input
              type="range"
              min="1"
              max="25"
              value={calcUnits}
              onChange={(e) => setCalcUnits(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-sm shrink-0 min-w-[70px]">
              {calcUnits} {calcUnits === 1 ? 'Unit' : 'Units'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-semibold">Your Estimated Monthly Rate:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">{calcPrice}</span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
          </div>
        </div>

        {/* Sticky Floating Billing Switcher */}
        <div className="sticky top-20 z-40 mb-8 flex justify-center pointer-events-none">
          <div className="pointer-events-auto px-4 py-2 rounded-full bg-neutral-900/95 border border-rose-500/40 shadow-2xl backdrop-blur-md flex items-center gap-3 select-none">
            <span className="text-[11px] font-extrabold text-neutral-300">Billing Mode:</span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className={`text-xs font-extrabold transition-all ${!isAnnual ? 'text-rose-400' : 'text-neutral-400'}`}>Monthly</span>
              <div className="w-10 h-5.5 bg-neutral-950 border border-neutral-700 rounded-full p-0.5 transition-colors relative shrink-0">
                <div className={`w-4.5 h-4.5 bg-rose-500 rounded-full transition-transform ${isAnnual ? 'translate-x-4.5' : 'translate-x-0'}`} />
              </div>
              <span className={`text-xs font-extrabold transition-all ${isAnnual ? 'text-emerald-400' : 'text-neutral-400'}`}>Annual (15% OFF)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Free 14-Day Trial */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between relative group hover:border-neutral-700 transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-neutral-200">14-Day Free Trial</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">14 Days</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-white">$0</span>
                <span className="text-neutral-500 text-xs">/ 14-day free trial</span>
              </div>
              <p className="text-[10px] text-neutral-400 mb-4">Full feature access for 14 days with zero credit card required upfront.</p>
              <ul className="space-y-2.5 text-[11px] text-neutral-400 mb-6">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">14 Days No Card Required</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Card Required Day 15 to Continue</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>GPS Verification & Photo Audits</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Bilingual Terminal & Receipts</span>
                </li>
              </ul>
            </div>
            <Link
              href="/airbnb/login"
              className="w-full py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 font-bold text-[11px] text-center transition-all block cursor-pointer text-neutral-300"
            >
              Start 14-Day Free Trial ($0)
            </Link>
          </div>

          {/* Pro Plan ($9/mo for 1 Property) */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-rose-500/40 flex flex-col justify-between relative group hover:border-rose-500 transition-all shadow-lg shadow-rose-500/5">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-neutral-200">Pro</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-[9px] font-bold text-rose-400 uppercase tracking-wider">1 Property</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-white">{isAnnual ? '$7.65' : '$9.00'}</span>
                <span className="text-neutral-500 text-xs">/ month</span>
              </div>
              <p className="text-[10px] text-neutral-500 mb-4">{isAnnual ? 'Billed annually ($91.80/yr)' : 'Billed monthly'}</p>
              <ul className="space-y-2.5 text-[11px] text-neutral-400 mb-6">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">1 Managed Property</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Unlimited Cleaner Seats ($0)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Automated Cleaner Receipts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Dispute-Proof PDF Audit Logs</span>
                </li>
              </ul>
            </div>
            <Link
              href="/airbnb/login"
              className="w-full py-2 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-[11px] text-center transition-all block shadow-md shadow-rose-500/10 cursor-pointer text-white"
            >
              Get Pro Plan ($9)
            </Link>
          </div>

          {/* Growth Plan ($18.99/mo for 2-3 Properties) */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-amber-500/50 flex flex-col justify-between relative group hover:border-amber-500 transition-all shadow-lg shadow-amber-500/5">
            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-linear-to-r from-rose-500 to-amber-500 text-[8px] font-extrabold text-white uppercase tracking-wider">
              Popular
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-neutral-200">Growth</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-400 uppercase tracking-wider">2-3 Props</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-white">{isAnnual ? '$16.14' : '$18.99'}</span>
                <span className="text-neutral-500 text-xs">/ month</span>
              </div>
              <p className="text-[10px] text-neutral-500 mb-4">{isAnnual ? 'Billed annually ($193.68/yr)' : 'Billed monthly ($6.33/unit)'}</p>
              <ul className="space-y-2.5 text-[11px] text-neutral-400 mb-6">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">2 to 3 Managed Properties</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Supply Inventory Stock Alerts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Host Touch-Up Request Workflow</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Instant Damage Photo Alerts</span>
                </li>
              </ul>
            </div>
            <Link
              href="/airbnb/login"
              className="w-full py-2 rounded-xl bg-neutral-950 border border-amber-500/40 hover:border-amber-500 font-bold text-[11px] text-center transition-all block cursor-pointer text-amber-400"
            >
              Unlock Growth ($18.99)
            </Link>
          </div>

          {/* Elite Plan ($29.99/mo for 4-6 Properties) */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-purple-500/50 flex flex-col justify-between relative group hover:border-purple-500 transition-all shadow-lg shadow-purple-500/5">
            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-purple-500 text-[8px] font-extrabold text-white uppercase tracking-wider">
              Scaling
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-neutral-200">Elite</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[9px] font-bold text-purple-400 uppercase tracking-wider">4-6 Props</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold text-white">{isAnnual ? '$25.49' : '$29.99'}</span>
                <span className="text-neutral-500 text-xs">/ month</span>
              </div>
              <p className="text-[10px] text-purple-400 font-semibold mb-4">+$4.99/mo per unit beyond 6</p>
              <ul className="space-y-2.5 text-[11px] text-neutral-400 mb-6">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">4 to 6 Managed Properties</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Twilio SMS Autopilot Alerts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>HubSpot CRM Integration</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Door QR Code Sign Generator</span>
                </li>
              </ul>
            </div>
            <Link
              href="/airbnb/login"
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-[11px] text-center text-white transition-all block cursor-pointer"
            >
              Get Elite ($29.99)
            </Link>
          </div>

          {/* Commercial Facilities Tier ($89.99/mo per Building) */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-emerald-500/50 flex flex-col justify-between relative group hover:border-emerald-500 transition-all shadow-lg shadow-emerald-500/5">
            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-[8px] font-extrabold text-black uppercase tracking-wider">
              Facility
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-neutral-200">Commercial</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">1 Building</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold text-white">{isAnnual ? '$76.49' : '$89.99'}</span>
                <span className="text-neutral-500 text-xs">/ mo (1 Bldg)</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mb-4">Separate billing for multi-tenant complexes</p>
              <ul className="space-y-2.5 text-[11px] text-neutral-400 mb-6">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">1 Commercial Site / Building</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Auto-Email Facility Managers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Audit Subcontracted Cleaners</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Dedicated Compliance Support</span>
                </li>
              </ul>
            </div>
            <Link
              href="/airbnb/login"
              className="w-full py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-[11px] text-center text-black transition-all block cursor-pointer"
            >
              Get Commercial ($89.99)
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-neutral-900">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto">Everything you need to know about dispute proofing, cleaner tracking, and property audits.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Do I need a credit card to start the trial?",
              a: "No credit card is required upfront for Days 1–14. You get 14 days of full feature access with $0 charged today."
            },
            {
              q: "How does the 14-day free trial work and when do I enter my card?",
              a: "You get 14 days of full feature access with zero credit card required upfront ($0 charged today). On Day 15, simply select a plan (Pro $9/mo, Growth $18.99/mo) and enter your payment card to continue using TurnProofs."
            },
            {
              q: "How does Annual Billing work?",
              a: "Annual billing is charged as one discounted upfront payment for 12 months (saving 15%), renewing annually with zero monthly charges."
            },
            {
              q: "How does TurnProofs protect me against false guest cleanliness refund claims?",
              a: "Cleaners record timestamped high-resolution photo proofs, room-by-room checklist completions, and verified GPS check-in location coordinates before guest arrival. TurnProofs compiles these into an official PDF Audit Certificate with a shareable verification link to submit directly to Airbnb Support or VRBO resolution centers."
            },
            {
              q: "Do my cleaners need to download an app or create an account?",
              a: "Zero app downloads or logins required. Cleaners simply scan a door QR code or tap a 1-click magic link sent via text/email to open their mobile checklist in any smartphone browser."
            },
            {
              q: "Can I cancel, pause, or re-subscribe anytime?",
              a: "Yes! Zero contract lock-ins or cancellation fees. You can pause billing for 30 days with $0 charged. While paused, both your Host Dashboard and Cleaner Terminals freeze until resumed. Pause extensions are reserved for active paid subscriptions (unavailable during trial phase). You can also cancel and re-subscribe anytime in 1-click on your previous plan with zero setup fees."
            },
            {
              q: "Where is my data stored and how long do you keep it?",
              a: "TurnProofs doesn't store your photos, videos, or audit logs long-term. Instead, we send dispute-proof PDF certificates directly to your email and your cleaners' emails immediately after each turnover. You own all your files — download, share, or archive them however you want. We stay lean, you stay in control."
            },
            {
              q: "What payment methods do you accept?",
              a: "We process payments securely via Stripe accepting Visa, Mastercard, American Express, Discover, Apple Pay, and Google Pay."
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'bg-neutral-900/60 border-rose-500/40 shadow-lg shadow-rose-500/5' : 'bg-neutral-900/30 border-neutral-850 hover:border-neutral-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-rose-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-850/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All 15 FAQs Button */}
        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-rose-500/40 font-extrabold text-xs text-rose-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <span>View All 15 Frequently Asked Questions</span>
            <ChevronRight className="h-4 w-4 text-rose-400" />
          </Link>
        </div>

        {/* Support Callout Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-white">Still have questions before getting started?</h4>
            <p className="text-xs text-neutral-400">Email our host onboarding team at <a href="mailto:support@turnproofs.com" className="text-rose-400 font-bold underline">support@turnproofs.com</a> — we respond within 24–48 hours! <span className="text-neutral-500 font-medium">(Live chat coming soon)</span></p>
          </div>
          <a
            href="mailto:support@turnproofs.com"
            className="px-5 py-2.5 rounded-xl bg-neutral-950 border border-rose-500/40 hover:border-rose-500 text-xs font-bold text-rose-400 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            Email Support (24–48hr Response) &rarr;
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 bg-neutral-950 text-center text-neutral-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-rose-500" />
            <span className="font-bold text-white">TurnProofs</span>
          </div>
          <p>© {new Date().getFullYear()} TurnProofs. Built for hosts & property managers.</p>
          <div className="flex items-center gap-6 text-xs text-neutral-400 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
