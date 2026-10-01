import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, MapPin, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, Plus, Search, Filter, RefreshCw, QrCode, FileText, Check, X,
  Car, UserCheck, Calendar, ArrowUpRight, ArrowDownLeft, Building2, ChevronRight,
  Trash2, AlertOctagon, Loader2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  getAllVehicles, 
  getActiveStockyards, 
  saveStockInventory,
  getVehicleTransfers, 
  saveVehicleTransfers, 
  VehicleTransferItem, 
  syncWithSupabase,
  isTataItem,
  isHyundaiItem
} from '../data/seedData';
import { 
  deleteTransferRecord, deleteMultipleTransferRecords, clearAllTransferRecords 
} from '../services/dataService';
import { formatDate } from '../utils/dateUtils';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export const YardMovementsPage: React.FC = () => {
  const { user, isSuperAdmin, currentBrand, canDelete } = useAuth();

  // Active view: 'STOCK' (Stockyard Inventory), 'TRANSFERS' (IDT & Movements), 'APPROVALS' (Multi-Level Approvals Hub)
  const [activeTab, setActiveTab] = useState<'STOCK' | 'TRANSFERS' | 'APPROVALS'>('STOCK');
  const [loading, setLoading] = useState(false);

  // Data states
  const [vehicles, setVehicles] = useState<any[]>(() => getAllVehicles());
  const [transfers, setTransfers] = useState<VehicleTransferItem[]>(() => getVehicleTransfers());

  // Yard selector for Stock Tracker
  const activeYards = useMemo(() => getActiveStockyards(currentBrand?.code), [currentBrand?.code]);
  const [selectedYardName, setSelectedYardName] = useState<string>(() => {
    return activeYards.length > 0 ? activeYards[0].name : 'Pune Central Stockyard';
  });

  // Modals
  const [moveYardModal, setMoveYardModal] = useState<{ isOpen: boolean; vehicle: any | null }>({ isOpen: false, vehicle: null });
  const [targetYardName, setTargetYardName] = useState('');

  const [newTransferModal, setNewTransferModal] = useState(false);
  const [selectedVinForTransfer, setSelectedVinForTransfer] = useState('');
  const [destinationYardName, setDestinationYardName] = useState('');
  const [transferType, setTransferType] = useState<'INTER_DEALER' | 'INTER_YARD' | 'YARD_TO_SHOWROOM'>('INTER_DEALER');
  const [transferReason, setTransferReason] = useState('Customer Booking Allotment');
  const [transporterName, setTransporterName] = useState('FastTrack Fleet Logistics');
  const [carrierRegNo, setCarrierRegNo] = useState('MH-12-PQ-8899');
  const [driverName, setDriverName] = useState('Ramesh Pawar');
  const [driverPhone, setDriverPhone] = useState('9822119988');

  const [gatepassModal, setGatepassModal] = useState<VehicleTransferItem | null>(null);
  const [receiveModal, setReceiveModal] = useState<VehicleTransferItem | null>(null);

  // Deletion & Multi-selection State for Transfers
  const [selectedTransferIds, setSelectedTransferIds] = useState<Set<string>>(new Set());
  const [singleDeleteTransferTarget, setSingleDeleteTransferTarget] = useState<VehicleTransferItem | null>(null);
  const [isBulkDeleteTransferModalOpen, setIsBulkDeleteTransferModalOpen] = useState(false);
  const [isManageTransfersModalOpen, setIsManageTransfersModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Search & Filter within Yard Stock
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [transferStatusFilter, setTransferStatusFilter] = useState('ALL');

  useEffect(() => {
    refreshData();
    const handleStockUpdate = () => setVehicles(getAllVehicles());
    const handleTransfersUpdate = () => setTransfers(getVehicleTransfers());

    window.addEventListener('stock-updated', handleStockUpdate);
    window.addEventListener('transfers-updated', handleTransfersUpdate);

    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
      window.removeEventListener('transfers-updated', handleTransfersUpdate);
    };
  }, [currentBrand?.code]);

  const refreshData = async () => {
    setLoading(true);
    try {
      await syncWithSupabase();
      setVehicles(getAllVehicles());
      setTransfers(getVehicleTransfers());
    } catch (e) {
      console.warn('Data sync notice:', e);
    } finally {
      setLoading(false);
    }
  };

  // Vehicles physically present in selected stockyard
  const vehiclesInSelectedYard = useMemo(() => {
    return vehicles.filter(v => (v.location || '').toLowerCase() === selectedYardName.toLowerCase());
  }, [vehicles, selectedYardName]);

  // Filtered vehicles for current yard
  const filteredYardStock = useMemo(() => {
    const q = stockSearchQuery.trim().toLowerCase();
    return vehiclesInSelectedYard.filter(v => {
      const matchSearch = 
        !q || 
        (v.vin || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q) ||
        (v.variant || '').toLowerCase().includes(q) ||
        (v.customer_name || '').toLowerCase().includes(q);

      const matchStatus = stockStatusFilter === 'ALL' || v.status === stockStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehiclesInSelectedYard, stockSearchQuery, stockStatusFilter]);

  // Handle Quick Yard Reassignment
  const handleExecuteMoveYard = async () => {
    if (!moveYardModal.vehicle || !targetYardName) return;
    const { vin } = moveYardModal.vehicle;

    const updated = vehicles.map(v => {
      if (v.vin === vin) {
        return { ...v, location: targetYardName };
      }
      return v;
    });

    setVehicles(updated);
    saveStockInventory(updated);

    try {
      await supabase.from('vehicles').update({ location: targetYardName }).eq('vin', vin);
    } catch (err) {}

    setMoveYardModal({ isOpen: false, vehicle: null });
  };

  // Handle Creating New Inter-Dealer Transfer Request
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVinForTransfer || !destinationYardName) return;

    const vehicle = vehicles.find(v => v.vin === selectedVinForTransfer);
    if (!vehicle) return;

    const newTransfer: VehicleTransferItem = {
      id: `idt-${Date.now()}`,
      transfer_no: `IDT-2026-${Math.floor(100 + Math.random() * 900)}`,
      vin: vehicle.vin,
      model: vehicle.model,
      variant: vehicle.variant || 'Standard',
      color: vehicle.color || 'White',
      from_stockyard_id: vehicle.location || selectedYardName,
      from_stockyard_name: vehicle.location || selectedYardName,
      to_stockyard_id: destinationYardName,
      to_stockyard_name: destinationYardName,
      from_bay: '',
      transfer_type: transferType,
      reason: transferReason,
      transporter: transporterName,
      carrier_reg_no: carrierRegNo,
      driver_name: driverName,
      driver_phone: driverPhone,
      status: 'PENDING_APPROVAL',
      level_1_status: 'PENDING',
      level_2_status: 'PENDING',
      level_3_status: 'PENDING',
      created_by: user?.userName || 'Yard Supervisor',
      created_at: new Date().toISOString()
    };

    const updated = [newTransfer, ...transfers];
    saveVehicleTransfers(updated);
    setTransfers(updated);

    try {
      await supabase.from('vehicle_transfers').insert([newTransfer]);
    } catch (err) {}

    setNewTransferModal(false);
    setSelectedVinForTransfer('');
    setActiveTab('TRANSFERS');
  };

  // Handle Level Approvals
  const handleApproveLevel = async (transfer: VehicleTransferItem, level: 1 | 2 | 3) => {
    const approverName = user?.userName || 'Authorised Manager';
    const now = new Date().toISOString();

    const updatedTransfers = transfers.map(t => {
      if (t.id === transfer.id) {
        if (level === 1) {
          return {
            ...t,
            level_1_status: 'APPROVED' as const,
            level_1_approved_by: approverName,
            level_1_approved_at: now,
            status: 'LEVEL_1_APPROVED' as const
          };
        } else if (level === 2) {
          return {
            ...t,
            level_2_status: 'APPROVED' as const,
            level_2_approved_by: approverName,
            level_2_approved_at: now,
            status: 'LEVEL_2_APPROVED' as const
          };
        } else if (level === 3) {
          const gpNo = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          return {
            ...t,
            level_3_status: 'APPROVED' as const,
            level_3_approved_by: approverName,
            level_3_approved_at: now,
            status: 'DISPATCHED_IN_TRANSIT' as const,
            gatepass_no: gpNo,
            gatepass_issued_at: now,
            dispatched_at: now
          };
        }
      }
      return t;
    });

    saveVehicleTransfers(updatedTransfers);
    setTransfers(updatedTransfers);

    // If level 3 approved, update vehicle to In Transit
    if (level === 3) {
      const updatedVehicles = vehicles.map(v => {
        if (v.vin === transfer.vin) {
          return {
            ...v,
            location: 'In Transit',
            status: 'IN_TRANSIT'
          };
        }
        return v;
      });
      setVehicles(updatedVehicles);
      saveStockInventory(updatedVehicles);

      try {
        await supabase.from('vehicles').update({
          location: 'In Transit',
          status: 'IN_TRANSIT'
        }).eq('vin', transfer.vin);

        await supabase.from('vehicle_transfers').update(
          updatedTransfers.find(t => t.id === transfer.id)
        ).eq('id', transfer.id);
      } catch (err) {}
    }
  };

  // Handle Destination Gate-In Confirmation
  const handleConfirmDestinationInward = async () => {
    if (!receiveModal) return;
    const now = new Date().toISOString();

    const updatedTransfers = transfers.map(t => {
      if (t.id === receiveModal.id) {
        return {
          ...t,
          status: 'RECEIVED_AT_DESTINATION' as const,
          received_at: now
        };
      }
      return t;
    });

    saveVehicleTransfers(updatedTransfers);
    setTransfers(updatedTransfers);

    // Update vehicle to destination yard
    const updatedVehicles = vehicles.map(v => {
      if (v.vin === receiveModal.vin) {
        return {
          ...v,
          location: receiveModal.to_stockyard_name,
          status: 'RECEIVED'
        };
      }
      return v;
    });
    setVehicles(updatedVehicles);
    saveStockInventory(updatedVehicles);

    try {
      await supabase.from('vehicles').update({
        location: receiveModal.to_stockyard_name,
        status: 'RECEIVED'
      }).eq('vin', receiveModal.vin);

      await supabase.from('vehicle_transfers').update({
        status: 'RECEIVED_AT_DESTINATION',
        received_at: now
      }).eq('id', receiveModal.id);
    } catch (err) {}

    setReceiveModal(null);
  };

  // -------------------------------------------------------------------------
  // Transfer Deletion Handlers
  // -------------------------------------------------------------------------
  const handleToggleSelectTransfer = (key: string) => {
    setSelectedTransferIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleToggleSelectAllTransfers = () => {
    const visibleTransfers = transfers.filter(t => transferStatusFilter === 'ALL' || t.status === transferStatusFilter);
    if (selectedTransferIds.size === visibleTransfers.length && visibleTransfers.length > 0) {
      setSelectedTransferIds(new Set());
    } else {
      setSelectedTransferIds(new Set(visibleTransfers.map(t => (t.transfer_no || t.id)).filter(Boolean)));
    }
  };

  const handleClearTransferSelection = () => {
    setSelectedTransferIds(new Set());
  };

  const handleConfirmSingleDeleteTransfer = async () => {
    if (!canDelete || !singleDeleteTransferTarget) return;
    setIsDeleting(true);
    const targetKey = singleDeleteTransferTarget.transfer_no || singleDeleteTransferTarget.id;
    try {
      const success = await deleteTransferRecord(targetKey);
      if (success) {
        setTransfers(getVehicleTransfers());
        setSelectedTransferIds(prev => {
          const next = new Set(prev);
          next.delete(targetKey);
          return next;
        });
        setActionFeedback(`Transfer record #${targetKey} successfully deleted.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Error deleting transfer:', err);
      setActionFeedback(`Error deleting transfer: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setSingleDeleteTransferTarget(null);
    }
  };

  const handleConfirmBulkDeleteTransfers = async () => {
    if (!canDelete || selectedTransferIds.size === 0) return;
    setIsDeleting(true);
    const keys = Array.from(selectedTransferIds);
    try {
      const count = await deleteMultipleTransferRecords(keys);
      setTransfers(getVehicleTransfers());
      setSelectedTransferIds(new Set());
      setActionFeedback(`${count} transfer records permanently deleted.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error deleting transfers:', err);
      setActionFeedback(`Error deleting selected transfers: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteTransferModalOpen(false);
    }
  };

  const handleConfirmClearAllTransfers = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      const success = await clearAllTransferRecords();
      if (success) {
        setTransfers(getVehicleTransfers());
        setSelectedTransferIds(new Set());
        setActionFeedback('All transfer records cleared from database.');
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Error clearing transfers:', err);
      setActionFeedback(`Error clearing transfers: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsManageTransfersModalOpen(false);
    }
  };

  // Status Family Tone according to 01-foundations.md
  const getStatusBadgeTone = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('READY')) return 'ok';
    if (s.includes('ALLOCAT')) return 'accent';
    if (s.includes('PENDING') || s.includes('INWARD') || s.includes('RECEIV')) return 'warn';
    if (s.includes('TRANSIT')) return 'accent';
    if (s.includes('REPAIR') || s.includes('FAIL')) return 'danger';
    return 'neutral';
  };

  // KPI metrics for selected yard
  const totalStockInYard = vehiclesInSelectedYard.length;
  const pdiPendingInYard = vehiclesInSelectedYard.filter(v => v.status === 'PDI_PENDING' || v.status === 'RECEIVED').length;
  const pdiApprovedInYard = vehiclesInSelectedYard.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length;
  const allocatedInYard = vehiclesInSelectedYard.filter(v => !!v.customer_name || v.status === 'ALLOCATED').length;
  const pendingApprovalsCount = transfers.filter(t => t.status === 'PENDING_APPROVAL' || t.status === 'LEVEL_1_APPROVED' || t.status === 'LEVEL_2_APPROVED').length;
  const inTransitCount = transfers.filter(t => t.status === 'DISPATCHED_IN_TRANSIT').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Page Header */}
      <PageHeader
        title="Stockyard Fleet & Inter-Dealer Movements"
        subtitle="Stockyard Level Vehicle Tracking • Inter-Dealer Transfers (IDT) • Multi-Level Maker-Checker Approvals"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setNewTransferModal(true)}
              className="h-8 px-3.5 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>New Transfer Request</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Total in Yard" value={totalStockInYard} note={selectedYardName} tone="accent" />
        <Stat label="PDI Pending" value={pdiPendingInYard} note="Awaiting inspection" tone={pdiPendingInYard > 0 ? 'warn' : 'default'} />
        <Stat label="Certified Ready" value={pdiApprovedInYard} note="Cleared for delivery" tone="ok" />
        <Stat label="Customer Booked" value={allocatedInYard} note="Allocated units" />
        <Stat label="Pending Approvals" value={pendingApprovalsCount} note="Maker-checker queue" tone={pendingApprovalsCount > 0 ? 'warn' : 'default'} />
        <Stat label="In-Transit IDT" value={inTransitCount} note="En route between yards" tone={inTransitCount > 0 ? 'accent' : 'default'} />
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('STOCK')}
          className={`h-8 px-4 rounded text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'STOCK'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface text-ink-2 hover:bg-canvas border border-line'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Stockyard Fleet Tracker</span>
          <span className={`px-1.5 py-0.2 rounded-chip text-[10px] ${activeTab === 'STOCK' ? 'bg-white/20 text-white' : 'bg-canvas text-ink-3'}`}>
            {totalStockInYard} Units
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TRANSFERS')}
          className={`h-8 px-4 rounded text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'TRANSFERS'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface text-ink-2 hover:bg-canvas border border-line'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Inter-Dealer Transfers (IDT)</span>
          <span className={`px-1.5 py-0.2 rounded-chip text-[10px] ${activeTab === 'TRANSFERS' ? 'bg-white/20 text-white' : 'bg-canvas text-ink-3'}`}>
            {transfers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('APPROVALS')}
          className={`h-8 px-4 rounded text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPROVALS'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface text-ink-2 hover:bg-canvas border border-line'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Multi-Level Approvals Hub</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-chip text-[10px] bg-warn text-white font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOCKYARD FLEET TRACKER                                            */}
      {/* ========================================================================= */}
      {activeTab === 'STOCK' && (
        <Panel
          title={
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink">Vehicles Standing in Stockyard</span>
              <Badge tone="accent">{selectedYardName}</Badge>
            </div>
          }
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-medium text-ink-3">Select Yard:</label>
              <select
                value={selectedYardName}
                onChange={(e) => setSelectedYardName(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2.5 text-ink font-semibold focus:outline-none focus:border-accent cursor-pointer shadow-xs"
              >
                {activeYards.map(y => (
                  <option key={y.id} value={y.name}>{y.name} ({y.brand})</option>
                ))}
              </select>

              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search VIN, model..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium"
                />
              </div>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2 text-ink font-medium focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received in Yard</option>
                <option value="PDI_PENDING">PDI Pending</option>
                <option value="QA_PENDING">QA Pending</option>
                <option value="PDI_APPROVED">PDI Approved</option>
                <option value="ALLOCATED">Allocated</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-canvas border-b border-line text-ink font-semibold uppercase tracking-[0.06em] text-xs">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Vehicle Model & Variant</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Chassis / VIN No</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Colour & Fuel</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Allotted Customer</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Current Stockyard</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-2 text-xs">
                {filteredYardStock.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-3">
                      <Car className="w-6 h-6 mx-auto mb-2 text-ink-3" />
                      <p className="font-semibold text-ink">0 Vehicles in {selectedYardName}</p>
                      <p className="text-xs text-ink-3 mt-0.5">No vehicles match the selected filter in this stockyard.</p>
                    </td>
                  </tr>
                ) : (
                  filteredYardStock.map((v, idx) => (
                    <tr key={v.vin || idx} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-ink">{v.model}</div>
                        <div className="text-[11px] text-ink-3">{v.variant || 'Standard'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink whitespace-nowrap tnum">
                        {v.vin}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div>{v.color || 'White'}</div>
                        <div className="text-[11px] text-ink-3 uppercase">{v.fuel_type || 'PETROL'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge tone={getStatusBadgeTone(v.status) as any}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {v.customer_name ? (
                          <div>
                            <span className="font-semibold text-ink">{v.customer_name}</span>
                            {v.booking_id && <div className="text-[10px] font-mono text-ink-3">{v.booking_id}</div>}
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">Free Inventory</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                        {v.location || selectedYardName}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVinForTransfer(v.vin);
                              setNewTransferModal(true);
                            }}
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-[11px] font-semibold text-accent flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Transfer (IDT)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMoveYardModal({ isOpen: true, vehicle: v });
                              setTargetYardName('');
                            }}
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-[11px] font-semibold text-ink-2 flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Building2 className="w-3 h-3 text-ink-3" />
                            <span>Move Yard</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTER-DEALER TRANSFERS (IDT) & MOVEMENTS                            */}
      {/* ========================================================================= */}
      {activeTab === 'TRANSFERS' && (
        <Panel
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Inter-Dealer & Inter-Yard Movements</span>
              <Badge tone="accent">{transfers.length} Records</Badge>
            </div>
          }
          action={
            <div className="flex items-center gap-2">
              <select
                value={transferStatusFilter}
                onChange={(e) => setTransferStatusFilter(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2.5 text-ink font-medium focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="ALL">All Transfer Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="DISPATCHED_IN_TRANSIT">In-Transit</option>
                <option value="RECEIVED_AT_DESTINATION">Completed / Received</option>
              </select>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => setIsManageTransfersModalOpen(true)}
                  className="h-7 px-2.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Manage and clear transfers register"
                >
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                  <span>Manage Transfers</span>
                </button>
              )}
            </div>
          }
        >
          {canDelete && selectedTransferIds.size > 0 && (
            <div className="mb-3 p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">
                  <span className="font-mono tnum text-accent">{selectedTransferIds.size}</span> transfer(s) selected
                </span>
                <button
                  type="button"
                  onClick={handleClearTransferSelection}
                  className="text-ink-3 hover:text-ink underline text-[11px] cursor-pointer"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteTransferModalOpen(true)}
                  className="h-7 px-3 rounded bg-danger hover:bg-danger/90 text-white font-medium flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedTransferIds.size})</span>
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-canvas border-b border-line text-ink font-semibold uppercase tracking-[0.06em] text-xs">
                <tr>
                  {canDelete && (
                    <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={transfers.filter(t => transferStatusFilter === 'ALL' || t.status === transferStatusFilter).length > 0 && selectedTransferIds.size === transfers.filter(t => transferStatusFilter === 'ALL' || t.status === transferStatusFilter).length}
                        onChange={handleToggleSelectAllTransfers}
                        className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                        title="Select All Transfers"
                      />
                    </th>
                  )}
                  <th className="py-2.5 px-3 whitespace-nowrap">Transfer No</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">VIN / Model</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Origin Stockyard</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Destination Stockyard</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Transporter & Driver</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Approvals</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-2 text-xs">
                {transfers
                  .filter(t => transferStatusFilter === 'ALL' || t.status === transferStatusFilter)
                  .map((t, idx) => {
                    const itemKey = t.transfer_no || t.id;
                    return (
                      <tr key={t.id || idx} className="hover:bg-canvas transition-colors">
                        {canDelete && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedTransferIds.has(itemKey)}
                              onChange={() => handleToggleSelectTransfer(itemKey)}
                              className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3 font-mono font-semibold text-ink tnum whitespace-nowrap">
                          {t.transfer_no}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-ink">{t.model}</div>
                          <div className="font-mono text-ink-3 text-[11px] tnum">{t.vin}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                          {t.from_stockyard_name}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                          {t.to_stockyard_name}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-ink">{t.transporter || 'Direct Fleet'}</div>
                          <div className="text-ink-3 text-[11px]">{t.driver_name} • {t.driver_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${t.level_1_status === 'APPROVED' ? 'bg-ok' : 'bg-warn'}`} title="Level 1: Yard Supervisor" />
                            <span className={`w-2 h-2 rounded-full ${t.level_2_status === 'APPROVED' ? 'bg-ok' : 'bg-warn'}`} title="Level 2: Accounts / Stock Controller" />
                            <span className={`w-2 h-2 rounded-full ${t.level_3_status === 'APPROVED' ? 'bg-ok' : 'bg-warn'}`} title="Level 3: Branch GM (Gatepass)" />
                            <span className="text-[11px] text-ink-3 ml-1">
                              {t.level_3_status === 'APPROVED' ? 'Gatepass Issued' : t.level_2_status === 'APPROVED' ? 'L2 Cleared' : t.level_1_status === 'APPROVED' ? 'L1 Verified' : 'Awaiting L1'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge tone={
                            t.status === 'RECEIVED_AT_DESTINATION' ? 'ok' :
                            t.status === 'DISPATCHED_IN_TRANSIT' ? 'accent' : 'warn'
                          }>
                            {t.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {t.gatepass_no ? (
                              <button
                                type="button"
                                onClick={() => setGatepassModal(t)}
                                className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-[11px] font-semibold text-accent flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <QrCode className="w-3 h-3" />
                                <span>Gatepass</span>
                              </button>
                            ) : null}

                            {t.status === 'DISPATCHED_IN_TRANSIT' && (
                              <button
                                type="button"
                                onClick={() => setReceiveModal(t)}
                                className="h-6 px-2 rounded bg-ok hover:bg-ok/90 text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirm Inward</span>
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setSingleDeleteTransferTarget(t)}
                                className="h-6 w-6 rounded bg-surface border border-line hover:border-danger/40 hover:bg-danger/10 hover:text-danger text-ink-3 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                                title="Delete transfer record"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTI-LEVEL APPROVALS HUB (MAKER-CHECKER)                          */}
      {/* ========================================================================= */}
      {activeTab === 'APPROVALS' && (
        <Panel
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Multi-Level Authorization Queue (Maker-Checker)</span>
              <Badge tone="warn">{pendingApprovalsCount} Pending Action</Badge>
            </div>
          }
        >
          <div className="divide-y divide-line">
            {transfers.filter(t => t.status !== 'RECEIVED_AT_DESTINATION').length === 0 ? (
              <div className="py-12 text-center text-ink-3">
                <CheckCircle2 className="w-8 h-8 mx-auto text-ok mb-2" />
                <p className="text-sm font-semibold text-ink">All Movement Requests Cleared</p>
                <p className="text-xs text-ink-3 mt-0.5">No pending Level 1, 2, or 3 sign-offs in queue.</p>
              </div>
            ) : (
              transfers.filter(t => t.status !== 'RECEIVED_AT_DESTINATION').map(t => {
                const canDoL1 = isSuperAdmin || user?.role === 'YARD_SUPERVISOR' || user?.role === 'SYSTEM_ADMIN';
                const canDoL2 = isSuperAdmin || user?.role === 'BRANCH_MANAGER' || user?.role === 'QA_MANAGER' || user?.role === 'SYSTEM_ADMIN';
                const canDoL3 = isSuperAdmin || user?.role === 'BRANCH_MANAGER' || user?.role === 'SYSTEM_ADMIN';

                return (
                  <div key={t.id} className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-ink tnum">{t.transfer_no}</span>
                          <Badge tone="accent">{t.transfer_type.replace(/_/g, ' ')}</Badge>
                          <span className="text-xs text-ink-3 font-mono">{formatDate(t.created_at)}</span>
                        </div>
                        <p className="text-xs font-semibold text-ink mt-1">
                          {t.model} ({t.variant}) • <span className="font-mono">{t.vin}</span>
                        </p>
                        <p className="text-xs text-ink-3 mt-0.5">
                          Route: <span className="font-medium text-ink">{t.from_stockyard_name}</span> → <span className="font-medium text-ink">{t.to_stockyard_name}</span>
                        </p>
                        <p className="text-xs text-ink-3 mt-0.5">Reason: {t.reason}</p>
                      </div>

                      <div className="text-right">
                        <Badge tone={t.status === 'DISPATCHED_IN_TRANSIT' ? 'accent' : 'warn'}>
                          {t.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* 3-Tier Approval Pipeline UI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      
                      {/* Tier 1: Yard Supervisor */}
                      <div className="rounded border border-line p-3 bg-canvas/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink">Level 1: Yard Supervisor</span>
                          {t.level_1_status === 'APPROVED' ? (
                            <Badge tone="ok">APPROVED</Badge>
                          ) : (
                            <Badge tone="warn">PENDING</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-3">
                          {t.level_1_approved_by ? `Signed by: ${t.level_1_approved_by}` : 'Requires physical vehicle & odometer verification.'}
                        </p>
                        {t.level_1_status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={!canDoL1}
                            onClick={() => handleApproveLevel(t, 1)}
                            className="w-full h-7 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5 text-ok" />
                            <span>Verify & Sign L1</span>
                          </button>
                        )}
                      </div>

                      {/* Tier 2: Accounts / Stock Controller */}
                      <div className="rounded border border-line p-3 bg-canvas/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink">Level 2: Stock Controller</span>
                          {t.level_2_status === 'APPROVED' ? (
                            <Badge tone="ok">APPROVED</Badge>
                          ) : (
                            <Badge tone="warn">PENDING</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-3">
                          {t.level_2_approved_by ? `Signed by: ${t.level_2_approved_by}` : 'Commercial accounts & booking match verification.'}
                        </p>
                        {t.level_1_status === 'APPROVED' && t.level_2_status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={!canDoL2}
                            onClick={() => handleApproveLevel(t, 2)}
                            className="w-full h-7 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5 text-ok" />
                            <span>Clear Accounts L2</span>
                          </button>
                        )}
                      </div>

                      {/* Tier 3: Branch GM / Gatepass Authority */}
                      <div className="rounded border border-line p-3 bg-canvas/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink">Level 3: GM / Gatepass</span>
                          {t.level_3_status === 'APPROVED' ? (
                            <Badge tone="ok">GATEPASS ISSUED</Badge>
                          ) : (
                            <Badge tone="warn">PENDING</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-3">
                          {t.gatepass_no ? `Gatepass: ${t.gatepass_no}` : 'Final movement authorization & dispatch release.'}
                        </p>
                        {t.level_2_status === 'APPROVED' && t.level_3_status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={!canDoL3}
                            onClick={() => handleApproveLevel(t, 3)}
                            className="w-full h-7 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Issue Gatepass L3</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MOVE YARD (QUICK STOCKYARD REASSIGNMENT)                          */}
      {/* ========================================================================= */}
      {moveYardModal.isOpen && moveYardModal.vehicle && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-panel max-w-md w-full p-5 space-y-4 shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-sm font-semibold text-ink">Change Stockyard Location</h3>
              <button
                type="button"
                onClick={() => setMoveYardModal({ isOpen: false, vehicle: null })}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-ink font-semibold">{moveYardModal.vehicle.model} ({moveYardModal.vehicle.variant})</p>
              <p className="font-mono text-ink-3">VIN: {moveYardModal.vehicle.vin}</p>
              <p className="text-ink-3">Current Stockyard: <span className="text-ink font-semibold">{moveYardModal.vehicle.location || selectedYardName}</span></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">New Stockyard Location</label>
                <select
                  value={targetYardName}
                  onChange={(e) => setTargetYardName(e.target.value)}
                  className="w-full h-8 px-2 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">-- Select Destination Stockyard --</option>
                  {activeYards.map(y => (
                    <option key={y.id} value={y.name}>{y.name} ({y.city})</option>
                  ))}
                  <option value="Sumerpur Branch Yard">Sumerpur Branch Yard</option>
                  <option value="Pali Retail Delivery Yard">Pali Retail Delivery Yard</option>
                  <option value="Balotra RSO Yard">Balotra RSO Yard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setMoveYardModal({ isOpen: false, vehicle: null })}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!targetYardName}
                onClick={handleExecuteMoveYard}
                className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white cursor-pointer shadow-xs disabled:opacity-50"
              >
                Confirm Yard Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEW INTER-DEALER TRANSFER                                        */}
      {/* ========================================================================= */}
      {newTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTransfer} className="bg-surface border border-line rounded-panel max-w-lg w-full p-5 space-y-4 shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-sm font-semibold text-ink">Initiate Inter-Dealer Transfer Request</h3>
              <button
                type="button"
                onClick={() => setNewTransferModal(false)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">Select Vehicle (VIN)</label>
                <select
                  value={selectedVinForTransfer}
                  onChange={(e) => setSelectedVinForTransfer(e.target.value)}
                  required
                  className="w-full h-8 px-2 bg-canvas border border-line rounded text-xs font-mono text-ink focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">-- Choose Stock Vehicle --</option>
                  {vehicles.filter(v => v.status !== 'IN_TRANSIT').slice(0, 150).map(v => (
                    <option key={v.vin} value={v.vin}>
                      {v.model} ({v.variant}) • {v.vin} • [{v.location || 'Yard'}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink mb-1">Transfer Type</label>
                  <select
                    value={transferType}
                    onChange={(e: any) => setTransferType(e.target.value)}
                    className="w-full h-8 px-2 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="INTER_DEALER">Inter-Dealer Franchise</option>
                    <option value="INTER_YARD">Inter-Yard Stock Movement</option>
                    <option value="YARD_TO_SHOWROOM">Yard to Showroom Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-ink mb-1">Destination Stockyard / Branch</label>
                  <select
                    value={destinationYardName}
                    onChange={(e) => setDestinationYardName(e.target.value)}
                    required
                    className="w-full h-8 px-2 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="">-- Select Destination --</option>
                    {activeYards.map(y => (
                      <option key={y.id} value={y.name}>{y.name} ({y.city})</option>
                    ))}
                    <option value="Sumerpur Branch Yard">Sumerpur Branch Yard</option>
                    <option value="Pali Retail Delivery Yard">Pali Retail Delivery Yard</option>
                    <option value="Balotra RSO Yard">Balotra RSO Yard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Transfer Reason</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full h-8 px-2.5 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="border-t border-line pt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink mb-1">Transporter / Carrier</label>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    className="w-full h-8 px-2.5 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">Carrier Vehicle Reg No</label>
                  <input
                    type="text"
                    value={carrierRegNo}
                    onChange={(e) => setCarrierRegNo(e.target.value)}
                    className="w-full h-8 px-2.5 bg-canvas border border-line rounded font-mono text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full h-8 px-2.5 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">Driver Contact Phone</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full h-8 px-2.5 bg-canvas border border-line rounded font-mono text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setNewTransferModal(false)}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedVinForTransfer || !destinationYardName}
                className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white cursor-pointer shadow-xs disabled:opacity-50"
              >
                Submit for Multi-Level Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFFICIAL MOVEMENT GATEPASS                                       */}
      {/* ========================================================================= */}
      {gatepassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-panel max-w-lg w-full p-6 space-y-4 shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="eyebrow">Dhoot Group Logistics</span>
                <h3 className="text-base font-semibold text-ink">Official Vehicle Dispatch Gatepass</h3>
              </div>
              <button
                type="button"
                onClick={() => setGatepassModal(null)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded border border-line p-4 space-y-3 bg-canvas/30 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-ink-3 text-[11px]">Gatepass Number</span>
                  <p className="font-mono font-bold text-sm text-ink tnum">{gatepassModal.gatepass_no}</p>
                </div>
                <div className="text-right">
                  <span className="text-ink-3 text-[11px]">Issued Timestamp</span>
                  <p className="font-mono text-ink tnum">{formatDate(gatepassModal.gatepass_issued_at || '')}</p>
                </div>
              </div>

              <div className="border-t border-line pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-3 text-[11px]">Vehicle Model</span>
                  <p className="font-semibold text-ink">{gatepassModal.model}</p>
                </div>
                <div>
                  <span className="text-ink-3 text-[11px]">Chassis / VIN</span>
                  <p className="font-mono font-bold text-ink">{gatepassModal.vin}</p>
                </div>
              </div>

              <div className="border-t border-line pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-3 text-[11px]">Origin Stockyard</span>
                  <p className="font-medium text-ink">{gatepassModal.from_stockyard_name}</p>
                </div>
                <div>
                  <span className="text-ink-3 text-[11px]">Destination Stockyard</span>
                  <p className="font-medium text-ink">{gatepassModal.to_stockyard_name}</p>
                </div>
              </div>

              <div className="border-t border-line pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-3 text-[11px]">Carrier / Driver</span>
                  <p className="text-ink">{gatepassModal.transporter} • {gatepassModal.driver_name}</p>
                  <p className="font-mono text-ink-3">{gatepassModal.driver_phone}</p>
                </div>
                <div>
                  <span className="text-ink-3 text-[11px]">Carrier Vehicle Reg</span>
                  <p className="font-mono text-ink font-semibold">{gatepassModal.carrier_reg_no || 'MH-12-PQ-8899'}</p>
                </div>
              </div>

              <div className="border-t border-line pt-2 flex items-center justify-between">
                <div>
                  <span className="text-ink-3 text-[11px]">Authorized GM Sign-off</span>
                  <p className="font-medium text-ok flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{gatepassModal.level_3_approved_by || 'General Manager'}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-canvas border border-line rounded flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-ink" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGatepassModal(null)}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Gatepass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM DESTINATION GATE-IN RECEIPT                               */}
      {/* ========================================================================= */}
      {receiveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-panel max-w-md w-full p-5 space-y-4 shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-sm font-semibold text-ink">Destination Yard Gate-In Acceptance</h3>
              <button
                type="button"
                onClick={() => setReceiveModal(null)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-ink font-semibold">{receiveModal.model}</p>
              <p className="font-mono text-ink-3">VIN: {receiveModal.vin}</p>
              <p className="text-ink-3">Arriving at: <span className="text-ink font-bold">{receiveModal.to_stockyard_name}</span></p>
              <p className="text-ink-3">Dispatched From: <span className="text-ink font-medium">{receiveModal.from_stockyard_name}</span></p>
            </div>

            <div className="p-2.5 rounded bg-ok-soft/30 border border-ok/20 text-ok flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Physical condition audited. Vehicle safely received into destination stockyard.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setReceiveModal(null)}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDestinationInward}
                className="h-8 px-4 rounded bg-ok hover:bg-ok/90 text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                Confirm Gate-In & Inward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SINGLE DELETE TRANSFER                                            */}
      {/* ========================================================================= */}
      {singleDeleteTransferTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-surface w-full max-w-md rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2 text-danger">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <h3 className="font-semibold text-ink text-sm">Delete Movement Record</h3>
              </div>
              <button 
                onClick={() => setSingleDeleteTransferTarget(null)}
                className="w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <p className="text-ink">
                Are you sure you want to permanently delete movement record <strong className="text-ink font-mono font-semibold">#{singleDeleteTransferTarget.transfer_no}</strong>?
              </p>

              <div className="p-3 bg-canvas border border-line rounded space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-ink-3">VIN:</span>
                  <span className="font-semibold text-ink">{singleDeleteTransferTarget.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3">Model:</span>
                  <span className="text-ink">{singleDeleteTransferTarget.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3">Origin:</span>
                  <span className="text-ink">{singleDeleteTransferTarget.from_stockyard_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3">Destination:</span>
                  <span className="text-ink">{singleDeleteTransferTarget.to_stockyard_name}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-line">
                  <span className="text-ink-3">Status:</span>
                  <span className="text-ink font-medium">{singleDeleteTransferTarget.status}</span>
                </div>
              </div>

              <div className="p-2.5 bg-danger/10 border border-danger/20 rounded flex items-start gap-2 text-danger text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Permanent database removal: This transfer movement record will be expunged from local storage, local PostgREST database (<span className="font-mono">localhost:54321</span>), and cloud sync.
                </span>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSingleDeleteTransferTarget(null)}
                disabled={isDeleting}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDeleteTransfer}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-danger hover:bg-danger/90 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: BULK DELETE TRANSFERS                                             */}
      {/* ========================================================================= */}
      {isBulkDeleteTransferModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-surface w-full max-w-lg rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2 text-danger">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <h3 className="font-semibold text-ink text-sm">Delete {selectedTransferIds.size} Selected Movements</h3>
              </div>
              <button 
                onClick={() => setIsBulkDeleteTransferModalOpen(false)}
                className="w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <p className="text-ink">
                You are about to permanently delete <strong className="text-danger font-mono tnum">{selectedTransferIds.size}</strong> movement / IDT records from the register.
              </p>

              <div className="p-3 bg-canvas border border-line rounded space-y-2 max-h-36 overflow-y-auto">
                <span className="eyebrow block text-ink-3">Selected Transfer Keys:</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedTransferIds).slice(0, 10).map(id => (
                    <span key={id} className="px-2 py-0.5 rounded bg-surface border border-line font-mono text-[11px] text-ink font-semibold">
                      {id}
                    </span>
                  ))}
                  {selectedTransferIds.size > 10 && (
                    <span className="px-2 py-0.5 rounded bg-surface text-[11px] text-ink-3">
                      +{selectedTransferIds.size - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-danger/10 border border-danger/20 rounded flex items-start gap-2 text-danger text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Permanent database removal: All selected movement records will be expunged from local storage, local PostgREST database (<span className="font-mono">localhost:54321</span>), and cloud sync.
                </span>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteTransferModalOpen(false)}
                disabled={isDeleting}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDeleteTransfers}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-danger hover:bg-danger/90 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting {selectedTransferIds.size} Transfers...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete {selectedTransferIds.size} Transfers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: MANAGE & CLEAR TRANSFERS                                          */}
      {/* ========================================================================= */}
      {isManageTransfersModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-surface w-full max-w-lg rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-sm">Movement Ledger Operations</h3>
                  <p className="text-[11px] text-ink-3">Clear movements or purge transfer records</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManageTransfersModalOpen(false)}
                className="w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="p-3.5 bg-canvas border border-line rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-ink text-xs">Clear All Transfer Movements</h4>
                    <p className="text-ink-3 text-[11px] mt-0.5 leading-relaxed">
                      Removes all inter-dealer and inter-yard transfer records currently logged in the ledger.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmClearAllTransfers}
                    disabled={isDeleting}
                    className="h-7 px-3 rounded bg-surface border border-line hover:border-danger/40 hover:text-danger text-xs font-semibold text-ink transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsManageTransfersModalOpen(false)}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div className="fixed bottom-5 left-5 z-50 bg-surface border border-line shadow-pop px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-ink border-l-4 border-l-accent">
          <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
          <span>{actionFeedback}</span>
          <button 
            onClick={() => setActionFeedback(null)} 
            className="ml-2 text-ink-3 hover:text-ink cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
