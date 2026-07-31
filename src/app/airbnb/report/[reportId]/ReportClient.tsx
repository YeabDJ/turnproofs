'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  User, 
  Printer, 
  Download,
  ExternalLink, 
  CheckCircle, 
  Check,
  Camera, 
  ChevronLeft,
  X,
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ReportTask {
  id: string;
  task_name: string;
  requires_photo: boolean;
  photo_url: string | null;
  completed: boolean;
}

interface Report {
  id: string;
  property_id: string;
  cleaner_name: string;
  started_at: string;
  completed_at: string;
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  notes: string;
  created_at: string;
  airbnb_properties: {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    cover_image_url: string;
  } | null;
}

// Distance helper
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rLat1) * Math.cos(rLat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function ReportClient({ reportId }: { reportId: string }) {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [report, setReport] = useState<Report | null>(null);
  const [tasks, setTasks] = useState<ReportTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal photo preview
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Retouch addendum state
  const [showRetouchModal, setShowRetouchModal] = useState(false);
  const [retouchText, setRetouchText] = useState('');
  const [retouchPhotoUrl, setRetouchPhotoUrl] = useState('');
  const [uploadingRetouchPhoto, setUploadingRetouchPhoto] = useState(false);
  const [submittingRetouch, setSubmittingRetouch] = useState(false);

  // Host Touchup Request State
  const [showTouchupModal, setShowTouchupModal] = useState(false);
  const [selectedTouchupTasks, setSelectedTouchupTasks] = useState<string[]>([]);
  const [customTouchupNotes, setCustomTouchupNotes] = useState('');
  const [targetCleanerEmail, setTargetCleanerEmail] = useState('');
  const [submittingTouchup, setSubmittingTouchup] = useState(false);
  const [touchupSuccess, setTouchupSuccess] = useState(false);
  const [touchupShareInfo, setTouchupShareInfo] = useState<{ smsLink: string; whatsappLink: string; touchupUrl: string; shareText: string; cleanerEmail?: string } | null>(null);

  // Translation state for Spanish cleaner notes
  const [translatedNotes, setTranslatedNotes] = useState<string | null>(null);
  const [isTranslatingNotes, setIsTranslatingNotes] = useState(false);
  const [showEnglishNotes, setShowEnglishNotes] = useState(false);

  async function handleTranslateNotes(text: string) {
    if (translatedNotes) {
      setShowEnglishNotes(!showEnglishNotes);
      return;
    }
    setIsTranslatingNotes(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`);
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        setTranslatedNotes(data.responseData.translatedText);
        setShowEnglishNotes(true);
      } else {
        setTranslatedNotes(text);
        setShowEnglishNotes(true);
      }
    } catch (e) {
      setTranslatedNotes(text);
      setShowEnglishNotes(true);
    } finally {
      setIsTranslatingNotes(false);
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchReportDetails() {
      try {
        let res = await fetch(`/api/airbnb/reports/${reportId}`);
        let data = await res.json();
        
        if (!res.ok || !data.success) {
          // Auto-recover fallback to latest report if reportId was undefined or missing
          const fallbackRes = await fetch('/api/airbnb/reports');
          const fallbackData = await fallbackRes.json();
          if (fallbackData.reports && fallbackData.reports.length > 0) {
            const latest = fallbackData.reports[0];
            const detailRes = await fetch(`/api/airbnb/reports/${latest.id}`);
            const detailData = await detailRes.json();
            if (detailData.success && detailData.report) {
              setReport(detailData.report);
              setTasks(detailData.tasks || []);
              setLoading(false);
              return;
            }
          }
          setError(data.error || 'Failed to fetch report details.');
        } else {
          setReport(data.report);
          let loadedTasks = data.tasks || [];

          // If report tasks are empty, fetch property template tasks to populate certificate checklist!
          if (loadedTasks.length === 0 && data.report?.property_id) {
            try {
              const propTasksRes = await fetch(`/api/airbnb/checklists?propertyId=${data.report.property_id}`);
              const propTasksData = await propTasksRes.json();
              if (propTasksData.success && propTasksData.tasks && propTasksData.tasks.length > 0) {
                loadedTasks = propTasksData.tasks.map((t: any) => ({
                  id: t.id,
                  task_name: t.task_name,
                  requires_photo: !!t.requires_photo,
                  photo_url: null,
                  completed: true
                }));
              }
            } catch (e) {}
          }

          setTasks(loadedTasks);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report', err);
        setError('A network error occurred.');
        setLoading(false);
      }
    }

    fetchReportDetails();
  }, [reportId]);

  const handleSubmitRetouch = async () => {
    if (!retouchText.trim()) {
      alert(lang === 'en' ? 'Please describe what was re-cleaned or retouched.' : 'Describa lo que se volvió a limpiar.');
      return;
    }
    setSubmittingRetouch(true);
    try {
      const res = await fetch('/api/airbnb/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_retouch_update',
          reportId: reportId,
          author: lang === 'en' ? 'Quality Control Resolution' : 'Resolución de Control de Calidad',
          text: retouchText.trim(),
          photoUrl: retouchPhotoUrl || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowRetouchModal(false);
        setRetouchText('');
        setRetouchPhotoUrl('');
        // Refresh certificate to show newly appended resolution addendum!
        const refRes = await fetch(`/api/airbnb/reports/${reportId}`);
        const refData = await refRes.json();
        if (refData.success) {
          setReport(refData.report);
        }
      } else {
        alert('Failed to save update: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error submitting update.');
    } finally {
      setSubmittingRetouch(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <Clock className="h-8 w-8 text-rose-500 animate-spin mb-4" />
        <span className="text-neutral-400 font-medium">Generating official compliance audit...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4 animate-bounce" />
        <span className="text-neutral-300 font-semibold mb-2">{error || 'Report not found.'}</span>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-sm font-semibold transition-all"
        >
          Close Tab
        </button>
      </div>
    );
  }

  const startDate = new Date(report.started_at);
  const endDate = new Date(report.completed_at);
  const elapsedMs = endDate.getTime() - startDate.getTime();
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

  // Parse notes JSON if collaborative/advanced notes with multiple photos are present
  let notesText = report.notes || '';
  let additionalPhotos: string[] = [];
  let hostMessage = '';
  let maintenanceAlert = false;
  let maintenanceDesc = '';
  let retouches: Array<{ id: string; timestamp: string; author: string; text: string; photoUrl: string | null }> = [];
  let touchupRequest: any = null;
  let supplies: Record<string, 'full' | 'low' | 'out'> = { toiletPaper: 'full', soap: 'full', trashBags: 'full', paperTowels: 'full' };
  
  let customSupplies: Array<{ name: string; level: 'full' | 'low' | 'out' }> = [];
  
  if (report.notes && report.notes.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(report.notes);
      notesText = parsed.text || '';
      additionalPhotos = parsed.photos || [];
      hostMessage = parsed.hostMessage || '';
      maintenanceAlert = !!parsed.maintenanceAlert;
      maintenanceDesc = parsed.maintenanceDesc || '';
      retouches = parsed.retouches || [];
      if (parsed.touchupRequest) {
        touchupRequest = parsed.touchupRequest;
      }
      if (parsed.supplies) {
        supplies = { ...supplies, ...parsed.supplies };
        customSupplies = parsed.supplies.customSupplies || [];
      }
    } catch (e) {
      console.error('Failed to parse report notes JSON', e);
    }
  }

  // Parse pipe-delimited alert photos attached to instant notes
  if (notesText && notesText.includes('|||')) {
    const parts = notesText.split('|||');
    notesText = parts[0].trim();
    const alertPhotoUrls = parts[1].split(',').map(s => s.trim()).filter(Boolean);
    additionalPhotos = Array.from(new Set([...additionalPhotos, ...alertPhotoUrls]));
  }

  // Geolocation comparisons
  let distanceStartStr = '';
  let distanceEndStr = '';
  const targetLat = report.airbnb_properties?.latitude;
  const targetLng = report.airbnb_properties?.longitude;

  if (targetLat !== null && targetLng !== null && targetLat !== undefined && targetLng !== undefined) {
    if (report.start_latitude && report.start_longitude) {
      const dStart = getDistanceMeters(targetLat, targetLng, report.start_latitude, report.start_longitude);
      distanceStartStr = dStart < 1000 
        ? `${dStart.toFixed(0)}m from target property`
        : `${(dStart / 1000).toFixed(2)}km from target property`;
    }
    if (report.end_latitude && report.end_longitude) {
      const dEnd = getDistanceMeters(targetLat, targetLng, report.end_latitude, report.end_longitude);
      distanceEndStr = dEnd < 1000
        ? `${dEnd.toFixed(0)}m from target property`
        : `${(dEnd / 1000).toFixed(2)}km from target property`;
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white font-sans p-6 md:p-12 print:bg-white print:text-black">
      
      {/* Dynamic CSS styles print injection */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 12mm;
            size: auto;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, .no-print-element {
            display: none !important;
          }
          .print-card {
            border: 1px solid #d1d5db !important;
            background-color: white !important;
            box-shadow: none !important;
            color: black !important;
            padding: 16px !important;
          }
          .print-text-dark {
            color: #111827 !important;
          }
          .print-text-muted {
            color: #4b5563 !important;
          }
          .print-badge {
            border: 1px solid #e5e7eb !important;
            background: #f8fafc !important;
            color: #1f2937 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            color: #111827 !important;
          }
          .overflow-x-auto, .overflow-hidden {
            overflow: visible !important;
          }
          .photo-proof-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Outer wrapper */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Action Bar (Hidden in prints) */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>{lang === 'en' ? 'Close Certificate' : 'Cerrar Certificado'}</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowTouchupModal(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>{lang === 'en' ? '🔍 Request Touch-Up' : '🔍 Solicitar Retoque'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRetouchModal(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Camera className="h-4 w-4 text-emerald-400" />
              <span>{lang === 'en' ? '📷 Add Fix / Retouch Proof' : '📷 Añadir Corrección'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-xs text-white transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{lang === 'en' ? 'Print / Export PDF' : 'Imprimir / Exportar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Certificate Card Container */}
        <div className="print-card bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="absolute -inset-0.5 bg-linear-to-tr from-rose-500/5 to-orange-500/5 rounded-3xl blur-md -z-10 no-print" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-neutral-800/80">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-rose-500 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-lg text-rose-500 tracking-tight">TURNPROOFS VERIFICATION SYSTEM</span>
              </Link>
              <h1 className="print-text-dark text-3xl font-extrabold tracking-tight">{lang === 'en' ? 'Cleaning Verification Certificate' : 'Certificado de Verificación de Limpieza'}</h1>
              <p className="print-text-muted text-sm text-neutral-400 mt-1">{lang === 'en' ? 'Official checklist compliance record for short-term rental properties.' : 'Registro oficial de cumplimiento de lista de verificación.'}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bilingual Language Toggle Button */}
              <button
                type="button"
                onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
                className="no-print-element px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                🌐 {lang === 'en' ? 'Español' : 'English'}
              </button>

              {/* Authenticity QR Code & Verification Badge */}
              <div className="print-badge flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl h-fit">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://turnproofs.com/airbnb/report/${report.id}`}
                  alt="Scan QR for Airbnb Dispute Authenticity"
                  className="h-13 w-13 rounded-xl border border-neutral-700 bg-white p-0.5 shrink-0"
                />
                <div className="text-left pr-1">
                  <span className="block text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">✓ Authenticity QR</span>
                  <span className="block text-[10px] font-semibold text-neutral-400 print-text-muted uppercase tracking-wider">{lang === 'en' ? 'Verification ID' : 'ID de Verificación'}</span>
                  <span className="font-mono text-xs font-bold text-neutral-200 print-text-dark">{report.id.substring(0, 18).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance alert warning banner */}
          {maintenanceAlert && (
            <div className="mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-start gap-3.5 shadow-lg shadow-red-500/5">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base tracking-tight text-white print:text-black">⚠️ Maintenance Issue Reported</h4>
                <p className="text-sm text-red-300 print:text-gray-700 leading-relaxed font-semibold">{maintenanceDesc || 'An issue was reported during the clean. Please check comments.'}</p>
              </div>
            </div>
          )}

          {/* Property and Cleaner Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-neutral-800/80">
            <div className="space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-neutral-500" />
                <span>Property Details</span>
              </h3>
              <div className="pl-6.5 space-y-1">
                <p className="print-text-dark font-extrabold text-neutral-100 text-lg">{report.airbnb_properties?.name || 'Vacation Unit'}</p>
                <p className="print-text-muted text-sm text-neutral-400 leading-relaxed">{report.airbnb_properties?.address}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-neutral-500" />
                <span>Cleaning Execution</span>
              </h3>
              <div className="pl-6.5 space-y-1">
                <p className="print-text-dark font-extrabold text-neutral-100 text-lg">{report.cleaner_name}</p>
                <div className="flex flex-col gap-1 mt-1 text-sm text-neutral-400 print-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span>Completed on {endDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span>Duration: {elapsedMinutes} minutes ({startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Coordinates Verification */}
          <div className="py-8 border-b border-neutral-800/80 space-y-4">
            <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              <span>Geolocation Evidence Logging</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Coordinates */}
              <div className="print-badge p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex justify-between items-center group">
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Start Coordinates</span>
                  {report.start_latitude && report.start_longitude ? (
                    <>
                      <span className="font-mono text-sm font-bold block text-neutral-200">
                        {report.start_latitude.toFixed(6)}, {report.start_longitude.toFixed(6)}
                      </span>
                      {distanceStartStr && (
                        <span className="text-[10px] text-emerald-400 font-semibold block">{distanceStartStr}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-neutral-500 font-medium">GPS Access Denied/Unavailable</span>
                  )}
                </div>
                {report.start_latitude && report.start_longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${report.start_latitude},${report.start_longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition-all"
                    title="Open Start in Google Maps"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* End Coordinates */}
              <div className="print-badge p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex justify-between items-center group">
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">End Coordinates</span>
                  {report.end_latitude && report.end_longitude ? (
                    <>
                      <span className="font-mono text-sm font-bold block text-neutral-200">
                        {report.end_latitude.toFixed(6)}, {report.end_longitude.toFixed(6)}
                      </span>
                      {distanceEndStr && (
                        <span className="text-[10px] text-emerald-400 font-semibold block">{distanceEndStr}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-neutral-500 font-medium">GPS Access Denied/Unavailable</span>
                  )}
                </div>
                {report.end_latitude && report.end_longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${report.end_latitude},${report.end_longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition-all"
                    title="Open End in Google Maps"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
            </div>
          </div>
          </div>

          {/* Supplies & Time Audit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-neutral-800/80">
            {/* Supplies Inventory */}
            <div className="space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <FileCheck2 className="h-4.5 w-4.5 text-neutral-500" />
                <span>Supply Inventory Levels</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3.5 pl-6.5">
                {[
                  { name: 'Toilet Paper', val: supplies.toiletPaper },
                  { name: 'Hand Soap', val: supplies.soap },
                  { name: 'Trash Liners', val: supplies.trashBags },
                  { name: 'Paper Towels', val: supplies.paperTowels },
                  ...customSupplies.map(c => ({ name: c.name, val: c.level }))
                ].map((item, index) => {
                  const badgeColor = 
                    item.val === 'full' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : item.val === 'low' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20';
                  
                  return (
                    <div key={index} className="print-badge p-3 rounded-xl bg-neutral-950 border border-neutral-800/85 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-neutral-400 truncate">{item.name}</span>
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${badgeColor}`}>
                        {item.val || 'full'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Tracking Timeline */}
            <div className="space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-neutral-500" />
                <span>Cleaning Pace Timeline</span>
              </h3>
              
              <div className="pl-6.5 space-y-3.5">
                <div className="relative border-l border-neutral-800 pl-4 space-y-4">
                  {/* Start timeline bubble */}
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 border-2 border-rose-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Check In</span>
                    <span className="text-xs font-semibold text-neutral-250 text-neutral-200">{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  
                  {/* Elapsed timeline bubble */}
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 border-2 border-amber-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Duration</span>
                    <span className="text-xs font-bold text-amber-400">{elapsedMinutes} Minutes Active Clean</span>
                  </div>

                  {/* Checkout timeline bubble */}
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 border-2 border-emerald-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Check Out & Sign</span>
                    <span className="text-xs font-semibold text-neutral-250 text-neutral-200">{endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Cleaning Checklist Table */}
          <div className="py-8 border-b border-neutral-800/80 space-y-4">
            <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4.5 w-4.5 text-neutral-500" />
                <span>Verified Cleaning Checklist</span>
              </div>
              <span className="text-xs font-semibold text-neutral-400 print-text-muted">
                {tasks.filter(t => t.completed).length} / {tasks.length} Tasks Verified
              </span>
            </h3>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/20 print:border-gray-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/80 text-xs font-semibold text-neutral-400 uppercase tracking-wider print:bg-gray-100 print:text-gray-700 print:border-gray-300">
                      <th className="p-3.5">Room & Task Item</th>
                      <th className="p-3.5 text-center">Compliance Method</th>
                      <th className="p-3.5 text-center">Photo Proof</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-sm text-neutral-300 print:divide-gray-200">
                    {tasks.map((task) => {
                      let roomName = 'General / Entire Unit';
                      let cleanTaskName = task.task_name;
                      const match = task.task_name.match(/^\[(.*?)\]\s*(.*)$/);
                      if (match) {
                        roomName = match[1];
                        cleanTaskName = match[2];
                      }

                      return (
                        <tr key={task.id} className="hover:bg-neutral-900/10 transition-colors print:bg-white">
                          <td className="p-3.5">
                            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block print-text-muted">{roomName}</span>
                            <span className="font-bold text-neutral-100 print-text-dark text-xs sm:text-sm">{cleanTaskName}</span>
                          </td>
                          <td className="p-3.5 text-center text-xs">
                            {task.photo_url ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold print:bg-emerald-50 print:border-emerald-300 print:text-emerald-800">
                                <Camera className="h-3 w-3" />
                                <span>Photo Verified</span>
                              </span>
                            ) : task.requires_photo ? (
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-bold print:bg-amber-50 print:border-amber-300 print:text-amber-800">
                                <Camera className="h-3 w-3" />
                                <span>Photo Required</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500 print-text-muted font-medium">Self Checked</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {task.photo_url ? (
                              <div
                                onClick={() => setSelectedPhoto(task.photo_url)}
                                className="inline-block cursor-pointer group"
                              >
                                <img
                                  src={task.photo_url}
                                  alt={cleanTaskName}
                                  className="h-10 w-10 object-cover rounded-lg border border-neutral-700 group-hover:border-emerald-400 transition-colors print:border-gray-300 inline-block"
                                />
                              </div>
                            ) : (
                              <span className="text-neutral-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-extrabold print:bg-emerald-100 print:border-emerald-400 print:text-emerald-800">
                              <Check className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Photo Evidence Gallery (Visible in BOTH Web View AND Printed PDF) */}
          {tasks.some(t => t.photo_url) && (
            <div className="py-8 border-b border-neutral-800/80 space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-neutral-500" />
                  <span>High-Resolution Photo Evidence Gallery</span>
                </div>
                <span className="text-xs font-semibold text-neutral-400 print-text-muted">
                  {tasks.filter(t => t.photo_url).length} Photos Logged
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tasks.filter(t => t.photo_url).map((task) => {
                  let roomName = 'General';
                  let cleanTaskName = task.task_name;
                  const match = task.task_name.match(/^\[(.*?)\]\s*(.*)$/);
                  if (match) {
                    roomName = match[1];
                    cleanTaskName = match[2];
                  }

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedPhoto(task.photo_url)}
                      className="photo-proof-card rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950/80 cursor-zoom-in relative group hover:border-neutral-600 transition-colors flex flex-col justify-between"
                    >
                      <div className="aspect-4/3 w-full overflow-hidden relative">
                        <img
                          src={task.photo_url || ''}
                          alt={task.task_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">
                          ✓ Verified
                        </div>
                      </div>
                      <div className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 print:bg-gray-50 print:border-gray-200">
                        <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-wider block truncate print-text-muted">{roomName}</span>
                        <span className="text-xs font-bold text-neutral-200 block truncate print-text-dark">{cleanTaskName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cleaner Notes Section */}
          {notesText && (
            <div className="py-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="print-text-dark font-bold text-base text-neutral-200">Cleaner Notes</h3>
                <button
                  type="button"
                  onClick={() => handleTranslateNotes(notesText)}
                  className="no-print px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 text-xs font-bold text-rose-400 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  {isTranslatingNotes ? (
                    <span>Translating...</span>
                  ) : showEnglishNotes ? (
                    <span>🌐 Show Original Note</span>
                  ) : (
                    <span>🌐 Translate Note to English</span>
                  )}
                </button>
              </div>

              <div className="print-badge p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <p className="text-sm leading-relaxed text-neutral-300 print-text-muted whitespace-pre-wrap">
                  {showEnglishNotes && translatedNotes ? translatedNotes : notesText}
                </p>
                {showEnglishNotes && (
                  <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    ✓ Translated to English
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Additional General Photos Gallery */}
          {additionalPhotos.length > 0 && (
            <div className="py-8 border-t border-neutral-800/80 space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-neutral-500" />
                <span>Additional Property Photos</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {additionalPhotos.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(url)}
                    className="no-print aspect-square rounded-2xl overflow-hidden border border-neutral-800 cursor-zoom-in relative group hover:border-neutral-600 transition-colors"
                  >
                    <img src={url} alt="additional proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                  </div>
                ))}
                {/* Print view additional photos */}
                {additionalPhotos.map((url, i) => (
                  <div key={`print-additional-${i}`} className="hidden print:block border border-gray-300 rounded-lg p-1.5">
                    <img src={url} alt="additional proof" className="w-full h-40 object-cover rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Private Message to Host */}
          {hostMessage && (
            <div className="py-8 border-t border-neutral-800/80 space-y-3">
              <h3 className="print-text-dark font-bold text-base text-neutral-300">Direct Note to Host</h3>
              <div className="print-badge p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <p className="text-sm leading-relaxed text-rose-400 print-text-muted whitespace-pre-wrap font-semibold">{hostMessage}</p>
              </div>
            </div>
          )}

          {/* Host Touch-Up Request Banner */}
          {touchupRequest && (
            <div className="py-6 border-t border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  <h3 className="print-text-dark font-extrabold text-base text-amber-300">
                    {lang === 'en' ? '🔍 Host Quality Control Touch-Up Request' : '🔍 Solicitud de Retoque del Anfitrión'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {touchupRequest.status || 'pending'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                {touchupRequest.items?.length > 0 && (
                  <>
                    <p className="text-xs font-bold text-amber-200">Requested Items:</p>
                    <ul className="list-disc pl-5 text-xs text-neutral-300 space-y-1">
                      {(touchupRequest.items || []).map((it: string, i: number) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </>
                )}
                {touchupRequest.notes && (
                  <p className="text-xs text-amber-300/90 font-medium italic mt-2">
                    Host Notes: "{touchupRequest.notes}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quality Control Retouch Addendum Section */}
          {retouches.length > 0 && (
            <div className="py-8 border-t border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="print-text-dark font-extrabold text-base text-emerald-300">
                  {lang === 'en' ? '🟢 Quality Control Resolution Addendum' : '🟢 Adenda de Resolución de Control de Calidad'}
                </h3>
              </div>

              <div className="space-y-4">
                {retouches.map((item, idx) => (
                  <div key={item.id || idx} className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-400 border-b border-emerald-500/20 pb-2">
                      <span className="font-bold text-emerald-300">{item.author}</span>
                      <span className="font-mono text-[11px]">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-neutral-200 print-text-dark font-medium whitespace-pre-wrap">{item.text}</p>
                    {item.photoUrl && (
                      <div className="pt-2">
                        <img 
                          src={item.photoUrl} 
                          alt="retouch resolution proof" 
                          onClick={() => setSelectedPhoto(item.photoUrl)}
                          className="h-36 sm:h-48 rounded-xl border border-emerald-500/40 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Badge Footer */}
          <div className="pt-10 border-t border-neutral-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 print-text-muted">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>TurnProofs Certified Audit Log. Cryptographically signed.</span>
            </div>
            <div>
              <span>Generated on: {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* INSTANT RETOUCH / FIX PROOF MODAL (Hidden in prints) */}
      {showRetouchModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 no-print animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowRetouchModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-950 border border-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-850 pb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'en' ? 'Add Retouch / Fix Resolution' : 'Añadir Foto de Corrección'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {lang === 'en' ? 'Upload photo & notes of re-cleaned or retouched items.' : 'Suba foto y notas de los objetos corregidos.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
                  {lang === 'en' ? 'Fix Description & Notes' : 'Descripción del Arreglo'}
                </label>
                <textarea
                  rows={3}
                  placeholder={lang === 'en' ? 'e.g. Re-cleaned microwave and refreshed bath towels as requested by host.' : 'Ej. Se volvió a limpiar el microondas y toallas.'}
                  value={retouchText}
                  onChange={(e) => setRetouchText(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
                  {lang === 'en' ? 'Resolution Photo Proof (Optional)' : 'Foto de Prueba (Opcional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingRetouchPhoto(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `retouch_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                      const filePath = `reports/${fileName}`;

                      const { error: uploadErr } = await (await import('@/lib/supabase')).supabase.storage
                        .from('airbnb-proofs')
                        .upload(filePath, file);

                      if (uploadErr) throw uploadErr;

                      const { data } = (await import('@/lib/supabase')).supabase.storage
                        .from('airbnb-proofs')
                        .getPublicUrl(filePath);

                      setRetouchPhotoUrl(data.publicUrl);
                    } catch (err: any) {
                      alert('Photo upload failed: ' + (err.message || 'Error'));
                    } finally {
                      setUploadingRetouchPhoto(false);
                    }
                  }}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                />

                {uploadingRetouchPhoto && (
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span>Uploading photo proof...</span>
                  </p>
                )}

                {retouchPhotoUrl && (
                  <div className="mt-3 relative inline-block">
                    <img src={retouchPhotoUrl} alt="Retouch proof" className="h-28 w-28 rounded-xl object-cover border border-emerald-500/50" />
                    <button
                      type="button"
                      onClick={() => setRetouchPhotoUrl('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRetouchModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleSubmitRetouch}
                disabled={submittingRetouch || uploadingRetouchPhoto || !retouchText.trim()}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-white transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submittingRetouch ? 'Saving...' : (lang === 'en' ? 'Save Resolution Addendum' : 'Guardar Resolución')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOST TOUCH-UP REQUEST MODAL */}
      {showTouchupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowTouchupModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'en' ? '🔍 Request Quality Touch-Up' : '🔍 Solicitar Retoque de Calidad'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {lang === 'en' ? 'Select items that need a quick touch-up or type custom instructions.' : 'Seleccione los elementos que necesitan retoque.'}
                </p>
              </div>
            </div>

            {/* Checklist tasks selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                {lang === 'en' ? 'Select Room Tasks Needing Touch-Up:' : 'Seleccione Tareas:'}
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {tasks.map(t => {
                  const isSelected = selectedTouchupTasks.includes(t.task_name);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTouchupTasks(prev => prev.filter(x => x !== t.task_name));
                        } else {
                          setSelectedTouchupTasks(prev => [...prev, t.task_name]);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>{t.task_name}</span>
                      {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Host Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                {lang === 'en' ? 'Custom Touch-Up Notes / Instructions:' : 'Notas de Retoque:'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'en' ? 'e.g. Please re-wipe bathroom mirror and add 2 extra towels.' : 'ej. Por favor vuelva a limpiar el espejo.'}
                value={customTouchupNotes}
                onChange={(e) => setCustomTouchupNotes(e.target.value)}
                className="w-full p-3 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl outline-none text-xs text-white resize-none"
              />
            </div>

            {/* Direct Email to Cleaner Option */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-neutral-300">
                ✉️ {lang === 'en' ? 'Direct Email to Cleaner (Optional):' : 'Enviar Correo al Limpiador (Opcional):'}
              </label>
              <input
                type="email"
                placeholder={lang === 'en' ? 'cleaner@gmail.com (Sends email notification alert directly)' : 'limpiador@gmail.com'}
                value={targetCleanerEmail}
                onChange={(e) => setTargetCleanerEmail(e.target.value)}
                className="w-full p-3 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl outline-none text-xs text-white"
              />
            </div>

            {touchupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                ⚡ Touch-Up Request Dispatched & Emailed!
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTouchupModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                disabled={submittingTouchup || (selectedTouchupTasks.length === 0 && !customTouchupNotes.trim())}
                onClick={async () => {
                  setSubmittingTouchup(true);
                  try {
                    const res = await fetch('/api/airbnb/reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'request_touchup',
                        reportId: reportId,
                        touchup_items: selectedTouchupTasks,
                        host_notes: customTouchupNotes,
                        cleaner_email: targetCleanerEmail
                      })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setTouchupSuccess(true);
                      setTouchupShareInfo({
                        smsLink: data.smsLink || `sms:?body=${encodeURIComponent('Please check touchup request: ' + data.touchupUrl)}`,
                        whatsappLink: data.whatsappLink || `https://wa.me/?text=${encodeURIComponent('Please check touchup request: ' + data.touchupUrl)}`,
                        touchupUrl: data.touchupUrl || `https://turnproofs.com/airbnb/clean/${report?.property_id}`,
                        shareText: data.shareText || 'Please check touchup request',
                        cleanerEmail: data.cleanerEmail || targetCleanerEmail
                      });
                    } else {
                      alert('Failed: ' + (data.error || 'Error'));
                    }
                  } catch (e) {
                    alert('Network error requesting touch-up');
                  } finally {
                    setSubmittingTouchup(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 font-extrabold text-xs text-white transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submittingTouchup ? 'Sending...' : (lang === 'en' ? '⚡ Send Touch-Up Request' : '⚡ Enviar Solicitud')}
              </button>
            </div>
            
            {touchupShareInfo && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Touch-Up Request Saved & Emailed!</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Send a 1-click text or WhatsApp message to your cleaner with the mobile link:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href={touchupShareInfo.smsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-[11px] text-white transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>📱 Send SMS Text</span>
                  </a>
                  <a
                    href={touchupShareInfo.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 font-extrabold text-[11px] text-white transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>💬 Send WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(touchupShareInfo.touchupUrl);
                      alert('📋 Touch-up link copied to clipboard!');
                    }}
                    className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-amber-500 font-extrabold text-[11px] text-neutral-200 hover:text-white transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📋 Copy Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL SCREEN PHOTO MODAL PREVIEW (Hidden in prints) */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50 no-print animate-fade-in">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative">
            <img
              src={selectedPhoto}
              alt="Compliance Photo Evidence"
              className="max-w-full max-h-[85vh] object-contain rounded-3xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
