'use client';

import { useState } from 'react';
import { Play, Pause, ShieldCheck, CheckCircle2, Camera, QrCode, FileText, Sparkles, X } from 'lucide-react';

export default function DemoVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 p-3 sm:p-5 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
      {/* Video Screen Window */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-850 flex flex-col justify-between p-6 select-none">
        
        {/* Top Video Header Overlay */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-neutral-800">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-bold text-neutral-200">TurnProofs Live Workflow Demo</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { step: 1, label: '0:15 QR Scan' },
              { step: 2, label: '0:35 Room Check' },
              { step: 3, label: '0:55 PDF Report' }
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step as 1 | 2 | 3)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                  activeStep === s.step
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Screen Content Simulation */}
        <div className="my-auto py-4 relative z-10">
          {activeStep === 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-24 w-24 rounded-2xl bg-neutral-900 border border-rose-500/30 p-3 flex flex-col items-center justify-center shadow-lg shadow-rose-500/10">
                <QrCode className="h-12 w-12 text-rose-400 mb-1" />
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Door Sign QR</span>
              </div>
              <div className="max-w-md space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase">Step 1: 0-App Check-In</span>
                <h4 className="text-xl font-extrabold text-white">Cleaner Scans Door QR or Taps Link</h4>
                <p className="text-xs text-neutral-400">No app store download or cleaner password needed. Launches instant mobile terminal on any phone camera.</p>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="max-w-md mx-auto space-y-3 animate-fadeIn">
              <div className="text-center">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[10px] font-extrabold uppercase">Step 2: Room Accordions</span>
                <h4 className="text-base font-extrabold text-white mt-1">Rooms Turn from RED to GREEN</h4>
              </div>
              
              {/* Room 1: Incomplete Red Card */}
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-neutral-200">Top Floor Bedroom 1</span>
                </div>
                <span className="text-[10px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">🔴 2/4 Tasks Done</span>
              </div>

              {/* Room 2: Completed Green Card */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-200">Kitchen & Dining</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">🟢 Completed</span>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-24 w-20 rounded-xl bg-neutral-900 border border-emerald-500/50 p-3 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
                <FileText className="h-10 w-10 text-emerald-400 mb-1" />
                <span className="text-[9px] font-bold text-neutral-400 uppercase">PDF Audit</span>
              </div>
              <div className="max-w-md space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">Step 3: Auto-Email Certificate</span>
                <h4 className="text-xl font-extrabold text-white">Dispute-Proof PDF Delivered to Host</h4>
                <p className="text-xs text-neutral-400">Includes GPS location verification, time-stamps, room photo grid, and single-click public URL for Airbnb support.</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Play Controls Bar Overlay */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-850 z-10 bg-neutral-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveStep(prev => prev === 3 ? 1 : (prev + 1) as 1 | 2 | 3);
              }}
              className="h-9 w-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </button>
            <div>
              <p className="text-xs font-bold text-neutral-200">Interactive Walkthrough Demo</p>
              <p className="text-[10px] text-neutral-500">Click steps above or play button to tour features</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 font-bold">0:60 Full Tour</span>
          </div>
        </div>
      </div>

      {/* Video Highlights Footer */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-850 text-center sm:text-left px-2">
        <div 
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${activeStep === 1 ? 'border-rose-500/50 bg-rose-500/5' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-extrabold text-xs shrink-0">
              0:15
            </div>
            <div>
              <p className="text-xs font-bold text-white">0-App Cleaner Check-in</p>
              <p className="text-[11px] text-neutral-500">Scan QR code or tap link</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${activeStep === 2 ? 'border-orange-500/50 bg-orange-500/5' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-extrabold text-xs shrink-0">
              0:35
            </div>
            <div>
              <p className="text-xs font-bold text-white">Room Accordion Audits</p>
              <p className="text-[11px] text-neutral-500">Rooms turn RED ➔ GREEN</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${activeStep === 3 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-xs shrink-0">
              0:55
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dispute PDF Certificates</p>
              <p className="text-[11px] text-neutral-500">Instant PDF & GPS log email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
