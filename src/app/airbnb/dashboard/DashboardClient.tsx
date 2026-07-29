'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Home, 
  Users, 
  FileSpreadsheet, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ListTodo, 
  X, 
  Camera, 
  MapPin, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown,
  LogOut, 
  RefreshCw,
  ExternalLink,
  QrCode,
  Printer
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  cover_image_url: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface Cleaner {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface ChecklistTask {
  id: string;
  property_id: string;
  task_name: string;
  requires_photo: boolean;
  sort_order: number;
}

interface Report {
  id: string;
  property_id: string;
  cleaner_name: string;
  started_at: string;
  completed_at: string;
  notes: string;
  airbnb_properties: {
    name: string;
    address: string;
  } | null;
}

export default function DashboardClient() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Authentication & Host state
  const [host, setHost] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  // Tabs
  const [activeTab, setActiveTab] = useState<'properties' | 'cleaners' | 'reports'>('properties');

  // Database lists
  const [properties, setProperties] = useState<Property[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Copy URL indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Commercial Tier Upgrade state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState(false);

  // Modals & Form states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropImage, setNewPropImage] = useState('');
  const [newPropLat, setNewPropLat] = useState('');
  const [newPropLng, setNewPropLng] = useState('');
  const [newPropEmails, setNewPropEmails] = useState('');

  const [newCleanerName, setNewCleanerName] = useState('');
  const [newCleanerPhone, setNewCleanerPhone] = useState('');

  // QR Code generator state
  const [activeQrProperty, setActiveQrProperty] = useState<Property | null>(null);

  // Checklist management modal
  const [activeChecklistProperty, setActiveChecklistProperty] = useState<Property | null>(null);
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskRequiresPhoto, setNewTaskRequiresPhoto] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('General / Entire Unit');
  const [customRoom, setCustomRoom] = useState('');

  // Check auth and load initial dashboard data
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authRes = await fetch('/api/airbnb/auth');
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.success) {
          router.push('/airbnb/login');
          return;
        }

        setHost(authData.host);
        setAuthChecking(false);

        // Load all data
        await Promise.all([
          fetchProperties(),
          fetchCleaners(),
          fetchReports()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        router.push('/airbnb/login');
      }
    }
    
    checkAuthAndLoad();
  }, []);

  const fetchProperties = async () => {
    const res = await fetch('/api/airbnb/properties');
    const data = await res.json();
    if (data.success) setProperties(data.properties || []);
  };

  const fetchCleaners = async () => {
    const res = await fetch('/api/airbnb/cleaners');
    const data = await res.json();
    if (data.success) setCleaners(data.cleaners || []);
  };

  const fetchReports = async () => {
    const res = await fetch('/api/airbnb/reports');
    const data = await res.json();
    if (data.success) setReports(data.reports || []);
  };

  // Copy clean magic link
  const copyCleanerLink = (propertyId: string) => {
    const origin = window.location.origin;
    const url = `${origin}/airbnb/clean/${propertyId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create Property
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    // Anti-gaming free trial guard (1 property limit)
    if (properties.length >= 1) {
      alert('14-Day Free Trial Limit: Your trial includes 1 managed property. To add more properties to your portfolio, please upgrade to Starter (1-3 properties @ $19.99/mo) or Pro (4-9 properties @ $29.99/mo).');
      return;
    }

    try {
      const defaultImg = newPropImage?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
      const serializedImg = `${defaultImg}|||${newPropEmails.trim()}`;

      const res = await fetch('/api/airbnb/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPropName,
          address: newPropAddress,
          cover_image_url: serializedImg,
          latitude: newPropLat || undefined,
          longitude: newPropLng || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewPropName('');
        setNewPropAddress('');
        setNewPropImage('');
        setNewPropLat('');
        setNewPropLng('');
        setNewPropEmails('');
        setIsPropertyModalOpen(false);
        fetchProperties();
      } else {
        alert('Error adding property: ' + data.error);
      }
    } catch (err: any) {
      alert('Network error adding property');
    }
  };

  // Delete Property
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This will also remove associated checklist templates.')) return;

    try {
      const res = await fetch(`/api/airbnb/properties?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProperties();
      } else {
        alert('Error deleting property: ' + data.error);
      }
    } catch (err) {
      alert('Network error deleting property');
    }
  };

  // Create Cleaner
  const handleAddCleaner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCleanerName || !newCleanerPhone) return;

    try {
      const res = await fetch('/api/airbnb/cleaners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCleanerName,
          phone: newCleanerPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewCleanerName('');
        setNewCleanerPhone('');
        fetchCleaners();
      } else {
        alert('Error adding cleaner: ' + data.error);
      }
    } catch (err) {
      alert('Network error adding cleaner');
    }
  };

  // Delete Cleaner
  const handleDeleteCleaner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cleaner?')) return;

    try {
      const res = await fetch(`/api/airbnb/cleaners?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchCleaners();
      } else {
        alert('Error deleting cleaner: ' + data.error);
      }
    } catch (err) {
      alert('Network error deleting cleaner');
    }
  };

  // Open Checklist Drawer
  const openChecklistManager = async (property: Property) => {
    setActiveChecklistProperty(property);
    setChecklistTasks([]);
    try {
      const res = await fetch(`/api/airbnb/checklists?propertyId=${property.id}`);
      const data = await res.json();
      if (data.success) {
        setChecklistTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching checklist tasks', err);
    }
  };

  // Add Task to Checklist
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !activeChecklistProperty) return;

    try {
      const finalRoom = selectedRoom === 'Custom Room' ? (customRoom.trim() || 'Custom Zone') : selectedRoom;
      const fullTaskName = finalRoom !== 'General / Entire Unit' ? `[${finalRoom}] ${newTaskName.trim()}` : newTaskName.trim();

      const sortOrder = checklistTasks.length + 1;
      const res = await fetch('/api/airbnb/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: activeChecklistProperty.id,
          task_name: fullTaskName,
          requires_photo: newTaskRequiresPhoto,
          sort_order: sortOrder
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewTaskName('');
        setNewTaskRequiresPhoto(false);
        // Refresh checklists
        openChecklistManager(activeChecklistProperty);
      }
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/airbnb/checklists?id=${taskId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success && activeChecklistProperty) {
        openChecklistManager(activeChecklistProperty);
      }
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  // Move Task (Reordering)
  const handleMoveTask = async (index: number, direction: 'up' | 'down') => {
    if (!activeChecklistProperty) return;
    const newTasks = [...checklistTasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newTasks.length) return;

    // Swap sort_order
    const temp = newTasks[index].sort_order;
    newTasks[index].sort_order = newTasks[targetIndex].sort_order;
    newTasks[targetIndex].sort_order = temp;

    // Swap positions in array
    const [moved] = newTasks.splice(index, 1);
    newTasks.splice(targetIndex, 0, moved);

    setChecklistTasks(newTasks);

    // Save order to API
    try {
      await fetch('/api/airbnb/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: newTasks.map(t => ({ id: t.id, sort_order: t.sort_order }))
        })
      });
    } catch (err) {
      console.error('Error updating task order', err);
    }
  };

  // Move Room Card (Reordering entire rooms)
  const handleMoveRoom = async (roomName: string, direction: 'up' | 'down') => {
    const roomsOrder: string[] = [];
    checklistTasks.forEach(task => {
      let room = 'General / Entire Unit';
      const match = task.task_name.match(/^\[(.*?)\]/);
      if (match) room = match[1];
      if (!roomsOrder.includes(room)) roomsOrder.push(room);
    });

    const index = roomsOrder.indexOf(roomName);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= roomsOrder.length) return;

    const newRoomsOrder = [...roomsOrder];
    const temp = newRoomsOrder[index];
    newRoomsOrder[index] = newRoomsOrder[targetIndex];
    newRoomsOrder[targetIndex] = temp;

    const reorderedTasks: ChecklistTask[] = [];
    newRoomsOrder.forEach((r) => {
      checklistTasks.forEach(task => {
        let room = 'General / Entire Unit';
        const match = task.task_name.match(/^\[(.*?)\]/);
        if (match) room = match[1];
        if (room === r) reorderedTasks.push(task);
      });
    });

    // Reassign sort_orders sequentially
    reorderedTasks.forEach((t, i) => {
      t.sort_order = i + 1;
    });

    setChecklistTasks(reorderedTasks);

    try {
      await fetch('/api/airbnb/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: reorderedTasks.map(t => ({ id: t.id, sort_order: t.sort_order }))
        })
      });
    } catch (err) {
      console.error('Error saving room order', err);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/airbnb/auth', { method: 'DELETE' });
      router.push('/airbnb/login');
    } catch (err) {
      console.error('Error logging out', err);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mb-4" />
        <span className="text-neutral-400 font-medium">Authorizing Host Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative select-none">
      {/* Glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/10">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              TurnProofs
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Bilingual Toggle Button */}
            <button
              type="button"
              onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
              className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              🌐 {lang === 'en' ? 'Español' : 'English'}
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{lang === 'en' ? 'Business Center' : 'Centro de Negocios'}</p>
              <p className="text-sm font-semibold text-neutral-200">{host?.business_name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col">
        {/* Pricing Plan Status Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className={`flex h-2.5 w-2.5 rounded-full animate-pulse shrink-0 ${
              properties.length <= 1 ? 'bg-rose-500' : properties.length <= 5 ? 'bg-orange-500' : 'bg-amber-500'
            }`} />
            <div>
              <p className="text-sm font-semibold text-neutral-200">
                {properties.length <= 1 
                  ? `Plan Status: Free Tier (1 property limit). Portfolio: ${properties.length}/1 units.` 
                  : properties.length <= 5
                  ? `Plan Status: Pro Plan ($9/mo, up to 5 properties). Portfolio: ${properties.length}/5 units.`
                  : `Plan Status: Elite Mode ($29.99/mo, Unlimited properties). Portfolio: ${properties.length} units.`
                }
              </p>
              <p className="text-xs text-neutral-400">
                {properties.length <= 1 
                  ? "Upgrade to Pro ($9/mo) for up to 5 properties, or unlock Elite Mode ($29.99/mo) for unlimited properties." 
                  : properties.length <= 5
                  ? "Unlock Elite Mode ($29.99/mo) to manage unlimited properties and unlock Twilio/HubSpot integrations."
                  : "Elite Mode active. Unlimited properties, Twilio SMS Alerts, and HubSpot CRM integrations unlocked."
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {properties.length <= 1 && (
              <button
                onClick={() => alert("Simulating Upgrade Payment flow ($9/mo)... Thank you for upgrading to Pro Plan!")}
                className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-750 text-xs font-bold transition-all cursor-pointer text-neutral-300"
              >
                Upgrade to Pro ($9)
              </button>
            )}
            {properties.length <= 5 && (
              <button
                onClick={() => alert("Simulating Upgrade Payment flow ($29.99/mo)... Thank you for unlocking Elite Mode!")}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-650 text-xs font-extrabold transition-all shadow-md shadow-amber-500/10 cursor-pointer text-white"
              >
                Unlock Elite Mode ($29.99)
              </button>
            )}
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Managed Portfolio</span>
            <h3 className="text-3xl font-extrabold mt-2">{properties.length}</h3>
            <p className="text-xs text-neutral-500 mt-1">Active short-term rental units</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors" />
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Staff Cleaners</span>
            <h3 className="text-3xl font-extrabold mt-2">{cleaners.length}</h3>
            <p className="text-xs text-neutral-500 mt-1">Registered field cleaner workers</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Verification Certs</span>
            <h3 className="text-3xl font-extrabold mt-2">{reports.length}</h3>
            <p className="text-xs text-neutral-500 mt-1">Submitted proof-of-clean reports</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-neutral-800 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Home className="h-4.5 w-4.5" />
            <span>Properties</span>
          </button>
          <button
            onClick={() => setActiveTab('cleaners')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cleaners'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Cleaners</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>Reports History</span>
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mb-3" />
            <span className="text-neutral-400">Loading data profiles...</span>
          </div>
        ) : (
          <div className="flex-1">
            
            {/* TAB: PROPERTIES */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-100">Properties Inventory</h2>
                    <p className="text-sm text-neutral-400">Add rental units, manage templates, and share magic cleaner links.</p>
                  </div>
                  <button
                    onClick={() => setIsPropertyModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm transition-all shadow-md shadow-rose-500/10 flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Property</span>
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="border border-dashed border-neutral-800 rounded-3xl p-16 text-center bg-neutral-900/10">
                    <Home className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <h4 className="font-bold text-lg text-neutral-300">No properties yet</h4>
                    <p className="text-neutral-500 text-sm mt-1 max-w-sm mx-auto">Get started by creating your first property listing. We will automatically generate checklist templates for you.</p>
                    <button
                      onClick={() => setIsPropertyModalOpen(true)}
                      className="mt-6 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-sm font-semibold transition-all"
                    >
                      Create First Property
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden relative flex flex-col group hover:border-neutral-700 transition-all duration-300"
                      >
                        <div className="h-40 w-full relative overflow-hidden bg-neutral-950">
                          <img
                            src={prop.cover_image_url?.includes('|||') ? prop.cover_image_url.split('|||')[0] : prop.cover_image_url}
                            alt={prop.name}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-[10px] font-bold tracking-wider uppercase mb-1.5 inline-block">Airbnb Verified</span>
                            <h3 className="font-bold text-lg text-white truncate drop-shadow-md">{prop.name}</h3>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2 text-sm text-neutral-400">
                              <MapPin className="h-4.5 w-4.5 text-neutral-500 shrink-0 mt-0.5" />
                              <span>{prop.address}</span>
                            </div>
                            {prop.cover_image_url?.includes('|||') && prop.cover_image_url.split('|||')[1] && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-xl w-fit">
                                <span>📧 Auto-Email Reports: {prop.cover_image_url.split('|||')[1]}</span>
                              </div>
                            )}
                            {prop.latitude && prop.longitude && (
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                <span>GPS Coordinates: {prop.latitude.toFixed(5)}, {prop.longitude.toFixed(5)}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {/* Copy Magic Link */}
                            <button
                              onClick={() => copyCleanerLink(prop.id)}
                              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-rose-500/40 hover:bg-neutral-900/50 text-sm font-semibold transition-all flex items-center justify-between"
                            >
                              <span className="text-neutral-400">Cleaner Portal Magic Link</span>
                              <div className="flex items-center gap-1.5 text-rose-400">
                                {copiedId === prop.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    <span className="text-xs">Copy URL</span>
                                  </>
                                )}
                              </div>
                            </button>

                            {/* Actions bar */}
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => openChecklistManager(prop)}
                                className="flex-1 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <ListTodo className="h-4 w-4 text-neutral-400" />
                                <span>Edit Checklist</span>
                              </button>
                              <button
                                onClick={() => setActiveQrProperty(prop)}
                                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 transition-all cursor-pointer"
                                title="Generate QR Code Sign"
                              >
                                <QrCode className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(prop.id)}
                                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                                title="Delete Property"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CLEANERS */}
            {activeTab === 'cleaners' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left block: Add Cleaner */}
                  <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md h-fit">
                    <h3 className="font-bold text-lg mb-1">Add Staff Cleaner</h3>
                    <p className="text-xs text-neutral-400 mb-6">Create field cleaner profiles. Cleaners will select their name from a menu upon checkouts.</p>
                    
                    <form onSubmit={handleAddCleaner} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Cleaner Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={newCleanerName}
                          onChange={(e) => setNewCleanerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Cleaner Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. sarah@cleaningservice.com"
                          value={newCleanerPhone}
                          onChange={(e) => setNewCleanerPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm transition-all"
                      >
                        Add Cleaner Profile
                      </button>
                    </form>
                  </div>

                  {/* Right block: Cleaners List */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">Staff List ({cleaners.length})</h3>
                    {cleaners.length === 0 ? (
                      <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 text-sm">
                        No cleaners registered yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cleaners.map((cleaner) => (
                          <div
                            key={cleaner.id}
                            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-905/30 flex items-center justify-between hover:border-neutral-700 transition-colors"
                          >
                            <div>
                              <h4 className="font-bold text-base text-neutral-100">{cleaner.name}</h4>
                              <p className="text-xs text-neutral-400 mt-1">{cleaner.phone}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteCleaner(cleaner.id)}
                              className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
                              title="Delete Cleaner"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REPORTS HISTORY */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-100">Verification Certificates</h2>
                  <p className="text-sm text-neutral-400">View and download completed cleaning logs for Airbnb support validation.</p>
                </div>

                {reports.length === 0 ? (
                  <div className="border border-dashed border-neutral-800 rounded-2xl p-16 text-center text-neutral-500 text-sm">
                    No cleaning reports have been submitted yet.
                  </div>
                ) : (
                  <div className="border border-neutral-800 rounded-2xl bg-neutral-900/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            <th className="p-4">Property</th>
                            <th className="p-4">Cleaner</th>
                            <th className="p-4">Completed Date</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/80 text-sm text-neutral-300">
                          {reports.map((report) => {
                            const start = new Date(report.started_at);
                            const end = new Date(report.completed_at);
                            const durationMs = end.getTime() - start.getTime();
                            const durationMin = Math.round(durationMs / 60000);

                            let hasAlert = false;
                            if (report.notes && report.notes.trim().startsWith('{')) {
                              try {
                                const parsed = JSON.parse(report.notes);
                                hasAlert = !!parsed.maintenanceAlert;
                              } catch(e) {}
                            }

                            return (
                              <tr key={report.id} className="hover:bg-neutral-900/40 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-neutral-200">{report.airbnb_properties?.name || 'Unknown Unit'}</p>
                                    {hasAlert && (
                                      <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-450 text-red-400 text-[9px] font-extrabold uppercase tracking-wide shrink-0">
                                        ⚠️ Maintenance
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-neutral-500 truncate max-w-[240px]">{report.airbnb_properties?.address}</p>
                                </td>
                                <td className="p-4 font-medium">{report.cleaner_name}</td>
                                <td className="p-4 text-xs">
                                  {new Date(report.completed_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="p-4 text-xs font-mono">{durationMin} min</td>
                                <td className="p-4 text-right">
                                  <a
                                    href={`/airbnb/report/${report.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 text-xs font-semibold transition-all"
                                  >
                                    <span>Certificate</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* MODAL: ADD PROPERTY */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative">
            <button
              onClick={() => setIsPropertyModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-extrabold text-xl mb-1.5">Add Property Listing</h3>
            <p className="text-xs text-neutral-400 mb-6">Create a property listing below. Coordinates are optional but verify location compliance.</p>

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Condo in Downtown"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main St, New York, NY 10001"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPropImage}
                  onChange={(e) => setNewPropImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  <span>Auto-Email Reports to Facility Managers</span>
                  {host?.subscription_tier === 'commercial' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold tracking-wider">
                      ✓ Commercial Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-extrabold tracking-wider flex items-center gap-1">
                      🔒 Commercial Plan Only
                    </span>
                  )}
                </label>

                {host?.subscription_tier === 'commercial' ? (
                  <input
                    type="text"
                    placeholder="e.g. manager@building.com, inspector@company.com"
                    value={newPropEmails}
                    onChange={(e) => setNewPropEmails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-white"
                  />
                ) : (
                  <div
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950/90 border border-amber-500/30 hover:border-amber-500/60 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all shadow-sm"
                  >
                    <span className="text-neutral-400 font-medium italic truncate max-w-[260px]">
                      🔒 Locked for Commercial Tier Subscribers ($89.99/mo)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-[10px] shrink-0">
                      Upgrade Tier ⚡
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Target Latitude (Optional)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 40.7128"
                    value={newPropLat}
                    onChange={(e) => setNewPropLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Target Longitude (Optional)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. -74.0060"
                    value={newPropLng}
                    onChange={(e) => setNewPropLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm transition-all"
              >
                Create Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: EDIT CHECKLIST */}
      {activeChecklistProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="w-full max-w-xl h-full bg-neutral-900 border-l border-neutral-800 p-8 shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-xl truncate">{activeChecklistProperty.name}</h3>
                <button
                  onClick={() => setActiveChecklistProperty(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-neutral-400 pb-4 border-b border-neutral-800">
                Customize checklist requirements. Reorder list or request photography logs for tasks.
              </p>
            </div>

            {/* Middle part: Task List & Add Input */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              
              {/* Pinned Core Niche Banner */}
              <div className="p-3.5 rounded-xl bg-linear-to-r from-rose-950/60 to-neutral-900 border border-rose-500/30 flex items-start gap-2.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-xs text-rose-300 uppercase tracking-tight">📌 TurnProofs Niche: Mandatory Walkthrough Pinned as Priority #1</h5>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Before starting room tasks, cleaners are automatically forced to walk the property to inspect for damage/broken items & guest lost/found. This core audit is pinned at the top of every clean and cannot be moved or removed.
                  </p>
                </div>
              </div>

              {/* Room & Task Add Form */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-850 pb-2.5">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Room-Based Checklist Builder</h4>
                  <span className="text-[10px] text-neutral-400">Step 1: Create Room ➔ Step 2: Add Tasks</span>
                </div>

                {/* Step 1: Create Room */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300">1. Room / Commercial Zone Name:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Top Floor Bedroom 1, Executive Restroom, Lobby"
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg outline-none text-xs text-white focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customRoom.trim()) {
                          setSelectedRoom(customRoom.trim());
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 font-bold text-xs text-neutral-200 transition-colors"
                    >
                      Set Active Room
                    </button>
                  </div>

                  {/* Room Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Top Floor Bedroom 1',
                      'Master Bedroom',
                      'Living Room',
                      'Main Bathroom',
                      'Kitchen & Dining',
                      'Exterior / Patio'
                    ].map((roomPreset) => (
                      <button
                        key={roomPreset}
                        type="button"
                        onClick={() => {
                          setSelectedRoom(roomPreset);
                          setCustomRoom(roomPreset);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          selectedRoom === roomPreset
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {roomPreset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Add Task to Active Room */}
                <form onSubmit={handleAddTask} className="pt-2 border-t border-neutral-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-neutral-300">
                      2. Add Task to <span className="text-rose-400 font-extrabold">&quot;{selectedRoom}&quot;</span>:
                    </label>
                  </div>
                  
                  <input
                    type="text"
                    placeholder={`e.g. Make bed with fresh linens in ${selectedRoom}`}
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-lg focus:border-rose-500 outline-none text-xs text-white"
                    required
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-xs text-neutral-400 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTaskRequiresPhoto}
                        onChange={(e) => setNewTaskRequiresPhoto(e.target.checked)}
                        className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500 bg-neutral-900"
                      />
                      <span className="font-medium">Require photo validation for this task</span>
                    </label>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Task list container grouped by Collapsible Room Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Property Room Accordions</h4>
                  <span className="text-[10px] font-semibold text-rose-400">
                    {checklistTasks.length} Total Task{checklistTasks.length === 1 ? '' : 's'} Across Rooms
                  </span>
                </div>
                
                {checklistTasks.length === 0 ? (
                  <div className="p-8 border border-dashed border-neutral-800 rounded-xl text-center text-xs text-neutral-500">
                    No room checklists created yet. Type or select a room above to add tasks.
                  </div>
                ) : (
                  (() => {
                    // Group tasks by Room Name
                    const roomMap: Record<string, typeof checklistTasks> = {};
                    checklistTasks.forEach(task => {
                      let room = 'General / Entire Unit';
                      const match = task.task_name.match(/^\[(.*?)\]\s*(.*)$/);
                      if (match) {
                        room = match[1];
                      }
                      if (!roomMap[room]) roomMap[room] = [];
                      roomMap[room].push(task);
                    });

                    return (
                      <div className="space-y-3.5">
                        {Object.entries(roomMap).map(([roomName, tasksInRoom]) => (
                          <div
                            key={roomName}
                            className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-sm"
                          >
                            {/* Room Card Accordion Header */}
                            <div
                              onClick={() => {
                                setSelectedRoom(roomName);
                                setCustomRoom(roomName);
                              }}
                              className="px-4 py-3 bg-neutral-900/90 hover:bg-neutral-900 border-b border-neutral-850 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                <h5 className="font-extrabold text-sm text-neutral-100">{roomName}</h5>
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                                  {tasksInRoom.length} task{tasksInRoom.length === 1 ? '' : 's'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Room Move Up / Down Controls */}
                                <div className="flex items-center gap-1 border-r border-neutral-800 pr-2 mr-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveRoom(roomName, 'up');
                                    }}
                                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                                    title="Move Room Up"
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveRoom(roomName, 'down');
                                    }}
                                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                                    title="Move Room Down"
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRoom(roomName);
                                    setCustomRoom(roomName);
                                  }}
                                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                                >
                                  + Add Task
                                </button>
                                <ChevronDown className="h-4 w-4 text-neutral-400" />
                              </div>
                            </div>

                            {/* Room Checklist Items */}
                            <div className="p-3 space-y-2 bg-neutral-950/50">
                              {tasksInRoom.map((task, i) => {
                                const cleanText = task.task_name.replace(/^\[.*?\]\s*/, '');
                                const taskIndexInFullList = checklistTasks.findIndex(t => t.id === task.id);

                                return (
                                  <div
                                    key={task.id}
                                    className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-850 flex items-center justify-between group/task"
                                  >
                                    <div className="flex-1 min-w-0 mr-3 flex items-start gap-2.5">
                                      <span className="text-xs font-mono text-neutral-500 mt-0.5">{i + 1}</span>
                                      <div className="truncate">
                                        <p className="text-xs font-semibold text-neutral-200 truncate">{cleanText}</p>
                                        {task.requires_photo && (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase">
                                            <Camera className="h-3 w-3" />
                                            <span>Photo Required</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Reorder & Delete buttons */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleMoveTask(taskIndexInFullList, 'up')}
                                        disabled={taskIndexInFullList === 0}
                                        className="p-1 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                                        title="Move Task Up"
                                      >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleMoveTask(taskIndexInFullList, 'down')}
                                        disabled={taskIndexInFullList === checklistTasks.length - 1}
                                        className="p-1 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                                        title="Move Task Down"
                                      >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1.5 rounded-md hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>

            </div>

            {/* Bottom Panel */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={() => setActiveChecklistProperty(null)}
                className="w-full py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 font-bold text-sm transition-all"
              >
                Done Editing
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: QR CODE GENERATOR SIGN */}
      {activeQrProperty && (
        <div id="qr-modal-container" className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          {/* Print Style Injector */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #qr-print-box, #qr-print-box * {
                visibility: visible;
              }
              #qr-print-box {
                position: absolute;
                left: 0;
                top: 10%;
                width: 100%;
                background: white !important;
                color: black !important;
                border: none !important;
              }
              .no-print-element {
                display: none !important;
              }
            }
          `}</style>

          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative no-print-element">
            <button
              onClick={() => setActiveQrProperty(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-xl mb-1.5">Property QR Code</h3>
            <p className="text-xs text-neutral-400 mb-6">Print this card and place it inside the cleaning closet. Cleaners scan it to start tasks instantly.</p>

            {/* Printable Sign Box */}
            <div id="qr-print-box" className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 text-center space-y-6">
              <div className="flex items-center justify-center gap-1.5 text-rose-500">
                <ShieldCheck className="h-6 w-6 text-rose-500" />
                <span className="font-extrabold text-base tracking-tight uppercase">TurnProofs Compliance</span>
              </div>

              <div>
                <h2 className="font-black text-xl text-neutral-100 print:text-black truncate">{activeQrProperty.name}</h2>
                <p className="text-xs text-neutral-400 print:text-gray-600 truncate mt-1">{activeQrProperty.address}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    window.location.origin + '/airbnb/clean/' + activeQrProperty.id
                  )}`}
                  alt="Cleaner Scan QR Code"
                  className="h-44 w-44 object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider print:border print:border-rose-500">
                  Scan To Audit
                </span>
                <p className="text-[10px] text-neutral-500 print:text-gray-600 mt-2 font-medium">
                  Scan with your phone camera. Zero logins or app downloads required.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setActiveQrProperty(null)}
                className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 font-bold text-sm transition-all"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="py-3 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Sign Card</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* COMMERCIAL PLAN UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-wider">
                  Commercial Feature
                </span>
                <h3 className="font-extrabold text-lg text-white mt-0.5">
                  Upgrade to Commercial Tier
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-1">
                <span className="text-3xl font-black text-white">$89.99</span>
                <span className="text-xs text-neutral-400 font-semibold"> / month</span>
                <p className="text-xs text-emerald-400 font-bold pt-1">Commercial Facility Audit & Manager Dispatches</p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Auto-Email PDF Reports to Facility Managers & Inspectors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Audit Subcontracted Cleaners with Unlimited Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Commercial Zone Checklist Builder</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgradingTier}
                onClick={async () => {
                  setUpgradingTier(true);
                  try {
                    const res = await fetch('/api/airbnb/auth', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'upgrade_tier',
                        email: host?.email,
                        tier: 'commercial'
                      })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setHost((prev: any) => ({ ...prev, subscription_tier: 'commercial' }));
                      alert('🎉 Congratulations! You have successfully upgraded to Commercial Tier!');
                      setShowUpgradeModal(false);
                    } else {
                      alert('Upgrade failed: ' + (data.error || 'Unknown error'));
                    }
                  } catch (e) {
                    alert('Network error during upgrade');
                  } finally {
                    setUpgradingTier(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-extrabold text-xs text-black transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {upgradingTier ? 'Upgrading...' : '⚡ Unlock Commercial Plan ($89.99)'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
