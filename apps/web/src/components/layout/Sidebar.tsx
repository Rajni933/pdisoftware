import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, PieChart, Truck, Car, ClipboardCheck,
  Wrench, FileText, Settings2, ChevronDown, ChevronRight,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, isSuperAdmin } = useAuth();
  const [syncTime, setSyncTime] = useState('14:32');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefreshSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const formatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setSyncTime(formatted);
      setIsSyncing(false);
    }, 600);
  };

  const displayName = user?.userName || 'R. Meena';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RM';

  const groups: {
    heading: string;
    items: { label: string; path: string; icon: any; roles: string[]; count?: number }[];
  }[] = [
    {
      heading: 'OPERATIONS',
      items: [
        { label: 'Overview', path: '/dashboard', icon: LayoutGrid, roles: ['ALL'] },
        { label: 'Reports', path: '/reports', icon: PieChart, roles: ['ALL'] },
        { label: 'Inward', path: '/receiving', icon: Truck, roles: ['ALL'] },
        { label: 'Vehicles', path: '/vehicles', icon: Car, roles: ['ALL'], count: 12 },
        { label: 'PDI Queue', path: '/pdi', icon: ClipboardCheck, roles: ['ALL'] },
        { label: 'Repairs', path: '/repairs', icon: Wrench, roles: ['ALL'], count: 4 },
      ],
    },
    {
      heading: 'SALES',
      items: [
        { label: 'Certificates', path: '/certificates/cert-101', icon: FileText, roles: ['ALL'] },
      ],
    },
    {
      heading: 'SETUP',
      items: [
        { label: 'Administration', path: '/admin', icon: Settings2, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER'] },
      ],
    },
  ];

  const role = user?.role || 'SYSTEM_ADMIN';
  const allowed = (roles: string[]) => isSuperAdmin || roles.includes('ALL') || roles.includes(role);

  return (
    <aside className="w-64 bg-white flex flex-col h-full border-r border-line select-none">
      {/* Header: Autoprime folded triangular logo + Dealership branch selector */}
      <div className="p-4 pb-3 border-b border-line/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Official Dhoot Group Logo */}
          <img
            src="/logo-transparent.png"
            alt="Dhoot Group Logo"
            className="w-9 h-9 object-contain shrink-0"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Autoprime
            </span>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium truncate text-left transition-colors cursor-pointer mt-1"
              title="Switch branch location"
            >
              <span>Jodhpur (Basni)</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {groups.map((group, groupIdx) => {
          const items = group.items.filter((i) => allowed(i.roles));
          if (!items.length) return null;

          return (
            <div key={group.heading}>
              {groupIdx > 0 && <div className="border-t border-slate-100 mb-3 mx-1" />}
              <div className="px-3 mb-2 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                {group.heading}
              </div>

              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.path === '/dashboard'
                      ? location.pathname === '/' || location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`relative flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition-colors ${
                        active
                          ? 'bg-blue-50/80 text-blue-600 font-semibold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                      )}
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          active ? 'text-blue-600 stroke-[2]' : 'text-slate-600 stroke-[1.8]'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer Card: Synced indicator + User Profile */}
      <div className="p-3 mt-auto shrink-0">
        <div className="bg-slate-50/60 border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5">
          {/* Sync status row */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Synced · {syncTime}</span>
            </div>
            <button
              type="button"
              onClick={handleRefreshSync}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
              title="Refresh Sync"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* User profile row */}
          <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-200/60 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {displayName}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};
