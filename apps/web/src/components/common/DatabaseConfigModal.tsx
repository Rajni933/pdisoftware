import React, { useState, useEffect } from 'react';
import { 
  Database, CheckCircle2, AlertTriangle, RefreshCw, X, 
  Key, Globe, Sparkles, Check, Server, ArrowRight
} from 'lucide-react';
import { 
  getSupabaseConfig, setSupabaseConfig, resetSupabaseConfig, 
  checkDatabaseConnection, ConnectionStatus 
} from '../../lib/supabase';
import { seedInitialMastersToDatabase } from '../../services/dataService';
import { Badge } from '../ui/primitives';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [checking, setChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string; counts?: Record<string, number> } | null>(null);

  const testConnection = async () => {
    setChecking(true);
    setConnectionStatus(null);
    try {
      const res = await checkDatabaseConnection();
      setConnectionStatus(res);
    } catch (e: any) {
      setConnectionStatus({
        connected: false,
        error: e?.message || 'Failed to connect'
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig(current);
      setUrlInput(current.url);
      setKeyInput(current.anonKey);
      testConnection();
      setSeedResult(null);
    }
  }, [isOpen]);

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig(urlInput, keyInput);
    setConfig(getSupabaseConfig());
    await testConnection();
  };

  const handleResetDefault = async () => {
    resetSupabaseConfig();
    const def = getSupabaseConfig();
    setConfig(def);
    setUrlInput(def.url);
    setKeyInput(def.anonKey);
    await testConnection();
  };

  const handleSeedMasters = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await seedInitialMastersToDatabase();
      setSeedResult(result);
      if (result.success) {
        await testConnection();
      }
    } catch (e: any) {
      setSeedResult({
        success: false,
        message: e?.message || 'Error executing master database seeder'
      });
    } finally {
      setSeeding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface border border-line rounded-panel max-w-xl w-full overflow-hidden shadow-modal animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-control bg-accent-soft border border-accent-line flex items-center justify-center text-accent">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">Supabase PostgreSQL Connection</h2>
              <p className="text-xs text-ink-3">Live cloud database integration and master catalogue management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-control text-ink-3 hover:text-ink hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {/* Status Banner */}
          <div className="p-3 rounded-control border border-line bg-canvas">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">Connection Status:</span>
                {checking ? (
                  <Badge tone="neutral">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Checking connection…
                  </Badge>
                ) : connectionStatus?.connected ? (
                  <Badge tone="ok">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected · {connectionStatus.latencyMs}ms
                  </Badge>
                ) : (
                  <Badge tone="danger">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Disconnected / Project Paused
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={testConnection}
                disabled={checking}
                className="btn btn-secondary h-7 text-xs px-2.5"
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${checking ? 'animate-spin' : ''}`} />
                Test Ping
              </button>
            </div>

            {connectionStatus?.error && (
              <div className="mt-2 text-xs text-danger border-t border-danger-line pt-2 font-mono">
                {connectionStatus.error}
              </div>
            )}
            
            {connectionStatus?.isPausedOrUnreachable && (
              <p className="mt-2 text-xs text-ink-3">
                If using a free Supabase project, restore or unpause it in your Supabase Dashboard, or enter your new project URL and anon key below.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSaveAndConnect} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-3" />
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="input pl-9 font-mono text-xs w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Anon / Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-3" />
                <input
                  type="text"
                  required
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="sb_publishable_... or eyJhbGciOi..."
                  className="input pl-9 font-mono text-xs w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {config.isCustom ? (
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-xs text-ink-3 hover:text-danger underline transition-colors"
                >
                  Reset to Environment Default
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={checking}
                className="btn btn-primary text-xs h-8 px-4"
              >
                Save & Connect
              </button>
            </div>
          </form>

          {/* 1-Click Master Catalogs Seeder Section */}
          <div className="border-t border-line pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Seed Master Data to Database
                </h3>
                <p className="text-[11px] text-ink-3">
                  Populate standard Tata Motors & Hyundai stockyards, branches, vehicle models, financiers, and checkpoints into PostgreSQL if empty.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeedMasters}
                disabled={seeding || checking}
                className="btn btn-secondary h-8 text-xs px-3 shrink-0"
              >
                {seeding ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                    Seeding…
                  </>
                ) : (
                  <>
                    <Server className="w-3 h-3 mr-1.5" />
                    Seed Masters
                  </>
                )}
              </button>
            </div>

            {seedResult && (
              <div className={`p-2.5 rounded-control text-xs border ${seedResult.success ? 'bg-ok-soft text-ok border-ok-line' : 'bg-danger-soft text-danger border-danger-line'}`}>
                <div className="flex items-center gap-1.5 font-medium">
                  {seedResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {seedResult.message}
                </div>
                {seedResult.counts && (
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-mono text-ink">
                    <span>Yards: {seedResult.counts.stockyards}</span>
                    <span>Branches: {seedResult.counts.branches}</span>
                    <span>Models: {seedResult.counts.models}</span>
                    <span>Financiers: {seedResult.counts.financiers}</span>
                    <span>Insurance: {seedResult.counts.insurance}</span>
                    <span>Checkpoints: {seedResult.counts.checkpoints}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-line bg-canvas">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs h-8 px-4"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
