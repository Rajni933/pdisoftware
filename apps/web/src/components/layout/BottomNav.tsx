import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, ScanLine, Bell, User } from 'lucide-react';
import { CountBadge } from '@autoprime/ui';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const isHome = location.pathname === '/dashboard' || location.pathname === '/';
  const isTasks = location.pathname.startsWith('/pdi');
  const isScan = location.pathname.includes('scan') || location.pathname === '/vehicles';
  const isAlerts = location.pathname.startsWith('/qa') || location.pathname.startsWith('/repairs');
  const isProfile = location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile');

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-surface border-t border-line flex items-center justify-around z-sticky pb-[env(safe-area-inset-bottom)] select-none"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Home */}
      <Link
        to="/dashboard"
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
          isHome ? 'text-accent font-semibold' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <Home className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[11px] leading-none">Home</span>
      </Link>

      {/* 2. Tasks */}
      <Link
        to="/pdi"
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
          isTasks ? 'text-accent font-semibold' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <ClipboardCheck className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[11px] leading-none">Tasks</span>
      </Link>

      {/* 3. Scan (Centre Visually Raised 48px Circle - 06-mobile-yard.md §2) */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <Link
          to="/vehicles?scan=open"
          className="absolute -top-5 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-sticky border-2 border-surface transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Scan VIN or Barcode"
          aria-label="Scan VIN"
        >
          <ScanLine className="w-6 h-6 stroke-[1.75]" />
        </Link>
        <span className="text-[11px] text-accent font-semibold mt-7">Scan</span>
      </div>

      {/* 4. Alerts */}
      <Link
        to="/qa"
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 relative ${
          isAlerts ? 'text-accent font-semibold' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <div className="relative">
          <Bell className="w-5 h-5 stroke-[1.5]" />
          <span className="absolute -top-1 -right-1.5">
            <CountBadge count={3} variant="danger" />
          </span>
        </div>
        <span className="text-[11px] leading-none">Alerts</span>
      </Link>

      {/* 5. Profile */}
      <Link
        to="/admin"
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
          isProfile ? 'text-accent font-semibold' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <User className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[11px] leading-none">Profile</span>
      </Link>
    </nav>
  );
};
