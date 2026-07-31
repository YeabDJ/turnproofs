'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Scale, AlertTriangle, CreditCard, Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsOfService() {
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
            <Scale className="h-3.5 w-3.5" />
            <span>Terms & Service Contract</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-neutral-400">Last updated: July 28, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-neutral-300 text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, accessing the TurnProofs host dashboard, or using the 0-app mobile cleaner terminal, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-rose-500" />
              2. Subscriptions, Trials & Billing
            </h2>
            <p>TurnProofs operates on a portfolio-tier subscription model:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong>14-Day Free Trial:</strong> Full feature access with zero credit card required upfront ($0 charged today).</li>
              <li><strong>Pro Plan ($9.00/mo or $7.65/mo annual):</strong> Covers 1 managed property.</li>
              <li><strong>Growth Plan ($18.99/mo or $16.14/mo annual):</strong> Covers 2 to 3 managed properties.</li>
              <li><strong>Elite Plan ($29.99/mo + $4.99/unit beyond 6):</strong> Covers 4 to 6+ managed properties.</li>
              <li><strong>Commercial Plan ($89.99/mo):</strong> Dedicated commercial multi-tenant facility site tier.</li>
            </ul>
            <p>Subscriptions renew automatically unless canceled prior to the next billing cycle. All payments are non-refundable after the trial period.</p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              3. Third-Party Platform Verification & Disclaimer
            </h2>
            <p>
              TurnProofs provides independent, timestamped GPS geolocation logging and room photo compliance documentation (`/airbnb/report/[reportId]`).
            </p>
            <p>
              TurnProofs makes no representations or warranties regarding Airbnb or VRBO claim outcomes. Users accept all risk associated with submitting documentation to third-party platforms. Airbnb and VRBO make final dispute decisions independently. We provide the tools to document your compliance; hosts make all submission decisions.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-rose-500" />
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall TurnProofs, its operators, or suppliers be liable for indirect, incidental, or consequential damages resulting from lost bookings, third-party platform decisions, or temporary service unavailability. TurnProofs liability is strictly limited to the subscription fees paid by the user in the preceding 12-month period.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              5. Governing Law & Contact
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with standard business laws. Questions regarding these Terms may be directed to <a href="mailto:legal@turnproofs.com" className="text-rose-400 underline">legal@turnproofs.com</a>.
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
