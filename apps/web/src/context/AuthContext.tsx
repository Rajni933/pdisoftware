import React, { createContext, useContext, useState, useEffect } from 'react';

export type BrandCode = 'DHOOT-ALL' | 'DHOOT-TATA' | 'DHOOT-HYUNDAI';

export interface BrandConfig {
  code: BrandCode;
  name: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  primaryHover: string;
  accentColor: string;
  accentBg: string;
  orgId: string;
  models: string[];
}

export const BRAND_CONFIGS: Record<BrandCode, BrandConfig> = {
  'DHOOT-ALL': {
    code: 'DHOOT-ALL',
    name: 'Dhoot Group',
    shortName: 'ALL BRANDS',
    tagline: 'Consolidated multi-brand intelligence across Tata Motors and Hyundai franchises',
    logoUrl: '/logo.png',
    primaryColor: '#0F172A',
    primaryHover: '#1E293B',
    accentColor: '#6366F1',
    accentBg: '#EEF2FF',
    orgId: 'ALL',
    models: [
      'Tata Nexon', 'Tata Harrier', 'Tata Safari', 'Tata Curvv.ev', 'Tata Punch', 'Tata Tiago', 'Tata Altroz',
      'Hyundai Creta', 'Hyundai Venue', 'Hyundai Verna', 'Hyundai Ioniq 5', 'Hyundai Exter', 'Hyundai i20', 'Hyundai Tucson'
    ],
  },
  'DHOOT-TATA': {
    code: 'DHOOT-TATA',
    name: 'Autoprime Tata',
    shortName: 'TATA MOTORS',
    tagline: 'Executive dealership overview for Tata passenger and commercial vehicle fleet operations',
    logoUrl: '/logo.png',
    primaryColor: '#1A3A6B',
    primaryHover: '#2C5298',
    accentColor: '#38BDF8',
    accentBg: '#EBF3FD',
    orgId: '11111111-1111-1111-1111-111111111111',
    models: ['Tata Nexon', 'Tata Harrier', 'Tata Safari', 'Tata Curvv.ev', 'Tata Punch', 'Tata Tiago', 'Tata Altroz'],
  },
  'DHOOT-HYUNDAI': {
    code: 'DHOOT-HYUNDAI',
    name: 'Raja Hyundai',
    shortName: 'HYUNDAI MOTOR',
    tagline: 'Executive dealership overview for Hyundai passenger vehicle operations',
    logoUrl: '/logo.png',
    primaryColor: '#002C6C',
    primaryHover: '#0047AB',
    accentColor: '#00AAD2',
    accentBg: '#E6F0FA',
    orgId: '11111111-1111-1111-1111-111111111112',
    models: ['Hyundai Creta', 'Hyundai Venue', 'Hyundai Verna', 'Hyundai Ioniq 5', 'Hyundai Exter', 'Hyundai i20', 'Hyundai Tucson'],
  },
};

export interface AuthUser {
  id: string;
  employeeId: string;
  userCode: string;
  userName: string;
  email: string;
  role: string;
  designation?: string;
  nature?: string;
  branchCode?: string;
  branchId?: string;
  organizationId: string;
  brand: string;
  hasDualBrandAccess?: boolean;
  can_delete?: boolean;
  canDelete?: boolean;
}

export const checkUserCanDelete = (user: AuthUser | null): boolean => {
  if (!user) return false;
  // 1. Super Administrator & Master Admin Accounts
  const empId = (user.employeeId || '').toUpperCase().trim();
  const uCode = (user.userCode || '').toUpperCase().trim();
  const role = (user.role || '').toUpperCase().trim();
  if (
    role === 'SUPER_ADMIN' ||
    role === 'SYSTEM_ADMIN' ||
    empId === 'ADMIN' ||
    empId === 'ADMIN01' ||
    empId === 'DG001' ||
    uCode === 'ADMIN' ||
    uCode === 'ADMIN01' ||
    uCode === 'DG001'
  ) {
    return true;
  }

  // 2. Individual user account explicit override
  if ((user as any).can_delete === true || (user as any).canDelete === true) {
    return true;
  }
  if ((user as any).can_delete === false || (user as any).canDelete === false) {
    return false;
  }

  // 3. Role-Based Permissions matrix (from localStorage)
  try {
    const savedRoles = localStorage.getItem('dhoot_role_permissions');
    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);
      if (Array.isArray(parsedRoles)) {
        const matchingRole = parsedRoles.find((r: any) => r.role === user.role);
        if (matchingRole?.actions?.delete === true) {
          return true;
        }
      }
    }
  } catch (e) {}

  return false;
};

const DEFAULT_ADMIN: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  employeeId: 'DG001',
  userCode: 'DG001',
  userName: 'System Administrator',
  email: 'admin@dhootgroup.com',
  role: 'SYSTEM_ADMIN',
  designation: 'General Manager',
  organizationId: 'ALL',
  brand: 'ALL',
  hasDualBrandAccess: true,
  can_delete: true,
  canDelete: true,
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  currentBrand: BrandConfig;
  setBrand: (brand: BrandCode) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isSuperAdmin: boolean;
  canDelete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBrandCode, setSelectedBrandCode] = useState<BrandCode>('DHOOT-ALL');
  const [permissionVersion, setPermissionVersion] = useState(0);
  
  // Real secure session state — strictly null until user logs in
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dhoot_pdi_token') || localStorage.getItem('autoprime_token') || null;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('dhoot_pdi_user') || localStorage.getItem('autoprime_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      const b = (user.brand || '').toLowerCase();
      if (b.includes('hyundai') || b === 'dhoot-hyundai') {
        setSelectedBrandCode('DHOOT-HYUNDAI');
      } else if (b.includes('tata') || b === 'dhoot-tata') {
        setSelectedBrandCode('DHOOT-TATA');
      } else {
        setSelectedBrandCode('DHOOT-ALL');
      }
    }
  }, [user]);

  // Reactive listener for permission changes
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      setPermissionVersion(v => v + 1);
      // Also reload user from storage if updated
      const saved = localStorage.getItem('dhoot_pdi_user') || localStorage.getItem('autoprime_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('roles-updated', handlePermissionsUpdated);
    window.addEventListener('users-updated', handlePermissionsUpdated);
    window.addEventListener('storage', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('roles-updated', handlePermissionsUpdated);
      window.removeEventListener('users-updated', handlePermissionsUpdated);
      window.removeEventListener('storage', handlePermissionsUpdated);
    };
  }, []);

  const setBrand = (brand: BrandCode) => {
    setSelectedBrandCode(brand);
  };

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    const b = (newUser.brand || '').toLowerCase();
    if (b.includes('hyundai') || b === 'dhoot-hyundai') {
      setSelectedBrandCode('DHOOT-HYUNDAI');
    } else if (b.includes('tata') || b === 'dhoot-tata') {
      setSelectedBrandCode('DHOOT-TATA');
    } else {
      setSelectedBrandCode('DHOOT-ALL');
    }
    localStorage.setItem('dhoot_pdi_token', newToken);
    localStorage.setItem('dhoot_pdi_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dhoot_pdi_token');
    localStorage.removeItem('dhoot_pdi_user');
    localStorage.removeItem('autoprime_token');
    localStorage.removeItem('autoprime_user');
  };

  const currentBrand = BRAND_CONFIGS[selectedBrandCode] || BRAND_CONFIGS['DHOOT-ALL'];
  const isSuperAdmin = !!user && (
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'SYSTEM_ADMIN' ||
    user?.employeeId?.toUpperCase() === 'ADMIN' ||
    user?.employeeId?.toUpperCase() === 'ADMIN01' ||
    user?.userCode?.toUpperCase() === 'ADMIN' ||
    user?.userCode?.toUpperCase() === 'ADMIN01' ||
    user?.userCode?.toUpperCase() === 'DG001'
  );

  const canDelete = isSuperAdmin || checkUserCanDelete(user);

  return (
    <AuthContext.Provider value={{ user, token, currentBrand, setBrand, login, logout, isSuperAdmin, canDelete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};