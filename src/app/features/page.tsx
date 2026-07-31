'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  FileCheck2, 
  AlertTriangle, 
  RotateCcw, 
  Camera, 
  Globe, 
  Check, 
  ArrowRight,
  ChevronRight,
  Clock,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function FeaturesPage() {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-rose-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Dynamic background lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/airbnb" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              TurnProofs
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
              className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              🌐 {lang === 'en' ? 'Español' : 'English'}
            </button>
            
            <Link
              href="/airbnb/login"
              className="hidden sm:flex px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition-all"
            >
              Host Login
            </Link>

            <Link
              href="/airbnb/login"
              className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-xs font-black text-white shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{lang === 'en' ? 'Complete Feature Breakdown' : 'Desglose Completo de Funciones'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
          {lang === 'en' ? (
            <>Dispute-Proof Cleaning Verification <span className="bg-linear-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">Engine</span></>
          ) : (
            <>Sistema de Verificación de Limpieza <span className="bg-linear-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">Incorruptible</span></>
          )}
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          {lang === 'en' 
            ? 'Everything short-term rental hosts and facility managers need to defeat guest cleanliness refund claims, streamline cleaner turnovers, and log verified proof of property condition.'
            : 'Todo lo que los anfitriones de alquiler a corto plazo y administradores de propiedades necesitan para vencer los reclamos falsos de limpieza y agilizar las rotaciones.'
          }
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/airbnb/clean/demo"
            target="_blank"
            className="px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 font-extrabold text-sm text-neutral-200 hover:text-white transition-all flex items-center gap-2"
          >
            <span>📱 Try Public Cleaner Demo</span>
            <ExternalLink className="h-4 w-4 text-rose-400" />
          </Link>
          <Link
            href="/airbnb/login"
            className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-extrabold text-sm text-white shadow-xl shadow-rose-500/20 transition-all flex items-center gap-2"
          >
            <span>Start 14-Day Free Trial ($0)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Grid of 7 Core Features */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1: 0-App Mobile Cleaner Terminal */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">0-App Mobile Cleaner Terminal</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero app downloads or account logins required for cleaners. Cleaners simply scan a door QR code or tap a 1-click magic link sent via text/email to open their interactive mobile checklist.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Works on iOS & Android Web Browsers</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Door QR Code Printable Badges</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 1-Click SMS / WhatsApp Share Links</li>
            </ul>
          </div>

          {/* Feature 2: GPS Location & Pace Logging */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">GPS Verification & Time Audit</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically logs check-in and check-out timestamps along with exact GPS coordinates mapped to target property location. Proves cleaner presence on-site before guest arrival.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Verified Geolocation Coordinates</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 🗺️ Interactive "View on Maps" Buttons</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Active Clean Duration Minutes Tracker</li>
            </ul>
          </div>

          {/* Feature 3: AirCover PDF Certificate */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">AirCover Dispute-Proof PDF Certificate</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Generates a cryptographically signed, timestamped PDF audit certificate after each turnover. Formatted specifically to submit directly to Airbnb Support & VRBO resolution centers.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Shareable Verification Link & QR Code</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> High-Res Photo Evidence Gallery</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Clickable Image Links in PDF Export</li>
            </ul>
          </div>

          {/* Feature 4: Real-time Damage Alerts */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Instant Urgent Alerts & Lost/Found</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cleaners dispatch instant email notifications to hosts for property damage, broken items, or guest belongings found during initial walkthrough inspection before turnover starts.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 🚨 Red Flag Property Damage Alerts</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 🎒 Guest Lost & Found Image Alerts</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Automated Host Email Dispatch</li>
            </ul>
          </div>

          {/* Feature 5: Before/After Touch-Up Images */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Before / After Touch-Up Fix Proofs</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Host flags specific items needing a touch-up with optional "BEFORE" photos. Cleaner submits "AFTER" fix photos, creating a side-by-side comparison card on the PDF certificate.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 🔴 Host "BEFORE" Issue Photo Proof</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 🟢 Cleaner "AFTER" Resolution Photo</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Side-by-Side Comparison PDF Card</li>
            </ul>
          </div>

          {/* Feature 6: Standard Setup Reference Images */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Host Setup Standard Reference Photos</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hosts attach ideal setup reference photos to checklist tasks (e.g. hospital corners on beds, towel folds). Cleaners preview host reference guides directly on their smartphone.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300 border-t border-neutral-850 pt-4">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> ⭐ Host Setup Standard Photos</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 📷 View Reference Button in Terminal</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Full-Screen Setup Guide Modal</li>
            </ul>
          </div>

        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="p-10 rounded-3xl bg-linear-to-r from-rose-950/60 via-neutral-900 to-orange-950/60 border border-rose-500/30 space-y-6 relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Protect Your Vacation Rentals Today
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm max-w-xl mx-auto">
            Join hundreds of hosts who strengthen their cleanliness claims and automate cleaner turnovers with TurnProofs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/airbnb/login"
              className="px-8 py-4 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-black text-sm text-white shadow-xl shadow-rose-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start 14-Day Free Trial ($0)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 text-center text-xs text-neutral-500 space-y-6">
        <div className="max-w-3xl mx-auto space-y-2 text-[10px] text-neutral-500 leading-relaxed border-b border-neutral-900 pb-6">
          <p className="font-semibold text-neutral-400">⚖️ Legal Disclaimer & Notice:</p>
          <p>
            TurnProofs provides documentation and mobile verification tools to help hosts document property cleaning and turnover compliance. TurnProofs is an independent software tool and is not affiliated with, endorsed by, or sponsored by Airbnb, Inc. or VRBO. TurnProofs does not guarantee Airbnb or VRBO claim outcomes. Airbnb and VRBO make final dispute decisions independently. Hosts are solely responsible for downloading, archiving, and submitting documentation to third-party platforms.
          </p>
        </div>
        <p>© TurnProofs Systems. Professional Cleaning Verification & Compliance Engine.</p>
        <div className="flex justify-center gap-4 text-[11px] text-neutral-400">
          <Link href="/airbnb" className="hover:text-white">Home</Link>
          <span>•</span>
          <Link href="/features" className="hover:text-white">Features</Link>
          <span>•</span>
          <Link href="/airbnb/login" className="hover:text-white">Host Login</Link>
        </div>
      </footer>
    </div>
  );
}
