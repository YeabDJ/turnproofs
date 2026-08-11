import { NextRequest, NextResponse } from 'next/server';

// Comprehensive dictionary for instant Airbnb & cleaning terminology translation (ES <-> EN)
const termDictionary: Record<string, string> = {
  // Rooms & Areas
  'foyer & entrance': 'Entrada y Recibidor',
  'master bedroom': 'Dormitorio Principal',
  'master en-suite': 'Baño Principal',
  'guest suite': 'Suite de Invitados',
  'guest bath': 'Baño de Invitados',
  'chef\'s kitchen': 'Cocina Principal',
  'kitchen & dining': 'Cocina y Comedor',
  'dining room': 'Comedor',
  'grand living room': 'Sala Principal',
  'living room': 'Sala de Estar',
  'patio & resort pool': 'Patio y Piscina',
  'outdoor dining & bbq': 'Comedor Exterior y Barbacoa',
  'laundry center': 'Área de Lavandería',
  'laundry room': 'Cuarto de Lavado',
  'game room & arcade': 'Sala de Juegos',
  'garage & waste': 'Garaje y Basura',
  'stairways & corridors': 'Escaleras y Pasillos',
  'climate control & hvac': 'Aire Acondicionado y Clima',
  'security & access': 'Seguridad y Acceso',
  'utility & supply closet': 'Armario de Suministros',
  
  // Common Cleaner Sentences & Verbs
  'unit left in s-tier condition': 'Unidad dejada en excelentes condiciones.',
  'checked all checkout protocols and locked up': 'Se revisaron todos los protocolos de salida y se cerró con llave.',
  'completed full 40-point inspection': 'Se completó la inspección total de 40 puntos.',
  'all bedrooms remade': 'Todos los dormitorios fueron arreglados.',
  'bathrooms sanitized': 'Baños desinfectados.',
  'kitchen degreased': 'Cocina desengrasada.',
  'patio pool deck swept': 'Terraza de la piscina barrida.',
  'smart lock engaged': 'Cerradura inteligente activada.',
  'thermostat set to 72°f': 'Termostato configurado a 72°F.',
  'microondas': 'microwave',
  'toallas': 'towels',
  'espejo': 'mirror',
  'sábanas': 'sheets',
  'cama': 'bed',
  'limpiado': 'cleaned',
  'desinfectado': 'sanitized',
  'roto': 'broken',
  'dañado': 'damaged',
  'reemplazado': 'replaced',
  'llave': 'key',
  'cerradura': 'lock',
  'basura': 'trash'
};

export async function POST(request: NextRequest) {
  try {
    const { text, from = 'es', to = 'en' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, error: 'Text is required.' }, { status: 400 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ success: true, translatedText: '' });
    }

    // Provider 1: Dictionary Exact Match
    const lower = trimmed.toLowerCase();
    if (termDictionary[lower]) {
      return NextResponse.json({ success: true, translatedText: termDictionary[lower], provider: 'dictionary' });
    }

    // Provider 2: Dictionary Phrase Replacements
    let dictTranslated = trimmed;
    let replacedAny = false;
    Object.entries(termDictionary).forEach(([key, val]) => {
      const reg = new RegExp(key, 'gi');
      if (reg.test(dictTranslated)) {
        dictTranslated = dictTranslated.replace(reg, val);
        replacedAny = true;
      }
    });

    // Provider 3: Free Translation API (MyMemory with User-Agent & timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const apiRes = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`,
        {
          headers: { 'User-Agent': 'TurnProofs-App/1.0' },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      const apiData = await apiRes.json();
      if (apiData && apiData.responseData && apiData.responseData.translatedText && !apiData.responseData.translatedText.includes('MYMEMORY WARNING')) {
        return NextResponse.json({
          success: true,
          translatedText: apiData.responseData.translatedText,
          provider: 'mymemory'
        });
      }
    } catch (e) {
      // API call timed out or failed; fallback to dictionary/original
    }

    return NextResponse.json({
      success: true,
      translatedText: replacedAny ? dictTranslated : trimmed,
      provider: replacedAny ? 'dictionary-partial' : 'fallback'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
