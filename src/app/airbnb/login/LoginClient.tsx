'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, RefreshCw, KeyRound, HelpCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'email' | 'pin'>('email'); // 'email' or 'pin'
  const [resetStep, setResetStep] = useState<'none' | 'verify_code' | 'new_pin'>('none');
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Handle URL parameters (e.g. demo credentials)
  useEffect(() => {
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      setEmail('demo@turnproofs.com');
      setInfoMessage('Demo Mode: Click Continue to use demo credentials.');
    }
  }, [searchParams]);

  // Listen for physical keyboard number typing (0-9, Backspace, Delete, Escape)
  useEffect(() => {
    if (mode !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, pin, resetStep, sentCode, enteredCode, email]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setMode('pin');
    setResetStep('none');
    if (email === 'demo@turnproofs.com') {
      setPin('123456');
    }
  };

  const startForgotPin = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const res = await fetch('/api/airbnb/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          action: 'request_reset_code'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to request reset code.');
      } else {
        setResetStep('verify_code');
        setSentCode(data.verificationCode || '');
        setPin('');
        setInfoMessage(`Security code sent to ${email}! (Test Code: ${data.verificationCode})`);
      }
    } catch (err) {
      setError('Network error requesting reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newVal = pin + num;
      setPin(newVal);
      setError('');
      
      // Auto-submit when PIN reaches 6 digits
      if (newVal.length === 6) {
        if (resetStep === 'verify_code') {
          if (newVal === sentCode) {
            setEnteredCode(newVal);
            setResetStep('new_pin');
            setPin('');
            setError('');
            setInfoMessage('Security Code Verified! Enter your NEW 6-digit passcode PIN.');
          } else {
            setError('Incorrect 6-digit security code. Please check your email.');
            setPin('');
          }
        } else if (resetStep === 'new_pin') {
          submitNewPin(newVal);
        } else {
          submitAuth(newVal);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const submitAuth = async (finalPin: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/airbnb/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          pin_code: finalPin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please try again.');
        setPin(''); // Reset pin
        setLoading(false);
      } else {
        // Success
        setInfoMessage(data.isNew ? 'Welcome! Account created successfully.' : 'Welcome back!');
        setTimeout(() => {
          router.push('/airbnb/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
      setPin('');
      setLoading(false);
    }
  };

  const submitNewPin = async (newPin: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/airbnb/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          action: 'verify_reset_code',
          verification_code: enteredCode,
          new_pin: newPin
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update PIN.');
        setPin('');
      } else {
        setInfoMessage('Passcode PIN reset successfully! Signing in...');
        setTimeout(() => {
          router.push('/airbnb/dashboard');
        }, 800);
      }
    } catch (err) {
      setError('Network error updating PIN.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 relative select-none">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
        <div className="absolute -inset-0.5 bg-linear-to-tr from-rose-500/10 to-orange-500/10 rounded-3xl blur-md -z-10" />

        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-14 w-14 rounded-2xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              TurnProofs Host Portal
            </h2>
          </Link>
          <p className="text-sm text-neutral-400 mt-2 text-center">
            {mode === 'email' 
              ? 'Enter email to sign in or create an account' 
              : resetStep === 'verify_code'
              ? 'Enter 6-digit security code sent to your email'
              : resetStep === 'new_pin'
              ? 'Enter your NEW 6-digit passcode PIN'
              : 'Enter your 6-digit passcode PIN'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium">
            {infoMessage}
          </div>
        )}

        {/* Mode: Email */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 ml-1">
                Host Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-white transition-all text-base"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-base transition-all shadow-lg shadow-rose-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>PIN will be set automatically for new emails.</span>
            </div>
          </form>
        )}

        {/* Mode: PIN Code Keyboard */}
        {mode === 'pin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500">Account</span>
                <span className="text-sm font-medium truncate max-w-[220px]">{email}</span>
              </div>
              <button
                onClick={() => {
                  setMode('email');
                  setPin('');
                  setError('');
                  setResetStep('none');
                }}
                disabled={loading}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>

            {/* PIN Dots display */}
            <div className="flex justify-center gap-4 py-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-150 ${
                    i < pin.length
                      ? 'bg-rose-500 border-rose-500 scale-110 shadow-lg shadow-rose-500/30'
                      : 'border-neutral-700 bg-neutral-950'
                  }`}
                />
              ))}
            </div>

            {/* PIN Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={loading}
                  onClick={() => handleKeyPress(num)}
                  className="h-16 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 active:scale-95 transition-all text-xl font-bold flex items-center justify-center disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={loading || pin.length === 0}
                onClick={handleClear}
                className="h-16 rounded-2xl hover:bg-neutral-900 text-sm font-semibold flex items-center justify-center text-neutral-400 disabled:opacity-30 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleKeyPress('0')}
                className="h-16 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 active:scale-95 transition-all text-xl font-bold flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                disabled={loading || pin.length === 0}
                onClick={handleBackspace}
                className="h-16 rounded-2xl hover:bg-neutral-900 text-sm font-semibold flex items-center justify-center text-neutral-400 disabled:opacity-30 transition-colors"
              >
                Back
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  if (resetStep === 'none') {
                    startForgotPin();
                  } else {
                    setResetStep('none');
                    setPin('');
                    setError('');
                    setInfoMessage('');
                  }
                }}
                disabled={loading}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold transition-colors cursor-pointer"
              >
                {resetStep !== 'none' ? '← Back to Login PIN' : 'Forgot PIN? Send Security Code to Email'}
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-rose-400 text-sm font-medium animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{resetStep === 'verify_code' ? 'Sending security code...' : resetStep === 'new_pin' ? 'Updating passcode PIN...' : 'Authenticating secure passcode...'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
