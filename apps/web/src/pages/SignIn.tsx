import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Lock, Eye, EyeOff, Loader2, KeyRound, ArrowLeft, Mail, CheckCircle2, Car, ShieldCheck, Wrench, Award, Sparkles } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Mode: 'signin' | 'forgot_request' | 'forgot_verify'
  const [view, setView] = useState<'signin' | 'forgot_request' | 'forgot_verify'>('signin');

  // Sign in state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forgot password state
  const [forgotUsername, setForgotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser || !password || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

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
        setError('Invalid username or password.');
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

  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = forgotUsername.trim();
    if (!cleanUser || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('request_password_reset', {
        p_username: cleanUser
      });

      if (rpcErr) {
        setError(rpcErr.message || 'Failed to request password reset OTP.');
        setLoading(false);
        return;
      }

      if (rpcRes && !rpcRes.success) {
        setError(rpcRes.message || 'User not found.');
        setLoading(false);
        return;
      }

      setMaskedEmail(rpcRes.masked_email || 'registered email');
      setSuccess(`OTP has been sent to your registered email (${rpcRes.masked_email || ''}).`);
      setView('forgot_verify');
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    const cleanUser = forgotUsername.trim();

    if (!cleanOtp || !newPassword || !confirmPassword || loading) return;

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('verify_reset_otp_and_change_password', {
        p_username: cleanUser,
        p_otp: cleanOtp,
        p_new_password: newPassword
      });

      if (rpcErr) {
        setError(rpcErr.message || 'Verification failed.');
        setLoading(false);
        return;
      }

      if (rpcRes && !rpcRes.success) {
        setError(rpcRes.message || 'Invalid or expired OTP.');
        setLoading(false);
        return;
      }

      // Password updated successfully!
      setUsername(cleanUser);
      setPassword('');
      setView('signin');
      setSuccess('Password reset successfully! Please sign in with your new password.');
    } catch {
      setError('Connection error. Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10 xl:gap-14">
        {/* Left Branding: Autoprime Tata */}
        <aside
          aria-label="Autoprime Tata Motors Dealership"
          className="hidden lg:flex flex-col items-center text-center p-8 rounded-[var(--radius-lg)] w-72 xl:w-80 shrink-0 select-none shadow-sm transition-transform hover:-translate-y-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="w-12 h-1 rounded-full mb-5" style={{ backgroundColor: 'var(--color-action)' }} />

          <div className="relative mb-3">
            <img
              src="/logo-tata.jpg"
              alt="Autoprime Tata"
              className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)]"
            />
          </div>

          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-2"
            style={{
              backgroundColor: 'var(--color-action-soft)',
              color: 'var(--color-action)',
            }}
          >
            Authorized Dealer
          </span>

          <h2
            className="font-bold tracking-tight text-[var(--color-text-primary)] m-0"
            style={{ fontSize: 'var(--t-h3-size)', lineHeight: 'var(--t-h3-lh)' }}
          >
            Autoprime Tata
          </h2>

          <p className="text-xs text-[var(--color-text-secondary)] italic mt-1 mb-5">
            Connecting Aspirations
          </p>

          <div className="w-full border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-action)' }}
              >
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">Passenger & EV Fleet</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">Complete Tata line-up</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-action)' }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">Certified PDI Quality</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">100% factory compliance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-action)' }}
              >
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">Express Service</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">Genuine OEM spares & care</div>
              </div>
            </div>
          </div>

          <div className="w-full pt-4 mt-5 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
            Dhoot Group • Western Rajasthan
          </div>
        </aside>

        {/* Center: Sign In Card */}
        <div
          className="w-full max-w-[380px] sm:max-w-[400px] rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-sm"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
        {/* Dhoot Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo-transparent.png"
            alt="Dhoot Group Logo"
            className="w-16 h-16 object-contain mb-3 bg-transparent"
          />
          <h1
            className="font-bold tracking-tight text-[var(--color-text-primary)] m-0"
            style={{ fontSize: 'var(--t-h2-size)', lineHeight: 'var(--t-h2-lh)' }}
          >
            Dhoot Group
          </h1>
        </div>

        {/* Success Alert Banner */}
        {success && (
          <div
            role="status"
            className="mb-5 p-3 rounded-[var(--radius-sm)] text-center flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-success-soft)',
              border: '1px solid var(--color-success-border)',
              color: 'var(--color-success)',
              fontSize: 'var(--t-label-size)',
              lineHeight: 'var(--t-label-lh)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

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

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN FORM */}
        {/* ========================================================================= */}
        {view === 'signin' && (
          <form onSubmit={handleSignInSubmit} noValidate className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="signin-username"
                className="font-medium text-[var(--color-text-primary)]"
                style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
              >
                Username
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
                  placeholder="Enter username"
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

            {/* Forgot Password Link */}
            <div className="flex justify-center mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setForgotUsername(username.trim());
                  setError(null);
                  setSuccess(null);
                  setView('forgot_request');
                }}
                className="text-xs font-medium text-[var(--color-action)] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FORGOT PASSWORD — STEP 1: REQUEST OTP TO REGISTERED EMAIL */}
        {/* ========================================================================= */}
        {view === 'forgot_request' && (
          <form onSubmit={handleForgotRequestOtp} noValidate className="flex flex-col gap-4">
            <div className="text-left mb-1">
              <h2
                className="font-bold text-[var(--color-text-primary)] m-0"
                style={{ fontSize: 'var(--t-h3-size)', lineHeight: 'var(--t-h3-lh)' }}
              >
                Reset Password
              </h2>
              <p
                className="text-[var(--color-text-secondary)] mt-1 m-0"
                style={{ fontSize: 'var(--t-caption-size)', lineHeight: 'var(--t-caption-lh)' }}
              >
                Enter your username to receive a verification OTP on your registered email.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="forgot-username"
                className="font-medium text-[var(--color-text-primary)]"
                style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
              >
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                  <User className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="forgot-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  placeholder="Enter username"
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

            <button
              type="submit"
              disabled={loading || !forgotUsername.trim()}
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
                  <span>Sending OTP…</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send OTP to Email</span>
                </>
              )}
            </button>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setView('signin');
                }}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD — STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
        {/* ========================================================================= */}
        {view === 'forgot_verify' && (
          <form onSubmit={handleForgotVerifyAndReset} noValidate className="flex flex-col gap-4">
            <div className="text-left mb-1">
              <h2
                className="font-bold text-[var(--color-text-primary)] m-0"
                style={{ fontSize: 'var(--t-h3-size)', lineHeight: 'var(--t-h3-lh)' }}
              >
                Enter OTP & New Password
              </h2>
              {maskedEmail && (
                <p
                  className="text-[var(--color-text-secondary)] mt-1 m-0 font-medium"
                  style={{ fontSize: 'var(--t-caption-size)', lineHeight: 'var(--t-caption-lh)' }}
                >
                  Code sent to: <span className="font-mono text-[var(--color-text-primary)]">{maskedEmail}</span>
                </p>
              )}
            </div>

            {/* OTP Code */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="verify-otp"
                className="font-medium text-[var(--color-text-primary)]"
                style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
              >
                6-Digit Verification OTP
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                  <KeyRound className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="verify-otp"
                  type="text"
                  maxLength={6}
                  autoFocus
                  disabled={loading}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none tracking-widest transition-colors font-mono"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--t-body-size)',
                  }}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="verify-new-password"
                className="font-medium text-[var(--color-text-primary)]"
                style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
              >
                New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                  <Lock className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="verify-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  disabled={loading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-10 pl-9 pr-10 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--t-body-size)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-0 bg-transparent border-0 cursor-pointer flex items-center"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="verify-confirm-password"
                className="font-medium text-[var(--color-text-primary)]"
                style={{ fontSize: 'var(--t-label-size)', lineHeight: 'var(--t-label-lh)' }}
              >
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none flex items-center">
                  <Lock className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="verify-confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--t-body-size)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp.trim() || !newPassword || !confirmPassword}
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
                  <span>Updating Password…</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>

            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setView('forgot_request');
                }}
                className="text-xs text-[var(--color-action)] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setView('signin');
                }}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Mobile Brand Footer (Visible on screens < 768px) */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <img src="/logo-tata.jpg" alt="Tata" className="w-5 h-5 rounded-full object-cover" />
            <span>Autoprime Tata</span>
          </div>
          <span className="text-[var(--color-text-disabled)]">•</span>
          <div className="flex items-center gap-1.5">
            <img src="/logo-hyundai.jpg" alt="Hyundai" className="w-5 h-5 rounded-sm object-cover" />
            <span>Raja Hyundai</span>
          </div>
        </div>
      </div>

      {/* Right Branding: Raja Hyundai */}
      <aside
        aria-label="Raja Hyundai Dealership"
        className="hidden lg:flex flex-col items-center text-center p-8 rounded-[var(--radius-lg)] w-72 xl:w-80 shrink-0 select-none shadow-sm transition-transform hover:-translate-y-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="w-12 h-1 rounded-full mb-5" style={{ backgroundColor: 'var(--color-info)' }} />

        <div className="relative mb-3">
          <img
            src="/logo-hyundai.jpg"
            alt="Raja Hyundai"
            className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-4 ring-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)]"
          />
        </div>

        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-2"
          style={{
            backgroundColor: 'var(--color-info-soft)',
            color: 'var(--color-info)',
          }}
        >
          Authorized Dealer
        </span>

        <h2
          className="font-bold tracking-tight text-[var(--color-text-primary)] m-0"
          style={{ fontSize: 'var(--t-h3-size)', lineHeight: 'var(--t-h3-lh)' }}
        >
          Raja Hyundai
        </h2>

        <p className="text-xs text-[var(--color-text-secondary)] italic mt-1 mb-5">
          Sales · Service · Smiles
        </p>

        <div className="w-full border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-3 text-left">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-info)' }}
            >
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-primary)]">Full Hyundai Fleet</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">SUVs, sedans & electric</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-info)' }}
            >
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-primary)]">Platinum Dealership</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">Highest customer satisfaction</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-info)' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-primary)]">3S Mega Workshop</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">Next-gen diagnostic bays</div>
            </div>
          </div>
        </div>

        <div className="w-full pt-4 mt-5 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
          Dhoot Group • Western Rajasthan
        </div>
      </aside>
    </div>
  </div>
  );
};
