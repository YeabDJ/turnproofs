'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, RefreshCw, KeyRound, HelpCircle, Lock, CheckCircle2 } from 'lucide-react';

function DigitInputBoxes({
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus = false
}: {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleDigitChange = (index: number, digitVal: string) => {
    const cleanDigit = digitVal.replace(/\D/g, '').slice(-1);
    const pinArray = value.split('');
    // Fill or clear digit
    pinArray[index] = cleanDigit;
    const nextPin = pinArray.join('').slice(0, 6);
    onChange(nextPin);

    // Auto-advance to next input if digit entered
    if (cleanDigit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (nextPin.length === 6 && onComplete) {
      onComplete(nextPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current box empty, backspace moves focus to previous box
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    onChange(pastedData);
    if (pastedData.length === 6) {
      inputsRef.current[5]?.focus();
      if (onComplete) onComplete(pastedData);
    } else {
      inputsRef.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2.5 sm:gap-3 my-2">
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const char = value[idx] || '';
        return (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-11 h-14 sm:w-12 sm:h-14 text-center font-bold text-xl sm:text-2xl rounded-2xl border transition-all outline-none ${
              char
                ? 'bg-neutral-900 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 focus:border-rose-500/60 focus:bg-neutral-900'
            } disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Step state: 'email' | 'login_pin' | 'create_pin' | 'forgot_pin'
  const [step, setStep] = useState<'email' | 'login_pin' | 'create_pin' | 'forgot_pin'>('email');

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Forgot PIN state
  const [resetStage, setResetStage] = useState<'request' | 'verify' | 'new_pin'>('request');
  const [sentCode, setSentCode] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPin, setNewPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Check if host is already authenticated & auto-redirect to dashboard
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (res.ok && data.success && data.host) {
          router.push('/dashboard');
        }
      } catch (e) {}
    }
    checkExistingAuth();
  }, [router]);

  // Handle URL parameters (e.g. demo credentials)
  useEffect(() => {
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      setEmail('demo@turnproofs.com');
      setInfoMessage('Demo Mode: Click Continue to use demo credentials.');
    }
  }, [searchParams]);

  // Step 1: Submit Email -> Lookup if account exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to verify email address.');
      } else {
        if (data.exists) {
          // Account exists -> Ask for PIN
          setStep('login_pin');
          setPin('');
        } else {
          // New account -> Ask to create PIN
          setStep('create_pin');
          setPin('');
          setConfirmPin('');
        }
      }
    } catch (err) {
      setError('Network error checking account details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2A: Submit PIN for existing account
  const handleLoginSubmit = async (enteredPin: string) => {
    if (enteredPin.length < 6 || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          pin_code: enteredPin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed.');
        setPin('');
      } else {
        setInfoMessage('Welcome back!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err) {
      setError('Network error authenticating.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: Submit Create PIN for new account
  const handleCreateAccountSubmit = async () => {
    if (pin.length !== 6 || confirmPin.length !== 6) {
      setError('Both PIN fields must be 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          pin_code: pin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create account.');
      } else {
        // New account created successfully -> Redirect to Post-Signup Welcome Page!
        router.push('/welcome');
      }
    } catch (err) {
      setError('Network error creating account.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot PIN: Request Reset Code via Email
  const startForgotPin = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          action: 'request_reset_code'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send reset code.');
      } else {
        setStep('forgot_pin');
        setResetStage('verify');
        setSentCode(data.verificationCode || '');
        setResetCodeInput('');
        setInfoMessage(`Security code sent to ${email}. Check your inbox.`);
      }
    } catch (err) {
      setError('Network error sending reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot PIN: Submit Reset Code & New PIN
  const handleResetPinSubmit = async () => {
    if (resetCodeInput.length !== 6) {
      setError('Security code must be 6 digits.');
      return;
    }
    if (newPin.length !== 6) {
      setError('New PIN must be 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          action: 'verify_reset_code',
          verification_code: resetCodeInput,
          new_pin: newPin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset PIN.');
      } else {
        setInfoMessage('PIN reset successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err) {
      setError('Network error resetting PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-3">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-linear-to-r from-white to-neutral-200 bg-clip-text text-transparent">
              TurnProofs Host Portal
            </h2>
          </Link>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-semibold">
            {infoMessage}
          </div>
        )}

        {/* ================= STEP 1: EMAIL ONLY ================= */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
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
                  disabled={loading}
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-white transition-all text-base disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-rose-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-neutral-850 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
              <span>Enter your email to sign in or create a host account.</span>
            </div>
          </form>
        )}

        {/* ================= STEP 2A: EXISTING ACCOUNT (ENTER PIN) ================= */}
        {step === 'login_pin' && (
          <div className="space-y-6">
            {/* Email Header with Change Link */}
            <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-850">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Account</span>
                <span className="text-xs font-semibold text-white truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setPin('');
                  setError('');
                }}
                disabled={loading}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">Welcome back</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter the 6-digit PIN you created.
              </p>
            </div>

            {/* Digit Input Boxes */}
            <DigitInputBoxes
              value={pin}
              onChange={(val) => {
                setPin(val);
                setError('');
              }}
              onComplete={(completedPin) => {
                handleLoginSubmit(completedPin);
              }}
              disabled={loading}
              autoFocus
            />

            <button
              type="button"
              onClick={() => handleLoginSubmit(pin)}
              disabled={loading || pin.length < 6}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Sign In to Host Portal</span>
              )}
            </button>

            {/* Forgot PIN Flow Trigger */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={startForgotPin}
                disabled={loading}
                className="text-xs text-neutral-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer hover:underline"
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2B: NEW ACCOUNT (CREATE PIN) ================= */}
        {step === 'create_pin' && (
          <div className="space-y-5">
            {/* Email Header with Change Link */}
            <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-850">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">New Account</span>
                <span className="text-xs font-semibold text-white truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setPin('');
                  setConfirmPin('');
                  setError('');
                }}
                disabled={loading}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">Create your account</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Create a 6-digit PIN to secure your host portal.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 text-center">
                  Create 6-Digit PIN
                </label>
                <DigitInputBoxes
                  value={pin}
                  onChange={(val) => {
                    setPin(val);
                    setError('');
                  }}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 text-center">
                  Confirm 6-Digit PIN
                </label>
                <DigitInputBoxes
                  value={confirmPin}
                  onChange={(val) => {
                    setConfirmPin(val);
                    setError('');
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateAccountSubmit}
              disabled={loading || pin.length < 6 || confirmPin.length < 6}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Complete Account Setup</span>
              )}
            </button>
          </div>
        )}

        {/* ================= STEP 2C: FORGOT PIN FLOW ================= */}
        {step === 'forgot_pin' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-850">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Reset PIN for</span>
                <span className="text-xs font-semibold text-white truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('login_pin');
                  setError('');
                }}
                disabled={loading}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">Reset your PIN</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter the 6-digit security code sent to your email, then choose a new PIN.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 text-center">
                  6-Digit Email Security Code
                </label>
                <DigitInputBoxes
                  value={resetCodeInput}
                  onChange={(val) => {
                    setResetCodeInput(val);
                    setError('');
                  }}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 text-center">
                  New 6-Digit PIN
                </label>
                <DigitInputBoxes
                  value={newPin}
                  onChange={(val) => {
                    setNewPin(val);
                    setError('');
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPinSubmit}
              disabled={loading || resetCodeInput.length < 6 || newPin.length < 6}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Reset PIN & Sign In</span>
              )}
            </button>
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
