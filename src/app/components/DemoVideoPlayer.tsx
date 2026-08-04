'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, QrCode, FileText, CheckCircle2, RotateCcw, AlertCircle, Users, ArrowUp, ArrowDown, Camera } from 'lucide-react';

export default function DemoVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [progress, setProgress] = useState(0);

  // Animated video playback timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 1;
          if (next > 83) setActiveStep(6);
          else if (next > 66) setActiveStep(5);
          else if (next > 49) setActiveStep(4);
          else if (next > 33) setActiveStep(3);
          else if (next > 16) setActiveStep(2);
          else setActiveStep(1);
          return next;
        });
      }, 140);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleStepClick = (step: 1 | 2 | 3 | 4 | 5 | 6) => {
    setActiveStep(step);
    setIsPlaying(false);
    if (step === 1) setProgress(10);
    if (step === 2) setProgress(25);
    if (step === 3) setProgress(42);
    if (step === 4) setProgress(58);
    if (step === 5) setProgress(75);
    if (step === 6) setProgress(92);
  };

  const handlePlayToggle = () => {
    if (progress >= 100) {
      setProgress(0);
      setActiveStep(1);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 p-3 sm:p-5 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
      {/* Video Screen Window */}
      <div className="min-h-[320px] sm:min-h-[380px] w-full rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-850 flex flex-col justify-between p-4 sm:p-6 select-none">
        
        {/* Top Header Status Badge */}
        <div className="flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-neutral-800">
            <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-200">
              {isPlaying ? '▶ Auto-Touring Features...' : `Step ${activeStep}/6 Feature Tour`}
            </span>
          </div>

          <span className="text-[10px] font-mono font-extrabold text-neutral-400 bg-neutral-900/90 px-2.5 py-1 rounded-full border border-neutral-800">
            {activeStep === 1 && '0:15'}
            {activeStep === 2 && '0:25'}
            {activeStep === 3 && '0:35'}
            {activeStep === 4 && '0:45'}
            {activeStep === 5 && '0:55'}
            {activeStep === 6 && '1:05'}
          </span>
        </div>

        {/* Video Screen Content Simulation */}
        <div className="my-auto py-2 relative z-10">
          {!isPlaying && (
            <div 
              onClick={handlePlayToggle}
              className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
            >
              <div className="h-14 w-14 sm:h-18 sm:w-18 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-2xl shadow-rose-500/50 border-2 border-white/20 backdrop-blur-md">
                <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Step 1: QR Check-in */}
          {activeStep === 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-neutral-900 border border-rose-500/30 p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
                <QrCode className="h-8 w-8 sm:h-12 sm:w-12 text-rose-400 mb-0.5 sm:mb-1 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase">Door QR</span>
              </div>
              <div className="max-w-md space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 1: 0-App Check-In</span>
                <h4 className="text-sm sm:text-xl font-extrabold text-white">Scan Door QR or Tap Link</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 leading-snug">No app download or cleaner password required. Launches instant mobile terminal with GPS timestamp verification.</p>
              </div>
            </div>
          )}

          {/* Step 2: Priority #1 Walkthrough & Damage Alerts */}
          {activeStep === 2 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-red-950/40 border border-red-500/60 p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mb-0.5 sm:mb-1 animate-bounce" />
                <span className="text-[8px] sm:text-[9px] font-bold text-red-300 uppercase">Red Flag</span>
              </div>
              <div className="max-w-md space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 2: Instant Damage Alerts</span>
                <h4 className="text-sm sm:text-xl font-extrabold text-white">Urgent Alerts Sent to Host BEFORE Checkout</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 leading-snug">Cleaners inspect property first. 1-tap dispatch emails damage photos or guest lost items to host before cleaning starts.</p>
              </div>
            </div>
          )}

          {/* Step 3: Rearrange Rooms & RED to GREEN Accordions */}
          {activeStep === 3 && (
            <div className="max-w-md mx-auto space-y-2 animate-fadeIn">
              <div className="text-center">
                <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 3: Move Rooms & RED ➔ GREEN</span>
                <h4 className="text-xs sm:text-base font-extrabold text-white mt-0.5">Rooms Reorder & Turn BRIGHT GREEN</h4>
              </div>
              
              {/* Room 1: Incomplete Red Card */}
              <div className="p-2 sm:p-3 rounded-xl bg-red-950/40 border border-red-500/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <ArrowUp className="h-2.5 w-2.5 text-neutral-400" />
                    <ArrowDown className="h-2.5 w-2.5 text-neutral-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-200">1. Master Bedroom 101</span>
                </div>
                <span className="text-[8px] sm:text-[10px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">🔴 2/4 Done</span>
              </div>

              {/* Room 2: Completed Green Card */}
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <ArrowUp className="h-2.5 w-2.5 text-neutral-400" />
                    <ArrowDown className="h-2.5 w-2.5 text-neutral-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-200">2. Kitchen & Dining</span>
                </div>
                <span className="text-[8px] sm:text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  <span>🟢 Completed</span>
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Add Cleaner & Share to Team Members */}
          {activeStep === 4 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-blue-950/40 border border-blue-500/50 p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400 mb-0.5 sm:mb-1" />
                <span className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase">Team Clean</span>
              </div>
              <div className="max-w-md space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 4: Collaborative Team Link</span>
                <h4 className="text-sm sm:text-xl font-extrabold text-white">Share Live Clean Link to Team</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 leading-snug">Hosts assign cleaners or share live session link so multiple cleaners check off different rooms in real time.</p>
              </div>
            </div>
          )}

          {/* Step 5: Quality Control Retouch Addendum */}
          {activeStep === 5 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-amber-950/40 border border-amber-500/50 p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 mb-0.5 sm:mb-1" />
                <span className="text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase">QC Retouch</span>
              </div>
              <div className="max-w-md space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 5: Quality Control Retouch</span>
                <h4 className="text-sm sm:text-xl font-extrabold text-white">Upload Retouch Fix Proof Anytime</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 leading-snug">If a host requests a fix, the cleaner uploads fix photo proof. Appends a verified Quality Control Addendum to certificate!</p>
              </div>
            </div>
          )}

          {/* Step 6: Dispute-Proof PDF Certificate */}
          {activeStep === 6 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left animate-fadeIn">
              <div className="h-16 w-14 sm:h-24 sm:w-20 rounded-xl bg-neutral-900 border border-emerald-500/50 p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                <FileText className="h-7 w-7 sm:h-10 sm:w-10 text-emerald-400 mb-0.5 sm:mb-1" />
                <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase">PDF Audit</span>
              </div>
              <div className="max-w-md space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 6: Professional PDF Certificate</span>
                <h4 className="text-sm sm:text-xl font-extrabold text-white">Audit-Ready PDF Delivered to Host</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 leading-snug">Auto-generates professional compliance record with GPS coordinates, time-stamps, room photo grid, and verification link.</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Play Bar */}
        <div className="space-y-1.5 z-10 pt-1.5 border-t border-neutral-850 bg-neutral-950/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-xl">
          {/* Progress Bar Scrubber */}
          <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-linear-to-r from-rose-500 to-orange-500 h-full transition-all duration-150 ease-linear rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayToggle}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-white" />
                ) : progress >= 100 ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-neutral-200">
                  {isPlaying ? `Step ${activeStep}/6 Playing...` : 'Click Play (▶) to Tour All 6 Features'}
                </p>
                <p className="text-[9px] sm:text-[10px] text-neutral-500">Auto-tours check-in, alerts, room ordering, team link, retouches, & PDF</p>
              </div>
            </div>

            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 font-bold bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
              {Math.floor((progress / 100) * 90)}s / 90s
            </span>
          </div>
        </div>
      </div>

      {/* 6 Feature Cards Grid Footer (Single Interactive Step Selector) */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center sm:text-left">
        <div 
          onClick={() => handleStepClick(1)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 1 ? 'border-rose-500/60 bg-rose-500/15 shadow-md shadow-rose-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-rose-400">1. QR Check-In</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">0-App scan</p>
        </div>

        <div 
          onClick={() => handleStepClick(2)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 2 ? 'border-red-500/60 bg-red-500/15 shadow-md shadow-red-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-red-400">2. Urgent Alerts</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">Damage email</p>
        </div>

        <div 
          onClick={() => handleStepClick(3)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 3 ? 'border-orange-500/60 bg-orange-500/15 shadow-md shadow-orange-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-orange-400">3. Move Rooms</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">RED ➔ GREEN</p>
        </div>

        <div 
          onClick={() => handleStepClick(4)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 4 ? 'border-blue-500/60 bg-blue-500/15 shadow-md shadow-blue-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-blue-400">4. Team Invite</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">Share clean link</p>
        </div>

        <div 
          onClick={() => handleStepClick(5)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 5 ? 'border-amber-500/60 bg-amber-500/15 shadow-md shadow-amber-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-amber-400">5. QC Retouch</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">Fix photo proof</p>
        </div>

        <div 
          onClick={() => handleStepClick(6)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${activeStep === 6 ? 'border-emerald-500/60 bg-emerald-500/15 shadow-md shadow-emerald-500/10' : 'border-neutral-850 bg-neutral-950/60 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-emerald-400">6. PDF Audit</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">Audit-ready PDF</p>
        </div>
      </div>
    </div>
  );
}
