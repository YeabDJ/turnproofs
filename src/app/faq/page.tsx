'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  HelpCircle, 
  ArrowRight, 
  CreditCard, 
  Lock, 
  FileText, 
  Smartphone, 
  PauseCircle, 
  ExternalLink,
  Globe,
  Mail,
  Check
} from 'lucide-react';

export default function DedicatedFaqPage() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText('support@turnproofs.com');
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
    window.location.href = 'mailto:support@turnproofs.com';
  };

  const faqs = [
    {
      id: 'faq-1',
      category: 'pricing',
      categoryName: lang === 'en' ? 'Pricing & Trial' : 'Precios y Prueba',
      q: lang === 'en' ? "Do I need a credit card to start the trial?" : "¿Necesito tarjeta de crédito para iniciar la prueba?",
      a: lang === 'en' ? "No credit card is required upfront for Days 1–14. You get 14 days of full feature access with $0 charged today." : "No se requiere tarjeta de crédito por adelantado durante los días 1 al 14. Obtienes 14 días de acceso completo por $0 hoy."
    },
    {
      id: 'faq-2',
      category: 'pricing',
      categoryName: lang === 'en' ? 'Pricing & Trial' : 'Precios y Prueba',
      q: lang === 'en' ? "How does the 14-day free trial work and when do I enter my card?" : "¿Cómo funciona la prueba gratuita de 14 días y cuándo me piden tarjeta?",
      a: lang === 'en' ? "You get 14 days of full feature access with zero credit card required upfront ($0 charged today). On Day 15, simply select a plan (Pro $9/mo, Growth $18.99/mo) and enter your payment card to continue using TurnProofs." : "Obtienes 14 días de acceso completo sin tarjeta requerida. En el Día 15, simplemente eliges un plan (Pro $9/mes, Growth $18.99/mes) e ingresas tu tarjeta para continuar."
    },
    {
      id: 'faq-3',
      category: 'pricing',
      categoryName: lang === 'en' ? 'Pricing & Trial' : 'Precios y Prueba',
      q: lang === 'en' ? "How does Annual Billing work?" : "¿Cómo funciona la facturación anual?",
      a: lang === 'en' ? "Annual billing is charged as one discounted upfront payment for 12 months (saving 15%), renewing annually with zero monthly charges." : "La facturación anual se cobra como un pago por adelantado con 15% de descuento por 12 meses, renovando anualmente."
    },
    {
      id: 'faq-4',
      category: 'pricing',
      categoryName: lang === 'en' ? 'Pricing & Trial' : 'Precios y Prueba',
      q: lang === 'en' ? "What payment methods do you accept?" : "¿Qué métodos de pago aceptan?",
      a: lang === 'en' ? "We process payments securely via Stripe accepting Visa, Mastercard, American Express, Discover, Apple Pay, and Google Pay." : "Procesamos pagos de forma segura a través de Stripe aceptando Visa, Mastercard, American Express, Apple Pay y Google Pay."
    },
    {
      id: 'faq-5',
      category: 'disputes',
      categoryName: lang === 'en' ? 'Dispute Protection & Claims' : 'Protección de Reclamos',
      q: lang === 'en' ? "How does TurnProofs help protect me against false guest cleanliness refund claims?" : "¿Cómo me ayuda TurnProofs a protegerme contra reclamos falsos?",
      a: lang === 'en' ? "Cleaners record timestamped high-resolution photo proofs, room-by-room checklist completions, and verified GPS coordinates. TurnProofs compiles these into a professional PDF documentation certificate with a shareable verification link. While comprehensive documentation can strengthen your position in dispute claims, TurnProofs does not guarantee claim outcomes. Airbnb and VRBO make final decisions independently." : "Los limpiadores registran fotos con marca de tiempo, listas de verificación por habitación y coordenadas GPS verificadas. TurnProofs compila esto en un certificado de documentación PDF profesional. Si bien la documentación integral fortalece su posición en reclamos de disputa, TurnProofs no garantiza los resultados de los reclamos. Airbnb y VRBO toman las decisiones finales de forma independiente."
    },
    {
      id: 'faq-6',
      category: 'terminal',
      categoryName: lang === 'en' ? 'Cleaner Terminal & Mobile' : 'Terminal Móvil para Limpiadores',
      q: lang === 'en' ? "Do my cleaners need to download an app or create an account?" : "¿Mis limpiadores necesitan descargar una app o crear cuenta?",
      a: lang === 'en' ? "Zero app downloads or logins required. Cleaners simply scan a door QR code or tap a 1-click magic link sent via text/email to open their mobile checklist in any smartphone browser." : "Cero descargas de apps o inicios de sesión requeridos. Los limpiadores simplemente escanean un código QR en la puerta o abren un enlace mágico enviado por texto/correo."
    },
    {
      id: 'faq-7',
      category: 'data',
      categoryName: lang === 'en' ? 'Data Retention & File Ownership' : 'Retención de Datos y Archivos',
      q: lang === 'en' ? "Where is my data stored and how long do you keep it?" : "¿Dónde se guardan mis datos y cuánto tiempo los conservan?",
      a: lang === 'en' ? "TurnProofs delivers professional PDF audit certificates directly to your email and your cleaners' emails immediately after each turnover. Incomplete draft photos are automatically deleted after 30 days. You are responsible for maintaining copies of PDF certificates for your own records and dispute submissions. We recommend downloading and archiving PDFs immediately after each turnover." : "TurnProofs entrega certificados PDF profesionales directamente a su correo electrónico. Los borradores incompletos se eliminan automáticamente después de 30 días. Usted es responsable de mantener copias de los certificados PDF para sus propios registros."
    },
    {
      id: 'faq-8',
      category: 'pricing',
      categoryName: lang === 'en' ? 'Pricing & Trial' : 'Precios y Prueba',
      q: lang === 'en' ? "Can I cancel, pause, or re-subscribe anytime?" : "¿Puedo cancelar, pausar o volver a suscribirme en cualquier momento?",
      a: lang === 'en' ? "Yes! Zero contract lock-ins or cancellation fees. You can pause billing for 30 days with $0 charged. While paused, both your Host Dashboard and Cleaner Terminals freeze until resumed. You can also cancel and re-subscribe anytime in 1-click on your previous plan with zero setup fees." : "¡Sí! Cero permanencia obligatoria ni comisiones por cancelación. Puede pausar la facturación durante 30 días con $0 cobrados o cancelar en 1 clic."
    },
    {
      id: 'faq-9',
      category: 'pause',
      categoryName: lang === 'en' ? 'Subscription Pause & Management' : 'Pausa y Gestión de Suscripción',
      q: lang === 'en' ? "How does Subscription Pause work & what happens while paused?" : "¿Cómo funciona la Pausa de Suscripción y qué sucede mientras está pausada?",
      a: lang === 'en' ? "Pausing freezes your billing for 30 days with $0 charged. While paused, both your Host Dashboard and Mobile Cleaner Terminals freeze so zero checklists or reports can be created until resumed. On Day 27, a reminder email is sent before your plan auto-resumes on Day 30." : "Pausar congela su facturación durante 30 días con $0 cobrados. Mientras está pausado, tanto su Panel de Anfitrión como las Terminales Móviles se congelan hasta que se reanuden. En el día 27 se envía un recordatorio por correo electrónico."
    },
    {
      id: 'faq-10',
      category: 'pause',
      categoryName: lang === 'en' ? 'Subscription Pause & Management' : 'Pausa y Gestión de Suscripción',
      q: lang === 'en' ? "Will I get a reminder email before pause or trial ends?" : "¿Recibiré un correo electrónico de recordatorio antes de que finalice la pausa o prueba?",
      a: lang === 'en' ? "Yes! Reminders are sent on Trial Days 10, 13, and Day 14 at 12:00 PM ('Reverts in 24 hours at midnight EST'). For pauses, a reminder is sent 3 days before expiry." : "¡Sí! Los recordatorios se envían en los días de prueba 10, 13 y el día 14 a las 12:00 PM. Para las pausas, se envía un recordatorio 3 días antes del vencimiento."
    },
    {
      id: 'faq-11',
      category: 'pause',
      categoryName: lang === 'en' ? 'Subscription Pause & Management' : 'Pausa y Gestión de Suscripción',
      q: lang === 'en' ? "Can I pause mid-cycle or cancel during a pause?" : "¿Puedo pausar a mitad de ciclo o cancelar durante una pausa?",
      a: lang === 'en' ? "Yes! Mid-cycle pauses take effect immediately with unused days credited. You can cancel directly while paused without unpausing first." : "¡Sí! Las pausas a mitad de ciclo entran en vigor de inmediato con crédito por días no utilizados. Puede cancelar directamente mientras está pausado."
    },
    {
      id: 'faq-12',
      category: 'pause',
      categoryName: lang === 'en' ? 'Subscription Pause & Management' : 'Pausa y Gestión de Suscripción',
      q: lang === 'en' ? "How does Re-Subscription work?" : "¿Cómo funciona la re-suscripción?",
      a: lang === 'en' ? "Reactivate anytime with 1 click. You'll resume on your previous plan with zero setup fees. Your saved payment method will be used (update it anytime in Billing & Subscription)." : "Reactive en cualquier momento con 1 clic. Se reanudará en su plan anterior sin tarifas de configuración."
    },
    {
      id: 'faq-13',
      category: 'data',
      categoryName: lang === 'en' ? 'Data Retention & File Ownership' : 'Retención de Datos y Archivos',
      q: lang === 'en' ? "How long are incomplete non-archived drafts kept?" : "¿Cuánto tiempo se conservan los borradores incompletos no archivados?",
      a: lang === 'en' ? "Completed PDF audit reports are sent directly to your email and your cleaners' emails immediately after each turnover. Incomplete draft photos are retained for 30 days. After 30 days, they are automatically deleted to keep TurnProofs lightweight and your subscription costs low. You are responsible for downloading and archiving all PDF certificates you wish to retain for dispute purposes." : "Los informes PDF completados se envían directamente a su correo. Los borradores incompletos se conservan durante 30 días antes de eliminarse automáticamente. Usted es responsable de descargar y archivar todos los certificados PDF que desee conservar."
    },
    {
      id: 'faq-14',
      category: 'pause',
      categoryName: lang === 'en' ? 'Subscription Pause & Management' : 'Pausa y Gestión de Suscripción',
      q: lang === 'en' ? "How does Billing Email Dispatch work?" : "¿Cómo funciona el envío de correos de facturación?",
      a: lang === 'en' ? "Invoices and PDF receipts are automatically dispatched to your primary billing email. You can update your primary billing address anytime in your Host Dashboard Billing tab." : "Las facturas y recibos PDF se envían automáticamente a su correo electrónico de facturación principal."
    },
    {
      id: 'faq-15',
      category: 'disputes',
      categoryName: lang === 'en' ? 'Dispute Protection & Claims' : 'Protección de Reclamos',
      q: lang === 'en' ? "Can I click photo links directly inside the exported PDF?" : "¿Puedo hacer clic en los enlaces de fotos dentro del PDF exportado?",
      a: lang === 'en' ? "Yes! All photo evidence thumbnails and 🗺️ 'View on Maps' location badges inside exported PDF certificates are 100% hyperlinked so adjusters can view full-resolution original files in a browser." : "¡Sí! Todas las miniaturas de fotos y los botones 🗺️ 'Ver en mapas' dentro de los certificados PDF exportados son hipervínculos para ver las imágenes originales a resolución completa."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-rose-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              TurnProofs
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
              className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              🌐 {lang === 'en' ? 'Español' : 'English'}
            </button>
            
            <Link
              href="/login"
              className="hidden sm:flex px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition-all"
            >
              Host Login
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-xs font-black text-white shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{lang === 'en' ? 'Official TurnProofs Knowledge Base' : 'Base de Conocimiento Oficial'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          {lang === 'en' ? 'All 15 Frequently Asked Questions' : 'Todas las 15 Preguntas Frecuentes'}
        </h1>

        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {lang === 'en' 
            ? 'Everything you need to know about pricing, trial rules, Airbnb AirCover dispute certificates, mobile cleaner terminals, and subscription pauses.'
            : 'Todo lo que necesita saber sobre precios, reglas de prueba, certificados de disputa de Airbnb AirCover y terminales móviles.'
          }
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto pt-2 relative">
          <Search className="absolute left-4 top-5 h-5 w-5 text-neutral-500" />
          <input
            type="text"
            placeholder={lang === 'en' ? "Search all 15 questions (e.g. 'trial', 'pause', 'card')..." : "Buscar las 15 preguntas..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500/60 outline-none text-sm text-white transition-all shadow-xl"
          />
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="py-6 px-6 max-w-4xl mx-auto w-full space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm bg-neutral-900/40 rounded-2xl border border-neutral-800">
            No FAQ matches found for "{searchQuery}". Try searching for 'trial', 'pdf', or 'pause'.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'bg-neutral-900/70 border-rose-500/40 shadow-xl shadow-rose-500/5' 
                    : 'bg-neutral-900/30 border-neutral-850 hover:border-neutral-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto">
                      {faq.categoryName}
                    </span>
                    <span className="font-extrabold text-sm text-white leading-snug">{faq.q}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-rose-400 shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-neutral-850/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-xl font-extrabold text-white">Still have questions?</h3>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Have a custom request or need help setting up your property portfolio? Email our host onboarding team at <button type="button" onClick={handleEmailClick} className="text-rose-400 font-extrabold underline hover:text-rose-300 cursor-pointer">support@turnproofs.com</button> — we respond within 24–48 hours!
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleEmailClick}
              className="px-6 py-3 rounded-xl bg-neutral-950 border border-rose-500/40 hover:border-rose-500 font-extrabold text-xs text-rose-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Mail className="h-4 w-4 text-rose-400" />}
              <span>{copiedEmail ? '✓ Copied support@turnproofs.com!' : 'Email: support@turnproofs.com'}</span>
            </button>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-extrabold text-xs text-white shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start 14-Day Free Trial ($0)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 text-center text-xs text-neutral-500 space-y-6">
        <div className="max-w-3xl mx-auto space-y-2 text-[10px] text-neutral-500 leading-relaxed border-b border-neutral-900 pb-6">
          <p className="font-semibold text-neutral-400">⚖️ Legal Disclaimer & Notice:</p>
          <p>
            TurnProofs provides documentation and mobile verification tools to help hosts document property cleaning and turnover compliance. TurnProofs is an independent software tool and is not affiliated with, endorsed by, or sponsored by Airbnb, Inc. or VRBO. TurnProofs does not guarantee Airbnb or VRBO claim outcomes. Airbnb and VRBO make final dispute decisions independently. Hosts are solely responsible for downloading, archiving, and submitting documentation to third-party platforms.
          </p>
        </div>
        <p>© TurnProofs Knowledge Base & Compliance Engine. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-[11px] text-neutral-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>•</span>
          <Link href="/features" className="hover:text-white">Features</Link>
          <span>•</span>
          <Link href="/faq" className="hover:text-white">All FAQs</Link>
        </div>
      </footer>
    </div>
  );
}
