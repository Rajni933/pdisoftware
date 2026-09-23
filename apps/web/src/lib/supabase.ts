import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'autoprime_local_dev_key';

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export const getSupabaseConfig = (): DatabaseConfig => {
  if (typeof window === 'undefined') {
    return { url: DEFAULT_URL, anonKey: DEFAULT_KEY, isCustom: false };
  }

  const customUrl = localStorage.getItem('autoprime_supabase_url');
  const customKey = localStorage.getItem('autoprime_supabase_anon_key');

  if (customUrl && customKey) {
    return {
      url: customUrl.trim(),
      anonKey: customKey.trim(),
      isCustom: true
    };
  }

  return {
    url: DEFAULT_URL,
    anonKey: DEFAULT_KEY,
    isCustom: false
  };
};

let currentClient: SupabaseClient | null = null;
let currentConfigKey = '';

export const getSupabaseClient = (): SupabaseClient => {
  const config = getSupabaseConfig();
  const configKey = `${config.url}::${config.anonKey}`;

  if (!currentClient || currentConfigKey !== configKey) {
    currentConfigKey = configKey;
    currentClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return currentClient;
};

// Dynamic client proxy that always delegates to the active client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export const setSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('autoprime_supabase_url', url.trim());
    localStorage.setItem('autoprime_supabase_anon_key', anonKey.trim());
    currentClient = null;
    window.dispatchEvent(new Event('database-config-changed'));
  }
};

export const resetSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('autoprime_supabase_url');
    localStorage.removeItem('autoprime_supabase_anon_key');
    currentClient = null;
    window.dispatchEvent(new Event('database-config-changed'));
  }
};

export interface ConnectionStatus {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  tablesFound?: string[];
  isPausedOrUnreachable?: boolean;
}

export const checkDatabaseConnection = async (): Promise<ConnectionStatus> => {
  const startTime = Date.now();
  try {
    const client = getSupabaseClient();
    // Test query against stockyards
    const { data, error } = await client.from('stockyards').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      const msg = error.message || String(error);
      const isPaused = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('530') || msg.includes('503');
      return {
        connected: false,
        latencyMs,
        error: msg,
        isPausedOrUnreachable: isPaused
      };
    }

    return {
      connected: true,
      latencyMs,
      tablesFound: ['stockyards', 'vehicles', 'bookings', 'challan_invoices']
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      latencyMs,
      error: err?.message || 'Connection timeout or network error',
      isPausedOrUnreachable: true
    };
  }
};
