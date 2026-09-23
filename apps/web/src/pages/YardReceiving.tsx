import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, CheckCircle2, Camera, Video, Upload, Trash2, 
  Search, ArrowRight, FileText, Check, Package, Warehouse,
  ClipboardCheck, X, StopCircle, FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVehiclesForBrand, saveStockInventory, getActiveStockyards } from '../data/seedData';
import { fetchVehicles, inwardVehicleGate } from '../services/dataService';
import { Empty } from '../components/ui/primitives';
import { formatDate } from '../utils/dateUtils';

interface IncomingVehicle {
  id: string;
  vin: string;
  brand: 'TATA' | 'HYUNDAI';
  model: string;
  variant: string;
  color: string;
  fuel_type?: string;
  fsc_code?: string;
  dealer_code?: string;
  engineNo: string;
  plantCode: string;
  dispatchDate: string;
  trailerNo: string;
  transporter: string;
  status: 'YARD_RECEIVING_PENDING' | 'RECEIVED_IN_YARD';
  customer_name?: string;
  sales_consultant?: string;
  paperPdiPhoto?: string;
  unloadingVideo?: string;
  odometerReading?: number;
  receivedAt?: string;
  yardBay?: string;
}

// Image Compressor (< 2MB)
const compressImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length * 0.75 > 2 * 1024 * 1024 && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
    };
  });
};

export const YardReceivingPage: React.FC = () => {
  const { currentBrand } = useAuth();
  
  const [vehicles, setVehicles] = useState<IncomingVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RECEIVED'>('PENDING');
  const [searchVin, setSearchVin] = useState('');

  // Receiving Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<IncomingVehicle | null>(null);
  const [paperPdiPhoto, setPaperPdiPhoto] = useState<string | null>(null);
  const [unloadingVideo, setUnloadingVideo] = useState<string | null>(null);
  const [odometer, setOdometer] = useState<string>('6');
  const [yardBay, setYardBay] = useState<string>('Bay 1 (Inspection Staging)');
  const [receivingNotes, setReceivingNotes] = useState<string>('Unloaded safely from carrier. Zero physical transit damages.');
  const [isReceivingSuccess, setIsReceivingSuccess] = useState(false);

  const [activeYardsList, setActiveYardsList] = useState(() => getActiveStockyards(currentBrand?.code));

  useEffect(() => {
    fetchIncomingStock();
    setActiveYardsList(getActiveStockyards(currentBrand?.code));

    // Realtime Stock Synchronization
    const handleStockUpdate = () => {
      fetchIncomingStock();
    };

    const handleYardsUpdate = () => {
      setActiveYardsList(getActiveStockyards(currentBrand?.code));
    };

    window.addEventListener('stock-updated', handleStockUpdate);
    window.addEventListener('stockyards-updated', handleYardsUpdate);
    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
      window.removeEventListener('stockyards-updated', handleYardsUpdate);
    };
  }, [currentBrand?.code]);

  const mapVehicles = (rows: any[]): IncomingVehicle[] => {
    return rows.map((v: any) => {
      const s = (v.status || v.vehicle_status || '').toUpperCase();
      const isPending = s === 'YARD_RECEIVING_PENDING' || s === 'GATE_INWARD_PENDING' || s === 'IN_TRANSIT';

      return {
        id: v.id || v.vin,
        vin: v.vin,
        brand: (v.brand || (v.vin?.startsWith('MAL') || (v.model && v.model.toLowerCase().includes('hyundai')) ? 'HYUNDAI' : 'TATA')) as 'TATA' | 'HYUNDAI',
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'White',
        fuel_type: v.fuel_type || 'PETROL',
        fsc_code: v.fsc_code || '',
        dealer_code: v.dealer_code || 'DLR-MH01',
        engineNo: v.engine_no || v.engine_number || 'ENG-001',
        plantCode: v.plant_code || (v.model?.toLowerCase().includes('hyundai') ? 'PLT-CHE' : 'PLT-PUN'),
        dispatchDate: v.purchase_date || '2026-08-25',
        trailerNo: v.trailer_no || 'TR-LOG-01',
        transporter: v.transporter || 'Auto Carrier Logistics',
        customer_name: v.customer_name || '',
        sales_consultant: v.sales_consultant || '',
        status: isPending ? ('YARD_RECEIVING_PENDING' as const) : ('RECEIVED_IN_YARD' as const),
        yardBay: v.location || 'Bay 1 (Inspection Staging)',
        odometerReading: v.odometer || 6,
        paperPdiPhoto: v.paper_pdi_photo,
        unloadingVideo: v.unloading_video,
        receivedAt: v.received_at ? formatDate(v.received_at) : undefined
      };
    });
  };

  const fetchIncomingStock = async () => {
    setLoading(true);
    try {
      const liveStock = await fetchVehicles(currentBrand?.code);
      if (liveStock && liveStock.length > 0) {
        setVehicles(mapVehicles(liveStock));
      } else {
        const localRows = getVehiclesForBrand(currentBrand?.code || '');
        setVehicles(mapVehicles(localRows));
      }
    } catch (e) {
      console.warn('Yard stock load note:', e);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // In-App Camera/Video Recorder State
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean;
    mode: 'PHOTO' | 'VIDEO';
  }>({ isOpen: false, mode: 'PHOTO' });

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const openReceivingModal = (vehicle: IncomingVehicle) => {
    setSelectedVehicle(vehicle);
    setPaperPdiPhoto(null);
    setUnloadingVideo(null);
    setOdometer('8');
    const brandCode = vehicle.brand === 'HYUNDAI' ? 'DHOOT-HYUNDAI' : 'DHOOT-TATA';
    const activeYards = getActiveStockyards(brandCode);
    const defaultYard = vehicle.brand === 'HYUNDAI' ? 'Shantinath Yard' : 'Basni Yard';
    setYardBay(vehicle.yardBay || (activeYards.length > 0 ? activeYards[0].name : defaultYard));
    setIsReceivingSuccess(false);
  };

  // Open In-App Camera
  const openCamera = async (mode: 'PHOTO' | 'VIDEO') => {
    setCameraModal({ isOpen: true, mode });
    setIsRecording(false);
    setRecordSecs(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'VIDEO'
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera note:', e);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraModal({ isOpen: false, mode: 'PHOTO' });
    setIsRecording(false);
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPaperPdiPhoto(dataUrl);
    closeCamera();
  };

  // Start Video Recording
  const startRecord = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setUnloadingVideo(URL.createObjectURL(blob));
      closeCamera();
    };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordSecs(0);
  };

  // Stop Recording
  const stopRecord = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Timer Effect for Video
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSecs(prev => {
          if (prev >= 30) {
            stopRecord();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Upload Paper PDI Photo from File
  const handlePaperPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    setPaperPdiPhoto(compressed);
  };

  // Upload Video from File
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Video exceeds 15 MB. Please select a shorter video.');
    }
    setUnloadingVideo(URL.createObjectURL(file));
  };

  // Submit Inward Gate Receiving & Synchronize with Stock Sheet
  const handleConfirmReceiving = () => {
    if (!selectedVehicle) return;

    // 1. Update component state
    setVehicles(prev => prev.map(v => {
      if (v.vin === selectedVehicle.vin) {
        return {
          ...v,
          status: 'RECEIVED_IN_YARD',
          paperPdiPhoto: paperPdiPhoto || undefined,
          unloadingVideo: unloadingVideo || undefined,
          odometerReading: Number(odometer) || 8,
          receivedAt: formatDate(new Date()),
          yardBay
        };
      }
      return v;
    }));

    // 2. Synchronize with Supabase and local cache
    inwardVehicleGate(selectedVehicle.vin, {
      location: yardBay,
      odometer: Number(odometer) || 8,
      bay: yardBay
    }).catch(console.error);

    try {
      const saved = localStorage.getItem('dhoot_stock_inventory');
      if (saved) {
        let stockList: any[] = JSON.parse(saved);
        if (Array.isArray(stockList)) {
          stockList = stockList.map((item: any) => {
            if ((item.vin || '').toUpperCase().trim() === selectedVehicle.vin.toUpperCase().trim()) {
              return {
                ...item,
                status: 'RECEIVED',
                vehicle_status: 'RECEIVED',
                location: yardBay,
                odometer: Number(odometer) || 8,
                paper_pdi_photo: paperPdiPhoto ? (paperPdiPhoto.length > 500 ? '[Photo Evidence Captured]' : paperPdiPhoto) : undefined,
                unloading_video: unloadingVideo ? '[Video Evidence Captured]' : undefined,
                receiving_notes: receivingNotes,
                received_at: new Date().toISOString()
              };
            }
            return item;
          });

          saveStockInventory(stockList);
        }
      }
    } catch (e) {
      console.warn('Error syncing inward with stock inventory:', e);
    }

    setIsReceivingSuccess(true);
  };

  // Enhanced Filter & Fast Search including Last 5 Digits of VIN
  const cleanSearch = searchVin.trim().toLowerCase();

  const displayedVehicles = vehicles.filter(v => {
    const vin = (v.vin || '').toLowerCase();
    const vinLast5 = vin.slice(-5);
    const vinLast6 = vin.slice(-6);

    const matchesSearch = 
      !cleanSearch ||
      vin.includes(cleanSearch) || 
      vinLast5.includes(cleanSearch) ||
      vinLast6.includes(cleanSearch) ||
      (v.model || '').toLowerCase().includes(cleanSearch) ||
      (v.variant || '').toLowerCase().includes(cleanSearch) ||
      (v.color || '').toLowerCase().includes(cleanSearch) ||
      (v.customer_name || '').toLowerCase().includes(cleanSearch) ||
      (v.trailerNo || '').toLowerCase().includes(cleanSearch) ||
      (v.plantCode || '').toLowerCase().includes(cleanSearch);
    
    if (activeTab === 'PENDING') return matchesSearch && v.status === 'YARD_RECEIVING_PENDING';
    return matchesSearch && v.status === 'RECEIVED_IN_YARD';
  });

  const pendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING').length;
  const receivedCount = vehicles.filter(v => v.status === 'RECEIVED_IN_YARD').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink tracking-tight">Gate Inward Receiving</h1>
            <p className="text-xs text-ink-3">
              Carrier Arrival Protocol • Fast VIN 5-Digit Search • Stock Sheet Auto-Sync &amp; Staging
            </p>
          </div>
        </div>

        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50/60 text-blue-600 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>View Stock Ledger</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 KPI METRIC SUMMARY CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* TOTAL INWARD FLEET */}
        <div className="bg-white rounded-xl border border-blue-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                TOTAL INWARD FLEET
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {vehicles.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-blue-600 tnum">{vehicles.length}</span>
            <span className="text-xs text-ink-3">Units in Stock Ledger</span>
          </div>
        </div>

        {/* PENDING IN-TRANSIT */}
        <div className="bg-white rounded-xl border border-emerald-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                PENDING IN-TRANSIT
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {pendingCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-emerald-600 tnum">{pendingCount}</span>
            <span className="text-xs text-ink-3">Pending Gate Inward</span>
          </div>
        </div>

        {/* RECEIVED IN YARD */}
        <div className="bg-white rounded-xl border border-amber-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Warehouse className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                RECEIVED IN YARD
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {receivedCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-amber-600 tnum">{receivedCount}</span>
            <span className="text-xs text-ink-3">Staged in Yard Bays</span>
          </div>
        </div>

        {/* READY FOR PDI */}
        <div className="bg-white rounded-xl border border-purple-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                READY FOR PDI
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {receivedCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-purple-600 tnum">{receivedCount}</span>
            <span className="text-xs text-ink-3">Available in PDI Queue</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FAST VIN SEARCH BAR                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-line p-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Type Last 5 Digits of VIN (e.g. 88776), Full Chassis, Model, or Trailer No..."
            value={searchVin}
            onChange={(e) => setSearchVin(e.target.value)}
            className="w-full text-xs text-ink placeholder:text-ink-3 bg-transparent outline-none font-medium"
          />
          {searchVin && (
            <button
              onClick={() => setSearchVin('')}
              className="h-6 px-2 bg-canvas hover:bg-surface-sunken border border-line text-[11px] font-medium text-ink-3 rounded transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-ink-3 whitespace-nowrap pr-2">
          <span className="text-ink-3"># Showing </span>
          <span className="font-bold text-ink font-mono tnum">{displayedVehicles.length}</span>
          <span className="text-ink-3"> matching vehicles</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INWARD GATE MANIFEST CARD & DATA TABLE                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden flex flex-col">
        {/* Card Header with Unit Count & Segmented Tab Switcher */}
        <div className="px-4 py-3 border-b border-line flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-ink">Inward Gate Manifest</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              {displayedVehicles.length} Units
            </span>
          </div>

          {/* Segmented Switcher Tabs */}
          <div className="inline-flex bg-slate-100/80 p-0.5 rounded-lg text-xs gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={
                activeTab === 'PENDING'
                  ? 'px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white shadow-xs transition-colors cursor-pointer'
                  : 'px-3 py-1.5 rounded-md text-xs font-medium text-ink-3 hover:text-ink transition-colors cursor-pointer'
              }
            >
              Pending In-Transit ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RECEIVED')}
              className={
                activeTab === 'RECEIVED'
                  ? 'px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white shadow-xs transition-colors cursor-pointer'
                  : 'px-3 py-1.5 rounded-md text-xs font-medium text-ink-3 hover:text-ink transition-colors cursor-pointer'
              }
            >
              Received in Yard ({receivedCount})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-blue-900/70 whitespace-nowrap">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">CHASSIS / VIN (LAST 5 BOLD)</th>
                <th className="py-2.5 px-3">BRAND &amp; MODEL</th>
                <th className="py-2.5 px-3">VARIANT &amp; COLOR</th>
                <th className="py-2.5 px-3">FUEL</th>
                <th className="py-2.5 px-3">PLANT / DEALER</th>
                <th className="py-2.5 px-3">DISPATCH DATE</th>
                <th className="py-2.5 px-3">STAGING BAY</th>
                <th className="py-2.5 px-3">INWARD STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <div className="space-y-2.5">
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </td>
                </tr>
              ) : displayedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <Empty
                      title={searchVin
                        ? "No matching vehicles found"
                        : activeTab === 'PENDING'
                        ? "0 Pending In-Transit Vehicles"
                        : "0 Vehicles Received in Yard"}
                      hint={searchVin
                        ? "Try clearing your VIN / model search query."
                        : activeTab === 'PENDING'
                        ? "No vehicles pending gate inward. Import your daily carrier manifest or dispatch lot from the Stock Inventory page."
                        : "No vehicles recorded in yard yet. Inward in-transit vehicles from the Pending tab."}
                      action={
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                          <Link to="/vehicles" className="btn btn-primary text-xs h-8 px-3.5">
                            <Package className="w-3.5 h-3.5 mr-1" /> View Stock Inventory
                          </Link>
                          <Link to="/dashboard" className="btn btn-secondary text-xs h-8 px-3.5">
                            Go to Dashboard
                          </Link>
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                displayedVehicles.map((v, idx) => {
                  const vinPrefix = v.vin.length > 5 ? v.vin.slice(0, -5) : '';
                  const vinSuffix = v.vin.length > 5 ? v.vin.slice(-5) : v.vin;

                  return (
                    <tr key={v.id || idx} className="hover:bg-slate-50/70 transition-colors bg-white">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum whitespace-nowrap">
                        {idx + 1}
                      </td>

                      {/* VIN with highlighted bold last 5 digits */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <span className="text-ink-3">{vinPrefix}</span>
                        <span className="text-blue-700 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200 ml-0.5">
                          {vinSuffix}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              v.brand === 'HYUNDAI'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {v.brand === 'HYUNDAI' ? 'Hyundai' : 'Tata'}
                          </span>
                          <span className="font-bold text-ink">{v.model}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-ink font-medium">{v.variant}</div>
                        <div className="text-[11px] text-ink-3">{v.color}</div>
                      </td>

                      <td className="py-2.5 px-3 uppercase text-ink-3 font-medium whitespace-nowrap">
                        {v.fuel_type || 'PETROL'}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.plantCode} • {v.dealer_code}
                      </td>

                      <td className="py-2.5 px-3 text-ink-3 font-mono tnum whitespace-nowrap">
                        {formatDate(v.dispatchDate)}
                      </td>

                      <td className="py-2.5 px-3 text-ink font-medium whitespace-nowrap">
                        {v.yardBay || 'Bay 1 (Inspection Staging)'}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending In-Transit
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Received in Yard
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <button
                            type="button"
                            onClick={() => openReceivingModal(v)}
                            className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5 stroke-[2]" />
                            <span>Receive at Gate</span>
                          </button>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <span>Inspect in PDI</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VEHICLE RECEIVING MODAL (PDI PAPER PHOTO + UNLOADING VIDEO)               */}
      {/* ========================================================================= */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-2xl rounded-2xl overflow-hidden border border-line shadow-pop flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Truck className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Gate Inward: Receive {selectedVehicle.model}
                  </h2>
                  <p className="text-xs text-ink-3 mt-0.5 font-mono">
                    VIN: {selectedVehicle.vin} • Last 5: <strong className="text-blue-600">{selectedVehicle.vin.slice(-5)}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="w-8 h-8 rounded-lg hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {!isReceivingSuccess ? (
                <>
                  {/* Vehicle Summary Banner */}
                  <div className="p-3 bg-canvas rounded-xl border border-line flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-ink">{selectedVehicle.model} {selectedVehicle.variant}</h3>
                      <p className="text-[11px] text-ink-2 mt-0.5">Color: {selectedVehicle.color} • Fuel: {selectedVehicle.fuel_type}</p>
                      <p className="text-[11px] text-ink-3 mt-0.5 font-mono">
                        Plant: {selectedVehicle.plantCode} • Dealer: {selectedVehicle.dealer_code}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="eyebrow block">Chassis Stamp</span>
                      <span className="font-bold text-blue-600 text-sm">{selectedVehicle.vin.slice(-5)}</span>
                    </div>
                  </div>

                  {/* 1. MANDATORY PHYSICAL PDI SHEET PHOTO */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-ink">
                      1. OEM Physical PDI Sheet / Inward Gatepass Photo <span className="text-danger">*</span>
                    </label>
                    <p className="text-[11px] text-ink-3">
                      Capture or upload a clear photo of the official paper PDI sheet / transport challan delivered with the car.
                    </p>

                    {paperPdiPhoto ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video max-h-44 border border-line bg-black/5 flex items-center justify-center">
                        <img src={paperPdiPhoto} alt="Paper PDI Sheet" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaperPdiPhoto(null)}
                          className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openCamera('PHOTO')}
                          className="p-3.5 border border-dashed border-line hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-blue-600 bg-canvas transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-xs font-semibold">Take Live Photo</span>
                        </button>

                        <label className="p-3.5 border border-dashed border-line hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-blue-600 bg-canvas transition-all cursor-pointer">
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-xs font-semibold">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePaperPhotoUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. MANDATORY UNLOADING WALKAROUND VIDEO */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-ink">
                      2. Carrier Unloading Walkaround Video (Optional/Max 30s)
                    </label>
                    <p className="text-[11px] text-ink-3">
                      Record or upload a 10-30s walkaround video showing the vehicle being unloaded from carrier trailer.
                    </p>

                    {unloadingVideo ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video max-h-44 border border-line bg-black flex items-center justify-center">
                        <video src={unloadingVideo} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUnloadingVideo(null)}
                          className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg transition-all cursor-pointer shadow-xs z-10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openCamera('VIDEO')}
                          className="p-3.5 border border-dashed border-line hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-blue-600 bg-canvas transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold">Record Live Video</span>
                        </button>

                        <label className="p-3.5 border border-dashed border-line hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-blue-600 bg-canvas transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs font-semibold">Upload Video</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 3. Inward Parameters (Odometer, Bay, Remarks) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Odometer on Arrival (KM) *
                      </label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        className="w-full p-2 bg-canvas border border-line rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-blue-500 font-mono tnum"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Assign Stockyard Staging Bay *
                      </label>
                      <select
                        value={yardBay}
                        onChange={(e) => setYardBay(e.target.value)}
                        className="w-full p-2 bg-canvas border border-line rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-blue-500"
                      >
                        <optgroup label="Transit & Plant">
                          <option value="In Transit">In Transit</option>
                          <option value="In OEM Plant">In OEM Plant</option>
                        </optgroup>
                        <optgroup label="Active Brand Dealership Yards">
                          {getActiveStockyards(selectedVehicle?.brand === 'HYUNDAI' ? 'DHOOT-HYUNDAI' : 'DHOOT-TATA').map(y => (
                            <option key={y.id} value={y.name}>
                              {y.name} ({y.city})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmReceiving}
                      className="w-full h-9 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirm Gate Receiving &amp; Sync with Stock Sheet</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Success Confirmation View */
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-ink">Vehicle Successfully Received in Yard!</h3>
                    <p className="text-xs text-ink-3 max-w-md mx-auto leading-relaxed">
                      Vehicle <strong>{selectedVehicle.vin}</strong> has been received, staged in <strong>{yardBay}</strong>, and synced with Stock Ledger and PDI Queue.
                    </p>
                  </div>
                  <div className="flex gap-2.5 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="h-8 px-4 rounded-lg text-xs font-semibold border border-line text-ink hover:bg-canvas cursor-pointer"
                    >
                      Close
                    </button>
                    <Link
                      to="/pdi"
                      className="h-8 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Proceed to PDI Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CAMERA / VIDEO RECORDER MODAL VIEWPORT                            */}
      {/* ========================================================================= */}
      {cameraModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-2xl overflow-hidden border border-line shadow-pop flex flex-col">
            
            <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                {cameraModal.mode === 'PHOTO' ? <Camera className="w-4 h-4 text-blue-600" /> : <Video className="w-4 h-4 text-amber-600" />}
                <span className="text-xs font-bold text-ink">
                  {cameraModal.mode === 'PHOTO' ? 'Capture Paper PDI Sheet' : 'Record Carrier Unloading Video'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="w-8 h-8 rounded-lg hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-danger text-white px-2.5 py-1 rounded text-xs font-bold font-mono animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>REC 00:{recordSecs < 10 ? '0' + recordSecs : recordSecs} / 00:30</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line flex items-center justify-center gap-3 bg-canvas">
              {cameraModal.mode === 'PHOTO' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecord}
                      className="h-8 px-6 bg-danger hover:bg-danger/90 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecord}
                      className="h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop &amp; Save Video</span>
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
