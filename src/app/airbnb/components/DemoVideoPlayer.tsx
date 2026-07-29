'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, QrCode, FileText, CheckCircle2, RotateCcw, AlertCircle, Users, ArrowUp, ArrowDown, Camera, ShieldCheck } from 'lucide-react';

export default function DemoVideoPlayer() {
  const [videoMode, setVideoMode] = useState<'interactive' | 'video'>('interactive');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animated video playback timer loop for interactive mode
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && videoMode === 'interactive') {
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
  }, [isPlaying, videoMode]);

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
    if (videoMode === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (progress >= 100) {
      setProgress(0);
      setActiveStep(1);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 p-2.5 sm:p-5 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
      {/* Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">TurnProofs 6-Step Feature Tour</span>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
          <button
            type="button"
            onClick={() => { setVideoMode('interactive'); setIsPlaying(false); }}
            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
              videoMode === 'interactive' ? 'bg-rose-500 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            📱 Interactive Tour (6 Steps)
          </button>
          <button
            type="button"
            onClick={() => { setVideoMode('video'); setIsPlaying(false); }}
            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
              videoMode === 'video' ? 'bg-rose-500 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎥 MP4 Video
          </button>
        </div>
      </div>

      {/* Video Screen Window */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-850 flex flex-col justify-between p-3.5 sm:p-6 select-none">
        
        {videoMode === 'video' ? (
          /* Real HTML5 Video Player Mode (Like getcleanproof.com) */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-xl"
              controls
              playsInline
              muted
              poster="/demo_video_poster.jpg"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/turnproofs_demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          /* 6-Step Interactive Animated Video Tour Mode */
          <>
            {/* Top Video Header Overlay */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10 w-full">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-neutral-800">
                <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                <span className="text-[10px] sm:text-[11px] font-bold text-neutral-200">
                  {isPlaying ? '▶ Auto-Touring Features...' : 'Interactive Showcase'}
                </span>
              </div>

              {/* 6 Step Selector Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto">
                {[
                  { step: 1, label: '1. QR Check-in' },
                  { step: 2, label: '2. Urgent Alerts' },
                  { step: 3, label: '3. Move Rooms' },
                  { step: 4, label: '4. Team Invite' },
                  { step: 5, label: '5. QC Retouch' },
                  { step: 6, label: '6. PDF Audit' }
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => handleStepClick(s.step as any)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeStep === s.step
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105'
                        : 'bg-neutral-900/90 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Screen Content Simulation */}
            <div className="my-auto py-3 relative z-10">
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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left animate-fadeIn">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-neutral-900 border border-rose-500/30 p-2.5 flex flex-col items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
                    <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 mb-1 animate-pulse" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase">Door QR Code</span>
                  </div>
                  <div className="max-w-md space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 1: 0-App Check-In</span>
                    <h4 className="text-base sm:text-xl font-extrabold text-white">Scan Door QR or Tap Link</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">No app store download or cleaner password needed. Launches instant mobile terminal with GPS timestamp verification.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Priority #1 Walkthrough & Damage Alerts */}
              {activeStep === 2 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left animate-fadeIn">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-red-950/40 border border-red-500/60 p-2.5 flex flex-col items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
                    <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mb-1 animate-bounce" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-red-300 uppercase">Red Flag Alert</span>
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 2: Instant Damage & Lost/Found Alerts</span>
                    <h4 className="text-base sm:text-xl font-extrabold text-white">Urgent Alerts Sent to Host BEFORE Checkout</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">Cleaners inspect property first. 1-tap dispatch emails damage photos or guest lost items to host before cleaning starts.</p>
                  </div>
                </div>
              )}

              {/* Step 3: Rearrange Rooms & RED to GREEN Accordions */}
              {activeStep === 3 && (
                <div className="max-w-md mx-auto space-y-2.5 animate-fadeIn">
                  <div className="text-center">
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 3: Move Rooms & RED ➔ GREEN Accordions</span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">Host Drag/Reorders Rooms; Rooms Turn BRIGHT GREEN</h4>
                  </div>
                  
                  {/* Room 1: Incomplete Red Card */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-red-950/40 border border-red-500/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <ArrowUp className="h-3 w-3 text-neutral-400" />
                        <ArrowDown className="h-3 w-3 text-neutral-400" />
                      </div>
                      <span className="text-xs font-bold text-neutral-200">1. Top Floor Master Bedroom</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">🔴 2/4 Tasks Done</span>
                  </div>

                  {/* Room 2: Completed Green Card */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <ArrowUp className="h-3 w-3 text-neutral-400" />
                        <ArrowDown className="h-3 w-3 text-neutral-400" />
                      </div>
                      <span className="text-xs font-bold text-neutral-200">2. Kitchen & Dining</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>🟢 Completed</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Step 4: Add Cleaner & Share to Team Members */}
              {activeStep === 4 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left animate-fadeIn">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-blue-950/40 border border-blue-500/50 p-2.5 flex flex-col items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mb-1" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase">Team Cleaning</span>
                  </div>
                  <div className="max-w-md space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 4: Add Cleaners & Share Session Link</span>
                    <h4 className="text-base sm:text-xl font-extrabold text-white">Collaborative Team Cleaning</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">Hosts assign dedicated cleaners or team members. Share live clean link so multiple cleaners tackle different rooms in real time.</p>
                  </div>
                </div>
              )}

              {/* Step 5: Quality Control Retouch Addendum */}
              {activeStep === 5 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left animate-fadeIn">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-amber-950/40 border border-amber-500/50 p-2.5 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                    <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-amber-400 mb-1" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase">QC Resolution</span>
                  </div>
                  <div className="max-w-md space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 5: Quality Control Retouch & Fix Proof</span>
                    <h4 className="text-base sm:text-xl font-extrabold text-white">Upload Retouch Fix Photos Anytime</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">If a host requests a minor fix, the cleaner uploads fix photo proof. Appends a verified Quality Control Addendum to the certificate!</p>
                  </div>
                </div>
              )}

              {/* Step 6: Dispute-Proof PDF Certificate */}
              {activeStep === 6 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left animate-fadeIn">
                  <div className="h-20 w-16 sm:h-24 sm:w-20 rounded-xl bg-neutral-900 border border-emerald-500/50 p-2.5 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                    <FileText className="h-9 w-9 sm:h-10 sm:w-10 text-emerald-400 mb-1" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase">PDF Audit</span>
                  </div>
                  <div className="max-w-md space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-extrabold uppercase">Step 6: Dispute-Proof PDF Certificate</span>
                    <h4 className="text-base sm:text-xl font-extrabold text-white">Dispute-Proof PDF Delivered to Host</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">Auto-generates official compliance record with GPS coordinates, time-stamps, room photo grid, and single-click public URL for Airbnb support.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Scrubber & Play Bar */}
            <div className="space-y-2 z-10 pt-2 border-t border-neutral-850 bg-neutral-950/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl">
              {/* Progress Bar Scrubber */}
              <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-linear-to-r from-rose-500 to-orange-500 h-full transition-all duration-150 ease-linear rounded-full" 
                  style={{ width: `${progress}%` }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handlePlayToggle}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : progress >= 100 ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    )}
                  </button>
                  <div>
                    <p className="text-xs font-bold text-neutral-200">
                      {isPlaying ? `Step ${activeStep}/6 Tour Playing...` : 'Click Play (▶) to Tour All 6 Features'}
                    </p>
                    <p className="text-[10px] text-neutral-500">Auto-tours check-in, alerts, room ordering, team link, retouches, & PDF export</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-neutral-400 font-bold bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                  {Math.floor((progress / 100) * 90)}s / 90s
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 6 Feature Cards Grid Footer */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-neutral-850 text-center sm:text-left">
        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(1); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 1 && videoMode === 'interactive' ? 'border-rose-500/50 bg-rose-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-rose-400">1. QR Check-In</p>
          <p className="text-[9px] text-neutral-500 truncate">0-App scan</p>
        </div>

        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(2); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 2 && videoMode === 'interactive' ? 'border-red-500/50 bg-red-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-red-400">2. Urgent Alerts</p>
          <p className="text-[9px] text-neutral-500 truncate">Damage email</p>
        </div>

        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(3); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 3 && videoMode === 'interactive' ? 'border-orange-500/50 bg-orange-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-orange-400">3. Move Rooms</p>
          <p className="text-[9px] text-neutral-500 truncate">RED ➔ GREEN</p>
        </div>

        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(4); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 4 && videoMode === 'interactive' ? 'border-blue-500/50 bg-blue-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-blue-400">4. Team Invite</p>
          <p className="text-[9px] text-neutral-500 truncate">Share clean link</p>
        </div>

        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(5); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 5 && videoMode === 'interactive' ? 'border-amber-500/50 bg-amber-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-amber-400">5. QC Retouch</p>
          <p className="text-[9px] text-neutral-500 truncate">Fix photo proof</p>
        </div>

        <div 
          onClick={() => { setVideoMode('interactive'); handleStepClick(6); }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${activeStep === 6 && videoMode === 'interactive' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-neutral-850 bg-neutral-950/40 hover:border-neutral-750'}`}
        >
          <p className="text-[10px] font-bold text-emerald-400">6. PDF Audit</p>
          <p className="text-[9px] text-neutral-500 truncate">Dispute proof</p>
        </div>
      </div>
    </div>
  );
}
