'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Key, 
  Terminal, 
  Code, 
  ExternalLink, 
  Check, 
  Copy,
  Clock,
  BookOpen,
  AlertTriangle,
  Globe,
  Layers
} from 'lucide-react';

export default function ApiDocs() {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const curlCode = `curl -X GET "https://turnproofs.com/api/v1/reports?limit=5&offset=0" \\
  -H "Authorization: Bearer tp_live_your_api_key_here"`;

  const jsCode = `const fetchReports = async () => {
  const response = await fetch('https://turnproofs.com/api/v1/reports?limit=5', {
    headers: {
      'Authorization': 'Bearer tp_live_your_api_key_here',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  if (response.ok) {
    console.log('Reports fetched:', data.data);
  } else {
    console.error('Error:', data.error, data.message);
  }
};`;

  const pythonCode = `import requests

url = "https://turnproofs.com/api/v1/reports"
headers = {
    "Authorization": "Bearer tp_live_your_api_key_here"
}
params = {
    "limit": 5
}

response = requests.get(url, headers=headers, params=params)
if response.status_code == 200:
    print(response.json())
else:
    print(f"Error {response.status_code}: {response.json()}")`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white">
      {/* Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/airbnb/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              TurnProofs DevPortal
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/airbnb/dashboard" 
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold transition-all text-neutral-300 flex items-center gap-1.5"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 h-fit">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">Getting Started</span>
            <ul className="space-y-1 text-xs font-bold text-neutral-400">
              <li>
                <a href="#overview" className="block py-1.5 hover:text-white transition-colors">Overview</a>
              </li>
              <li>
                <a href="#authentication" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-rose-500" />
                  <span>Authentication</span>
                </a>
              </li>
              <li>
                <a href="#permissions" className="block py-1.5 hover:text-white transition-colors">Scopes & Permissions</a>
              </li>
              <li>
                <a href="#errors" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Error Handling</span>
                </a>
              </li>
              <li>
                <a href="#rate-limits" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Rate Limiting</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">v1 Core API Reference</span>
            <ul className="space-y-1 text-xs font-bold text-neutral-400">
              <li>
                <a href="#endpoint-properties" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">GET</span>
                  <span>/api/v1/properties</span>
                </a>
              </li>
              <li>
                <a href="#endpoint-reports-list" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">GET</span>
                  <span>/api/v1/reports</span>
                </a>
              </li>
              <li>
                <a href="#endpoint-report-detail" className="block py-1.5 hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">GET</span>
                  <span>/api/v1/reports/[id]</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">Policies</span>
            <ul className="space-y-1 text-xs font-bold text-neutral-400">
              <li>
                <a href="#deprecation-policy" className="block py-1.5 hover:text-white transition-colors">API Version Sunset</a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Documentation Content */}
        <main className="lg:col-span-3 space-y-16">
          {/* Section: Overview */}
          <section id="overview" className="space-y-4 scroll-mt-24">
            <h1 className="text-3xl font-extrabold tracking-tight">API Reference Documentation</h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Welcome to the TurnProofs Developer API. You can use our endpoints to pull cleaning audit reports, checklists, and dispute-ready photo proof certificates directly into your property management systems (PMS) like Guesty, Breezeway, or custom setups.
            </p>
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 space-y-2">
              <span className="font-extrabold text-white block">Base Endpoint URL:</span>
              <code className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-850 text-rose-400 font-mono text-[11px] select-all block w-fit">
                https://turnproofs.com/api/v1
              </code>
            </div>
          </section>

          {/* Section: Authentication */}
          <section id="authentication" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-rose-500" />
              <span>Authentication</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              The TurnProofs API authenticates your requests using API keys. You can generate and manage keys in your Host Dashboard under the <strong>Integrations</strong> tab. API keys are hashed securely using SHA-256 before storage.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Include your API key as a Bearer token in the <code className="text-rose-400 font-mono">Authorization</code> HTTP header, or provide it via the <code className="text-rose-400 font-mono">x-api-key</code> header:
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-850 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                <span>Authorization Header Pattern</span>
              </div>
              <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto select-all">
                Authorization: Bearer tp_live_your_generated_key_here
              </pre>
            </div>
          </section>

          {/* Section: Scopes */}
          <section id="permissions" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-neutral-400" />
              <span>Scopes & Permissions</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Keys are granted granular capabilities to prevent data exposure. You can toggle these permissions on creation:
            </p>
            <div className="overflow-x-auto rounded-2xl border border-neutral-850 bg-neutral-900/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-850 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900/40">
                    <th className="p-4">Scope</th>
                    <th className="p-4">Allowed Endpoints</th>
                    <th className="p-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-semibold text-neutral-300">
                  <tr>
                    <td className="p-4 font-mono text-rose-400">properties:read</td>
                    <td className="p-4 font-mono text-neutral-400">GET /properties</td>
                    <td className="p-4 text-neutral-400 font-normal">Retrieve properties catalog and basic details.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-rose-400">reports:read</td>
                    <td className="p-4 font-mono text-neutral-400">GET /reports, GET /reports/[id]</td>
                    <td className="p-4 text-neutral-400 font-normal">Retrieve cleaning turnover checkout logs, checklist checks, and photo URLs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Error Handling */}
          <section id="errors" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Error Handling & Response Codes</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              All API error responses use standard HTTP status codes and return a structured JSON body describing the error:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Error 401 */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-red-400 font-mono text-xs">401 Unauthorized</span>
                  <code className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">invalid_api_key</code>
                </div>
                <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-850 overflow-x-auto select-all">
{`{
  "error": {
    "code": "invalid_api_key",
    "message": "API key is invalid or revoked"
  }
}`}
                </pre>
              </div>

              {/* Error 429 */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-red-400 font-mono text-xs">429 Rate Limited</span>
                  <code className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">rate_limit_exceeded</code>
                </div>
                <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-850 overflow-x-auto select-all">
{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded 500 requests per minute"
  }
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section: Rate Limiting */}
          <section id="rate-limits" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <span>Rate Limiting</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              We enforce dynamic rate limiting based on your subscription tier:
            </p>
            <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
              <li><strong className="text-white">Growth Tier:</strong> 500 requests per minute</li>
              <li><strong className="text-white">Commercial/Enterprise Tier:</strong> 5,000 requests per minute</li>
              <li><strong className="text-white">Free/Trial Keys:</strong> 100 requests per minute</li>
            </ul>
            <p className="text-sm text-neutral-300 leading-relaxed mt-2">
              When you exceed your allowed rate limit, the API returns a <code className="text-rose-400 font-mono">429 Too Many Requests</code> response, along with a <code className="text-rose-400 font-mono">Retry-After</code> HTTP header specifying the number of seconds to wait before making new requests.
            </p>
          </section>

          <hr className="border-neutral-900" />

          {/* Endpoint: Properties */}
          <section id="endpoint-properties" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase">GET</span>
              <h3 className="text-xl font-black">/api/v1/properties</h3>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Returns a list of properties matching the API key's owner host account, filtered by any scoped properties configured in the dashboard.
            </p>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Response Payload (200 OK)</span>
              <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-850 overflow-x-auto select-all">
{`{
  "success": true,
  "properties": [
    {
      "id": "27b7f94d-172c-47ee-888e-67bdca2f0cb2",
      "name": "Sunset Villa Luxury Suite",
      "address": "100 Ocean Drive, Miami Beach, FL 33139",
      "cover_image_url": "https://images.unsplash.com/photo-...",
      "latitude": 25.7617,
      "longitude": -80.1918,
      "created_at": "2026-07-29T12:00:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Endpoint: Reports List */}
          <section id="endpoint-reports-list" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase">GET</span>
              <h3 className="text-xl font-black">/api/v1/reports</h3>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Returns paginated cleaning turnover reports. Can filter by property and completions history.
            </p>
            
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Query Parameters</span>
              <div className="overflow-x-auto rounded-2xl border border-neutral-850 bg-neutral-900/20 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-850 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900/40">
                      <th className="p-4">Parameter</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Default / Constraints</th>
                      <th className="p-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 font-semibold text-neutral-300">
                    <tr>
                      <td className="p-4 font-mono text-rose-400">property_id</td>
                      <td className="p-4 font-mono text-neutral-400">UUID</td>
                      <td className="p-4 text-neutral-400 font-normal">Optional</td>
                      <td className="p-4 text-neutral-400 font-normal">Filter logs for a specific property.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-rose-400">since</td>
                      <td className="p-4 font-mono text-neutral-400">ISO-8601</td>
                      <td className="p-4 text-neutral-400 font-normal">Optional</td>
                      <td className="p-4 text-neutral-400 font-normal">Fetch reports completed on/after this timestamp.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-rose-400">limit</td>
                      <td className="p-4 font-mono text-neutral-400">Integer</td>
                      <td className="p-4 text-neutral-400 font-normal">50 (max 100)</td>
                      <td className="p-4 text-neutral-400 font-normal">Number of reports to return per page.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-rose-400">offset</td>
                      <td className="p-4 font-mono text-neutral-400">Integer</td>
                      <td className="p-4 text-neutral-400 font-normal">0</td>
                      <td className="p-4 text-neutral-400 font-normal">Pagination offset.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Response Payload (200 OK)</span>
              <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-850 overflow-x-auto select-all">
{`{
  "success": true,
  "data": [
    {
      "id": "e43b8a32-6031-4fa3-9e45-fbc4a3dcb1a1",
      "property_id": "27b7f94d-172c-47ee-888e-67bdca2f0cb2",
      "property_name": "Sunset Villa Luxury Suite",
      "property_address": "100 Ocean Drive, Miami Beach, FL 33139",
      "cleaner_name": "Sunset Cleaning Crew",
      "started_at": "2026-08-01T10:00:00Z",
      "completed_at": "2026-08-01T11:30:00Z",
      "start_latitude": 25.7617,
      "start_longitude": -80.1918,
      "end_latitude": 25.7618,
      "end_longitude": -80.1919,
      "notes": "Units in perfect shape.",
      "created_at": "2026-08-01T11:30:00Z"
    }
  ],
  "pagination": {
    "total": 120,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}`}
              </pre>
            </div>
          </section>

          {/* Endpoint: Report Detail */}
          <section id="endpoint-report-detail" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase">GET</span>
              <h3 className="text-xl font-black">/api/v1/reports/[reportId]</h3>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Returns granular verification checklists, timestamps, duration, and image verification links for a single report.
            </p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Response Payload (200 OK)</span>
              <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-850 overflow-x-auto select-all">
{`{
  "success": true,
  "report": {
    "id": "e43b8a32-6031-4fa3-9e45-fbc4a3dcb1a1",
    "property": {
      "id": "27b7f94d-172c-47ee-888e-67bdca2f0cb2",
      "name": "Sunset Villa Luxury Suite",
      "address": "100 Ocean Drive, Miami Beach, FL 33139"
    },
    "cleaner_name": "Sunset Cleaning Crew",
    "started_at": "2026-08-01T10:00:00Z",
    "completed_at": "2026-08-01T11:30:00Z",
    "duration_seconds": 5400,
    "verification": {
      "start_latitude": 25.7617,
      "start_longitude": -80.1918,
      "end_latitude": 25.7618,
      "end_longitude": -80.1919
    },
    "notes": "Units in perfect shape.",
    "created_at": "2026-08-01T11:30:00Z"
  },
  "tasks": [
    {
      "id": "416bca82-df7a-42cd-9e32-9cbca43cb121",
      "task_name": "Sweep Patio & Wipe Glass Door",
      "requires_photo": true,
      "completed": true,
      "photo_url": "https://knjafkrildnehfbbmrqa.supabase.co/storage/v1/object/public/...",
      "created_at": "2026-08-01T10:00:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Quick Start / Code Snippets */}
          <section className="space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-neutral-400" />
              <span>Integration Code Snippets</span>
            </h3>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-850">
                <div className="flex gap-2">
                  {(['curl', 'js', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                        activeLang === lang 
                          ? 'bg-rose-500 text-white' 
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {lang === 'js' ? 'javascript' : lang}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const code = activeLang === 'curl' ? curlCode : activeLang === 'js' ? jsCode : pythonCode;
                    handleCopy(code, 'snippet');
                  }}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white transition-all text-[10px] font-bold border border-neutral-850 flex items-center gap-1"
                >
                  {copiedText === 'snippet' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedText === 'snippet' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto select-all">
                {activeLang === 'curl' ? curlCode : activeLang === 'js' ? jsCode : pythonCode}
              </pre>
            </div>
          </section>

          <hr className="border-neutral-900" />

          {/* Section: Deprecation Policy */}
          <section id="deprecation-policy" className="space-y-4 scroll-mt-24 pb-12">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-400" />
              <span>API Versioning & Deprecation Policy</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              To support continuous improvement and security updates, the TurnProofs API is versioned. When breaking changes are introduced, we release a new major version (e.g., v2).
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2 text-xs leading-relaxed text-neutral-300">
              <span className="font-extrabold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Clock className="h-4 w-4" />
                <span>12-Month Support Window</span>
              </span>
              <p>
                Each major API version is fully supported for <strong className="text-white">12 months</strong> following the release of the subsequent version. Developers must migrate their integrations before sunset dates.
              </p>
              <ul className="space-y-1 mt-2 text-neutral-400">
                <li>• <strong>v1 Release Date:</strong> August 2, 2026</li>
                <li>• <strong>v1 Expected Sunset:</strong> August 2, 2027 (or 12 months post-v2 release)</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
