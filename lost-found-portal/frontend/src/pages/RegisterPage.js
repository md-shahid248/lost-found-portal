import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return;
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const pwColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-500'];
  const pwLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-surface-950 dark:to-surface-900 px-4 pt-16 pb-10">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Join FindItCampus</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create your free account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Rahul Kumar" className="input" required minLength={2} autoComplete="name" />
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@college.edu" className="input" required autoComplete="email" />
            </div>

            <div>
              <label className="label">Phone Number <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210" className="input" autoComplete="tel" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters" className="input pr-10" required minLength={6} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${pwColors[pwStrength]}`}
                      style={{ width: `${(pwStrength / 3) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${['', 'text-red-500', 'text-yellow-600', 'text-emerald-600'][pwStrength]}`}>
                    {pwLabels[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full rounded-xl mt-2">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
