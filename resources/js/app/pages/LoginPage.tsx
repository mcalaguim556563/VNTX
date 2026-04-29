import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A] flex flex-col items-center justify-center px-4 relative">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, #0066CC14 0%, transparent 70%)' }}
      />

      {/* Back to Home — top-left */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#00C8F8] transition-colors"
      >
        <Home size={15} />
        Back to Home
      </Link>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#0A1628] border border-[#1E3A5C] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Accent bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0066CC, #00C8F8, #10B981)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-20 w-20 rounded-2xl bg-[#0D1F3C] border border-[#1E3A5C] flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="VNTX Logo"
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const fallback = el.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#00C8F8] items-center justify-center text-white font-black text-xl"
                  style={{ display: 'none' }}
                >
                  VX
                </div>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wider">VNTX</h1>
              <p className="text-xs text-[#64748B] tracking-widest uppercase mt-0.5">Admin Portal</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-5">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email</label>
                <div className="flex items-center rounded-xl bg-[#0D1F3C] border border-[#1E3A5C]
                  focus-within:border-[#00C8F8] focus-within:ring-1 focus-within:ring-[#00C8F8]/40 transition-colors">
                  <span className="pl-4 pr-3 text-[#64748B] shrink-0">
                    <Mail size={15} />
                  </span>
                  <div className="w-px h-4 bg-[#1E3A5C] shrink-0" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="flex-1 pl-3 pr-4 py-3 bg-transparent text-white text-sm
                      placeholder-[#64748B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Password</label>
                <div className="flex items-center rounded-xl bg-[#0D1F3C] border border-[#1E3A5C]
                  focus-within:border-[#00C8F8] focus-within:ring-1 focus-within:ring-[#00C8F8]/40 transition-colors">
                  <span className="pl-4 pr-3 text-[#64748B] shrink-0">
                    <Lock size={15} />
                  </span>
                  <div className="w-px h-4 bg-[#1E3A5C] shrink-0" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="flex-1 pl-3 pr-3 py-3 bg-transparent text-white text-sm
                      placeholder-[#64748B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="pr-4 text-[#64748B] hover:text-[#94A3B8] transition-colors shrink-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm mt-2
                  bg-[#00C8F8] text-[#050B1A] hover:bg-[#00B0D8] disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-[#00C8F8]/20
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-[#050B1A]/30 border-t-[#050B1A] rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-[#050B1A]/50 border-t border-[#1E3A5C] text-center">
            <p className="text-xs text-[#64748B]">© 2025 VNTX Sports Tournament Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
