import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!reportId || reportId === 'undefined' || reportId === 'null') {
      return NextResponse.json({ success: false, error: 'Invalid Report ID. Please open the report from your Host Dashboard.' }, { status: 400 });
    }

    // Public Demo Fallback - 40+ Verified Photos & Door/Utility Closet Access Codes
    if (reportId.includes('demo') || reportId.includes('sample')) {
      return NextResponse.json({
        success: true,
        report: {
          id: 'demo-report-123',
          property_id: 'demo',
          cleaner_name: 'Maria S. & Elite Turnover Crew (GPS Verified)',
          started_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          completed_at: new Date().toISOString(),
          start_latitude: 25.7617,
          start_longitude: -80.1918,
          notes: JSON.stringify({
            text: 'Completed full 40-point inspection for 8,000 sq ft luxury estate. Keypad door code (4829#) and utility closet code (1042) verified. All bedrooms remade, bathrooms sanitized, kitchen degreased, and patio pool deck swept. Smart lock engaged and thermostat set to 72°F.',
            cleanerEmail: 'cleaner@turnproofs.com',
            supplies: { toiletPaper: 'full', soap: 'full', trashBags: 'full', paperTowels: 'full' },
            additional_photos: [
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
            ]
          }),
          airbnb_properties: {
            id: 'demo',
            name: 'Sunset Villa Estate & Luxury Resort (Full 40-Point Audit)',
            address: '100 Ocean Drive, Suite 402, Miami Beach, FL 33139',
            cover_image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80|||support@turnproofs.com'
          }
        },
        tasks: [
          { id: 'dt-1', task_name: '[Entry Security & Access] 🔑 Main Entry Keypad Code verified set to 4829# & deadbolt response tested', requires_photo: false, completed: false, photo_url: null },
          { id: 'dt-2', task_name: '[Utility & Supply Closet] 🔐 Utility Closet Code (1042) opened, extra linens restocked & locked', requires_photo: false, completed: false, photo_url: null },
          { id: 'dt-3', task_name: '[Foyer & Entrance] 🧹 Entryway mirror wiped, umbrella stand checked & floor polished', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-4', task_name: '[Master Bedroom] 🛏️ King bed remade with fresh 800-thread sheets & hospital corners', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-5', task_name: '[Master Bedroom] 🧹 Nightstands dusted, lamps polished & USB ports tested', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-6', task_name: '[Master En-Suite] 🚿 Frameless glass shower enclosure scrubbed & streak-free', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-7', task_name: '[Master En-Suite] 🧼 Double vanity quartz countertop disinfected & chrome polished', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-8', task_name: '[Master En-Suite] 🚽 Toilet disinfected inside out & sanitary band attached', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1585412727339-54e4bed3bcf5?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-9', task_name: '[Guest Suite #2] 🛏️ Queen pillowtop bed remade & decorative throw fluffed', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-10', task_name: '[Guest Suite #2] 👔 Closet inspect, extra pillows stocked & wooden hangers aligned', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-11', task_name: '[Guest Bath #2] 🛁 Soaking tub scrubbed, plush bath towels folded & soap restocked', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-12', task_name: '[Guest Suite #3] 🛏️ Twin beds remade with fresh linens & nightstand disinfected', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-13', task_name: '[Guest Suite #4] 🛏️ Bunk bed mattresses disinfected & ladder safety checked', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-14', task_name: '[Guest Bath #3] 🚿 Shower tile scrubbed, drain cleared & paper towels stocked', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-15', task_name: '[Chef\'s Kitchen] 🍳 Waterfall marble island sanitized & barstools aligned', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-16', task_name: '[Chef\'s Kitchen] 🧊 Stainless steel Sub-Zero fridge wiped inside & door handles disinfected', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-17', task_name: '[Chef\'s Kitchen] 🍽️ Microwave interior steam cleaned & turntable disinfected', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-18', task_name: '[Chef\'s Kitchen] 🧼 Dishwasher emptied, sink polished & fresh sponge left', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-19', task_name: '[Coffee & Pantry] ☕ Keurig coffee bar restocked (K-cups, sweetener, creamer & mugs)', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-20', task_name: '[Dining Room] 🍷 12-Person dining table polished, placemats set & chandelier dusted', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-21', task_name: '[Grand Living Room] 📺 Sectional sofa vacuumed, decorative pillows fluffed & rug steam cleaned', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1603618301084-d122295ab138?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-22', task_name: '[Grand Living Room] 📺 85" Smart TV screen wiped & remotes sanitized', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1593784991095-877102483734?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-23', task_name: '[Second Floor Lounge] 🛋️ Coffee table wiped, books organized & glass doors polished', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-24', task_name: '[Patio & Resort Pool] 🏊 Pool deck pressure washed & sun loungers arranged', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-25', task_name: '[Outdoor Dining & BBQ] 🔥 BBQ gas grill brushed, propane checked & table wiped', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-26', task_name: '[Spa & Hot Tub] ♨️ Hot tub water temperature verified 102°F & cover strapped', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-27', task_name: '[EV Charging Station] ⚡ Tesla EV charger cable neatly coiled & dock inspected', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-28', task_name: '[Laundry Center] 🧺 Washer/dryer drums disinfected & lint trap cleaned', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-29', task_name: '[Laundry Center] 🧴 Laundry detergent pods & dryer sheets fully restocked', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-30', task_name: '[Game Room & Arcade] 🎮 Billiards table brushed, cues organized & arcade controllers wiped', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-31', task_name: '[Garage & Waste] 🚪 Trash bins washed, fresh heavy liners inserted & floor swept', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-32', task_name: '[Stairways & Corridors] 🧹 Oak staircase handrails disinfected & runner vacuumed', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-33', task_name: '[Climate Control & HVAC] 💡 Air vents checked & dual Nest thermostats set to eco 72°F', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-34', task_name: '[Smoke & CO Detectors] 🚨 All 8 smoke detectors green status light verified', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-35', task_name: '[Welcome Setup] 🎁 Welcome basket with local wine & estate guidebooks arranged', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-36', task_name: '[Pre-Clean Audit] 📸 Initial walkthrough complete & zero guest damages confirmed', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-37', task_name: '[Lost & Found Audit] 🎒 Checked under all beds, nightstand drawers & closets for guest items', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-38', task_name: '[Sanitation Protocol] 🧼 All door handles, light switches & remotes sanitized with hospital disinfectant', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-39', task_name: '[Security Shutters] 🪟 Upstairs balcony doors locked & hurricane shutter sensors checked', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
          { id: 'dt-40', task_name: '[Final Departure Protocol] 🔑 Lockbox key verified & smart deadbolt locked securely (4829#)', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80' }
        ]
      });
    }

    // Fetch the report details joined with property details
    const { data: report, error: reportError } = await supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(*)')
      .eq('id', reportId)
      .maybeSingle();

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
    }

    // Fetch the tasks for this report
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('airbnb_report_tasks')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (tasksError) {
      return NextResponse.json({ success: false, error: tasksError.message }, { status: 500 });
    }

    // Fetch host branding info for white-labeling
    let branding = null;
    if (report.airbnb_properties?.host_id) {
      const { data: hostData } = await supabaseAdmin
        .from('airbnb_hosts')
        .select('business_name, company_logo_url, custom_footer, hide_branding, subscription_tier')
        .eq('id', report.airbnb_properties.host_id)
        .maybeSingle();

      if (hostData) {
        branding = {
          business_name: hostData.business_name,
          company_logo_url: hostData.company_logo_url,
          custom_footer: hostData.custom_footer,
          hide_branding: !!hostData.hide_branding,
          subscription_tier: hostData.subscription_tier
        };
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        branding
      },
      tasks
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
