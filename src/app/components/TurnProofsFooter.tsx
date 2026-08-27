'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, ChevronRight, ExternalLink } from 'lucide-react';

export default function TurnProofsFooter() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950/90 pt-16 pb-12 px-6 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Top Brand & Trust Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-neutral-900">
          <div className="space-y-2 max-w-md">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-[#FF4F2B] to-rose-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-orange-500/20">
                T
              </div>
              <span className="font-black text-xl text-white tracking-tight">TurnProofs</span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Automated turnover verification &amp; dispute-proof sanitation audit logs for vacation rental hosts, property managers &amp; cleaning teams.
            </p>
          </div>

          {/* Security & Verification Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 All Systems Operational</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>STR Dispute Document Compatible</span>
            </div>
          </div>
        </div>

        {/* 4-Column Navigation Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Product & Features */}
          <div className="space-y-3">
            <p className="font-extrabold text-white text-xs uppercase tracking-wider">Product &amp; Features</p>
            <ul className="space-y-2.5 font-medium text-neutral-400">
              <li>
                <Link href="/#features" className="hover:text-rose-400 transition-colors flex items-center gap-1">
                  <span>Key Features</span>
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition-colors flex items-center gap-1">
                  <span>Pricing &amp; Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/clean/demo" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>Cleaner Terminal Demo</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/report/sample-report" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>Sample Audit PDF Report</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <p className="font-extrabold text-white text-xs uppercase tracking-wider">Solutions &amp; Tiers</p>
            <ul className="space-y-2.5 font-medium text-neutral-400">
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition-colors">
                  <span>Solo Airbnb Hosts (1 Unit)</span>
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition-colors">
                  <span>Small Teams (2–3 Units)</span>
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition-colors">
                  <span>Growing Portfolios (4–6 Units)</span>
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition-colors">
                  <span>Commercial Operators (7+ Units)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Resources */}
          <div className="space-y-3">
            <p className="font-extrabold text-white text-xs uppercase tracking-wider">Support &amp; Resources</p>
            <ul className="space-y-2.5 font-medium text-neutral-400">
              <li>
                <Link href="/faq" className="hover:text-rose-400 transition-colors font-bold text-rose-300 flex items-center gap-1">
                  <span>Knowledge Base &amp; 15 FAQs</span>
                  <ChevronRight className="h-3 w-3 text-rose-400" />
                </Link>
              </li>
              <li>
                <a href="mailto:support@turnproofs.com" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>support@turnproofs.com</span>
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-400 transition-colors">
                  <span>Host Portal Sign In</span>
                </Link>
              </li>
              <li>
                <a href="https://www.facebook.com/groups/3368145073503788" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors flex items-center gap-1">
                  <span>Facebook Host Community</span>
                  <ExternalLink className="h-3 w-3 text-neutral-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div className="space-y-3">
            <p className="font-extrabold text-white text-xs uppercase tracking-wider">Legal &amp; Compliance</p>
            <ul className="space-y-2.5 font-medium text-neutral-400">
              <li>
                <Link href="/privacy" className="hover:text-rose-400 transition-colors">
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-400 transition-colors">
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/terms#disclaimer" className="hover:text-rose-400 transition-colors">
                  <span>Dispute Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2">
          <div className="flex items-center gap-2 text-white font-extrabold text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Independent Platform Notice &amp; Legal Disclaimer:</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            TurnProofs is an independent operational software tool designed for vacation rental hosts, property managers, and cleaning subcontractors. TurnProofs is not affiliated with, endorsed by, sponsored by, or partnered with Airbnb, Inc., VRBO, or Expedia Group. TurnProofs provides documentation and mobile verification tools; final guest dispute outcomes remain subject to third-party platform terms and independent review.
          </p>
        </div>

        {/* Bottom Copyright & Status Line */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[#FF4F2B] flex items-center justify-center font-black text-white text-[9px]">T</div>
            <p>© {new Date().getFullYear()} TurnProofs Systems Inc. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-neutral-300 transition-colors">FAQ</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
