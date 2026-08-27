'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProperty, setHasProperty] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadData() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (res.ok && data.success && data.host) {
          setHost(data.host);
          
          // Check if host already has properties
          const propRes = await fetch('/api/properties');
          const propData = await propRes.json();
          if (propData.success && propData.properties?.length > 0) {
            setHasProperty(true);
          }
        } else {
          // Not logged in -> redirect to login
          router.push('/login');
        }
      } catch (e) {
        console.error('Failed loading welcome page auth data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Calculate 14-day trial expiration date
  const createdDate = host?.created_at ? new Date(host.created_at) : new Date();
  const trialEndDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const formattedTrialEnd = trialEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const hostDisplayName = host?.business_name
    ? host.business_name.replace(/['’]s Properties$/i, '').trim()
    : 'there';

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white flex flex-col items-center justify-start py-12 px-4 sm:px-6 relative select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl space-y-10">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-[#FF4F2B] to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-orange-500/20">
            T
          </div>
          <span className="font-black text-xl text-white tracking-tight">TurnProofs</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            You&apos;re set up, {hostDisplayName || 'there'}.
          </h1>
          <p className="text-base text-neutral-400 leading-relaxed max-w-xl">
            Everything&apos;s unlocked. The fastest way to see whether this is useful is to run it on one real turnover, so here&apos;s the shortest path there.
          </p>

          {/* Trial Status Pill Badge */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span>14-day trial, no card. Ends {formattedTrialEnd}.</span>
            </div>
          </div>
        </div>

        {/* Three Things To Do First */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Three things to do first
          </h3>

          <div className="space-y-3.5">
            {/* Step 1: Add Property */}
            <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition-all space-y-2">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {hasProperty ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-neutral-700 bg-neutral-950" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Add your first property</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Name and address. Takes about thirty seconds.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard?action=add-property"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <span>Add property</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Build a checklist */}
            <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition-all space-y-2">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  <div className="h-6 w-6 rounded-full border-2 border-neutral-700 bg-neutral-950" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Build a checklist</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Start from a standard turnover template and edit what doesn&apos;t fit. English and Spanish both come built in.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard?tab=checklists"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <span>Open checklists</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Send QR code to cleaner */}
            <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition-all space-y-2">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  <div className="h-6 w-6 rounded-full border-2 border-neutral-700 bg-neutral-950" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Send the QR code to your cleaner</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    They scan it at the door. Nothing to install and no login on their end.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard?tab=properties"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <span>Get the code</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-neutral-900 pt-8">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Want me to set the first property up for you? Reply to the welcome email or write to{' '}
            <a
              href="mailto:support@turnproofs.com"
              className="text-neutral-200 font-semibold underline hover:text-white transition-colors"
            >
              support@turnproofs.com
            </a>{' '}
            and I&apos;ll do it and send it back ready to go.
          </p>
        </div>

      </div>
    </div>
  );
}
