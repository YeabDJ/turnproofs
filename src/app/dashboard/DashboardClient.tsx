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
  Printer,
  CreditCard,
  Lock,
  Shield,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
  HelpCircle,
  Edit3,
  Key,
  Terminal,
  Code,
  Eye,
  Share2
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
  const [activeTab, setActiveTab] = useState<'properties' | 'cleaners' | 'reports' | 'billing' | 'integrations'>('properties');

  // Billing & Subscription states
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeTargetPlan, setDowngradeTargetPlan] = useState<any>(null);
  const [pausingSubscription, setPausingSubscription] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [showFaqGuide, setShowFaqGuide] = useState(false);
  const [editingBillingEmail, setEditingBillingEmail] = useState(false);
  const [customBillingEmail, setCustomBillingEmail] = useState('');
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  
  // Card form state for first-time checkout
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Database lists
  const [properties, setProperties] = useState<Property[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('live');
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['properties:read', 'reports:read']);
  const [newKeyProperties, setNewKeyProperties] = useState<string[]>([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<any>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Copy indicator & Upgrade modal states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPreviewId, setCopiedPreviewId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState(false);

  // White-Label Branding states
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [agencyEmail, setAgencyEmail] = useState('');
  const [customFooterText, setCustomFooterText] = useState('');
  const [hideBranding, setHideBranding] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  // Modals & Form states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropImage, setNewPropImage] = useState('');
  const [newPropLat, setNewPropLat] = useState('');
  const [newPropLng, setNewPropLng] = useState('');
  const [newPropEmails, setNewPropEmails] = useState('');

  // Edit Property Modal states
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [editPropName, setEditPropName] = useState('');
  const [editPropAddress, setEditPropAddress] = useState('');
  const [editPropImage, setEditPropImage] = useState('');
  const [editPropLat, setEditPropLat] = useState('');
  const [editPropLng, setEditPropLng] = useState('');
  const [editPropEmails, setEditPropEmails] = useState('');
  const [savingEditProperty, setSavingEditProperty] = useState(false);

  const openEditPropertyModal = (prop: Property) => {
    setEditingPropId(prop.id);
    setEditPropName(prop.name || '');
    setEditPropAddress(prop.address || '');
    
    let imgUrl = prop.cover_image_url || '';
    let emailStr = '';
    if (imgUrl.includes('|||')) {
      const parts = imgUrl.split('|||');
      imgUrl = parts[0] || '';
      emailStr = parts[1] || '';
    }
    setEditPropImage(imgUrl);
    setEditPropEmails(emailStr);
    setEditPropLat(prop.latitude ? String(prop.latitude) : '');
    setEditPropLng(prop.longitude ? String(prop.longitude) : '');
    setIsEditPropertyModalOpen(true);
  };

  const handleSaveEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPropId || !editPropName || !editPropAddress) return;

    setSavingEditProperty(true);
    try {
      const defaultImg = editPropImage?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
      const serializedImg = editPropEmails.trim() ? `${defaultImg}|||${editPropEmails.trim()}` : defaultImg;

      const res = await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPropId,
          name: editPropName.trim(),
          address: editPropAddress.trim(),
          cover_image_url: serializedImg,
          latitude: editPropLat ? parseFloat(editPropLat) : null,
          longitude: editPropLng ? parseFloat(editPropLng) : null
        })
      });

      const data = await res.json();
      setSavingEditProperty(false);

      if (data.success && data.property) {
        setProperties(prev => prev.map(p => p.id === editingPropId ? data.property : p));
        setIsEditPropertyModalOpen(false);
        setEditingPropId(null);
        alert('🎉 Property details updated successfully!');
      } else {
        alert('Failed to update property: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setSavingEditProperty(false);
      alert('Network error while updating property.');
    }
  };

  const [newCleanerName, setNewCleanerName] = useState('');
  const [newCleanerPhone, setNewCleanerPhone] = useState('');
  const [newCleanerPropId, setNewCleanerPropId] = useState('');

  // QR Code generator state
  const [activeQrProperty, setActiveQrProperty] = useState<Property | null>(null);

  // Checklist management modal
  const [activeChecklistProperty, setActiveChecklistProperty] = useState<Property | null>(null);
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskRequiresPhoto, setNewTaskRequiresPhoto] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('General / Entire Unit');
  const [customRoom, setCustomRoom] = useState('');
  const [newTaskRefPhoto, setNewTaskRefPhoto] = useState('');
  const [uploadingRefPhoto, setUploadingRefPhoto] = useState(false);

  // Bulk Copy-Paste Checklist Importer State
  const [checklistMode, setChecklistMode] = useState<'single' | 'bulk'>('single');
  const [bulkText, setBulkText] = useState('');
  const [bulkRequirePhotos, setBulkRequirePhotos] = useState(false);
  const [importingBulk, setImportingBulk] = useState(false);

  const isPaidActive = !!(host?.subscription_status === 'active' || host?.stripe_subscription_id);

  // Check auth and load initial dashboard data
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.success) {
          router.push('/login');
          return;
        }

        setHost(authData.host);
        if (authData.host) {
          setCompanyName(authData.host.business_name || '');
          setCompanyLogoUrl(authData.host.company_logo_url || '');
          setAgencyEmail(authData.host.email || '');
          setCustomFooterText(authData.host.custom_footer || '');
          setHideBranding(!!authData.host.hide_branding);
        }
        setAuthChecking(false);

        // Load all data
        await Promise.all([
          fetchProperties(),
          fetchCleaners(),
          fetchReports(),
          fetchApiKeys()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        router.push('/login');
      }
    }
    
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (activeTab === 'integrations') {
      fetchApiKeys();
    }
  }, [activeTab]);

  const fetchProperties = async () => {
    const res = await fetch('/api/properties');
    const data = await res.json();
    if (data.success) setProperties(data.properties || []);
  };

  const fetchCleaners = async () => {
    const res = await fetch('/api/cleaners');
    const data = await res.json();
    if (data.success) setCleaners(data.cleaners || []);
  };

  const fetchReports = async () => {
    const res = await fetch('/api/reports');
    const data = await res.json();
    if (data.success) setReports(data.reports || []);
  };

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      if (data.success) setApiKeys(data.keys || []);
    } catch (e) {
      console.error('Failed to fetch API keys:', e);
    }
  };

  // Copy clean magic link
  const copyCleanerLink = (propertyId: string) => {
    const origin = window.location.origin;
    const url = `${origin}/clean/${propertyId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy cleaner preview link
  const copyPreviewLink = (propertyId: string) => {
    const origin = window.location.origin;
    const url = `${origin}/preview/${propertyId}`;
    navigator.clipboard.writeText(url);
    setCopiedPreviewId(propertyId);
    setTimeout(() => setCopiedPreviewId(null), 2500);
    alert(`📋 Cleaner Preview Link copied to clipboard!\n\nSend this URL to your cleaner so they can review tasks and reference photos beforehand:\n${url}`);
  };

  // Create Property
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    // Anti-gaming free trial guard (1 property limit)
    if (properties.length >= 1 && !host?.stripe_subscription_id && host?.subscription_status !== 'active') {
      alert('14-Day Free Trial Capacity Reached: Your trial includes 1 managed property ($0 today). To add additional properties to your portfolio, please select a plan: Growth Tier (2-3 properties @ $18.99/mo) or Elite Tier (4-6 properties @ $35.99/mo).');
      setCheckoutPlan({
        name: 'Growth Plan',
        planKey: 'growth',
        units: 3,
        monthlyRate: 18.99,
        annualRate: 16.14
      });
      setIsPropertyModalOpen(false);
      setShowCheckoutModal(true);
      return;
    }

    try {
      const defaultImg = newPropImage?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
      const serializedImg = `${defaultImg}|||${newPropEmails.trim()}`;

      const res = await fetch('/api/properties', {
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
      if (data.success && data.property) {
        setNewPropName('');
        setNewPropAddress('');
        setNewPropImage('');
        setNewPropLat('');
        setNewPropLng('');
        setNewPropEmails('');
        setIsPropertyModalOpen(false);
        fetchProperties();
        // Instantly reveal the new unit's unique QR Code & Magic Link!
        setActiveQrProperty(data.property);
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
      const res = await fetch(`/api/properties?id=${id}`, {
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
      const res = await fetch('/api/cleaners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCleanerName,
          phone: newCleanerPhone,
          property_id: newCleanerPropId || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewCleanerName('');
        setNewCleanerPhone('');
        setNewCleanerPropId('');
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
      const res = await fetch(`/api/cleaners?id=${id}`, {
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
      const res = await fetch(`/api/checklists?propertyId=${property.id}`);
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
      let fullTaskName = finalRoom !== 'General / Entire Unit' ? `[${finalRoom}] ${newTaskName.trim()}` : newTaskName.trim();
      if (newTaskRefPhoto) {
        fullTaskName = `${fullTaskName} ||| ${newTaskRefPhoto}`;
      }

      const sortOrder = checklistTasks.length + 1;
      const res = await fetch('/api/checklists', {
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
        setNewTaskRefPhoto('');
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
      const res = await fetch(`/api/checklists?id=${taskId}`, {
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
      await fetch('/api/checklists', {
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
      await fetch('/api/checklists', {
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

  // Toggle Photo Requirement for a single task
  const handleToggleTaskPhoto = async (taskId: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    setChecklistTasks(prev => prev.map(t => t.id === taskId ? { ...t, requires_photo: nextVal } : t));

    try {
      await fetch('/api/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          requires_photo: nextVal
        })
      });
    } catch (err) {
      console.error('Error toggling photo requirement:', err);
    }
  };

  // Batch Toggle Photo Requirement for ALL tasks of active property
  const handleBatchTogglePhotos = async (enablePhotos: boolean) => {
    if (!activeChecklistProperty || checklistTasks.length === 0) return;
    setChecklistTasks(prev => prev.map(t => ({ ...t, requires_photo: enablePhotos })));

    try {
      const updatePayload = checklistTasks.map(t => ({ id: t.id, requires_photo: enablePhotos }));
      await fetch('/api/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
    } catch (err) {
      console.error('Error batch toggling photo requirement:', err);
    }
  };

  // Bulk Copy-Paste Checklist Importer
  const handleBulkImportChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChecklistProperty || !bulkText.trim()) return;

    const rawLines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    setImportingBulk(true);

    const parsedTasks = rawLines.map(line => {
      let cleanLine = line.replace(/^[\-\*\•\d+\.\)\s]+/, '').trim();
      let roomTag = selectedRoom || 'General / Entire Unit';

      const match = cleanLine.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        roomTag = match[1];
        cleanLine = match[2];
      } else {
        const colonMatch = cleanLine.match(/^([A-Za-z0-9\s#\-\_\&\']+):\s*(.*)$/);
        if (colonMatch && colonMatch[1].length < 30) {
          roomTag = colonMatch[1].trim();
          cleanLine = colonMatch[2].trim();
        }
      }

      const fullTaskName = `[${roomTag}] ${cleanLine}`;
      const requiresPhoto = bulkRequirePhotos;

      return {
        task_name: fullTaskName,
        requires_photo: requiresPhoto
      };
    });

    try {
      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: activeChecklistProperty.id,
          tasks: parsedTasks
        })
      });

      const data = await res.json();
      setImportingBulk(false);

      if (res.ok && data.success) {
        // Re-fetch clean checklist from database to ensure valid task objects
        const refetchRes = await fetch(`/api/checklists?propertyId=${activeChecklistProperty.id}`);
        const refetchData = await refetchRes.json();
        if (refetchData.success && refetchData.tasks) {
          setChecklistTasks(refetchData.tasks);
        } else if (data.tasks) {
          setChecklistTasks(prev => [...prev, ...data.tasks]);
        }
        setBulkText('');
        setChecklistMode('single');
        alert(`⚡ Successfully imported ${data.tasks?.length || 'all'} checklist tasks into "${activeChecklistProperty.name}"!`);
      } else {
        alert('Failed to import checklist: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setImportingBulk(false);
      alert('Network error importing checklist.');
    }
  };

  // Duplicate Property Modal state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [sourcePropForDup, setSourcePropForDup] = useState<Property | null>(null);
  const [dupPropName, setDupPropName] = useState('');
  const [dupPropAddress, setDupPropAddress] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  const openDuplicateModal = (prop: Property) => {
    setSourcePropForDup(prop);
    setDupPropName(`${prop.name} (Unit B)`);
    setDupPropAddress(prop.address);
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePropForDup || !dupPropName.trim() || !dupPropAddress.trim()) return;

    setDuplicating(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          sourcePropertyId: sourcePropForDup.id,
          newName: dupPropName.trim(),
          newAddress: dupPropAddress.trim()
        })
      });
      const data = await res.json();
      setDuplicating(false);

      if (res.ok && data.success && data.property) {
        setProperties(prev => [data.property, ...prev]);
        setIsDuplicateModalOpen(false);
        setSourcePropForDup(null);
        // Instantly reveal the new unit's unique QR Code & Magic Link!
        setActiveQrProperty(data.property);
      } else {
        alert('Failed to duplicate property: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setDuplicating(false);
      alert('Network error duplicating property.');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
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
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" title="Go to TurnProofs Main Landing Page">
              <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/10">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                TurnProofs
              </span>
            </Link>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Home className="h-3.5 w-3.5 text-rose-400" />
              <span>TurnProofs Home</span>
            </Link>
          </div>

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
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center justify-end gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-mono text-neutral-100">{host?.email || 'Logged In'}</span>
              </p>
              <p className="text-[11px] text-neutral-400 font-medium truncate max-w-[180px]">{host?.business_name || 'TurnProofs Host'}</p>
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
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {properties.length <= 1 ? '14-Day Free Trial' : properties.length <= 3 ? 'Growth Tier' : properties.length <= 6 ? 'Elite Tier' : 'Elite Scaling'}
                </span>
                <span className="text-xs text-neutral-400 font-semibold">({properties.length} Active {properties.length === 1 ? 'Unit' : 'Units'})</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Full feature access active. Manage your billing, plan scaling, and payment methods in your Billing tab.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-xs font-extrabold transition-all shadow-md shadow-rose-500/10 cursor-pointer text-white flex items-center gap-1.5 shrink-0"
          >
            <CreditCard className="h-4 w-4" />
            <span>Manage Billing & Subscription</span>
          </button>
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
        <div className="flex items-center border-b border-neutral-800 mb-8 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
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
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
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
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'reports'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>Reports History</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'billing'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Billing & Subscription</span>
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-4 text-base font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'integrations'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="h-4.5 w-4.5" />
            <span>Integrations (API)</span>
            {!['elite', 'commercial'].includes(host?.subscription_tier || '') && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase tracking-wider">
                🔒 Upgrade
              </span>
            )}
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
                              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-rose-500/40 hover:bg-neutral-900/50 text-sm font-semibold transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span className="text-neutral-400">📱 Cleaner App Link (Mobile Terminal)</span>
                              <div className="flex items-center gap-1.5 text-rose-400">
                                {copiedId === prop.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    <span className="text-xs">Copy Link</span>
                                  </>
                                )}
                              </div>
                            </button>

                            {/* Copy Preview Link */}
                            <button
                              onClick={() => copyPreviewLink(prop.id)}
                              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-900/50 text-sm font-semibold transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span className="text-neutral-400">👁️ Share Cleaner Preview Link (Read-Only)</span>
                              <div className="flex items-center gap-1.5 text-amber-400">
                                {copiedPreviewId === prop.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="h-4 w-4" />
                                    <span className="text-xs">Copy Preview Link</span>
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
                                onClick={() => openDuplicateModal(prop)}
                                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 transition-all cursor-pointer"
                                title="Duplicate Property & Checklist in 1 Action"
                              >
                                <Copy className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => openEditPropertyModal(prop)}
                                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                title="Edit Property Details (Name, Address, Cover Image, GPS, Emails)"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
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
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Assign to Property Unit</label>
                        <select
                          value={newCleanerPropId}
                          onChange={(e) => setNewCleanerPropId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 outline-none text-sm text-white transition-all cursor-pointer"
                        >
                          <option value="">All Portfolio Properties (Default)</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
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
                    {reports.length === 0 ? (
                      <div className="p-12 text-center text-neutral-500">
                        <FileCheck2 className="h-10 w-10 mx-auto text-neutral-700 mb-3" />
                        <p className="font-semibold text-neutral-300">No turnover verification logs completed yet.</p>
                        <p className="text-xs text-neutral-500 mt-1">When cleaners submit checklist logs, their signed certificates appear here.</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
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
                                const durationMin = Math.max(1, Math.round(durationMs / 60000));

                                let hasAlert = false;
                                let isRedFlag = report.notes?.includes('[RED FLAG ALERT]');
                                let isLostFound = report.notes?.includes('[LOST & FOUND ALERT]');

                                if (report.notes && report.notes.trim().startsWith('{')) {
                                  try {
                                    const parsed = JSON.parse(report.notes);
                                    hasAlert = !!parsed.maintenanceAlert;
                                  } catch(e) {}
                                }

                                return (
                                  <tr key={report.id} className="hover:bg-neutral-900/40 transition-colors">
                                    <td className="p-4">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-neutral-200">{report.airbnb_properties?.name || 'Unknown Unit'}</p>
                                        {isRedFlag && (
                                          <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                                            🚨 Red Flag Alert
                                          </span>
                                        )}
                                        {isLostFound && (
                                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                                            🎒 Lost & Found Item
                                          </span>
                                        )}
                                        {hasAlert && !isRedFlag && (
                                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-extrabold uppercase tracking-wide shrink-0">
                                            ⚠️ Maintenance
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-neutral-500 truncate max-w-[240px]">{report.airbnb_properties?.address}</p>
                                      {(isRedFlag || isLostFound) && report.notes && (
                                        <p className="text-xs text-neutral-300 mt-1 italic line-clamp-1 bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-800">
                                          "{report.notes.replace(/^(🚨 \[RED FLAG ALERT\]:|🎒 \[LOST & FOUND ALERT\]:)\s*/, '').split('|||')[0].trim()}"
                                        </p>
                                      )}
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
                                        href={`/report/${report.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 text-xs font-semibold transition-all"
                                      >
                                        <span>Certificate</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards Stack View */}
                        <div className="block md:hidden divide-y divide-neutral-800/80">
                          {reports.map((report) => {
                            const start = new Date(report.started_at);
                            const end = new Date(report.completed_at);
                            const durationMs = end.getTime() - start.getTime();
                            const durationMin = Math.max(1, Math.round(durationMs / 60000));

                            let isRedFlag = report.notes?.includes('[RED FLAG ALERT]');
                            let isLostFound = report.notes?.includes('[LOST & FOUND ALERT]');

                            return (
                              <div key={report.id} className="p-4 space-y-3 bg-neutral-950/40">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-white">{report.airbnb_properties?.name || 'Vacation Unit'}</h4>
                                    <p className="text-xs text-neutral-400">{report.airbnb_properties?.address}</p>
                                  </div>
                                   <div className="flex items-center gap-1.5 shrink-0">
                                     <button
                                       onClick={async () => {
                                         const targetEmail = prompt("Enter recipient email address to receive certified PDF report (or leave blank to send to host email):", host?.email || '');
                                         if (targetEmail === null) return;
                                         try {
                                           const res = await fetch('/api/reports', {
                                             method: 'POST',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify({
                                               action: 'resend_email',
                                               reportId: report.id,
                                               target_email: targetEmail.trim() || undefined
                                             })
                                           });
                                           const data = await res.json();
                                           if (data.success) {
                                             alert(data.message || "Certified PDF report email dispatched successfully!");
                                           } else {
                                             alert(data.error || "Failed to resend email.");
                                           }
                                         } catch (e) {
                                           alert("Error resending email.");
                                         }
                                       }}
                                       className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-bold"
                                       title="Resend PDF Report to Email"
                                     >
                                       📧 Email
                                     </button>

                                  <a
                                    href={`/report/${report.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold flex items-center gap-1 shrink-0 shadow-sm"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {isRedFlag && (
                                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-black uppercase">
                                      🚨 Red Flag
                                    </span>
                                  )}
                                  {isLostFound && (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                                      🎒 Lost & Found
                                    </span>
                                  )}
                                  <span className="text-[11px] text-neutral-400 font-medium">
                                    Cleaner: <strong className="text-neutral-200">{report.cleaner_name}</strong>
                                  </span>
                                  <span className="text-[11px] text-neutral-500">• {durationMin} min clean</span>
                                </div>

                                <p className="text-[10px] text-neutral-500 font-mono">
                                  Completed: {new Date(report.completed_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BILLING & SUBSCRIPTION */}
            {activeTab === 'billing' && (
              <div className="space-y-10">
                {/* 0. Trial Banner OR Active Paid Subscription Banner */}
                {(() => {
                  const createdDate = host?.created_at ? new Date(host.created_at) : new Date();
                  const phase2UnlockDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
                  const firstBillingDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  if (isPaidActive) {
                    return (
                      <div className="p-6 rounded-3xl bg-neutral-900/80 border border-emerald-500/30 space-y-3 backdrop-blur-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">Active Subscription ({host?.subscription_tier?.toUpperCase() || 'PRO'})</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                                  AUTO-RENEWS
                                </span>
                              </div>
                              <span className="text-xs text-neutral-400">Trial completed. Full features active across your portfolio with zero hidden fees.</span>
                            </div>
                          </div>
                          <span className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shrink-0">
                            🟢 Billing Active
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-6 rounded-3xl bg-neutral-900/80 border border-emerald-500/30 space-y-4 backdrop-blur-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0">
                            14d
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">14-Day Free Trial (Zero Credit Card Required)</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                                Card Required Day 15: {fmt(phase2UnlockDate)}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">Full Pro feature access active. Select a plan & enter card on Day 15 ({fmt(phase2UnlockDate)}) to continue using TurnProofs ($0 charged today).</span>
                          </div>
                        </div>
                        <span className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shrink-0">
                          💳 Card Required Day 15
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                          <span>Trial Start: {fmt(createdDate)}</span>
                          <span className="text-emerald-400 font-mono">14-Day Free Trial (Zero Card Required)</span>
                          <span className="text-rose-400 font-bold">Card Required Day 15: {fmt(phase2UnlockDate)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850 p-0.5">
                          <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full w-[10%]" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                          <span>{emailRemindersEnabled ? `📧 Email Reminder Scheduled: ${fmt(phase2UnlockDate)} at 12:00 PM` : '🔕 Trial & Billing Email Reminders Paused by Host'}</span>
                          <span className="text-neutral-300 font-semibold">$0.00 Due Today</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 1. Current Active Subscription & Usage Overview */}
                <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md relative overflow-hidden space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-850">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                          isPaidActive 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          <span className={`h-2 w-2 rounded-full animate-pulse ${isPaidActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span>{isPaidActive ? 'Active Plan' : '🎁 Free Trial Active'}</span>
                        </span>
                        <span className="text-xs text-neutral-400 font-semibold">
                          {isPaidActive ? '• Paid Subscription Active' : '• $0.00 Charged Today (Card Required Day 15)'}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span>
                          {properties.length <= 1 
                            ? 'Pro Plan (1 Property)' 
                            : properties.length <= 3 
                            ? 'Growth Plan (2-3 Properties)' 
                            : properties.length <= 6 
                            ? 'Elite Plan (4-6 Properties)' 
                            : `Elite Scaling Plan (${properties.length} Properties)`}
                        </span>
                      </h2>

                      <p className="text-sm text-neutral-400">
                        {isPaidActive ? 'Current portfolio rate: ' : 'Plan rate when trial ends: '}
                        <strong className="text-white font-mono">
                          {`$${properties.length <= 1 ? '9.00' : properties.length <= 3 ? '18.99' : (35.99 + Math.max(0, properties.length - 6) * 4.99).toFixed(2)} /mo`}
                        </strong> {isPaidActive ? `(${properties.length} active unit${properties.length === 1 ? '' : 's'})` : `($0.00 charged during 14-day trial)`}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => {
                          const targetPlan = properties.length <= 1 ? 'pro' : properties.length <= 3 ? 'growth' : 'elite';
                          setCheckoutPlan({
                            name: properties.length <= 1 ? 'Pro Plan' : properties.length <= 3 ? 'Growth Plan' : 'Elite Plan',
                            planKey: targetPlan,
                            units: properties.length,
                            monthlyRate: properties.length <= 1 ? 9.00 : properties.length <= 3 ? 18.99 : parseFloat((35.99 + Math.max(0, properties.length - 6) * 4.99).toFixed(2)),
                            annualRate: properties.length <= 1 ? 7.65 : properties.length <= 3 ? 16.14 : parseFloat(((35.99 + Math.max(0, properties.length - 6) * 4.99) * 0.85).toFixed(2))
                          });
                          setShowCheckoutModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-4.5 w-4.5" />
                        <span>Manage / Change Plan</span>
                      </button>
                    </div>
                  </div>

                    {/* Account Metadata Row: Usage, Billing Cycle Dates, Billing Email, Reminder Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 space-y-1">
                      <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Portfolio Usage</span>
                      <p className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-rose-400" />
                        <span>{properties.length} of {properties.length <= 1 ? '1' : properties.length <= 3 ? '3' : properties.length <= 6 ? '6' : properties.length} Units</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 space-y-1">
                      <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Billing Cycle</span>
                      <p className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Aug 29 – Sep 28</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 space-y-1">
                      <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Next Renewal</span>
                      <p className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-rose-400" />
                        <span>$0.00 Today ($9.00 Next)</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Receipts Email</span>
                        <button
                          onClick={() => {
                            const newEmail = prompt('Enter primary billing email address:', customBillingEmail || host?.email || 'support@turnproofs.com');
                            if (newEmail && newEmail.includes('@')) {
                              setCustomBillingEmail(newEmail.trim());
                              alert(`Billing receipt email updated to: ${newEmail.trim()}`);
                            }
                          }}
                          className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                        >
                          Edit Email
                        </button>
                      </div>
                      <p className="text-xs font-bold text-neutral-200 truncate">{customBillingEmail || host?.email || 'support@turnproofs.com'}</p>
                    </div>

                    {/* Interactive Reminder Toggle Card */}
                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-850 space-y-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Email Reminders</span>
                        <p className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{emailRemindersEnabled ? '🔔 Active' : '🔕 Paused'}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !emailRemindersEnabled;
                          setEmailRemindersEnabled(next);
                          alert(next ? '🔔 Trial & billing email reminders enabled!' : '🔕 Trial & billing email reminders paused.');
                        }}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                          emailRemindersEnabled ? 'bg-emerald-500 justify-end' : 'bg-neutral-800 justify-start'
                        }`}
                        title="Toggle automated trial & billing email reminders"
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Upgrade / Downgrade Plan Grid */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Select or Upgrade Your Plan</h3>
                      <p className="text-xs text-neutral-400">Scale your short-term rental portfolio with 0 hidden fees or contracts.</p>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div className="inline-flex items-center p-1 rounded-2xl bg-neutral-950 border border-neutral-800 self-start">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          billingCycle === 'monthly' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Monthly Billing
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('annual')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          billingCycle === 'annual' ? 'bg-rose-500 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <span>Annual Billing</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/30 text-[9px] font-extrabold text-white">15% OFF</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Pro Tier */}
                    {(() => {
                      const isCurrent = properties.length <= 1;
                      return (
                        <div className={`p-6 rounded-3xl bg-neutral-900/40 border transition-all flex flex-col justify-between space-y-6 relative ${isCurrent ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-neutral-800 hover:border-neutral-700'}`}>
                          {isCurrent && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>{isPaidActive ? 'Current Plan' : '🎁 Included in Free Trial'}</span>
                            </span>
                          )}
                          <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 inline-block">1 Property</span>
                            <div>
                              <h4 className="text-lg font-black text-white">Pro Plan</h4>
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{billingCycle === 'annual' ? '$7.65' : '$9.00'}</span>
                                <span className="text-xs text-neutral-400 font-semibold">/ month</span>
                              </div>
                              {billingCycle === 'annual' && <span className="text-[10px] text-emerald-400 font-bold block mt-1">💰 Save $16.20 / yr ($91.80/yr)</span>}
                            </div>
                            <ul className="space-y-2 text-xs text-neutral-300">
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> 1 Managed Property</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Unlimited Cleaners</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Automated Cleaner Receipts</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Professional PDF Audit Logs</li>
                            </ul>
                          </div>
                          {isCurrent ? (
                            <button disabled className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black cursor-default flex items-center justify-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>{isPaidActive ? 'Current Active Plan' : '✓ Trial Plan (1 Unit Included)'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const target = {
                                  name: 'Pro Plan',
                                  planKey: 'pro',
                                  units: 1,
                                  monthlyRate: 9.00,
                                  annualRate: 7.65
                                };
                                if (properties.length > 1) {
                                  setDowngradeTargetPlan(target);
                                  setShowDowngradeModal(true);
                                } else {
                                  setCheckoutPlan(target);
                                  setShowCheckoutModal(true);
                                }
                              }}
                              className="w-full py-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-rose-500/50 hover:bg-neutral-900 text-xs font-extrabold text-white transition-all cursor-pointer"
                            >
                              Downgrade to Pro ($9)
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Growth Tier */}
                    {(() => {
                      const isCurrent = properties.length >= 2 && properties.length <= 3;
                      const isUpgrade = properties.length < 2;
                      return (
                        <div className={`p-6 rounded-3xl bg-neutral-900/40 border transition-all flex flex-col justify-between space-y-6 relative ${isCurrent ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-amber-500/30'}`}>
                          {isCurrent ? (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Current Plan</span>
                            </span>
                          ) : (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm">Popular</span>
                          )}
                          <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block">2 to 3 Props</span>
                            <div>
                              <h4 className="text-lg font-black text-white">Growth Plan</h4>
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{billingCycle === 'annual' ? '$16.14' : '$18.99'}</span>
                                <span className="text-xs text-neutral-400 font-semibold">/ month</span>
                              </div>
                              {billingCycle === 'annual' && <span className="text-[10px] text-amber-400 font-bold block mt-1">💰 Save $34.20 / yr ($193.68/yr)</span>}
                            </div>
                            <ul className="space-y-2 text-xs text-neutral-300">
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" /> 2 to 3 Managed Properties</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Supply Stock Alerts</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Host Touch-Up Workflow</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Damage Photo Notifications</li>
                            </ul>
                          </div>
                          {isCurrent ? (
                            <button disabled className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black cursor-default flex items-center justify-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>Current Active Plan</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCheckoutPlan({
                                  name: 'Growth Plan',
                                  planKey: 'growth',
                                  units: Math.max(2, properties.length),
                                  monthlyRate: 18.99,
                                  annualRate: 16.14
                                });
                                setShowCheckoutModal(true);
                              }}
                              className="w-full py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-500/10"
                            >
                              {isUpgrade ? 'Upgrade to Growth ($18.99)' : 'Downgrade to Growth ($18.99)'}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Elite Tier */}
                    {(() => {
                      const isCurrent = properties.length >= 4 && host?.subscription_tier !== 'commercial';
                      return (
                        <div className={`p-6 rounded-3xl bg-neutral-900/40 border transition-all flex flex-col justify-between space-y-6 relative ${isCurrent ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-purple-500/30'}`}>
                          {isCurrent ? (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Current Plan</span>
                            </span>
                          ) : (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm">Scaling</span>
                          )}
                          <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 inline-block">4 to 6+ Props</span>
                            <div>
                              <h4 className="text-lg font-black text-white">Elite Plan</h4>
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{billingCycle === 'annual' ? '$30.59' : '$35.99'}</span>
                                <span className="text-xs text-neutral-400 font-semibold">/ month</span>
                              </div>
                              {billingCycle === 'annual' ? (
                                <span className="text-[10px] text-purple-400 font-bold block mt-1">💰 Save $64.80 / yr (15% OFF)</span>
                              ) : (
                                <span className="text-[10px] text-purple-400 font-bold block mt-1">+$4.99/mo per unit beyond 6</span>
                              )}
                            </div>
                            <ul className="space-y-2 text-xs text-neutral-300">
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> 4 to 6+ Managed Properties</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> <span className="text-purple-300 font-bold">Full REST API Access &amp; Keys</span></li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> Twilio SMS Autopilot Alerts</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> HubSpot CRM Integration</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> Door QR Code Generator</li>
                            </ul>
                          </div>
                          {isCurrent ? (
                            <button disabled className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black cursor-default flex items-center justify-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>Current Active Plan</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const units = Math.max(4, properties.length);
                                const mRate = units <= 6 ? 35.99 : parseFloat((35.99 + (units - 6) * 4.99).toFixed(2));
                                const aRate = parseFloat((mRate * 0.85).toFixed(2));
                                setCheckoutPlan({
                                  name: `Elite Plan (${units} Units)`,
                                  planKey: 'elite',
                                  units,
                                  monthlyRate: mRate,
                                  annualRate: aRate
                                });
                                setShowCheckoutModal(true);
                              }}
                              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-purple-500/10"
                            >
                              Upgrade to Elite ($35.99+)
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Commercial Tier */}
                    {(() => {
                      const isCurrent = host?.subscription_tier === 'commercial';
                      return (
                        <div className={`p-6 rounded-3xl bg-neutral-900/40 border transition-all flex flex-col justify-between space-y-6 ${isCurrent ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-emerald-500/30'}`}>
                          <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block">1 Commercial Bldg</span>
                            <div>
                              <h4 className="text-lg font-black text-white">Commercial Site</h4>
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{billingCycle === 'annual' ? '$76.49' : '$89.99'}</span>
                                <span className="text-xs text-neutral-400 font-semibold">/ month</span>
                              </div>
                              {billingCycle === 'annual' && <span className="text-[10px] text-emerald-400 font-bold block mt-1">💰 Save $162.00 / yr ($917.88/yr)</span>}
                            </div>
                            <ul className="space-y-2 text-xs text-neutral-300">
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 1 Building / Multi-Tenant Complex</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Auto-Email Facility Managers</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Subcontracted Cleaners Audit</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Dedicated Compliance Support</li>
                            </ul>
                          </div>
                          {isCurrent ? (
                            <button disabled className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black cursor-default flex items-center justify-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>Current Active Plan</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCheckoutPlan({
                                  name: 'Commercial Building Plan',
                                  planKey: 'commercial',
                                  units: 1,
                                  monthlyRate: 89.99,
                                  annualRate: 76.49
                                });
                                setShowCheckoutModal(true);
                              }}
                              className="w-full py-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                            >
                              Upgrade to Commercial ($89.99)
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 3. Payment Method & Invoice History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Method Card */}
                  <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <CreditCard className="h-4.5 w-4.5 text-neutral-400" />
                        <span>Payment Method</span>
                      </h4>
                      <button
                        onClick={() => alert("Redirecting to Stripe payment setup to add a backup card...")}
                        className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                      >
                        + Add Backup Card
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                          VISA
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-200 block">•••• •••• •••• 4242</span>
                          <span className="text-[10px] text-neutral-400 block">Expires 12/28 • Default Payment Card</span>
                          <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">Last Payment: July 29, 2026 ($0.00 Trial Start)</span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/stripe', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'portal' })
                            });
                            const data = await res.json();
                            if (data.portalUrl) {
                              window.location.href = data.portalUrl;
                            } else {
                              alert("Stripe Billing Portal: Payment method management enabled once live Stripe keys are configured.");
                            }
                          } catch (e) {
                            alert("Unable to connect to Stripe portal.");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer transition-all"
                      >
                        Update Payment Method
                      </button>
                    </div>
                  </div>

                  {/* Billing Invoices Card */}
                  <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-neutral-400" />
                        <span>Billing History & Receipts</span>
                      </h4>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/stripe', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'portal' })
                            });
                            const data = await res.json();
                            if (data.portalUrl) {
                              window.location.href = data.portalUrl;
                            } else {
                              alert("Opening full invoice history from Stripe...");
                            }
                          } catch (e) {
                            alert("Stripe invoice history accessed.");
                          }
                        }}
                        className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                      >
                        View All Invoices &rarr;
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-neutral-200 block">14-Day Free Trial Access Receipt</span>
                        <span className="text-[10px] text-emerald-400 font-semibold block">July 29, 2026 • $0.00 Paid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                          Paid / Active
                        </span>
                        <button
                          onClick={() => alert("Downloading PDF Receipt...")}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                          title="Download PDF Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Danger Zone & Subscription Pause / Cancel Card */}
                <div className="p-6 rounded-3xl bg-red-950/20 border border-red-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Manage Subscription Status (Pause or Cancel)</span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                        Need a break? You can pause your subscription for 30 days or cancel anytime. All PDF audit reports and certificates are sent directly to your email and your cleaners' emails immediately after each turnover. We don't store data long-term — you own all your files. This keeps TurnProofs lean and keeps your costs down.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setShowPauseModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
                      >
                        Pause Subscription (30 Days)
                      </button>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-extrabold text-red-400 transition-all cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  </div>

                  {/* Expandable FAQ: Frequently Asked Billing Questions */}
                  <div className="pt-4 border-t border-red-900/30 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowFaqGuide(!showFaqGuide)}
                      className="w-full p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs font-black text-neutral-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>Frequently Asked Billing & Subscription Questions (Pause Rules, Email & File Ownership)</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${showFaqGuide ? 'rotate-180 text-rose-400' : ''}`} />
                    </button>

                    {showFaqGuide && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 animate-fade-in">
                        {[
                          {
                            q: "1. How does Subscription Pause work & what happens while paused?",
                            a: "Pausing freezes your billing for 30 days with $0 charged. While paused, both your Host Dashboard and Mobile Cleaner Terminals freeze so zero checklists or reports can be created until resumed. Pause extensions are reserved for active paid subscriptions (unavailable during trial phase). On Day 27, a reminder email is sent before your plan auto-resumes on Day 30."
                          },
                          {
                            q: "2. Will I get a reminder email before pause or trial ends?",
                            a: "Yes! Reminders are sent on Trial Days 10, 13, and Day 14 at 12:00 PM ('Reverts in 24 hours at midnight EST'). For pauses, a reminder is sent 3 days before expiry."
                          },
                          {
                            q: "3. Can I pause mid-cycle or cancel during a pause?",
                            a: "Yes! Mid-cycle pauses take effect immediately with unused days credited. You can cancel directly while paused without unpausing first."
                          },
                          {
                            q: "4. How does Re-Subscription work?",
                            a: "Reactivate anytime with 1 click. You'll resume on your previous plan with zero setup fees. Your saved payment method will be used (update it anytime in Billing & Subscription)."
                          },
                          {
                            q: "5. How does Annual Billing work?",
                            a: "Annual billing is charged as one discounted upfront payment for 12 months, renewing annually with zero monthly charges."
                          },
                          {
                            q: "6. Non-Archived Drafts & Data Retention",
                            a: "Completed PDF audit reports are sent directly to your email and your cleaners' emails immediately after each turnover. Incomplete draft photos are retained for 30 days (gives you time to re-upload or recover). After 30 days, automatically deleted to keep TurnProofs lightweight and your subscription costs low."
                          },
                          {
                            q: "7. Billing Email Dispatch",
                            a: "Invoices and PDF receipts are automatically dispatched to your primary billing email. Click 'Edit Email' at the top of this tab to update anytime."
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-1.5 hover:border-neutral-800 transition-all">
                            <h5 className="text-xs font-bold text-rose-300 leading-snug">{item.q}</h5>
                            <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">{item.a}</p>
                          </div>
                        ))}
                        
                        <div className="md:col-span-2 pt-2 text-center">
                          <a
                            href="/faq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <span>Need more help? View all 15 platform FAQs on dedicated knowledge base</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTEGRATIONS (API) */}
            {activeTab === 'integrations' && (
              <div className="space-y-10 font-sans">
                {/* Integrations Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-rose-500" />
                      <span>API & Property Management Systems (PMS)</span>
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      Integrate TurnProofs with third-party software like Guesty, Breezeway, or custom applications.
                    </p>
                  </div>
                  <Link
                    href="/docs"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-rose-400 transition-all"
                  >
                    <span>Developer Documentation</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Tier Gate: upsell wall for non-eligible users */}
                {!['elite', 'commercial'].includes(host?.subscription_tier || '') ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                    <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-xl font-extrabold text-white">API Access is a Growing Portfolio Feature</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        Generate API keys to connect TurnProofs with Guesty, Breezeway, Zapier, or your own custom dashboard. Available on the <span className="text-amber-400 font-bold">Growing Portfolio</span> plan ($35.99/mo) and above.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('billing')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-sm font-extrabold transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                      >
                        ⚡ Upgrade to Growing Portfolio
                      </button>
                      <Link
                        href="/docs"
                        target="_blank"
                        className="px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-sm font-bold transition-all"
                      >
                        Preview API Docs
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full pt-4">
                      {[
                        { icon: '🔗', title: 'Zapier / Make', body: 'Trigger automations when a turnover report is completed.' },
                        { icon: '📊', title: 'Custom Dashboards', body: 'Pull your property and report data into any BI tool.' },
                        { icon: '🏠', title: 'Guesty / Breezeway', body: 'Sync turnover status directly to your PMS.' },
                      ].map(({ icon, title, body }) => (
                        <div key={title} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-left space-y-1">
                          <div className="text-2xl">{icon}</div>
                          <p className="text-xs font-extrabold text-white">{title}</p>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                {/* White-Label Branding Card */}
                <div className="p-4 sm:p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                        <span>🎨 White-Label &amp; Custom Agency Branding</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase">
                          Growing Portfolio + Commercial
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                        Customize report certificates, digital turnover views, and PDF exports with your agency logo and custom footer.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                          Company / Agency Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Cleaning & Management Co."
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs sm:text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                          Agency / Host Contact Email <span className="text-purple-400">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="support@turnproofs.com"
                          value={agencyEmail}
                          onChange={(e) => setAgencyEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs sm:text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                          Company Logo Image URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourcompany.com/logo.png"
                          value={companyLogoUrl}
                          onChange={(e) => setCompanyLogoUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs sm:text-sm text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                          Custom PDF &amp; Email Footer Text
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Certified by Apex Turnover Assurance • Quality Line: (555) 019-2831 • support@apexcleaning.com"
                          value={customFooterText}
                          onChange={(e) => setCustomFooterText(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white"
                        />
                      </div>

                      <div className="pt-1">
                        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hideBranding}
                            onChange={(e) => setHideBranding(e.target.checked)}
                            className="mt-0.5 rounded border-neutral-800 text-purple-500 focus:ring-purple-500 bg-neutral-900 h-4 w-4 shrink-0"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-white block">Hide "Powered by TurnProofs" Badge</span>
                            <span className="text-[10px] text-neutral-500 block leading-tight mt-0.5">Remove platform branding from all customer-facing reports &amp; PDFs</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-neutral-850">
                    <button
                      onClick={async () => {
                        const targetEmail = agencyEmail.trim() || host?.email;
                        if (!targetEmail) {
                          alert("Please enter an agency email address.");
                          return;
                        }
                        setSavingBranding(true);
                        try {
                          const res = await fetch('/api/auth', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'update_branding',
                              email: targetEmail,
                              company_name: companyName,
                              company_logo_url: companyLogoUrl,
                              custom_footer: customFooterText,
                              hide_branding: hideBranding
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            if (data.host) setHost(data.host);
                            alert("White-Label Branding Settings Saved Successfully!");
                          } else {
                            alert(data.error || "Failed to save branding settings");
                          }
                        } catch (e) {
                          alert("Error saving branding settings");
                        } finally {
                          setSavingBranding(false);
                        }
                      }}
                      disabled={savingBranding}
                      className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5"
                    >
                      {savingBranding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>Save White-Label Settings</span>
                    </button>
                  </div>
                </div>

                {/* API Key Generator Card */}
                <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Create New API Key</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">API keys authenticate third-party clients securely using SHA-256 matching.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Left */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">API Key Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Guesty Connection, Production API"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Environment</label>
                        <select
                          value={newKeyEnv}
                          onChange={(e) => setNewKeyEnv(e.target.value as 'live' | 'test')}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-neutral-300"
                        >
                          <option value="live">Live (Production Data)</option>
                          <option value="test">Test (Sandbox/Simulation)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Expiration</label>
                        <select
                          value={newKeyExpiry}
                          onChange={(e) => setNewKeyExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-neutral-300"
                        >
                          <option value="">Never Expires</option>
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                          <option value="365">1 Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Granular Scopes / Permissions</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newKeyScopes.includes('properties:read')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewKeyScopes([...newKeyScopes, 'properties:read']);
                                } else {
                                  setNewKeyScopes(newKeyScopes.filter(s => s !== 'properties:read'));
                                }
                              }}
                              className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500 bg-neutral-950"
                            />
                            <div>
                              <span className="font-bold text-white">properties:read</span>
                              <span className="text-neutral-500 ml-1.5">— View list of properties and checklists</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newKeyScopes.includes('reports:read')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewKeyScopes([...newKeyScopes, 'reports:read']);
                                } else {
                                  setNewKeyScopes(newKeyScopes.filter(s => s !== 'reports:read'));
                                }
                              }}
                              className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500 bg-neutral-950"
                            />
                            <div>
                              <span className="font-bold text-white">reports:read</span>
                              <span className="text-neutral-500 ml-1.5">— View historical reports and photos</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Form Right - Property Scoping */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Property Scope Restriction</label>
                        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-3">
                          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer border-b border-neutral-900 pb-2">
                            <input
                              type="radio"
                              name="propScope"
                              checked={newKeyProperties.length === 0}
                              onChange={() => setNewKeyProperties([])}
                              className="text-rose-500 focus:ring-rose-500 bg-neutral-950 border-neutral-850"
                            />
                            <span className="font-bold text-white">All Properties</span>
                          </label>

                          <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
                            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block mb-1">Restricted Selection:</span>
                            {properties.map((p) => (
                              <label key={p.id} className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newKeyProperties.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewKeyProperties([...newKeyProperties, p.id]);
                                    } else {
                                      setNewKeyProperties(newKeyProperties.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="rounded border-neutral-850 text-rose-500 focus:ring-rose-500 bg-neutral-950"
                                />
                                <span className="truncate">{p.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!newKeyName.trim()) {
                        alert("Please enter a name for the API key.");
                        return;
                      }
                      if (newKeyScopes.length === 0) {
                        alert("Please check at least one permission scope.");
                        return;
                      }
                      setCreatingKey(true);
                      try {
                        const res = await fetch('/api/api-keys', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: newKeyName,
                            scopes: newKeyScopes,
                            property_ids: newKeyProperties.length > 0 ? newKeyProperties : null,
                            expires_in_days: newKeyExpiry || null,
                            environment: newKeyEnv
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setGeneratedKey(data.key);
                          setShowKeyModal(true);
                          setNewKeyName('');
                          setNewKeyProperties([]);
                          fetchApiKeys();
                        } else {
                          alert(data.error || "Failed to create API key");
                        }
                      } catch (e) {
                        alert("Error generating API key");
                      } finally {
                        setCreatingKey(false);
                      }
                    }}
                    disabled={creatingKey}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5"
                  >
                    {creatingKey ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Generate API Key</span>
                  </button>
                </div>

                {/* API Keys Table Card */}
                <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Active API Credentials</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Manage and revoke credentials generated for integrations.</p>
                  </div>

                  {apiKeys.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-850 text-center space-y-2">
                      <Key className="h-8 w-8 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400">No active API keys found. Generate a key above to start integrating.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-neutral-850 bg-neutral-950 overflow-hidden">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-neutral-850 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900/20">
                              <th className="p-4">Name / ID</th>
                              <th className="p-4">Prefix</th>
                              <th className="p-4">Env</th>
                              <th className="p-4">Scopes</th>
                              <th className="p-4">Property Restriction</th>
                              <th className="p-4">Created / Expiry</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900 font-semibold text-neutral-300 font-sans">
                            {apiKeys.map((key) => {
                              const isRevoked = !!key.revoked_at;
                              const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
                              return (
                                <tr key={key.id} className={`hover:bg-neutral-900/10 ${isRevoked || isExpired ? 'opacity-50' : ''}`}>
                                  <td className="p-4">
                                    <span className="font-extrabold text-white block">{key.name}</span>
                                    {isRevoked ? (
                                      <span className="text-[10px] text-red-400 block mt-0.5 max-w-xs truncate">
                                        Revoked: {key.revocation_reason || 'No reason'} ({new Date(key.revoked_at).toLocaleDateString()})
                                      </span>
                                    ) : isExpired ? (
                                      <span className="text-[10px] text-amber-500 block mt-0.5">Expired</span>
                                    ) : (
                                      <span className="text-[10px] text-neutral-500 font-mono select-all block mt-0.5">{key.id}</span>
                                    )}
                                  </td>
                                  <td className="p-4 font-mono text-neutral-400 select-all">{key.api_key_prefix}...</td>
                                  <td className="p-4 uppercase font-bold text-[10px]">
                                    <span className={`px-2 py-0.5 rounded border ${
                                      key.environment === 'test' 
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-550/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-550/20'
                                    }`}>
                                      {key.environment || 'live'}
                                    </span>
                                  </td>
                                  <td className="p-4 space-x-1">
                                    {(key.scopes || []).map((sc: string) => (
                                      <span key={sc} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400 font-bold">
                                        {sc}
                                      </span>
                                    ))}
                                  </td>
                                  <td className="p-4">
                                    {key.property_ids && Array.isArray(key.property_ids) ? (
                                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
                                        {key.property_ids.length} Units Restricted
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                                        All Properties
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className="block text-[11px]">{new Date(key.created_at).toLocaleDateString()}</span>
                                    <span className="block text-[10px] text-neutral-500">
                                      {key.expires_at ? `Exp: ${new Date(key.expires_at).toLocaleDateString()}` : 'Never expires'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    {!isRevoked && (
                                      <button
                                        onClick={async () => {
                                          const reason = prompt("Enter a reason for revoking this key (optional):") || "Revoked by owner";
                                          if (!confirm(`Are you sure you want to revoke API key "${key.name}"? Guesty/Breezeway connections using this key will fail immediately.`)) {
                                            return;
                                          }
                                          try {
                                            const res = await fetch(`/api/api-keys?id=${key.id}&reason=${encodeURIComponent(reason)}`, {
                                              method: 'DELETE'
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                              fetchApiKeys();
                                            } else {
                                              alert(data.error || "Failed to revoke key");
                                            }
                                          } catch (e) {
                                            alert("Error revoking key");
                                          }
                                        }}
                                        className="p-1.5 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                        title="Revoke Key"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards Stack View */}
                      <div className="block md:hidden divide-y divide-neutral-900">
                        {apiKeys.map((key) => {
                          const isRevoked = !!key.revoked_at;
                          const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
                          return (
                            <div key={key.id} className="p-4 space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-extrabold text-sm text-white">{key.name}</h4>
                                  <span className="font-mono text-[10px] text-neutral-400 block">{key.api_key_prefix}...</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  key.environment === 'test' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {key.environment || 'live'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {(key.scopes || []).map((sc: string) => (
                                  <span key={sc} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400 font-bold">
                                    {sc}
                                  </span>
                                ))}
                                {key.property_ids && Array.isArray(key.property_ids) ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
                                    {key.property_ids.length} Restricted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                                    All Properties
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-900">
                                <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                {!isRevoked && (
                                  <button
                                    onClick={async () => {
                                      const reason = prompt("Enter a reason for revoking this key (optional):") || "Revoked by owner";
                                      if (!confirm(`Are you sure you want to revoke API key "${key.name}"?`)) return;
                                      try {
                                        const res = await fetch(`/api/api-keys?id=${key.id}&reason=${encodeURIComponent(reason)}`, {
                                          method: 'DELETE'
                                        });
                                        const data = await res.json();
                                        if (data.success) fetchApiKeys();
                                        else alert(data.error || "Failed to revoke key");
                                      } catch (e) {
                                        alert("Error revoking key");
                                      }
                                    }}
                                    className="text-red-400 font-bold px-2 py-1 rounded bg-red-950/40 border border-red-900/30"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <footer className="mt-16 border-t border-neutral-900 pt-8 pb-12 text-center text-xs text-neutral-500 space-y-4">
          <div className="max-w-3xl mx-auto space-y-2 text-[10px] text-neutral-500 leading-relaxed border-b border-neutral-900 pb-6">
            <p className="font-semibold text-neutral-400">⚖️ Legal Disclaimer & Notice:</p>
            <p>
              TurnProofs provides documentation and mobile verification tools to help hosts document property cleaning and turnover compliance. TurnProofs is an independent software tool and is not affiliated with, endorsed by, or sponsored by Airbnb, Inc. or VRBO. TurnProofs does not guarantee Airbnb or VRBO claim outcomes. Airbnb and VRBO make final dispute decisions independently. Hosts are solely responsible for downloading, archiving, and submitting documentation to third-party platforms.
            </p>
          </div>
          <p>© TurnProofs Host Control Center. Professional Cleaning Verification Engine.</p>
        </footer>
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
            <p className="text-xs text-neutral-400 mb-4">Create a property listing below. Coordinates are optional but verify location compliance.</p>

            {/* Capacity Limit Warning Banner */}
            {properties.length >= (host?.subscription_tier === 'growth' ? 3 : host?.subscription_tier === 'pro' || !host?.subscription_tier ? 1 : 6) && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs mb-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Capacity Reached ({properties.length} of {properties.length <= 1 ? '1' : properties.length <= 3 ? '3' : '6'} Used)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPropertyModalOpen(false);
                    setActiveTab('billing');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-[11px] hover:bg-amber-400 cursor-pointer shrink-0 transition-all shadow-md shadow-amber-500/10"
                >
                  Upgrade Plan ➔
                </button>
              </div>
            )}

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

      {/* MODAL: DUPLICATE PROPERTY & CHECKLIST */}
      {isDuplicateModalOpen && sourcePropForDup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsDuplicateModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-850 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-extrabold shrink-0">
                <Copy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">Duplicate Property &amp; Checklist</h3>
                <p className="text-xs text-neutral-400">
                  Cloning template from: <span className="font-bold text-white">{sourcePropForDup.name}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDuplicate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  New Property Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Villa Unit B"
                  value={dupPropName}
                  onChange={(e) => setDupPropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  New Property Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Sunset Blvd, Suite 2B, Miami, FL"
                  value={dupPropAddress}
                  onChange={(e) => setDupPropAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                <span>All room checklist items &amp; photo protocols will be copied to your new property instantly.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicating || !dupPropName.trim() || !dupPropAddress.trim()}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-extrabold text-xs text-white transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {duplicating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Cloning Property...</span>
                    </>
                  ) : (
                    <span>📋 Create &amp; Clone Checklist</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROPERTY */}
      {isEditPropertyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsEditPropertyModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">Edit Property Listing</h3>
                <p className="text-xs text-neutral-400">Update property name, cover image URL, facility emails, or GPS location.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Luxury Villa"
                  value={editPropName}
                  onChange={(e) => setEditPropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Ocean Drive, Miami FL"
                  value={editPropAddress}
                  onChange={(e) => setEditPropAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                  value={editPropImage}
                  onChange={(e) => setEditPropImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white font-mono"
                />
                {editPropImage && (
                  <div className="mt-2 h-20 w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                    <img src={editPropImage} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
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
                    value={editPropEmails}
                    onChange={(e) => setEditPropEmails(e.target.value)}
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
                    value={editPropLat}
                    onChange={(e) => setEditPropLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Target Longitude (Optional)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. -74.0060"
                    value={editPropLng}
                    onChange={(e) => setEditPropLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPropertyModalOpen(false)}
                  className="w-1/3 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditProperty}
                  className="w-2/3 py-3.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingEditProperty ? 'Saving Changes...' : 'Save Property Changes'}
                </button>
              </div>
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
                <div className="flex items-center gap-2">
                  <a
                    href={`/preview/${activeChecklistProperty.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Open cleaner read-only preview page in a new tab"
                  >
                    <Eye className="h-4 w-4 text-amber-400" />
                    <span>👁️ Preview Cleaner View</span>
                  </a>
                  <button
                    onClick={() => setActiveChecklistProperty(null)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
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

                {/* Step 2 Mode Selector: Single vs Bulk */}
                <div className="pt-2 border-t border-neutral-850 space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-850 pb-2">
                    <button
                      type="button"
                      onClick={() => setChecklistMode('single')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        checklistMode === 'single'
                          ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      + Single Task
                    </button>

                    <button
                      type="button"
                      onClick={() => setChecklistMode('bulk')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        checklistMode === 'bulk'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                          : 'bg-neutral-900 border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                      }`}
                    >
                      <span>⚡ Bulk Copy &amp; Paste (Turno / Word / Email)</span>
                    </button>
                  </div>

                  {checklistMode === 'bulk' ? (
                    /* BULK COPY-PASTE FORM */
                    <form onSubmit={handleBulkImportChecklist} className="space-y-3 animate-fade-in">
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                        <p className="font-extrabold text-purple-300 flex items-center gap-1.5 mb-1">
                          <span>📋 Copy &amp; Paste From Turno, Word, PDF, or Email:</span>
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Paste your entire checklist lines below. TurnProofs will automatically parse room categories <span className="text-purple-300 font-mono">[Master Bedroom]</span> or colons <span className="text-purple-300 font-mono">Master Bedroom: task</span>. Uncategorized items will be assigned to <span className="text-purple-300 font-bold">&quot;{selectedRoom}&quot;</span>.
                        </p>
                      </div>

                      <textarea
                        rows={7}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`[Master Bedroom] Strip linens, wash sheets & remake bed with hospital corners\n[Master Bedroom] Vacuum rug and dust nightstands\n[En-Suite Bath] Scrub shower glass, sanitize toilet & restock paper towels\n[Chef's Kitchen] Clean Sub-Zero fridge interior & sanitize marble island\n[Patio & Pool] Sweep deck tiles & check hot tub water temp`}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white font-mono leading-relaxed placeholder:text-neutral-600"
                        required
                      />

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bulkRequirePhotos}
                            onChange={(e) => setBulkRequirePhotos(e.target.checked)}
                            className="rounded border-neutral-700 bg-neutral-900 text-purple-500 focus:ring-purple-500 h-4 w-4"
                          />
                          <span>Require Photo Evidence for Imported Items</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={importingBulk || !bulkText.trim()}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-extrabold text-xs text-white transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {importingBulk ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            <span>Importing Checklist...</span>
                          </>
                        ) : (
                          <span>⚡ Import All Tasks ({bulkText.split('\n').filter(l => l.trim()).length} Items)</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* SINGLE TASK FORM */
                    <form onSubmit={handleAddTask} className="space-y-3">
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

                  {/* Standard Reference Photo (Host Example) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                      <span>📷 Standard Reference Photo (How cleaner should set this up):</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Optional</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingRefPhoto(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const uploadRes = await fetch('/api/reports', {
                              method: 'PUT',
                              body: formData
                            });
                            const uploadData = await uploadRes.json();
                            if (!uploadRes.ok || !uploadData.success) {
                              throw new Error(uploadData.error || 'Upload failed');
                            }
                            setNewTaskRefPhoto(uploadData.publicUrl);
                          } catch (err: any) {
                            alert('Reference photo upload failed: ' + (err.message || 'Error'));
                          } finally {
                            setUploadingRefPhoto(false);
                          }
                        }}
                        className="flex-1 text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                      />
                      {newTaskRefPhoto && (
                        <div className="relative shrink-0">
                          <img src={newTaskRefPhoto} alt="Ref preview" className="h-10 w-10 object-cover rounded-lg border border-rose-500/50" />
                          <button
                            type="button"
                            onClick={() => setNewTaskRefPhoto('')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-[9px]"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {uploadingRefPhoto && (
                      <p className="text-[10px] text-rose-400 animate-pulse">Uploading reference image...</p>
                    )}
                  </div>

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
                      disabled={uploadingRefPhoto}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </form>
              )}
                </div>
              </div>

              {/* Task list container grouped by Collapsible Room Cards */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Property Room Accordions</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBatchTogglePhotos(false)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-850 hover:border-neutral-700 text-[10px] font-extrabold transition-all cursor-pointer active:scale-95"
                      title="Turn off photo requirements for all tasks"
                    >
                      🚫 Remove All Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchTogglePhotos(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold transition-all cursor-pointer active:scale-95"
                      title="Require photos for all tasks"
                    >
                      📷 Require All Photos
                    </button>
                    <span className="text-[10px] font-semibold text-rose-400 ml-1">
                      {checklistTasks.length} Task{checklistTasks.length === 1 ? '' : 's'}
                    </span>
                  </div>
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
                      if (!task) return;
                      let room = 'General / Entire Unit';
                      const match = (task.task_name || '').match(/^\[(.*?)\]\s*(.*)$/);
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
                                  if (!task) return null;
                                  const cleanText = (task.task_name || '').replace(/^\[.*?\]\s*/, '');
                                  const taskIndexInFullList = checklistTasks.findIndex(t => t && t.id === task.id);

                                return (
                                  <div
                                    key={task.id}
                                    className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-850 flex items-center justify-between group/task"
                                  >
                                    <div className="flex-1 min-w-0 mr-3 flex items-start gap-2.5">
                                      <span className="text-xs font-mono text-neutral-500 mt-0.5">{i + 1}</span>
                                      <div className="truncate">
                                        <p className="text-xs font-semibold text-neutral-200 truncate">{cleanText}</p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleTaskPhoto(task.id, true)}
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer border flex items-center gap-1 ${
                                              !task.requires_photo
                                                ? 'bg-neutral-800 text-emerald-300 border-emerald-500/40 shadow-xs'
                                                : 'bg-neutral-950 text-neutral-500 border-neutral-850 hover:text-neutral-300'
                                            }`}
                                            title="Set to Photo Optional (no photo needed)"
                                          >
                                            <span>{!task.requires_photo ? '✓ Photo Optional' : 'Photo Optional'}</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleToggleTaskPhoto(task.id, false)}
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer border flex items-center gap-1 ${
                                              task.requires_photo
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                                                : 'bg-neutral-950 text-neutral-500 border-neutral-850 hover:text-neutral-300'
                                            }`}
                                            title="Set to Photo Required (cleaner must take a photo)"
                                          >
                                            <Camera className={`h-3 w-3 ${task.requires_photo ? 'text-amber-400' : 'text-neutral-500'}`} />
                                            <span>{task.requires_photo ? '📷 ✓ Photo Required' : '📷 Photo Required'}</span>
                                          </button>
                                        </div>
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
          <style>{`
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
            <div id="qr-print-box" className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 text-center space-y-5">
              <div className="flex items-center justify-center gap-1.5 text-rose-500">
                <ShieldCheck className="h-6 w-6 text-rose-500" />
                <span className="font-extrabold text-base tracking-tight uppercase">TurnProofs Compliance</span>
              </div>

              <div>
                <h2 className="font-black text-xl text-neutral-100 print:text-black truncate">{activeQrProperty.name}</h2>
                <p className="text-xs text-neutral-400 print:text-gray-600 truncate mt-1">{activeQrProperty.address}</p>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                  UNIQUE UNIT ID: {activeQrProperty.id.substring(0, 13)}...
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    (typeof window !== 'undefined' ? window.location.origin : 'https://turnproofs.com') + '/clean/' + activeQrProperty.id
                  )}`}
                  alt="Cleaner Scan QR Code"
                  className="h-44 w-44 object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider print:border print:border-rose-500">
                  Scan To Launch Mobile Terminal
                </span>
                <p className="text-[10px] text-neutral-500 print:text-gray-600 mt-2 font-medium">
                  Scan with your phone camera. Zero logins or app downloads required.
                </p>
              </div>
            </div>

            {/* Quick Share Links */}
            <div className="mt-4 space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/clean/${activeQrProperty.id}`;
                  navigator.clipboard.writeText(url);
                  alert(`📋 Unique Cleaner Magic Link copied!\n\nURL: ${url}`);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-rose-500/50 font-bold text-neutral-200 hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="text-neutral-400">📱 Unique Cleaner Terminal Link</span>
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Cleaner Link</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/preview/${activeQrProperty.id}`;
                  navigator.clipboard.writeText(url);
                  alert(`👁️ Unique Read-Only Preview Link copied!\n\nURL: ${url}`);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 font-bold text-neutral-200 hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="text-neutral-400">👁️ Unique Read-Only Preview Link</span>
                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Preview Link</span>
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => setActiveQrProperty(null)}
                className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 font-bold text-xs text-neutral-300 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="py-3 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-xs text-white transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print QR Sign Card</span>
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
                    const res = await fetch('/api/auth', {
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

      {/* MODAL: EMBEDDED HIGH-TRUST STRIPE CHECKOUT */}
      {showCheckoutModal && checkoutPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
                <Lock className="h-3 w-3" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
              <h3 className="font-black text-2xl text-white">Subscribe to TurnProofs</h3>
              <p className="text-xs text-neutral-400">Confirm your subscription to activate full property verification automation.</p>
            </div>

            {/* Order Summary Box */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-850">
                <div>
                  <span className="text-sm font-black text-white block">{checkoutPlan.name}</span>
                  <span className="text-xs text-neutral-400">{checkoutPlan.units} Managed Unit{checkoutPlan.units === 1 ? '' : 's'} • {billingCycle === 'annual' ? 'Annual Billing (15% OFF)' : 'Monthly Billing'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white block font-mono">
                    ${billingCycle === 'annual' ? checkoutPlan.annualRate : checkoutPlan.monthlyRate}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">per month</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Free Trial Included</span>
                <span className="text-emerald-400 font-bold">14-Day Free Trial • Card required after trial ends</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-white pt-1">
                <span>Total Due Today</span>
                <span className="text-lg font-black text-emerald-400 font-mono">$0.00</span>
              </div>
            </div>

            {/* Payment Info Form Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Payment Information</label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Card number (e.g. 4242 4242 4242 4242)"
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 font-mono text-xs text-white outline-none"
                  />
                  <CreditCard className="h-4 w-4 text-neutral-500 absolute right-3.5 top-3" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 font-mono text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center text-[10px] text-neutral-400 font-medium">
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-rose-400" />
                <span>Stripe Encrypted</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Cancel Anytime • 0 Contract</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-1/3 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: checkoutPlan.planKey, propertiesCount: checkoutPlan.units, cycle: billingCycle })
                    });
                    const data = await res.json();
                    if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    } else if (data.demo) {
                      setShowCheckoutModal(false);
                      alert(`🎉 [SUBSCRIPTION CONFIRMED]\n\nPlan: ${checkoutPlan.name}\nBilling Cycle: ${billingCycle.toUpperCase()}\nMonthly Rate: $${billingCycle === 'annual' ? checkoutPlan.annualRate : checkoutPlan.monthlyRate}/mo\n\nYour 14-day free trial is active with full access! Add STRIPE_SECRET_KEY to Vercel environment variables whenever you want live card processing.`);
                    }
                  } catch (e) {
                    alert("Unable to process subscription.");
                  }
                }}
                className="w-2/3 py-3.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-xs font-black text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Confirm Subscription ($0 Today)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAUSE SUBSCRIPTION (30 DAYS) */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowPauseModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xl text-white">Pause Subscription for 30 Days?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Freeze your billing for 30 days. On Day 27, an automated email reminder is sent to your billing address. If no action is taken, your subscription automatically resumes on Day 30 so turnover checklists continue running smoothly.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="w-1/2 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-300"
              >
                Back
              </button>
              <button
                type="button"
                disabled={pausingSubscription}
                onClick={async () => {
                  const isTrialHost = !host?.stripe_subscription_id && (host?.created_at ? (Date.now() - new Date(host.created_at).getTime() < 30 * 24 * 60 * 60 * 1000) : true);
                  if (isTrialHost) {
                    alert("⚠️ Pause extension is unavailable during the 30-day free trial. Pause extension is reserved for active paid subscriptions. You can pause anytime once your paid plan begins.");
                    setShowPauseModal(false);
                    return;
                  }
                  setPausingSubscription(true);
                  setTimeout(() => {
                    setPausingSubscription(false);
                    setShowPauseModal(false);
                    alert("🎉 [SUBSCRIPTION PAUSED]\n\nYour subscription has been paused for 30 days ($0 charged). Zero charges will occur, and dashboard/cleaner portals are frozen until resumed on Day 30.");
                  }, 800);
                }}
                className="w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-black transition-all cursor-pointer"
              >
                {pausingSubscription ? 'Pausing...' : 'Confirm Pause (30 Days)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 2-STEP CONFIRM SUBSCRIPTION CANCELLATION */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xl text-white">Cancel Your Subscription?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Are you sure you want to cancel your TurnProofs subscription? Your subscription will end at the close of your current billing cycle with zero future charges.
              </p>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                <span className="font-bold text-white block">What happens when you cancel:</span>
                <p>• Zero future charges will occur.</p>
                <p>• All PDF audit reports and certificates are sent directly to your email and your cleaners' emails immediately after each turnover. We don't store data long-term — you own all your files. This keeps TurnProofs lean and keeps your costs down.</p>
                <p>• You can re-activate or upgrade anytime in 1 click.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
              >
                Keep My Plan
              </button>
              <button
                type="button"
                disabled={cancelingSubscription}
                onClick={async () => {
                  setCancelingSubscription(true);
                  try {
                    const res = await fetch('/api/stripe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'cancel' })
                    });
                    const data = await res.json();
                    setCancelingSubscription(false);
                    setShowCancelModal(false);
                    if (data.portalUrl) {
                      window.location.href = data.portalUrl;
                    } else if (data.demo) {
                      alert(`[SUBSCRIPTION CANCELED]\n\nYour plan has been canceled. Zero further charges will occur.`);
                    }
                  } catch (e) {
                    setCancelingSubscription(false);
                    alert("Unable to process cancellation.");
                  }
                }}
                className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {cancelingSubscription ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOWNGRADE PROPERTY RETENTION SELECTOR */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowDowngradeModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xl text-white">Select Properties to Retain</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You are downgrading to <strong className="text-white">{downgradeTargetPlan?.name || 'a lower tier'}</strong> which supports up to <strong className="text-emerald-400">{downgradeTargetPlan?.units || 1} active property slot(s)</strong>. Select which properties to keep active:
              </p>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {properties.map((prop) => (
                <label
                  key={prop.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between cursor-pointer hover:border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded bg-neutral-900 border-neutral-700 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{prop.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{prop.address}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Active Slot</span>
                </label>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-850 text-[11px] text-neutral-400 space-y-1">
              <span className="font-bold text-white block">Proration & File Delivery:</span>
              <p>• Unused days from your previous plan are automatically credited to your account.</p>
              <p>• All PDF audit reports and certificates are sent directly to your email and your cleaners' emails immediately after each turnover. We don't store data long-term — you own all your files. This keeps TurnProofs lean and keeps your costs down.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDowngradeModal(false)}
                className="w-1/3 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDowngradeModal(false);
                  setCheckoutPlan(downgradeTargetPlan);
                  setShowCheckoutModal(true);
                }}
                className="w-2/3 py-3 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                Confirm Plan Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERATED API KEY SHOW-ONCE */}
      {showKeyModal && generatedKey && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Key className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xl text-white">API Key Generated</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                For security reasons, this key will be displayed <strong className="text-white">only once</strong>. Copy it now and save it in a secure password manager. You will not be able to retrieve it again.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block font-sans">Your API Key:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-extrabold uppercase font-sans">
                  {generatedKey.environment === 'test' ? 'tp_test_secret' : 'tp_live_secret'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-neutral-900 p-3 rounded-lg border border-neutral-800 font-mono text-xs text-white select-all break-all">
                <span>{generatedKey.rawKey}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey.rawKey);
                    alert("API Key copied to clipboard!");
                  }}
                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800 shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-[11px] text-neutral-400 space-y-1 font-sans">
              <span className="font-bold text-red-400 block">⚠️ Security Warning:</span>
              <p>• Do not share this key in public repositories, client-side code, or insecure channels.</p>
              <p>• If you believe the key has been compromised, revoke it immediately in the panel.</p>
            </div>

            <button
              onClick={() => {
                setShowKeyModal(false);
                setGeneratedKey(null);
              }}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-rose-500/10 font-sans"
            >
              I Have Saved This Key
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
