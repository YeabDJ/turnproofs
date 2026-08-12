import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { ShieldCheck } from 'lucide-react';
import PreviewClient from './PreviewClient';

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function PublicChecklistPreviewPage({ params }: Props) {
  const { token } = await params;

  let property: any = null;
  let tasks: any[] = [];

  if (token === 'demo') {
    property = {
      id: 'demo',
      name: 'Sunset Villa Luxury Suite (Public Demo)',
      address: '123 Sunset Villa Boulevard, Miami, FL 33139',
      cover_image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
    };
    tasks = [
      { id: '1', task_name: '[Entry Security & Access] 🔑 Main Entry Keypad Code verified set to 4829# & deadbolt response tested', requires_photo: false, sort_order: 1 },
      { id: '2', task_name: '[Utility & Supply Closet] 🔐 Utility Closet Code (1042) opened, extra linens restocked & locked', requires_photo: false, sort_order: 2 },
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
      console.error('Failed to load preview:', e);
    }
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-black">Checklist Preview Not Found</h1>
        <p className="text-xs text-neutral-400 max-w-sm">The preview link may be expired or invalid. Please request a new link from your property host.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-rose-500 font-bold text-xs text-white">
          Return to Home
        </Link>
      </div>
    );
  }

  return <PreviewClient property={property} tasks={tasks} token={token} />;
}
