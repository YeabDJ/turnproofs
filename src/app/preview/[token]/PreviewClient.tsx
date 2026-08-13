'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Camera, Check, Clock, Copy, ArrowRight } from 'lucide-react';

interface Props {
  property: {
    id: string;
    name: string;
    address: string;
    cover_image_url?: string;
  };
  tasks: Array<{
    id: string;
    task_name: string;
    requires_photo: boolean;
    sort_order?: number;
  }>;
  token: string;
}

export default function PreviewClient({ property, tasks, token }: Props) {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const t = lang === 'en' ? {
    previewTag: '👁️ READ-ONLY PREVIEW',
    protocol: 'Turnover Protocol Specification',
    subcontractorNoticeTitle: 'Subcontractor & Cleaner Preparation View',
    subcontractorNoticeDesc: 'This read-only link allows cleaners and teams to study room tasks, photo rules, and supplies before arriving. Zero login required.',
    accessTitle: '🔐 Property Access Credentials & Door Codes',
    tapToCopy: 'Tap code to copy',
    mainEntry: '🚪 Main Entry Keypad Door Code',
    utilityCloset: '🔑 Utility Closet Lock Code',
    checklistTitle: '📋 Official Turnover Checklist',
    totalTasks: `Total ${tasks.length} room tasks specified for this property.`,
    taskCount: `${tasks.length} Tasks`,
    photoMandatory: 'Photo Mandatory',
    ctaTitle: 'Ready to start cleaning this turnover?',
    ctaDesc: 'Open the live cleaner terminal to check in, record GPS coordinates, and upload timestamped photo proof.',
    launchBtn: '▶️ Launch Mobile Cleaner Terminal',
    certFooter: 'TurnProofs System Certification • Permanent Read-Only Specification'
  } : {
    previewTag: '👁️ VISTA PREVIA (SÓLO LECTURA)',
    protocol: 'Especificación de Protocolo de Limpieza',
    subcontractorNoticeTitle: 'Vista de Preparación para Limpiadores',
    subcontractorNoticeDesc: 'Este enlace de lectura permite a los limpiadores estudiar las tareas, fotos obligatorias y suministros antes de llegar. Sin inicio de sesión.',
    accessTitle: '🔐 Credenciales de Acceso y Códigos de Puerta',
    tapToCopy: 'Toque para copiar',
    mainEntry: '🚪 Código de Entrada Principal',
    utilityCloset: '🔑 Código del Armario de Suministros',
    checklistTitle: '📋 Lista Oficial de Verificación',
    totalTasks: `Total de ${tasks.length} tareas especificadas para esta propiedad.`,
    taskCount: `${tasks.length} Tareas`,
    photoMandatory: 'Foto Obligatoria',
    ctaTitle: '¿Listo para comenzar a limpiar esta propiedad?',
    ctaDesc: 'Abra la terminal de limpieza para registrar entrada, coordenadas GPS y subir fotos con fecha.',
    launchBtn: '▶️ Abrir Terminal de Limpieza Móvil',
    certFooter: 'Certificación de Sistema TurnProofs • Especificación Permanente'
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-rose-500/20">
              T
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">TurnProofs</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
            >
              🌐 {lang === 'en' ? 'Español' : 'English'}
            </button>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              {t.previewTag}
            </span>
          </div>
        </div>

        {/* Property Hero Banner */}
        <div className="relative h-52 sm:h-60 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900">
          <img
            src={property.cover_image_url?.includes('|||') ? property.cover_image_url.split('|||')[0] : (property.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80')}
            alt={property.name}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.protocol}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white truncate drop-shadow-md">{property.name}</h1>
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold uppercase text-amber-400 text-[11px]">{t.subcontractorNoticeTitle}</p>
            <p className="text-[11px] text-amber-300/90 mt-0.5">
              {t.subcontractorNoticeDesc}
            </p>
          </div>
        </div>

        {/* Door & Utility Closet Access Credentials (Interactive 1-Click Copy) */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">{t.accessTitle}</h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-semibold">{t.tapToCopy}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Main Entry Keypad */}
            <div 
              onClick={() => copyCode('4829#', 'main')}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <div className="space-y-0.5">
                <span className="text-neutral-400 font-bold block text-[11px]">{t.mainEntry}</span>
                <span className="text-[10px] text-neutral-500">{t.tapToCopy}</span>
              </div>
              <button 
                type="button" 
                className="font-mono font-extrabold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode === 'main' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{lang === 'en' ? 'Copied!' : '¡Copiado!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-amber-400" />
                    <span>4829#</span>
                  </>
                )}
              </button>
            </div>

            {/* Utility Closet Code */}
            <div 
              onClick={() => copyCode('1042', 'utility')}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 flex items-center justify-between cursor-pointer transition-all active:scale-95"
            >
              <div className="space-y-0.5">
                <span className="text-neutral-400 font-bold block text-[11px]">{t.utilityCloset}</span>
                <span className="text-[10px] text-neutral-500">{t.tapToCopy}</span>
              </div>
              <button 
                type="button" 
                className="font-mono font-extrabold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode === 'utility' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{lang === 'en' ? 'Copied!' : '¡Copiado!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-emerald-400" />
                    <span>1042</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Room Tasks Specification List */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="font-black text-base text-white">{t.checklistTitle}</h2>
              <p className="text-xs text-neutral-400">{t.totalTasks}</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-neutral-300">
              {t.taskCount}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={task.id || idx} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-6 w-6 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-neutral-200 truncate">{task.task_name}</span>
                </div>
                {task.requires_photo && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase shrink-0 flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    <span>{t.photoMandatory}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Launch Cleaner Terminal CTA */}
        <div className="p-6 rounded-3xl bg-linear-to-r from-rose-950/30 to-orange-950/30 border border-rose-500/30 text-center space-y-3">
          <h3 className="font-extrabold text-sm text-rose-200 uppercase tracking-wider">{t.ctaTitle}</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">{t.ctaDesc}</p>
          <Link
            href={`/clean/${token}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-extrabold text-xs text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>{t.launchBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="text-center text-xs text-neutral-600 font-semibold py-4">
          {t.certFooter}
        </div>

      </div>
    </div>
  );
}
