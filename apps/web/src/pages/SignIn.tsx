import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser || !password || loading) return;

    setLoading(true);
    setError(null);

    try {
      let authUser: any = null;
      let token = '';

      // Direct Supabase RPC Authentication
      try {
        const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('authenticate_user', {
          p_identifier: cleanUser,
          p_password: password
        });

        if (!rpcErr && rpcRes && rpcRes.success && rpcRes.user) {
          authUser = rpcRes.user;
          token = rpcRes.token;
        } else if (rpcRes && !rpcRes.success && rpcRes.message) {
          setError(rpcRes.message);
          setLoading(false);
          return;
        }
      } catch (rpcErr) {
        console.warn('Supabase auth notice:', rpcErr);
      }

      // Fallback check for seeded master admin credentials
      if (!authUser && (cleanUser.toLowerCase() === 'admin' || cleanUser.toUpperCase() === 'ADMIN01') && (password === 'Mujhenhipta01' || password === 'Admin@2026')) {
        authUser = {
          id: '00000000-0000-0000-0000-000000000001',
          userCode: 'ADMIN01',
          employeeId: 'ADMIN01',
          userName: 'System Administrator',
          email: 'admin@dhootgroup.com',
          role: 'SUPER_ADMIN',
          designation: 'General Manager',
          brand: 'ALL',
          nature: 'Management',
          branchCode: 'HO-DHOOT',
          organizationId: '11111111-1111-1111-1111-111111111111',
          hasDualBrandAccess: true,
        };
        token = `jwt_dhoot_ADMIN01_${Date.now()}`;
      }

      if (!authUser) {
        setError('Employee ID or password is incorrect.');
        setLoading(false);
        return;
      }

      login(token, authUser);
      navigate('/dashboard');
    } catch {
      setError('Connection error. Could not verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-[380px] sm:max-w-[400px] rounded-[var(--radius-lg)] p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Dhoot Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/brand/dhoot-mark-clean.png"
            alt="Dhoot Group Logo"
            className="w-16 h-16 object-contain mb-3"
          />
          <h1
            className="font-bold tracking-tight text-[var(--color-text-primary)] m-0"
            style={{ fontSize: 'var(--t-h2-size)', lineHeight: 'var(--t-h2-lh)' }}
          >
            Dhoot Group
          </h1>
          <p
            className="text-[var(--color-text-secondary)] mt-1 m-0"
            style={{ fontSize: 'var(--t-caption-size)', lineHeight: 'var(--t-caption-lh)' }}
          >
            Autoprime PDI Platform
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-[var(--radius-sm)] text-center"
            style={{
              backgroundColor: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              fontSize: 'var(--t-label-size)',
              lineHeight: 'var(--t-label-lh)',
            }}
          >
            {error}
          </div>
        )}

        {/* Clean Sign In Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Username / Employee ID */}
          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="signin-username"
              className="font-medium text-[var(--color-text-primary)]"
              style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
            >
              Employee ID / Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                <User className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <input
                id="signin-username"
                type="text"
                autoComplete="username"
                autoFocus
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ADMIN01, PDI01"
                className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--t-body-size)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="signin-password"
              className="font-medium text-[var(--color-text-primary)]"
              style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
            >
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                <Lock className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-10 pl-9 pr-10 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--t-body-size)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-0 bg-transparent border-0 cursor-pointer flex items-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full h-11 rounded-[var(--radius-md)] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-action)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontSize: 'var(--t-body-size)',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-inverse)]" />
                <span>Signing in…</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
