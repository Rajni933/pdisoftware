import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Car, ClipboardCheck, ShieldCheck,
  Bookmark, Wrench, Receipt, FileCheck, Settings2, PieChart,
  ChevronDown, Cloud, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CountBadge } from '@autoprime/ui';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, isSuperAdmin } = useAuth();

  const groups: {
    heading: string;
    items: { label: string; path: string; icon: any; roles: string[]; count?: number; isDangerCount?: boolean }[];
  }[] = [
    {
      heading: 'Operations',
      items: [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
        { label: 'Reports', path: '/reports', icon: PieChart, roles: ['ALL'] },
        { label: 'Inward', path: '/receiving', icon: Truck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER'] },
        { label: 'Vehicles', path: '/vehicles', icon: Car, roles: ['ALL'], count: 12 },
        { label: 'PDI Queue', path: '/pdi', icon: ClipboardCheck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER', 'QA_MANAGER'] },
        { label: 'Repairs', path: '/repairs', icon: Wrench, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'WORKSHOP_SUPERVISOR', 'PDI_ENGINEER'], count: 4 },
        { label: 'QA Queue', path: '/qa', icon: ShieldCheck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER'], count: 7, isDangerCount: true },
      ],
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Bookings', path: '/bookings', icon: Bookmark, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'SALES_CONSULTANT', 'ACCOUNTS_EXECUTIVE'] },
        { label: 'Invoicing', path: '/invoicing', icon: Receipt, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTS_EXECUTIVE', 'SALES_CONSULTANT'] },
        { label: 'Certificates', path: '/certificates/cert-101', icon: FileCheck, roles: ['ALL'] },
      ],
    },
    {
      heading: 'Setup',
      items: [
        { label: 'Administration', path: '/admin', icon: Settings2, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER'] },
      ],
    },
  ];

  const role = user?.role || 'SYSTEM_ADMIN';
  const allowed = (roles: string[]) => isSuperAdmin || roles.includes('ALL') || roles.includes(role);

  return (
    <aside className="w-60 bg-surface flex flex-col h-full border-r border-line select-none">
      {/* Sidebar Head: Autoprime mark + Branch Switcher (05-screen-blueprints §A) */}
      <div className="h-14 px-3.5 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-chip bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-tighter">
            AP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-ink truncate leading-tight">Autoprime</span>
            <button
              type="button"
              className="text-[11px] text-ink-3 hover:text-ink flex items-center gap-1 font-medium truncate text-left focus:outline-none"
              title="Switch branch location"
            >
              <span>Jodhpur (Basni)</span>
              <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {groups.map((group) => {
          const items = group.items.filter((i) => allowed(i.roles));
          if (!items.length) return null;

          return (
            <div key={group.heading} className="mb-4 last:mb-0">
              <div className="eyebrow px-2 mb-1 text-[11px] text-ink-3 uppercase font-mono tracking-wider">{group.heading}</div>

              {items.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 h-8 px-2.5 rounded text-sm transition-colors ${
                      active
                        ? 'bg-accent-soft text-accent font-medium'
                        : 'text-ink-2 hover:bg-canvas hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-accent' : 'text-ink-3'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count !== undefined && (
                      <CountBadge
                        count={item.count}
                        variant={item.isDangerCount ? 'danger' : 'neutral'}
                        className="ml-auto"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer: Connection + Last Sync + User (05-screen-blueprints §A) */}
      <div className="p-3 border-t border-line flex flex-col gap-1 bg-canvas/40 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-ink-3">
            <span className="flex items-center text-ok">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </span>
            <span className="text-[11px]">Synced · 14:32</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-ok shrink-0" title="Connected" />
        </div>
        <div className="text-xs font-medium text-ink truncate">
          {user?.userName || 'R. Meena'}
        </div>
      </div>
    </aside>
  );
};
