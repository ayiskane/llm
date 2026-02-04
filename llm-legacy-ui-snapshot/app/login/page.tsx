'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LLMLogo } from '@/lib/icons';
import { cn } from '@/lib/config/theme';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, rememberMe }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
    setPin(value);
    setError(null);
  };

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <LLMLogo className="w-20 h-20 text-[#074f88] mb-4" />
        <h1 className="text-2xl font-bold text-white">Legal Legends Manual</h1>
        <p className="text-slate-400 text-sm mt-1">BC Court & Corrections Directory</p>
      </div>

      <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
        <p className="text-slate-400 text-sm mb-6">Enter your 8-character PIN to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-xs font-medium text-slate-400 mb-2">
              Access PIN
            </label>
            <input
              id="pin"
              type="text"
              value={pin}
              onChange={handlePinChange}
              placeholder="XXXXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className={cn(
                'w-full bg-slate-800/50 border rounded-xl px-4 py-3',
                'text-center text-xl font-mono tracking-[0.5em] text-white',
                'placeholder:text-slate-600 placeholder:tracking-[0.3em]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                error ? 'border-red-500/50' : 'border-slate-700/50'
              )}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/40 focus:ring-offset-0"
              disabled={isLoading}
            />
            <span className="text-sm text-slate-400">Remember me for 7 days</span>
          </label>

          <button
            type="submit"
            disabled={isLoading || pin.length !== 8}
            className={cn(
              'w-full py-3 rounded-xl font-medium transition-all',
              'flex items-center justify-center gap-2',
              pin.length === 8 && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            Don&apos;t have a PIN? Register via WhatsApp to get access.
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-600">
        For BC Legal Professionals Only
      </p>
    </div>
  );
}
