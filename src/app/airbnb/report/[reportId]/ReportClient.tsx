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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchReportDetails() {
      try {
        const res = await fetch(`/api/airbnb/reports/${reportId}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to fetch report details.');
        } else {
          setReport(data.report);
          setTasks(data.tasks || []);
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
  let supplies: Record<string, 'full' | 'low' | 'out'> = { toiletPaper: 'full', soap: 'full', trashBags: 'full', paperTowels: 'full' };
  
  if (report.notes && report.notes.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(report.notes);
      notesText = parsed.text || '';
      additionalPhotos = parsed.photos || [];
      hostMessage = parsed.hostMessage || '';
      maintenanceAlert = !!parsed.maintenanceAlert;
      maintenanceDesc = parsed.maintenanceDesc || '';
      if (parsed.supplies) {
        supplies = { ...supplies, ...parsed.supplies };
      }
    } catch (e) {
      console.error('Failed to parse report notes JSON', e);
    }
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
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #e5e7eb !important;
            background-color: transparent !important;
            box-shadow: none !important;
            color: black !important;
          }
          .print-text-dark {
            color: #111827 !important;
          }
          .print-text-muted {
            color: #4b5563 !important;
          }
          .print-badge {
            border: 1px solid #d1d5db !important;
            background: #f3f4f6 !important;
            color: #1f2937 !important;
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
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                document.title = `TurnProofs_Audit_${reportId.substring(0, 8)}.pdf`;
                window.print();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-xs text-white transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{lang === 'en' ? 'Download PDF File' : 'Guardar en PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 font-bold text-xs text-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-neutral-400" />
              <span>{lang === 'en' ? 'Print Certificate' : 'Imprimir Certificado'}</span>
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

              <div className="print-badge md:text-right bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-2xl h-fit">
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{lang === 'en' ? 'Verification ID' : 'ID de Verificación'}</span>
                <span className="font-mono text-sm font-bold text-neutral-200">{report.id.substring(0, 18).toUpperCase()}</span>
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
                  { name: 'Paper Towels', val: supplies.paperTowels }
                ].map((item, index) => {
                  const badgeColor = 
                    item.val === 'full' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : item.val === 'low' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20';
                  
                  return (
                    <div key={index} className="print-badge p-3 rounded-xl bg-neutral-950 border border-neutral-800/85 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-neutral-400">{item.name}</span>
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-extrabold uppercase tracking-wide ${badgeColor}`}>
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

          {/* Checklist compliance items */}
          <div className="py-8 border-b border-neutral-800/80 space-y-4">
            <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
              <FileCheck2 className="h-4.5 w-4.5 text-neutral-500" />
              <span>Verified Cleaning Checklist</span>
            </h3>

            <div className="border border-neutral-850 rounded-2xl overflow-hidden bg-neutral-950/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/80 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      <th className="p-4">Item Name</th>
                      <th className="p-4 text-center">Compliance Method</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-sm text-neutral-300">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-neutral-900/10 transition-colors">
                        <td className="p-4 font-semibold print-text-dark">{task.task_name}</td>
                        <td className="p-4 text-center text-xs text-neutral-450 print-text-muted">
                          {task.photo_url ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
                              <Camera className="h-3 w-3" />
                              <span>Photo Verified</span>
                            </span>
                          ) : task.requires_photo ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-semibold">
                              <Camera className="h-3 w-3" />
                              <span>Photo Required</span>
                            </span>
                          ) : (
                            <span className="text-neutral-500 print-text-muted">Self Checked</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold">
                            <span>Completed</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Photo Evidence Gallery */}
          {tasks.some(t => t.photo_url) && (
            <div className="py-8 border-b border-neutral-800/80 space-y-4">
              <h3 className="print-text-dark font-bold text-base text-neutral-200 flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-neutral-500" />
                <span>Uploaded Photo Proofs</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tasks.filter(t => t.photo_url).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedPhoto(task.photo_url)}
                    className="no-print aspect-square rounded-2xl overflow-hidden border border-neutral-800 cursor-zoom-in relative group hover:border-neutral-600 transition-colors"
                  >
                    <img
                      src={task.photo_url || ''}
                      alt={task.task_name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-white truncate w-full">{task.task_name}</span>
                    </div>
                  </div>
                ))}
                
                {/* Print view photos (plain images that display without zoom-in/hover animations) */}
                {tasks.filter(t => t.photo_url).map((task) => (
                  <div key={`print-${task.id}`} className="hidden print:block border border-gray-300 rounded-lg p-1.5 space-y-1">
                    <img
                      src={task.photo_url || ''}
                      alt={task.task_name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <span className="text-[8px] text-gray-500 font-semibold block truncate">{task.task_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cleaner Notes Section */}
          {notesText && (
            <div className="py-8 space-y-3">
              <h3 className="print-text-dark font-bold text-base text-neutral-200">Cleaner Notes</h3>
              <div className="print-badge p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <p className="text-sm leading-relaxed text-neutral-400 print-text-muted whitespace-pre-wrap">{notesText}</p>
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
                <p className="text-sm leading-relaxed text-rose-455 text-rose-400 print-text-muted whitespace-pre-wrap font-semibold">{hostMessage}</p>
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
