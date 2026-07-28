'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, Globe, Eye } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              TurnProofs
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <Lock className="h-3.5 w-3.5" />
            <span>Legal & Privacy Standards</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-neutral-400">Last updated: July 28, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-neutral-300 text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-rose-500" />
              1. Information We Collect
            </h2>
            <p>
              TurnProofs (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting the personal data collected through our software platform. We collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong>Account Credentials:</strong> Host email addresses and 6-digit access PINs.</li>
              <li><strong>Cleaning Terminal Data:</strong> Field cleaner names, email addresses, and checklist execution timestamps.</li>
              <li><strong>GPS Geolocation Data:</strong> Geolocation coordinates captured only during active check-in and checkout actions on the cleaner mobile terminal.</li>
              <li><strong>Media & Photos:</strong> Room inspection photos uploaded by field cleaners as compliance evidence.</li>
              <li><strong>Property Details:</strong> Property names, addresses, and custom cleaning instructions.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              2. How We Use Your Data
            </h2>
            <p>Your data is strictly utilized to provide turnover verification services, including:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li>Generating immutable, timestamped PDF verification certificates (`/airbnb/report/[reportId]`).</li>
              <li>Auto-emailing sanitation reports to registered property managers and cleaners.</li>
              <li>Displaying property turnover status on the host management dashboard.</li>
              <li>Authenticating secure login sessions.</li>
            </ul>
            <p className="font-semibold text-rose-400 mt-2">
              We never sell, rent, or trade your personal data, cleaner records, or property photos to third-party advertisers.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-500" />
              3. Data Storage & Security
            </h2>
            <p>
              All property data, inspection photos, and GPS logs are stored using enterprise-grade database encryption (SSL/TLS in transit, AES-256 at rest) via Supabase cloud infrastructure.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-500" />
              4. Cookies & Tracking
            </h2>
            <p>
              TurnProofs uses strictly necessary HTTP-only authentication cookies (`airbnb_host_token`) to manage active host sessions securely. We do not use third-party tracking cookies or invasive cross-site advertising scripts.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              5. User Rights & Data Deletion
            </h2>
            <p>
              Hosts and property managers retain full rights to request the deletion of their accounts, properties, or historical audit logs at any time by contacting our support team at <a href="mailto:support@turnproofs.com" className="text-rose-400 underline">support@turnproofs.com</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TurnProofs. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
