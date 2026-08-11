import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { ShieldCheck, MapPin, Camera, Check, Clock, FileText, ArrowRight } from 'lucide-react';

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function PublicChecklistPreviewPage({ params }: Props) {
  const { token } = await params;

  let property: any = null;
  let tasks: any[] = [];
  let errorMsg = '';

  if (token === 'demo') {
    property = {
      id: 'demo',
      name: 'Sunset Villa Luxury Suite (Public Demo)',
      address: '123 Sunset Villa Boulevard, Miami, FL 33139',
      cover_image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
    };
    tasks = [
      { id: '1', task_name: '[Security & Access] 🔑 Main Door Keypad Code verified set to 4829# & deadbolt response tested', requires_photo: true, sort_order: 1 },
      { id: '2', task_name: '[Utility & Supply Closet] 🔐 Utility Closet Code (1042) opened, extra linens restocked & locked', requires_photo: true, sort_order: 2 },
      { id: '3', task_name: '[Walkthrough Audit] 📸 Initial damage & guest lost/found inspection', requires_photo: true, sort_order: 3 },
      { id: '4', task_name: '[Master Bedroom] 🛏️ Strip sheets, wash linens & remake bed with hospital corners', requires_photo: true, sort_order: 4 },
      { id: '5', task_name: '[Master Bedroom] 🧹 Vacuum rug & wipe down nightstands', requires_photo: false, sort_order: 5 },
      { id: '6', task_name: '[Main Bathroom] 🚿 Scrub shower tile, sanitize toilet & restock paper towels', requires_photo: true, sort_order: 6 },
      { id: '7', task_name: '[Chef\'s Kitchen] 🍽️ Empty dishwasher, wipe countertops & sanitize sink', requires_photo: true, sort_order: 7 },
      { id: '8', task_name: '[Patio & Resort Pool] 🏊 Sweep deck & verify pool loungers arranged', requires_photo: true, sort_order: 8 },
      { id: '9', task_name: '[Climate Control] 💡 Air vents checked & Nest thermostat set to eco 72°F', requires_photo: true, sort_order: 9 },
      { id: '10', task_name: '[Final Checkout] 🔑 Keypad deadbolt locked securely (4829#)', requires_photo: true, sort_order: 10 }
    ];
  } else {
    try {
      const { data: propData } = await supabaseAdmin
        .from('airbnb_properties')
        .select('*')
        .eq('id', token)
        .maybeSingle();

      property = propData;

      if (property) {
        const { data: taskData } = await supabaseAdmin
          .from('airbnb_checklists')
          .select('*')
          .eq('property_id', property.id)
          .order('sort_order', { ascending: true });

        tasks = taskData || [];
      }
    } catch (e: any) {
      errorMsg = e?.message || 'Failed to load preview.';
    }
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-black">Checklist Preview Not Found</h1>
        <p className="text-xs text-neutral-400 max-w-sm">The preview link may be expired or invalid. Please request a new terminal link from your property host.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-rose-500 font-bold text-xs text-white">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500 flex items-center justify-center text-white font-black text-xs">
              T
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">TurnProofs</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
            👁️ READ-ONLY PREVIEW
          </span>
        </div>

        {/* Property Hero Banner */}
        <div className="relative h-48 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900">
          <img
            src={property.cover_image_url?.includes('|||') ? property.cover_image_url.split('|||')[0] : (property.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80')}
            alt={property.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Turnover Protocol Specification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white truncate">{property.name}</h1>
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
            <p className="font-extrabold uppercase text-amber-400 text-[11px]">Subcontractor &amp; Cleaner Preparation View</p>
            <p className="text-[11px] text-amber-300/90 mt-0.5">
              This read-only link allows cleaners and teams to study room tasks, photo rules, and supplies before arriving. Zero login required.
            </p>
          </div>
        </div>

        {/* Door & Utility Closet Access Credentials */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">🔐 Property Access Credentials &amp; Door Codes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400 font-bold">🚪 Main Entry Keypad Door Code:</span>
              <span className="font-mono font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">4829#</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400 font-bold">🔑 Supply / Utility Closet Lock Code:</span>
              <span className="font-mono font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">1042</span>
            </div>
          </div>
        </div>

        {/* Room Tasks Specification List */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="font-black text-base text-white">📋 Official Turnover Checklist</h2>
              <p className="text-xs text-neutral-400">Total {tasks.length} room tasks specified for this property.</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-neutral-300">
              {tasks.length} Tasks
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
                    <span>Photo Mandatory</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Launch Cleaner Terminal CTA */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/30 to-orange-950/30 border border-rose-500/30 text-center space-y-3">
          <h3 className="font-extrabold text-sm text-rose-200 uppercase tracking-wider">Ready to start cleaning this turnover?</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">Open the live cleaner terminal to check in, record GPS coordinates, and upload timestamped photo proof.</p>
          <Link
            href={`/clean/${token}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-extrabold text-xs text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>▶️ Launch Mobile Cleaner Terminal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="text-center text-xs text-neutral-600 font-semibold py-4">
          TurnProofs System Certification • Permanent Read-Only Specification
        </div>

      </div>
    </div>
  );
}
