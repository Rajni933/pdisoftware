import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Car, ShieldCheck, CreditCard, 
  Settings, Plus, Search, ChevronRight, ChevronLeft, CheckCircle2, 
  Briefcase, MapPin, DollarSign, Layers, Shield, Sparkles, 
  FileSpreadsheet, Activity, Wrench, X, Loader2, Camera,
  Video, Edit3, Trash2, Check, AlertTriangle, Sliders,
  Landmark, ShieldAlert, Phone, Mail, UserCheck, Warehouse,
  ToggleLeft, ToggleRight, CheckCircle, XCircle,
  Boxes, Eye, Calendar, ArrowRight, MoreHorizontal, Database
} from 'lucide-react';
import { AdminUsersPage } from './AdminUsers';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';
import { 
  fetchStockyards, saveStockyard, deleteStockyard, toggleStockyardStatus,
  fetchBranches, saveBranch, deleteBranch,
  fetchCheckpoints, saveCheckpoint, deleteCheckpoint,
  fetchMasterModels, saveMasterModel, deleteMasterModel,
  fetchMasterFinanciers, saveMasterFinancier, deleteMasterFinancier,
  fetchMasterInsurance, saveMasterInsurance, deleteMasterInsurance,
  YardItem, BranchItem, PdiRuleItem, FinancierItem, InsuranceItem, VehicleModelItem
} from '../services/dataService';
import { DatabaseConfigModal } from '../components/common/DatabaseConfigModal';

export { type PdiRuleItem, type FinancierItem, type InsuranceItem };

export const AdminMasterPanel: React.FC = () => {
  const { currentBrand } = useAuth();
  const [activeTab, setActiveTab] = useState<'PDI_RULES' | 'USERS' | 'MODELS' | 'YARDS' | 'BRANCHES' | 'FINANCE' | 'INSURANCE'>('YARDS');
  const [loading, setLoading] = useState(true);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // =========================================================================
  // Master State from Live Database (Zero Mock Fallbacks)
  // =========================================================================
  const [yards, setYards] = useState<YardItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [pdiRules, setPdiRules] = useState<PdiRuleItem[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelItem[]>([]);
  const [financiers, setFinanciers] = useState<FinancierItem[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceItem[]>([]);

  // Load all master catalogues from live PostgreSQL database
  const loadAllMasters = async () => {
    setLoading(true);
    try {
      const [y, b, r, m, f, i] = await Promise.all([
        fetchStockyards(),
        fetchBranches(),
        fetchCheckpoints(),
        fetchMasterModels(),
        fetchMasterFinanciers(),
        fetchMasterInsurance()
      ]);
      setYards(y);
      setBranches(b);
      setPdiRules(r);
      setVehicleModels(m);
      setFinanciers(f);
      setInsuranceProviders(i);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasters();

    const handleUpdate = () => {
      loadAllMasters();
    };

    window.addEventListener('stockyards-updated', handleUpdate);
    window.addEventListener('branches-updated', handleUpdate);
    window.addEventListener('pdi-rules-updated', handleUpdate);
    window.addEventListener('models-updated', handleUpdate);
    window.addEventListener('financiers-updated', handleUpdate);
    window.addEventListener('insurance-updated', handleUpdate);
    window.addEventListener('database-config-changed', handleUpdate);

    return () => {
      window.removeEventListener('stockyards-updated', handleUpdate);
      window.removeEventListener('branches-updated', handleUpdate);
      window.removeEventListener('pdi-rules-updated', handleUpdate);
      window.removeEventListener('models-updated', handleUpdate);
      window.removeEventListener('financiers-updated', handleUpdate);
      window.removeEventListener('insurance-updated', handleUpdate);
      window.removeEventListener('database-config-changed', handleUpdate);
    };
  }, []);

  // =========================================================================
  // 1. Stockyards Handlers
  // =========================================================================
  const [yardBrandFilter, setYardBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [yardSearch, setYardSearch] = useState('');
  const [showYardModal, setShowYardModal] = useState(false);
  const [editingYard, setEditingYard] = useState<YardItem | null>(null);
  const [yardForm, setYardForm] = useState<YardItem>({
    id: '',
    code: '',
    name: '',
    brand: 'Tata Motors',
    city: 'Jodhpur',
    state: 'Rajasthan',
    capacity: '100 Cars',
    manager: '',
    phone: '+91 ',
    status: 'ACTIVE'
  });

  const handleToggleYardStatus = async (id: string) => {
    const target = yards.find(y => y.id === id);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setYards(prev => prev.map(y => y.id === id ? { ...y, status: nextStatus } : y));
    await toggleStockyardStatus(id, nextStatus);
  };

  const handleOpenAddYard = () => {
    setEditingYard(null);
    setYardForm({
      id: `yrd-${Date.now()}`,
      code: `YRD-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai' : 'Tata Motors',
      city: 'Jodhpur',
      state: 'Rajasthan',
      capacity: '100 Cars',
      manager: '',
      phone: '+91 98290 ',
      status: 'ACTIVE'
    });
    setShowYardModal(true);
  };

  const handleOpenEditYard = (y: YardItem) => {
    setEditingYard(y);
    setYardForm({ ...y });
    setShowYardModal(true);
  };

  const handleSaveYard = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStockyard(yardForm);
    setShowYardModal(false);
    setEditingYard(null);
  };

  const handleDeleteYard = async (id: string) => {
    if (confirm('Are you sure you want to remove this stockyard?')) {
      await deleteStockyard(id);
    }
  };

  // =========================================================================
  // 2. Branches Handlers
  // =========================================================================
  const [branchBrandFilter, setBranchBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [branchSearch, setBranchSearch] = useState('');
  const [branchPage, setBranchPage] = useState(1);
  const branchesPerPage = 6;
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState<BranchItem>({
    id: '',
    code: '',
    name: '',
    brand: 'Tata Motors',
    type: 'Main Showroom',
    city: 'Jodhpur',
    state: 'Rajasthan',
    capacity: '80 Cars',
    manager: '',
    phone: '+91 ',
    status: 'ACTIVE'
  });

  const handleToggleBranchStatus = async (id: string) => {
    const target = branches.find(b => b.id === id);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setBranches(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
    await saveBranch({ ...target, status: nextStatus });
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      id: `br-${Date.now()}`,
      code: `BR-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai' : 'Tata Motors',
      type: 'Main Showroom',
      city: 'Jodhpur',
      state: 'Rajasthan',
      capacity: '60 Cars',
      manager: '',
      phone: '+91 98290 ',
      status: 'ACTIVE'
    });
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: BranchItem) => {
    setEditingBranch(b);
    setBranchForm({ ...b });
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBranch(branchForm);
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm('Are you sure you want to remove this branch/showroom?')) {
      await deleteBranch(id);
    }
  };

  // =========================================================================
  // 3. PDI Checkpoints Handlers
  // =========================================================================
  const [pdiSearch, setPdiSearch] = useState('');
  const [pdiBrandFilter, setPdiBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [pdiPage, setPdiPage] = useState(1);
  const pdiPerPage = 6;
  const [showPdiModal, setShowPdiModal] = useState(false);
  const [editingPdiRule, setEditingPdiRule] = useState<PdiRuleItem | null>(null);
  const [pdiForm, setPdiForm] = useState<PdiRuleItem>({
    id: '',
    stage: 'Exterior',
    category: 'Body Panels',
    code: '',
    title: '',
    description: '',
    standardRemark: 'Inspected and verified OK',
    mandatory: true,
    photosRequired: 1,
    videoRequired: false,
    severity: 'MAJOR',
    toolRequired: 'Visual',
    status: 'ACTIVE'
  });

  const handleTogglePdiStatus = async (id: string) => {
    const target = pdiRules.find(r => r.id === id);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setPdiRules(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));
    await saveCheckpoint({ ...target, status: nextStatus });
  };

  const handleOpenAddPdi = () => {
    setEditingPdiRule(null);
    setPdiForm({
      id: `RULE-${Date.now().toString().slice(-4)}`,
      stage: 'Exterior',
      category: 'General',
      code: `CHK-${Date.now().toString().slice(-3)}`,
      title: '',
      description: '',
      standardRemark: 'Inspected and verified OK',
      mandatory: true,
      photosRequired: 1,
      videoRequired: false,
      severity: 'MAJOR',
      toolRequired: 'Visual',
      status: 'ACTIVE'
    });
    setShowPdiModal(true);
  };

  const handleOpenEditPdi = (rule: PdiRuleItem) => {
    setEditingPdiRule(rule);
    setPdiForm({ ...rule });
    setShowPdiModal(true);
  };

  const handleSavePdi = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCheckpoint(pdiForm);
    setShowPdiModal(false);
    setEditingPdiRule(null);
  };

  const handleDeletePdi = async (id: string) => {
    if (confirm('Are you sure you want to remove this PDI checkpoint?')) {
      await deleteCheckpoint(id);
    }
  };

  // =========================================================================
  // 4. Vehicle Models Handlers
  // =========================================================================
  const [modelSearch, setModelSearch] = useState('');
  const [modelBrandFilter, setModelBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModelItem | null>(null);
  const [modelForm, setModelForm] = useState<VehicleModelItem>({
    id: '',
    brand: 'Tata Motors',
    model_name: '',
    body_type: 'Compact SUV',
    base_ex_showroom: 800000,
    fuel_types: ['PETROL'],
    transmission: '6MT / 6AT',
    seating_capacity: '5 Seater',
    variants: ['Smart', 'Pure', 'Adventure'],
    colors: ['White', 'Grey', 'Black'],
    gst_rate: 28
  });

  const handleOpenAddModel = () => {
    setEditingModel(null);
    setModelForm({
      id: `m-${Date.now()}`,
      brand: currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai' : 'Tata Motors',
      model_name: '',
      body_type: 'SUV',
      base_ex_showroom: 900000,
      fuel_types: ['PETROL', 'DIESEL'],
      transmission: '6MT / 6AT',
      seating_capacity: '5 Seater',
      variants: ['Standard', 'Luxury'],
      colors: ['White', 'Black'],
      gst_rate: 28
    });
    setShowModelModal(true);
  };

  const handleOpenEditModel = (m: VehicleModelItem) => {
    setEditingModel(m);
    setModelForm({ ...m });
    setShowModelModal(true);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMasterModel(modelForm);
    setShowModelModal(false);
    setEditingModel(null);
  };

  const handleDeleteModel = async (id: string) => {
    if (confirm('Are you sure you want to remove this vehicle model?')) {
      await deleteMasterModel(id);
    }
  };

  // =========================================================================
  // 5. Financiers Handlers
  // =========================================================================
  const [financeSearch, setFinanceSearch] = useState('');
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState<FinancierItem | null>(null);
  const [financeForm, setFinanceForm] = useState<FinancierItem>({
    id: '',
    name: '',
    category: 'PRIVATE_BANK',
    code: '',
    contactPerson: '',
    designation: '',
    phone: '+91 ',
    email: '',
    maxLtv: 90,
    processingFee: 0.5,
    activeStatus: 'ACTIVE'
  });

  const handleOpenAddFinance = () => {
    setEditingFinance(null);
    setFinanceForm({
      id: `fin-${Date.now()}`,
      name: '',
      category: 'PRIVATE_BANK',
      code: `FIN-${Date.now().toString().slice(-4)}`,
      contactPerson: '',
      designation: 'Auto Loans Desk',
      phone: '+91 ',
      email: '',
      maxLtv: 90,
      processingFee: 0.5,
      activeStatus: 'ACTIVE'
    });
    setShowFinanceModal(true);
  };

  const handleOpenEditFinance = (item: FinancierItem) => {
    setEditingFinance(item);
    setFinanceForm({ ...item });
    setShowFinanceModal(true);
  };

  const handleSaveFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMasterFinancier(financeForm);
    setShowFinanceModal(false);
    setEditingFinance(null);
  };

  const handleDeleteFinance = async (id: string) => {
    if (confirm('Are you sure you want to remove this banking partner?')) {
      await deleteMasterFinancier(id);
    }
  };

  // =========================================================================
  // 6. Insurance Providers Handlers
  // =========================================================================
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceItem | null>(null);
  const [insuranceForm, setInsuranceForm] = useState<InsuranceItem>({
    id: '',
    name: '',
    code: '',
    claimsHead: '',
    surveyorName: '',
    surveyorContact: '+91 ',
    cashlessTieUp: true,
    discountPercentage: 60,
    policyTypes: 'Zero Dep, RTI, Engine Protect'
  });

  const handleOpenAddInsurance = () => {
    setEditingInsurance(null);
    setInsuranceForm({
      id: `ins-${Date.now()}`,
      name: '',
      code: `INS-${Date.now().toString().slice(-4)}`,
      claimsHead: '',
      surveyorName: '',
      surveyorContact: '+91 ',
      cashlessTieUp: true,
      discountPercentage: 60,
      policyTypes: 'Zero Dep, RTI, Engine Protect, Key Replacement'
    });
    setShowInsuranceModal(true);
  };

  const handleOpenEditInsurance = (item: InsuranceItem) => {
    setEditingInsurance(item);
    setInsuranceForm({ ...item });
    setShowInsuranceModal(true);
  };

  const handleSaveInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMasterInsurance(insuranceForm);
    setShowInsuranceModal(false);
    setEditingInsurance(null);
  };

  const handleDeleteInsurance = async (id: string) => {
    if (confirm('Are you sure you want to remove this insurance tie-up partner?')) {
      await deleteMasterInsurance(id);
    }
  };

  // Filtered lists
  const filteredYards = yards.filter(y => {
    const matchesBrand = yardBrandFilter === 'ALL' || y.brand === yardBrandFilter || y.brand === 'Shared';
    const matchesSearch = !yardSearch || y.name.toLowerCase().includes(yardSearch.toLowerCase()) || y.city.toLowerCase().includes(yardSearch.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const filteredBranches = branches.filter(b => {
    const matchesBrand = branchBrandFilter === 'ALL' || b.brand === branchBrandFilter || b.brand === 'Shared';
    const matchesSearch = !branchSearch || b.name.toLowerCase().includes(branchSearch.toLowerCase()) || b.city.toLowerCase().includes(branchSearch.toLowerCase());
    return matchesBrand && matchesSearch;
  });
  const totalBranchPages = Math.ceil(filteredBranches.length / branchesPerPage) || 1;
  const paginatedBranches = filteredBranches.slice((branchPage - 1) * branchesPerPage, branchPage * branchesPerPage);

  const filteredPdiRules = pdiRules.filter(r => {
    const q = pdiSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.stage.toLowerCase().includes(q) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      r.severity.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.standardRemark && r.standardRemark.toLowerCase().includes(q))
    );
  });
  const totalPdiPages = Math.ceil(filteredPdiRules.length / pdiPerPage) || 1;
  const paginatedPdiRules = filteredPdiRules.slice((pdiPage - 1) * pdiPerPage, pdiPage * pdiPerPage);

  const renderBankLogo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('sbi') || lower.includes('state bank')) {
      return (
        <svg className="w-7 h-7 shrink-0 text-blue-600" viewBox="0 0 32 32" fill="currentColor">
          <circle cx="16" cy="16" r="16" fill="currentColor" />
          <circle cx="16" cy="16" r="6.5" fill="white" />
          <rect x="14.5" y="16" width="3" height="10" fill="currentColor" />
        </svg>
      );
    }
    if (lower.includes('hdfc')) {
      return (
        <div className="w-7 h-7 rounded-md bg-blue-900 flex items-center justify-center shrink-0 shadow-xs p-1">
          <div className="w-full h-full border border-white/60 flex items-center justify-center bg-blue-900">
            <div className="w-2.5 h-2.5 bg-red-600 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-900" />
            </div>
          </div>
        </div>
      );
    }
    if (lower.includes('icici')) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-xs italic">
          <span className="font-serif leading-none">i</span>
        </div>
      );
    }
    if (lower.includes('tata')) {
      return (
        <div className="w-7 h-7 rounded-md bg-sky-950 flex items-center justify-center shrink-0 shadow-xs text-white font-black text-[8px] tracking-tighter">
          <span>TATA</span>
        </div>
      );
    }
    if (lower.includes('bajaj')) {
      return (
        <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-xs">
          <span className="leading-none">B</span>
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
        <Landmark className="w-3.5 h-3.5" />
      </div>
    );
  };

  const activeYardsCount = yards.filter(y => y.status === 'ACTIVE').length;
  const activeBranchesCount = branches.filter(b => b.status === 'ACTIVE').length;
  const activeFinanciersCount = financiers.filter(f => f.activeStatus.toLowerCase().includes('active')).length;
  const maxLtvVal = financiers.length > 0 ? Math.max(...financiers.map(f => f.maxLtv || 0)) : 100;

  const filteredFinanciers = financiers.filter(f => {
    const q = financeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.contactPerson.toLowerCase().includes(q) ||
      f.phone.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.code && f.code.toLowerCase().includes(q))
    );
  });

  const filteredInsuranceProviders = insuranceProviders.filter(i => {
    const q = insuranceSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.claimsHead.toLowerCase().includes(q) ||
      i.surveyorContact.toLowerCase().includes(q) ||
      (i.surveyorName && i.surveyorName.toLowerCase().includes(q)) ||
      (i.policyTypes && i.policyTypes.toLowerCase().includes(q))
    );
  });

  const filteredModels = vehicleModels.filter(m => {
    const q = modelSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.model_name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.body_type.toLowerCase().includes(q) ||
      m.transmission.toLowerCase().includes(q) ||
      (m.fuel_types || []).some((f: string) => f.toLowerCase().includes(q)) ||
      (m.variants || []).some((v: string) => v.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-950 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Master Data &amp; Facility Management</h1>
            <p className="text-xs text-ink-3 mt-0.5">
              Manage OEM Stockyards, Showroom Branches, Inspection Checkpoints, Vehicle Models &amp; Financiers
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDbModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-ink hover:bg-surface-hover transition-colors shadow-xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Database Connection &amp; Seeder</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-line text-xs font-semibold text-ink shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>11 Sep 2025</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar (7 Horizontal Cards matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Card 1: Stockyards */}
        <button
          type="button"
          onClick={() => setActiveTab('YARDS')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'YARDS'
              ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-blue-50/40 border-blue-100/80 hover:bg-blue-50/70 hover:border-blue-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Stockyards</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{yards.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 2: Branches & Showrooms */}
        <button
          type="button"
          onClick={() => setActiveTab('BRANCHES')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'BRANCHES'
              ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-emerald-50/40 border-emerald-100/80 hover:bg-emerald-50/70 hover:border-emerald-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Branches &amp; Showrooms</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{branches.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 3: Checkpoints */}
        <button
          type="button"
          onClick={() => setActiveTab('PDI_RULES')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'PDI_RULES'
              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-amber-50/40 border-amber-100/80 hover:bg-amber-50/70 hover:border-amber-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Checkpoints</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{pdiRules.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 4: Users & Roles */}
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-purple-50/40 border-purple-100/80 hover:bg-purple-50/70 hover:border-purple-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Users &amp; Roles</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">6</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 5: Models */}
        <button
          type="button"
          onClick={() => setActiveTab('MODELS')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'MODELS'
              ? 'bg-cyan-50/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
              : 'bg-cyan-50/40 border-cyan-100/80 hover:bg-cyan-50/70 hover:border-cyan-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Models</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{vehicleModels.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 6: Financiers */}
        <button
          type="button"
          onClick={() => setActiveTab('FINANCE')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'FINANCE'
              ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-rose-50/40 border-rose-100/80 hover:bg-rose-50/70 hover:border-rose-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Financiers</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{financiers.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>

        {/* Card 7: Insurance */}
        <button
          type="button"
          onClick={() => setActiveTab('INSURANCE')}
          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'INSURANCE'
              ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-indigo-50/40 border-indigo-100/80 hover:bg-indigo-50/70 hover:border-indigo-200'
          }`}
        >
          <div className="w-7.5 h-7.5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">Insurance</div>
            <div className="text-lg font-bold font-mono text-slate-900 leading-tight mt-0.5">{insuranceProviders.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Partners</div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOCKYARDS MASTER (TATA & HYUNDAI YARDS)                           */}
      {/* ========================================================================= */}
      {activeTab === 'YARDS' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* TOTAL STOCKYARDS */}
            <div className="bg-blue-50/40 border border-blue-100/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Warehouse className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] font-bold tracking-wider text-blue-600 uppercase truncate leading-none">
                    TOTAL STOCKYARDS
                  </span>
                  <span className="text-base font-bold font-mono text-ink tracking-tight tnum leading-tight mt-0.5">
                    {yards.length}
                  </span>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-blue-100/50 flex items-center justify-between text-[10px] text-blue-600 font-medium">
                <span>Configured Yards</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* ACTIVE STOCKYARDS */}
            <div className="bg-emerald-50/40 border border-emerald-100/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Eye className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] font-bold tracking-wider text-emerald-700 uppercase truncate leading-none">
                    ACTIVE STOCKYARDS
                  </span>
                  <span className="text-base font-bold font-mono text-ink tracking-tight tnum leading-tight mt-0.5">
                    {activeYardsCount}
                  </span>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-emerald-100/50 flex items-center justify-between text-[10px] text-emerald-700 font-medium">
                <span>Visible in Dropdowns</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* TATA STOCKYARDS */}
            <div className="bg-indigo-50/40 border border-indigo-100/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 9h8M12 9v7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] font-bold tracking-wider text-indigo-700 uppercase truncate leading-none">
                    TATA STOCKYARDS
                  </span>
                  <span className="text-base font-bold font-mono text-ink tracking-tight tnum leading-tight mt-0.5">
                    {yards.filter(y => y.brand === 'Tata Motors').length}
                  </span>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-indigo-100/50 flex items-center justify-between text-[10px] text-indigo-700 font-medium">
                <span>Tata Dealerships</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* HYUNDAI STOCKYARDS */}
            <div className="bg-rose-50/40 border border-rose-100/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <ellipse cx="12" cy="12" rx="9" ry="7" />
                    <path d="M9 8v8M15 8v8M9 12h6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] font-bold tracking-wider text-rose-700 uppercase truncate leading-none">
                    HYUNDAI STOCKYARDS
                  </span>
                  <span className="text-base font-bold font-mono text-ink tracking-tight tnum leading-tight mt-0.5">
                    {yards.filter(y => y.brand === 'Hyundai').length}
                  </span>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-rose-100/50 flex items-center justify-between text-[10px] text-rose-700 font-medium">
                <span>Hyundai Dealerships</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-ink tracking-tight">Stockyard Facilities Ledger</h2>
                <span className="bg-blue-100/70 text-blue-700 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                  {filteredYards.length} Facilities
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                {/* Search Box */}
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Yard Name or City"
                    value={yardSearch}
                    onChange={(e) => setYardSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50/80 border border-line rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Brand Filter */}
                <select
                  value={yardBrandFilter}
                  onChange={(e) => setYardBrandFilter(e.target.value as any)}
                  className="h-8 text-xs bg-slate-50/80 border border-line rounded-lg px-3 text-ink focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Tata Motors">Tata Motors Yards</option>
                  <option value="Hyundai">Hyundai Yards</option>
                </select>

                {/* Add Stockyard Button */}
                <button
                  type="button"
                  onClick={handleOpenAddYard}
                  className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Add Stockyard</span>
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">STOCKYARD NAME</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">BRAND DEALERSHIP</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">LOCATION / CITY</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">YARD IN-CHARGE</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">CONTACT PHONE</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">STATUS</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 text-ink-2 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredYards.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <Empty
                          title="No stockyards configured"
                          hint="Add your first stockyard facility or seed standard master catalogs."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddYard}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Stockyard
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredYards.map((y, idx) => {
                      const isActive = y.status === 'ACTIVE';
                      return (
                        <tr key={y.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 text-center text-ink-3 tnum whitespace-nowrap font-mono">
                            {idx + 1}.
                          </td>
                          <td className="py-3 px-3 font-bold text-ink whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
                                <Warehouse className="w-3.5 h-3.5" />
                              </div>
                              <span>{y.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
                              {y.brand}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-ink-2 whitespace-nowrap">
                            {y.city}, {y.state}
                          </td>
                          <td className="py-3 px-3 text-ink font-medium whitespace-nowrap">
                            {y.manager || 'Yard Supervisor'}
                          </td>
                          <td className="py-3 px-3 font-mono text-ink-3 whitespace-nowrap">
                            {y.phone}
                          </td>
                          
                          {/* 1-Click Status Toggle */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleYardStatus(y.id)}
                              className={`h-6 px-2.5 rounded-full text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ACTIVE</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>INACTIVE</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditYard(y)}
                                className="p-1 rounded text-ink-3 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit Stockyard"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteYard(y.id)}
                                className="p-1 rounded text-ink-3 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Stockyard"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANCHES & SHOWROOMS MASTER (TATA & HYUNDAI BRANCHES)              */}
      {/* ========================================================================= */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-4">
          <div className="bg-white border border-line rounded-2xl shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">Branch &amp; Showroom Directory</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
                    {branches.length} Showrooms
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Branch Name or City..."
                    value={branchSearch}
                    onChange={(e) => {
                      setBranchSearch(e.target.value);
                      setBranchPage(1);
                    }}
                    className="h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 w-56 sm:w-64 transition-colors"
                  />
                </div>

                <select
                  value={branchBrandFilter}
                  onChange={(e) => {
                    setBranchBrandFilter(e.target.value as any);
                    setBranchPage(1);
                  }}
                  className="h-8.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-slate-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="Hyundai">Hyundai</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddBranch}
                  className="h-8.5 px-3.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Branch / Showroom Name</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Brand</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Type</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">City</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Branch Manager</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Contact Phone</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredBranches.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <Empty
                          title="No showroom branches configured"
                          hint="Add your first dealership branch or seed standard master catalogs."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddBranch}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Branch
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedBranches.map((b, idx) => {
                      const rowIdx = (branchPage - 1) * branchesPerPage + idx + 1;
                      const isActive = b.status === 'ACTIVE';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 text-center text-slate-500 font-mono text-xs whitespace-nowrap">
                            {rowIdx}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-800 text-xs">{b.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {b.brand}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              b.type === 'Main Showroom'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {b.type}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                            {b.city}, {b.state}
                          </td>
                          <td className="py-3 px-3.5 text-slate-800 whitespace-nowrap font-medium">
                            {b.manager}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap text-xs">
                            {b.phone}
                          </td>
                          
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleBranchStatus(b.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ACTIVE</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>INACTIVE</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditBranch(b)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit Branch"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBranch(b.id)}
                                className="p-1 rounded text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Branch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredBranches.length === 0 ? 0 : (branchPage - 1) * branchesPerPage + 1} - {Math.min(branchPage * branchesPerPage, filteredBranches.length)} of {filteredBranches.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBranchPage(p => Math.max(1, p - 1))}
                  disabled={branchPage === 1}
                  className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalBranchPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setBranchPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      branchPage === pg
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-line text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBranchPage(p => Math.min(totalBranchPages, p + 1))}
                  disabled={branchPage === totalBranchPages || totalBranchPages === 0}
                  className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER TABS: USERS, PDI RULES, MODELS, FINANCE, INSURANCE                  */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && <AdminUsersPage />}

      {activeTab === 'PDI_RULES' && (
        <div className="space-y-4">
          <div className="bg-white border border-line rounded-2xl shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">PDI Checkpoints Master</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
                    {pdiRules.length} Checkpoints
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Checkpoint Title, Stage, Code..."
                    value={pdiSearch}
                    onChange={(e) => {
                      setPdiSearch(e.target.value);
                      setPdiPage(1);
                    }}
                    className="h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 w-56 sm:w-64 transition-colors"
                  />
                </div>

                <select
                  value={pdiBrandFilter}
                  onChange={(e) => {
                    setPdiBrandFilter(e.target.value as any);
                    setPdiPage(1);
                  }}
                  className="h-8.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-slate-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="Hyundai">Hyundai</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddPdi}
                  className="h-8.5 px-3.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Checkpoint</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Checkpoint Title &amp; Instructions</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Stage</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Code</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Default / Standard Remark</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Severity</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Evidence Req.</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Special Tool</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredPdiRules.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <Empty
                          title="No PDI checkpoints configured"
                          hint="Add your first inspection checkpoint or seed standard master catalogs."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddPdi}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Checkpoint
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedPdiRules.map((r, idx) => {
                      const rowIdx = (pdiPage - 1) * pdiPerPage + idx + 1;
                      const isActive = r.status === 'ACTIVE';
                      return (
                        <tr key={r.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 text-center text-slate-500 font-mono text-xs whitespace-nowrap">
                            {rowIdx}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-800 text-xs">{r.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-800">
                            {r.stage}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600 text-xs">
                            {r.code || '—'}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-xs max-w-xs truncate" title={r.standardRemark}>
                            {r.standardRemark || 'Inspected and verified OK'}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                              r.severity === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                                : r.severity === 'MAJOR'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                : 'bg-blue-50 text-blue-600 border border-blue-200/80'
                            }`}>
                              {r.severity}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap text-slate-600 text-xs">
                            {r.photosRequired} {r.photosRequired === 1 ? 'Photo' : 'Photos'} {r.videoRequired ? '+ Video' : ''}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 text-xs">
                            {r.toolRequired || 'Visual'}
                          </td>
                          
                          {/* Status Toggle */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleTogglePdiStatus(r.id)}
                              className={`h-6 px-2.5 rounded-full text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ACTIVE</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>INACTIVE</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPdi(r)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit Checkpoint"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePdi(r.id)}
                                className="p-1 rounded text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Checkpoint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredPdiRules.length === 0 ? 0 : (pdiPage - 1) * pdiPerPage + 1} - {Math.min(pdiPage * pdiPerPage, filteredPdiRules.length)} of {filteredPdiRules.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPdiPage(p => Math.max(1, p - 1))}
                  disabled={pdiPage === 1}
                  className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPdiPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setPdiPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      pdiPage === pg
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-line text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPdiPage(p => Math.min(totalPdiPages, p + 1))}
                  disabled={pdiPage === totalPdiPages || totalPdiPages === 0}
                  className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MODELS' && (
        <div className="space-y-4">
          <div className="bg-white border border-line rounded-2xl shadow-xs overflow-hidden">
            {/* Card Header with Banner */}
            <div className="p-4 md:p-5 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              {/* Left: Title, Badges, Add Button & Search */}
              <div className="flex-1 max-w-2xl space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Vehicle Models Catalog
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
                    {vehicleModels.length} Models
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddModel}
                    className="ml-1 h-7 px-3 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Model</span>
                  </button>
                </div>

                <div className="relative w-full max-w-xl">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Model Name, Body Type, Transmission, Variants..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full h-9.5 pl-10 pr-3 text-xs bg-slate-50/70 border border-slate-200 focus:bg-white rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Right: Graphic Banner */}
              <div className="shrink-0 self-center md:self-auto hidden sm:block">
                <img
                  src="/brand/models-banner.png"
                  alt="More Models, More Choices, Better Journeys"
                  className="h-20 w-auto rounded-xl object-cover shadow-2xs"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">MODEL NAME</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">BRAND</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">BODY TYPE</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">BASE EX-SHOWROOM</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">TRANSMISSION</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">FUEL TYPES</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">SEATING</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredModels.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <Empty
                          title="No vehicle models found"
                          hint="Add a new vehicle model or seed master vehicle catalogs directly from the database seeder."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddModel}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Model
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredModels.map((m, idx) => (
                      <tr key={m.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3.5 text-center text-slate-400 font-mono text-xs whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-3.5 font-bold text-slate-900 text-xs whitespace-nowrap">
                          {m.model_name}
                        </td>
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            m.brand === 'Hyundai'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {m.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600 whitespace-nowrap text-xs">
                          {m.body_type}
                        </td>
                        <td className="py-3.5 px-3.5 text-left font-bold text-slate-900 font-mono text-xs whitespace-nowrap">
                          ₹{Number(m.base_ex_showroom).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600 font-mono text-xs whitespace-nowrap">
                          {m.transmission}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600 font-mono text-xs whitespace-nowrap uppercase">
                          {(m.fuel_types || []).join(', ')}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600 text-xs whitespace-nowrap">
                          {m.seating_capacity}
                        </td>
                        <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModel(m)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Model"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteModel(m.id)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Model"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="space-y-4">
          {/* Sub-header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Banking &amp; Financier Partners</h2>
              <p className="text-xs text-slate-500 mt-1">Manage and track your banking &amp; finance partners efficiently</p>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Partners */}
            <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 tracking-tight">Total Partners</div>
                <div className="text-2xl font-bold font-mono text-slate-900 leading-none mt-1">
                  {financiers.length}
                </div>
              </div>
            </div>

            {/* Card 2: Active Tie-Ups */}
            <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 tracking-tight">Active Tie-Ups</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 leading-none mt-1">
                  {activeFinanciersCount}
                </div>
              </div>
            </div>

            {/* Card 3: Max LTV */}
            <div className="bg-purple-50/50 border border-purple-100/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 tracking-tight">Max LTV</div>
                <div className="text-2xl font-bold font-mono text-purple-700 leading-none mt-1">
                  {maxLtvVal}%
                </div>
              </div>
            </div>

            {/* Card 4: Processing Fee */}
            <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 tracking-tight">Processing Fee</div>
                <div className="text-2xl font-bold font-mono text-slate-900 leading-none mt-1">
                  0.25%
                </div>
              </div>
            </div>
          </div>

          {/* Search & Action Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Bank Name, Contact Officer, Phone or Category..."
                value={financeSearch}
                onChange={(e) => setFinanceSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs transition-colors"
              />
              {financeSearch && (
                <button
                  type="button"
                  onClick={() => setFinanceSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenAddFinance}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banking Partner</span>
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-line rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/50 border-b border-line text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-4 whitespace-nowrap">BANK / FINANCIER NAME</th>
                    <th className="py-3 px-4 whitespace-nowrap">CATEGORY</th>
                    <th className="py-3 px-4 whitespace-nowrap">CONTACT LEAD</th>
                    <th className="py-3 px-4 whitespace-nowrap">PHONE NUMBER</th>
                    <th className="py-3 px-4 whitespace-nowrap">MAX LTV</th>
                    <th className="py-3 px-4 whitespace-nowrap">PROCESSING FEE</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">STATUS</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-slate-600 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredFinanciers.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <Empty
                          title="No banking partners found"
                          hint="Add your first financier tie-up or seed standard banking partners from the database seeder."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddFinance}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Banking Partner
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredFinanciers.map((f, idx) => (
                      <tr key={f.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs whitespace-nowrap">
                          {idx + 1}.
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {renderBankLogo(f.name)}
                            <span className="font-bold text-slate-900 text-xs">{f.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-wider">
                            {f.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 text-xs font-medium whitespace-nowrap">
                          {f.contactPerson}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {f.phone}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                          {f.maxLtv}%
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {f.processingFee}%
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            {f.activeStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditFinance(f)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Financier"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFinance(f.id)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove Partner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'INSURANCE' && (
        <div className="space-y-4">
          {/* Search & Action Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Insurance Company, Claims Lead, Phone or Covers..."
                value={insuranceSearch}
                onChange={(e) => setInsuranceSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs transition-colors"
              />
              {insuranceSearch && (
                <button
                  type="button"
                  onClick={() => setInsuranceSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenAddInsurance}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Insurance Partner</span>
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-line rounded-2xl shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-line flex items-center gap-2.5 bg-white">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                General Insurance Tie-up Partners
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
                {insuranceProviders.length} Partners
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-50/50 border-b border-line text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-4 whitespace-nowrap">INSURANCE COMPANY</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">TIE-UP DISCOUNT</th>
                    <th className="py-3 px-4 whitespace-nowrap">CLAIMS LEAD / IN-CHARGE</th>
                    <th className="py-3 px-4 whitespace-nowrap">SURVEYOR / CONTACT PHONE</th>
                    <th className="py-3 px-4 whitespace-nowrap">COVERAGE PACKAGES (COVERS)</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">CASHLESS TIE-UP</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-slate-600 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4">
                        <div className="space-y-2">
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                          <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredInsuranceProviders.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <Empty
                          title="No insurance partners found"
                          hint="Add your first insurance tie-up partner or seed standard tie-ups from the database seeder."
                          action={
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenAddInsurance}
                                className="btn btn-primary text-xs h-7 px-3"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Insurance Partner
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbModalOpen(true)}
                                className="btn btn-secondary text-xs h-7 px-3"
                              >
                                <Database className="w-3 h-3 mr-1" /> Seed Master Data
                              </button>
                            </div>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredInsuranceProviders.map((i, idx) => (
                      <tr key={i.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs whitespace-nowrap">
                          {idx + 1}.
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                          {i.name}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-700 border border-blue-200/60">
                            {i.discountPercentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium text-xs whitespace-nowrap">
                          {i.claimsHead}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {i.surveyorContact}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                          {i.policyTypes}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {i.cashlessTieUp ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Reimbursement
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditInsurance(i)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Insurance Partner"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInsurance(i.id)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete Partner"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STOCKYARD                                               */}
      {/* ========================================================================= */}
      {showYardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingYard ? 'Edit Stockyard Facility' : 'Add New Stockyard Facility'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure yard name, brand assignment, and operational status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowYardModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveYard} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Stockyard Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basni Yard, Shantinath Yard, Sumerpur..."
                    value={yardForm.name}
                    onChange={(e) => setYardForm({ ...yardForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Brand Assignment *
                  </label>
                  <select
                    value={yardForm.brand}
                    onChange={(e) => setYardForm({ ...yardForm, brand: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                                      </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jodhpur, Pali, Balotra..."
                    value={yardForm.city}
                    onChange={(e) => setYardForm({ ...yardForm, city: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Vehicle Storage Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150 Cars"
                    value={yardForm.capacity}
                    onChange={(e) => setYardForm({ ...yardForm, capacity: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={yardForm.status}
                    onChange={(e) => setYardForm({ ...yardForm, status: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Yard In-Charge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Choudhary"
                    value={yardForm.manager}
                    onChange={(e) => setYardForm({ ...yardForm, manager: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98290 00000"
                    value={yardForm.phone}
                    onChange={(e) => setYardForm({ ...yardForm, phone: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowYardModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingYard ? 'Save Changes' : 'Create Stockyard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BRANCH                                                  */}
      {/* ========================================================================= */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingBranch ? 'Edit Showroom Branch' : 'Add New Showroom Branch'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure branch name, brand dealership, and operational status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBranchModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch / Showroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pratap Nagar, Bhagat Ki Kothi, Sumerpur..."
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Brand Assignment *
                  </label>
                  <select
                    value={branchForm.brand}
                    onChange={(e) => setBranchForm({ ...branchForm, brand: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                                      </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch Type
                  </label>
                  <select
                    value={branchForm.type}
                    onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Main Showroom">Main Showroom</option>
                    <option value="RSO">RSO (Regional / Rural Sales Outlet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jodhpur, Pali, Balotra..."
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={branchForm.status}
                    onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={branchForm.manager}
                    onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98290 00000"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingBranch ? 'Save Changes' : 'Create Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PDI CHECKPOINT                                          */}
      {/* ========================================================================= */}
      {showPdiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingPdiRule ? 'Edit PDI Checkpoint' : 'Add PDI Checkpoint'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure inspection criteria, stage, severity, and photo/video evidence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPdiModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePdi} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Checkpoint Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Body Panel Alignment, Paint Gloss..."
                    value={pdiForm.title}
                    onChange={(e) => setPdiForm({ ...pdiForm, title: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Inspection Stage *</label>
                  <select
                    value={pdiForm.stage}
                    onChange={(e) => setPdiForm({ ...pdiForm, stage: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Exterior">Exterior</option>
                    <option value="Electricals">Electricals</option>
                    <option value="Interior">Interior</option>
                    <option value="Engine Bay">Engine Bay</option>
                    <option value="Underbody">Underbody</option>
                    <option value="Road Test">Road Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Severity Rating *</label>
                  <select
                    value={pdiForm.severity}
                    onChange={(e) => setPdiForm({ ...pdiForm, severity: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                    <option value="OBSERVATION">OBSERVATION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Photos Required</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={pdiForm.photosRequired}
                    onChange={(e) => setPdiForm({ ...pdiForm, photosRequired: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Special Tool Required</label>
                  <input
                    type="text"
                    placeholder="e.g. Feeler Gauge, Multimeter, Visual"
                    value={pdiForm.toolRequired}
                    onChange={(e) => setPdiForm({ ...pdiForm, toolRequired: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Default / Standard Remark (Auto-filled on PASS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. All panel gaps uniform (3.5mm) & factory aligned"
                    value={pdiForm.standardRemark || ''}
                    onChange={(e) => setPdiForm({ ...pdiForm, standardRemark: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Inspection Instructions *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detailed inspection checklist steps for the engineer..."
                    value={pdiForm.description}
                    onChange={(e) => setPdiForm({ ...pdiForm, description: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowPdiModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingPdiRule ? 'Save Changes' : 'Create Checkpoint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT VEHICLE MODEL                                           */}
      {/* ========================================================================= */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingModel ? 'Edit Vehicle Model' : 'Add Vehicle Model'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure model name, brand, body type, and base pricing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModelModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Safari, Hyundai Creta..."
                    value={modelForm.model_name}
                    onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Brand Dealership *</label>
                  <select
                    value={modelForm.brand}
                    onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Body Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compact SUV, Sedan..."
                    value={modelForm.body_type}
                    onChange={(e) => setModelForm({ ...modelForm, body_type: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Base Ex-Showroom (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1099000"
                    value={modelForm.base_ex_showroom}
                    onChange={(e) => setModelForm({ ...modelForm, base_ex_showroom: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Transmission</label>
                  <input
                    type="text"
                    placeholder="e.g. 6MT / 6AT / DCA"
                    value={modelForm.transmission}
                    onChange={(e) => setModelForm({ ...modelForm, transmission: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Seating Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Seater, 7 Seater"
                    value={modelForm.seating_capacity}
                    onChange={(e) => setModelForm({ ...modelForm, seating_capacity: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingModel ? 'Save Changes' : 'Create Model'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BANKING & FINANCIER PARTNER                             */}
      {/* ========================================================================= */}
      {showFinanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingFinance ? 'Edit Banking Partner' : 'Add Banking Partner'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure bank name, partner category, loan desk officer, and LTV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFinance} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Bank / Financier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India, HDFC Bank Ltd..."
                    value={financeForm.name}
                    onChange={(e) => setFinanceForm({ ...financeForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Institution Category *</label>
                  <select
                    value={financeForm.category}
                    onChange={(e) => setFinanceForm({ ...financeForm, category: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="NATIONALISED_BANK">Nationalised Bank</option>
                    <option value="PRIVATE_BANK">Private Bank</option>
                    <option value="OEM_CAPTIVE_NBFC">OEM Captive NBFC</option>
                    <option value="NBFC">NBFC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Max LTV (%) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={100}
                    value={financeForm.maxLtv}
                    onChange={(e) => setFinanceForm({ ...financeForm, maxLtv: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Contact Officer / Lead *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anil Kumar (Chief Manager Auto Loans)"
                    value={financeForm.contactPerson}
                    onChange={(e) => setFinanceForm({ ...financeForm, contactPerson: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 141 223 9011"
                    value={financeForm.phone}
                    onChange={(e) => setFinanceForm({ ...financeForm, phone: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.50"
                    value={financeForm.processingFee}
                    onChange={(e) => setFinanceForm({ ...financeForm, processingFee: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowFinanceModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingFinance ? 'Save Changes' : 'Create Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INSURANCE PARTNER                                       */}
      {/* ========================================================================= */}
      {showInsuranceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingInsurance ? 'Edit Insurance Tie-up' : 'Add Insurance Partner'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure insurance company, tie-up discount, claims desk and coverages</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInsuranceModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInsurance} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Insurance Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata AIG General Insurance, ICICI Lombard..."
                    value={insuranceForm.name}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Tie-Up Discount (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    placeholder="e.g. 60"
                    value={insuranceForm.discountPercentage}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Cashless Tie-Up Facility *
                  </label>
                  <select
                    value={insuranceForm.cashlessTieUp ? 'YES' : 'NO'}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, cashlessTieUp: e.target.value === 'YES' })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="YES">Yes - Cashless Approved</option>
                    <option value="NO">No - Reimbursement Only</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Claims Lead / Contact Officer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Sen (Zonal Claims Lead)"
                    value={insuranceForm.claimsHead}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, claimsHead: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Surveyor Contact / Toll Free Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 1800 266 7780"
                    value={insuranceForm.surveyorContact}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, surveyorContact: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Policy Coverage Packages (Covers) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Zero Dep, Engine Protect, RTI, Key Replacement, Consumables Cover"
                    value={insuranceForm.policyTypes}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, policyTypes: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowInsuranceModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingInsurance ? 'Save Changes' : 'Create Tie-up'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase PostgreSQL Configuration & Master Seeder Modal */}
      <DatabaseConfigModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />

    </div>
  );
};

export const AdminMasterPanelPage = AdminMasterPanel;
