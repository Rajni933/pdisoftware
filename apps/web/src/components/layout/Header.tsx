import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, Search, Settings, HelpCircle, Database } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { DatabaseConfigModal } from '../common/DatabaseConfigModal';
import { checkDatabaseConnection } from '../../lib/supabase';
import { CountBadge } from '@autoprime/ui';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const initials = (name?: string, fallback = 'SA') => {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/vehicles')) return 'Vehicles';
  if (pathname.startsWith('/pdi')) return 'PDI Queue';
  if (pathname.startsWith('/qa')) return 'QA Queue';
  if (pathname.startsWith('/repairs')) return 'Repairs';
  if (pathname.startsWith('/receiving')) return 'Inward Queue';
  if (pathname.startsWith('/bookings')) return 'Bookings';
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/invoicing')) return 'Invoicing';
  if (pathname.startsWith('/certificates')) return 'Certificates';
  if (pathname.startsWith('/admin')) return 'Administration';
  return 'Operations Overview';
};

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    let mounted = true;
    const verifyConnection = async () => {
      try {
        const res = await checkDatabaseConnection();
        if (mounted) {
          setDbStatus(res.connected ? 'connected' : 'disconnected');
        }
      } catch {
        if (mounted) setDbStatus('disconnected');
      }
    };
    verifyConnection();

    const handleConfigChange = () => {
      verifyConnection();
    };
    window.addEventListener('supabase_config_changed', handleConfigChange);
    return () => {
      mounted = false;
      window.removeEventListener('supabase_config_changed', handleConfigChange);
    };
  }, []);

  // Keyboard navigation shortcuts (05-screen-blueprints §A)
  useEffect(() => {
    let lastKey = '';
    let lastTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && e.key !== 'Escape') {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'g') {
        lastKey = 'g';
        lastTime = Date.now();
      } else if (lastKey === 'g' && Date.now() - lastTime < 1000) {
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          navigate('/vehicles');
          lastKey = '';
        } else if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          navigate('/qa');
          lastKey = '';
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          navigate('/pdi');
          lastKey = '';
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          navigate('/dashboard');
          lastKey = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <>
      <header className="h-14 bg-surface border-b border-line px-4 flex items-center justify-between gap-4 shrink-0 select-none">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden -ml-1 p-2 rounded text-ink-2 hover:bg-canvas focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Current Page Title (not a logo; 05-screen-blueprints §A) */}
          <h1 className="text-base font-semibold text-ink truncate leading-tight tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Right actions: Global Search, Settings, Shortcuts, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search with '/' shortcut */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search VIN, model or engineer…"
              className="h-8 pl-8 pr-8 w-56 lg:w-64 bg-canvas border border-line rounded text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:bg-surface transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-surface border border-line rounded text-[10px] font-mono text-ink-3">
              /
            </kbd>
          </div>

          {/* Keyboard shortcut help sheet trigger */}
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-canvas transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Database Live / Config Pill Button */}
          <button
            type="button"
            onClick={() => setDbModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              dbStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : dbStatus === 'checking'
                ? 'bg-slate-50 text-slate-600 border-line hover:bg-slate-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Supabase Database Connection & Seeder"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : dbStatus === 'checking' ? 'bg-slate-400' : 'bg-amber-500'
            }`} />
            <Database className="w-3.5 h-3.5" />
            <span>{dbStatus === 'connected' ? 'DB Live' : dbStatus === 'checking' ? 'Checking DB' : 'DB Setup'}</span>
          </button>

          {/* Settings link */}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center justify-center w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-canvas transition-colors"
            title="Dealership Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications Bell with Danger Count Badge when blocked items exist */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-canvas flex items-center justify-center relative transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5">
                  <CountBadge count={unreadCount} variant="danger" />
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              onUnreadChange={setUnreadCount}
            />
          </div>

          {/* User Profile avatar & info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-line">
            <div className="w-7 h-7 rounded-chip bg-accent text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials(user?.userName || user?.employeeId)}
            </div>
            <div className="hidden sm:flex flex-col leading-tight min-w-0">
              <span className="text-xs font-medium text-ink truncate max-w-[120px]">
                {user?.userName || 'R. Meena'}
              </span>
              <span className="text-[11px] text-ink-3 truncate max-w-[120px]">
                {user?.designation || 'QA Manager'}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={logout}
            className="p-1.5 rounded text-ink-3 hover:text-danger hover:bg-canvas transition-colors focus:outline-none ml-1"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Database Connection & Seeder Configuration Modal */}
      <DatabaseConfigModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </>
  );
};
