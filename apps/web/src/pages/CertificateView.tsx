import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, CheckCircle2 } from 'lucide-react';

export const CertificateViewPage: React.FC = () => {
  const { id } = useParams();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/qa" className="p-2 bg-surface border border-line rounded text-ink-3 hover:text-ink flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to QA Queue
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-accent hover:bg-accent-600 text-white text-sm font-semibold rounded flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Official Certificate Paper Document */}
      <div className="bg-surface border-2 border-accent rounded-panel p-10 space-y-8 relative overflow-hidden">
        {/* Watermark Logo Accent */}
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
          <img src="/logo.png" alt="Watermark" className="w-64 h-64 object-contain" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-accent pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Dhoot Group Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">AUTOPRIME TATA</h1>
              <p className="text-xs uppercase font-bold text-ink-3">Dhoot Group — Authorized Tata Motors Dealership</p>
              <p className="text-[11px] text-ink-3">Pune Central Branch • Nagar Road, Pune, MH 411014</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent-soft px-3 py-1 rounded-chip border border-accent-line">
              OFFICIAL CERTIFICATE
            </span>
            <div className="mt-2 text-xs font-mono font-bold text-ink">CERT: PDI-TATA-2026-9812</div>
            <div className="text-[11px] text-ink-3">Date: 25 Aug 2026</div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-accent">
            PRE-DELIVERY INSPECTION CERTIFICATE
          </h2>
          <p className="text-xs text-ink-2 max-w-xl mx-auto">
            This certifies that the vehicle identified below has undergone a comprehensive 120-point quality audit in accordance with Tata Motors OEM specifications and is certified 100% Delivery Ready.
          </p>
        </div>

        {/* Vehicle Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-canvas border border-line rounded text-xs">
          <div>
            <span className="text-ink-3 block uppercase text-[10px] font-semibold">Model / Variant</span>
            <span className="font-bold text-sm text-ink">Tata Curvv.ev</span>
            <span className="text-[11px] text-ink-3 block">Empowered Plus 55</span>
          </div>
          <div>
            <span className="text-ink-3 block uppercase text-[10px] font-semibold">VIN / Chassis Number</span>
            <span className="font-mono font-bold text-xs text-ink">MAT612345C1122334</span>
            <span className="text-[11px] text-ink-3 block">CH: CH-CRV-3319</span>
          </div>
          <div>
            <span className="text-ink-3 block uppercase text-[10px] font-semibold">Fuel & Color</span>
            <span className="font-bold text-sm text-ink">EV (Electric)</span>
            <span className="text-[11px] text-ink-3 block">Virtual Sunrise</span>
          </div>
          <div>
            <span className="text-ink-3 block uppercase text-[10px] font-semibold">Odometer & Battery</span>
            <span className="font-bold text-sm text-ink">18 KM</span>
            <span className="text-[11px] text-ok font-semibold block">SOC: 98% (12.8V)</span>
          </div>
        </div>

        {/* Inspection Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Quality Audit Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-ok-soft border border-ok-line rounded text-center">
              <span className="text-ok font-extrabold text-lg block">100%</span>
              <span className="text-ok font-semibold text-[11px]">Exterior & Body</span>
            </div>
            <div className="p-3 bg-ok-soft border border-ok-line rounded text-center">
              <span className="text-ok font-extrabold text-lg block">100%</span>
              <span className="text-ok font-semibold text-[11px]">Electrical & Lighting</span>
            </div>
            <div className="p-3 bg-ok-soft border border-ok-line rounded text-center">
              <span className="text-ok font-extrabold text-lg block">100%</span>
              <span className="text-ok font-semibold text-[11px]">Underhood & Fluids</span>
            </div>
            <div className="p-3 bg-ok-soft border border-ok-line rounded text-center">
              <span className="text-ok font-extrabold text-lg block">100%</span>
              <span className="text-ok font-semibold text-[11px]">Brakes & Road Test</span>
            </div>
          </div>
        </div>

        {/* Verification & Signatures */}
        <div className="pt-6 border-t-2 border-accent flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-line rounded bg-canvas">
              <QrCode className="w-16 h-16 text-ink" />
            </div>
            <div className="text-left space-y-0.5">
              <span className="text-[10px] font-bold text-ok uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Verified
              </span>
              <p className="text-[11px] font-mono text-ink-3">TOKEN: QR-9921ABCD</p>
              <p className="text-[10px] text-ink-3">Scan QR to verify certificate validity</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic font-bold text-base text-accent">K. R. Deshmukh</div>
            <div className="text-xs font-bold text-ink">Quality Assurance Manager</div>
            <div className="text-[11px] text-ink-3">Dhoot Group PDI Authority</div>
          </div>
        </div>
      </div>
    </div>
  );
};
