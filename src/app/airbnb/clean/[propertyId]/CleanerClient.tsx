'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  MapPin, 
  Play, 
  CheckSquare, 
  Square, 
  Camera, 
  Check, 
  Loader2, 
  AlertCircle, 
  FileText,
  Clock,
  Users,
  Share2,
  Copy,
  X
} from 'lucide-react';
import { supabase, uploadFileToSupabase } from '@/lib/supabase';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
}

interface ChecklistTask {
  id: string;
  task_name: string;
  requires_photo: boolean;
  sort_order: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  cover_image_url: string;
}

const translations = {
  en: {
    title: "Cleaner Terminal",
    selectProfile: "Select Your Cleaner Profile",
    joinActive: "Join Active Cleaning Team",
    collaborativeMsg: "⚠️ Collaborative Mode: You are joining an ongoing cleaning session for this property. Your actions will sync in real-time.",
    chooseName: "-- Choose Your Name --",
    customName: "+ Guest/Other Cleaner",
    writeName: "Write your name",
    checkInBtn: "Check In & Start Cleaning",
    joinBtn: "Join Team Cleaning Session",
    activeTeam: "Active Cleaning Team",
    realtimeClean: "Real-time Team Cleaning",
    inviteCleaner: "Invite Cleaner",
    copied: "Copied!",
    sendInvite: "Send this invite link to your team. Multiple cleaners can check off tasks and upload photos simultaneously.",
    checklistTasks: "Checklist Tasks",
    noTasks: "No tasks registered for this unit. You can checkout directly.",
    photoRequired: "Photo Required",
    photoEvidence: "Photo Evidence",
    tapToCapture: "Tap to capture photo proof",
    uploading: "Uploading evidence...",
    completed: "Completed",
    additionalNotes: "Additional Cleaning Notes (Optional)",
    writeNotes: "Write any notes, supply shortages, or damages here...",
    checkoutBtn: "Complete & Check Out",
    submitting: "Submitting report...",
    gpsRequired: "This checklist requires GPS location verification.",
    gpsScanning: "Acquiring GPS lock...",
    changeLang: "Español",
    missingPhotosAlert: "Missing photo evidence for: ",
    confirmRestore: "We found an unfinished cleaning session. Would you like to restore your progress?",
    additionalPhotos: "Additional General Photos",
    addPhotoBtn: "+ Add Photo",
    damageSupplyPhotos: "Upload general property photos (e.g. damages, supply shortages, or finished setup proofs)",
    supplyStock: "Supply Stock Levels Tracker",
    toiletPaper: "Toilet Paper Rolls",
    soap: "Hand Soap & Shampoo",
    trashBags: "Trash Bin Liners",
    paperTowels: "Kitchen Paper Towels",
    full: "Full",
    low: "Low",
    out: "Out",
    maintenanceAlert: "Flag Maintenance / Damage Issue",
    maintenanceDesc: "Detail the damage (e.g. broken lock, stained sheet, water leak)",
    directMsg: "Private Note to Host",
    directMsgPlaceholder: "Leave private feedback or instructions directly for the host...",
    cleanerEmail: "Cleaner Email Address (Required for Report Copy)",
    cleanerEmailPlaceholder: "e.g. cleaner@gmail.com"
  },
  es: {
    title: "Terminal del Limpiador",
    selectProfile: "Seleccione su Perfil de Limpiador",
    joinActive: "Unirse al Equipo de Limpieza Activo",
    collaborativeMsg: "⚠️ Modo Colaborativo: Te estás uniendo a una sesión de limpieza en curso. Tus acciones se sincronizarán en tiempo real.",
    chooseName: "-- Elija Su Nombre --",
    customName: "+ Invitado/Otro Limpiador",
    writeName: "Escriba su nombre",
    checkInBtn: "Registrarse e Iniciar Limpieza",
    joinBtn: "Unirse a la Sesión del Equipo",
    activeTeam: "Equipo de Limpieza Activo",
    realtimeClean: "Limpieza en Equipo en Tiempo Real",
    inviteCleaner: "Invitar Limpiador",
    copied: "¡Copiado!",
    sendInvite: "Envíe este enlace de invitación a su equipo. Varios limpiadores pueden marcar tareas y subir fotos simultáneamente.",
    checklistTasks: "Tareas de la Lista",
    noTasks: "No hay tareas registradas para esta unidad. Puede finalizar directamente.",
    photoRequired: "Foto Requerida",
    photoEvidence: "Evidencia Fotográfica",
    tapToCapture: "Toque para capturar foto de prueba",
    uploading: "Subiendo evidencia...",
    completed: "Completado",
    additionalNotes: "Notas Adicionales de Limpieza (Opcional)",
    writeNotes: "Escriba cualquier nota, escasez de suministros o daños aquí...",
    checkoutBtn: "Finalizar y Registrar Salida",
    submitting: "Enviando informe...",
    gpsRequired: "Esta lista requiere verificación de ubicación GPS.",
    gpsScanning: "Adquiriendo bloqueo GPS...",
    changeLang: "English",
    missingPhotosAlert: "Falta evidencia fotográfica para: ",
    confirmRestore: "Encontramos una sesión de limpieza inacabada. ¿Le gustaría restaurar su progreso?",
    additionalPhotos: "Fotos Generales Adicionales",
    addPhotoBtn: "+ Añadir Foto",
    damageSupplyPhotos: "Suba fotos generales de la propiedad (por ejemplo, daños, escasez de suministros o pruebas del estado de entrega)",
    supplyStock: "Control de Stock de Suministros",
    toiletPaper: "Rollos de Papel Higiénico",
    soap: "Jabón de Manos y Champú",
    trashBags: "Bolsas de Basura",
    paperTowels: "Toallas de Papel de Cocina",
    full: "Lleno",
    low: "Bajo",
    out: "Agotado",
    maintenanceAlert: "Reportar Daño o Mantenimiento",
    maintenanceDesc: "Describa el daño (ej. cerradura rota, sábana manchada, fuga de agua)",
    directMsg: "Mensaje Privado al Anfitrión",
    directMsgPlaceholder: "Deje comentarios o instrucciones privadas directamente para el anfitrión...",
    cleanerEmail: "Correo Electrónico del Limpiador (Requerido)",
    cleanerEmailPlaceholder: "ej. limpiador@gmail.com"
  }
};

export default function CleanerClient({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Data lists
  const [property, setProperty] = useState<Property | null>(null);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Cleaner select & Start state
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [customCleanerName, setCustomCleanerName] = useState('');
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live Timer
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Task statuses: task ID -> { completed, photoUrl }
  const [taskStates, setTaskStates] = useState<Record<string, { completed: boolean; photoUrl: string | null }>>({});

  // Checkout states
  const [notes, setNotes] = useState('');
  const [cleanerEmail, setCleanerEmail] = useState('');
  
  // Supply Stock Levels states
  const [toiletPaper, setToiletPaper] = useState<'full' | 'low' | 'out'>('full');
  const [soap, setSoap] = useState<'full' | 'low' | 'out'>('full');
  const [trashBags, setTrashBags] = useState<'full' | 'low' | 'out'>('full');
  const [paperTowels, setPaperTowels] = useState<'full' | 'low' | 'out'>('full');

  // Maintenance & Private Host message states
  const [maintenanceAlert, setMaintenanceAlert] = useState(false);
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [hostMessage, setHostMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  // Collaborative team states
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get('sessionId') : null;
  const [activeReportId, setActiveReportId] = useState<string | null>(sessionId);
  const [cleanersList, setCleanersList] = useState<string>('');
  const [copiedSessionLink, setCopiedSessionLink] = useState(false);

  // Language Toggle State
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const t = translations[lang];

  // Room Accordion Collapsed State
  const [collapsedRooms, setCollapsedRooms] = useState<Record<string, boolean>>({});

  // Walkthrough Audit State (Priority #1 Niche)
  const [walkthroughDone, setWalkthroughDone] = useState(false);

  // Instant Red Flag / Lost & Found Alert Modal State
  const [instantModalType, setInstantModalType] = useState<'damage' | 'lost_found' | null>(null);
  const [instantDesc, setInstantDesc] = useState('');
  const [instantPhotos, setInstantPhotos] = useState<string[]>([]);
  const [uploadingInstantPhoto, setUploadingInstantPhoto] = useState(false);
  const [sendingInstantAlert, setSendingInstantAlert] = useState(false);
  const [instantAlertSuccess, setInstantAlertSuccess] = useState(false);

  // Additional Photos State
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  // Custom Supply Items State
  const [customSupplies, setCustomSupplies] = useState<Array<{ name: string; level: 'full' | 'low' | 'out' }>>([]);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [showAddSupplyInput, setShowAddSupplyInput] = useState(false);

  const [isHostPaused, setIsHostPaused] = useState(false);

  // Load initial data & restore saved cleaner email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('turnproofs_saved_cleaner_email');
      if (savedEmail) {
        setCleanerEmail(savedEmail);
      }
    } catch (e) {}

    async function loadData() {
      try {
        // Fetch property details (public)
        const propRes = await fetch(`/api/airbnb/properties?id=${propertyId}`);
        const propData = await propRes.json();
        if (propData.success) {
          setProperty(propData.property);
          if (propData.isPaused) {
            setIsHostPaused(true);
          }
        } else {
          setGpsError('Property not found.');
        }

        // Fetch cleaners (by propertyId to identify host)
        const cleanerRes = await fetch(`/api/airbnb/cleaners?propertyId=${propertyId}`);
        const cleanerData = await cleanerRes.json();
        if (cleanerData.success) {
          setCleaners(cleanerData.cleaners || []);
        }

        // Fetch checklists (either from active session or property template)
        if (sessionId) {
          const taskRes = await fetch(`/api/airbnb/reports/${sessionId}`);
          const taskData = await taskRes.json();
          if (taskData.success) {
            setTasks(taskData.tasks.map((t: any) => ({
              id: t.id,
              task_name: t.task_name,
              requires_photo: !!t.requires_photo,
              sort_order: 0
            })));
            const initialStates: Record<string, { completed: boolean; photoUrl: string | null }> = {};
            taskData.tasks.forEach((t: any) => {
              initialStates[t.id] = { completed: !!t.completed, photoUrl: t.photo_url || null };
            });
            setTaskStates(initialStates);
            setCleanersList(taskData.report?.cleaner_name || '');
          } else {
            setGpsError('Collaborative cleaning session not found or expired.');
          }
        } else {
          const taskRes = await fetch(`/api/airbnb/checklists?propertyId=${propertyId}`);
          const taskData = await taskRes.json();
          if (taskData.success) {
            setTasks(taskData.tasks || []);
            const initialStates: Record<string, { completed: boolean; photoUrl: string | null }> = {};
            taskData.tasks.forEach((task: ChecklistTask) => {
              initialStates[task.id] = { completed: false, photoUrl: null };
            });
            setTaskStates(initialStates);
          }
        }


        // Check if there is an active auto-save session for this property
        const savedSessionStr = localStorage.getItem(`turnproofs_autosave_${propertyId}`);
        if (savedSessionStr) {
          try {
            const saved = JSON.parse(savedSessionStr);
            const savedTime = saved.startTime ? new Date(saved.startTime) : null;
            // Verify session is recent (e.g. less than 8 hours old)
            if (savedTime && (new Date().getTime() - savedTime.getTime() < 8 * 60 * 60 * 1000)) {
              const confirmMsg = saved.lang === 'es' ? translations.es.confirmRestore : translations.en.confirmRestore;
              if (confirm(confirmMsg)) {
                setSelectedCleaner(saved.selectedCleaner || '');
                setCustomCleanerName(saved.customCleanerName || '');
                setStartTime(savedTime);
                setStartCoords(saved.startCoords || null);
                if (saved.taskStates) {
                  setTaskStates(saved.taskStates);
                }
                setNotes(saved.notes || '');
                setAdditionalPhotos(saved.additionalPhotos || []);
                setLang(saved.lang || 'en');
                setToiletPaper(saved.toiletPaper || 'full');
                setSoap(saved.soap || 'full');
                setTrashBags(saved.trashBags || 'full');
                setPaperTowels(saved.paperTowels || 'full');
                setMaintenanceAlert(!!saved.maintenanceAlert);
                setMaintenanceDesc(saved.maintenanceDesc || '');
                setHostMessage(saved.hostMessage || '');
                setStarted(true);
              } else {
                localStorage.removeItem(`turnproofs_autosave_${propertyId}`);
              }
            }
          } catch (e) {
            console.error('Error restoring session', e);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading cleaner data', err);
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  // Live elapsed time timer (Stops immediately upon checkout completion)
  useEffect(() => {
    if (!started || !startTime || success || submittedReportId) return;

    const timer = setInterval(() => {
      const diffMs = new Date().getTime() - startTime.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      const formattedSecs = secs < 10 ? `0${secs}` : secs;
      
      setElapsedTime(`${formattedMins}:${formattedSecs}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, startTime, success, submittedReportId]);

  // Auto-save cleaner checklist progress to localStorage to prevent data loss on page refreshes
  useEffect(() => {
    if (!started) return;
    try {
      const sessionState = {
        selectedCleaner,
        customCleanerName,
        startTime: startTime?.toISOString(),
        startCoords,
        taskStates,
        notes,
        additionalPhotos,
        lang,
        toiletPaper,
        soap,
        trashBags,
        paperTowels,
        maintenanceAlert,
        maintenanceDesc,
        hostMessage,
        cleanerEmail
      };
      localStorage.setItem(`turnproofs_autosave_${propertyId}`, JSON.stringify(sessionState));
      if (cleanerEmail) {
        localStorage.setItem('turnproofs_saved_cleaner_email', cleanerEmail);
      }
    } catch (e) {
      console.error('Failed to auto-save session progress', e);
    }
  }, [started, selectedCleaner, customCleanerName, startTime, startCoords, taskStates, notes, additionalPhotos, lang, toiletPaper, soap, trashBags, paperTowels, maintenanceAlert, maintenanceDesc, hostMessage, cleanerEmail, propertyId]);

  // Collaborative Polling: Sync task states and team lists in real time
  useEffect(() => {
    if (!started || !activeReportId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/airbnb/reports/${activeReportId}`);
        const data = await res.json();
        if (data.success) {
          // Sync checkoff states and photos
          const syncedStates: Record<string, { completed: boolean; photoUrl: string | null }> = {};
          data.tasks.forEach((t: any) => {
            syncedStates[t.id] = { completed: !!t.completed, photoUrl: t.photo_url || null };
          });
          setTaskStates(syncedStates);

          // Update collaborative cleaner list
          if (data.report?.cleaner_name) {
            setCleanersList(data.report.cleaner_name);
          }
        }
      } catch (err) {
        console.error('Collaborative polling sync failed:', err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [started, activeReportId]);



  // Request HTML5 Location
  const requestLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsError(null);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          let msg = 'Failed to acquire GPS coordinates.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'GPS Location Permission Denied. Please enable GPS permissions for this page.';
          }
          setGpsError(msg);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Start Clean Check-in / Join Team Session
  const handleCheckIn = async () => {
    const name = selectedCleaner === 'custom' ? customCleanerName : selectedCleaner;
    if (!name || name.trim() === '') {
      alert('Please select or enter your name to start.');
      return;
    }

    setLoading(true);
    const coords = await requestLocation();
    setStartCoords(coords);
    const cleanName = name.trim();

    try {
      if (sessionId) {
        // Join existing session
        const res = await fetch('/api/airbnb/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join_session',
            reportId: sessionId,
            cleaner_name: cleanName
          })
        });
        const data = await res.json();
        if (data.success) {
          setActiveReportId(sessionId);
          setCleanersList(data.report.cleaner_name);
          setStartTime(new Date(data.report.started_at));
          setStarted(true);
        } else {
          alert('Failed to join team: ' + data.error);
        }
      } else {
        // Start a new collaborative session
        const nowStr = new Date().toISOString();
        const res = await fetch('/api/airbnb/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start_session',
            property_id: propertyId,
            cleaner_name: cleanName,
            started_at: nowStr,
            start_latitude: coords?.lat || null,
            start_longitude: coords?.lng || null
          })
        });
        const data = await res.json();
        if (data.success) {
          setActiveReportId(data.reportId);
          setCleanersList(cleanName);
          setStartTime(new Date(nowStr));
          
          // Fetch the newly created report tasks (which contain report_tasks database IDs)
          const taskRes = await fetch(`/api/airbnb/reports/${data.reportId}`);
          const taskData = await taskRes.json();
          if (taskData.success) {
            setTasks(taskData.tasks.map((t: any) => ({
              id: t.id,
              task_name: t.task_name,
              requires_photo: !!t.requires_photo,
              sort_order: 0
            })));
            const initialStates: Record<string, { completed: boolean; photoUrl: string | null }> = {};
            taskData.tasks.forEach((t: any) => {
              initialStates[t.id] = { completed: !!t.completed, photoUrl: t.photo_url || null };
            });
            setTaskStates(initialStates);
          }
          setStarted(true);
        } else {
          alert('Failed to start cleaning session: ' + data.error);
        }
      }
    } catch (err) {
      console.error('Check-in error', err);
      alert('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Check off a task manually (or trigger camera if photo is MANDATORY required and missing)
  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentStatus = taskStates[taskId] || { completed: false, photoUrl: null };

    // If it MANDATORY requires photo and no photo uploaded yet, trigger camera file picker!
    if (task.requires_photo && !currentStatus.photoUrl) {
      const fileInput = document.getElementById(`file_input_${taskId}`);
      if (fileInput) {
        fileInput.click();
      } else {
        alert('This task requires photo evidence. Please tap the camera icon to take a photo.');
      }
      return;
    }

    const nextCompleted = !currentStatus.completed;

    setTaskStates(prev => ({
      ...prev,
      [taskId]: {
        completed: nextCompleted,
        photoUrl: currentStatus.photoUrl || null
      }
    }));

    if (activeReportId) {
      fetch('/api/airbnb/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          completed: nextCompleted,
          photoUrl: currentStatus.photoUrl || null
        })
      }).catch(err => console.error('Failed to sync task status:', err));
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTaskId(taskId);
    try {
      // 1. Generate unique file path
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${propertyId}_${taskId}_${Date.now()}.${fileExt}`;
      const filePath = `proofs/${fileName}`;

      // 2. Upload file directly to Supabase Public Bucket via REST API
      const photoUrl = await uploadFileToSupabase(file, filePath);

      // 3. Update task state - auto checks the checkbox
      setTaskStates(prev => ({
        ...prev,
        [taskId]: {
          completed: true,
          photoUrl: photoUrl
        }
      }));

      // Sync to database
      if (activeReportId) {
        fetch('/api/airbnb/reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            completed: true,
            photoUrl: photoUrl
          })
        }).catch(err => console.error('Failed to sync photo upload status:', err));
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingTaskId(null);
    }
  };

  // Handle Additional General Photos Upload
  const handleAdditionalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAdditional(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `additional_${propertyId}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const photoUrl = await uploadFileToSupabase(file, filePath);
        urls.push(photoUrl);
      }
      setAdditionalPhotos(prev => [...prev, ...urls]);
    } catch (err: any) {
      console.error('Failed to upload additional photos:', err);
      alert('Error uploading one or more photos. Please try again.');
    } finally {
      setUploadingAdditional(false);
    }
  };

  // Check out & Submit
  const handleCheckOut = async () => {
    // Verify mandatory Walkthrough Audit is completed (Our Niche Priority #1)
    if (!walkthroughDone) {
      alert(lang === 'en'
        ? 'Checkout blocked: Step 1 (Initial Walkthrough Audit for Damage & Lost/Found) must be verified before checking out.'
        : 'Salida bloqueada: El Paso 1 (Auditoría de Inspección Inicial de Daños y Objetos Olvidados) debe ser verificado antes de salir.'
      );
      return;
    }

    // Verify all tasks are completed
    const uncompletedTasks = tasks.filter(t => !taskStates[t.id]?.completed);
    if (uncompletedTasks.length > 0) {
      const pendingRooms = Array.from(new Set(uncompletedTasks.map(t => {
        const match = t.task_name.match(/^\[(.*?)\]/);
        return match ? match[1] : 'General';
      }))).join(', ');
      alert(lang === 'en' 
        ? `Checkout blocked: The following room(s) are incomplete (highlighted in RED): ${pendingRooms}. Please complete all room tasks and required photos before checking out.` 
        : `Salida bloqueada: La(s) siguiente(s) habitación(es) están incompletas (resaltadas en ROJO): ${pendingRooms}. Por favor complete todas las tareas y fotos requeridas antes de registrar la salida.`
      );
      return;
    }

    // Verify all photo-required tasks are completed
    const missingPhotos = tasks.filter(t => t.requires_photo && !taskStates[t.id]?.photoUrl);
    if (missingPhotos.length > 0) {
      const missingNames = missingPhotos.map(m => m.task_name.replace(/^\[.*?\]\s*/, '')).join(', ');
      alert(`${t.missingPhotosAlert}${missingNames}`);
      return;
    }

    // Verify cleaner email address is provided
    if (!cleanerEmail || !cleanerEmail.trim() || !cleanerEmail.includes('@')) {
      alert(lang === 'en' ? 'Please enter a valid cleaner email address before checking out.' : 'Por favor ingrese un correo electrónico de limpiador válido antes de registrar la salida.');
      return;
    }

    setSubmitting(true);
    // Request final location coordinates
    const coords = await requestLocation();
    
    // Construct request payload
    const cleanerName = selectedCleaner === 'custom' ? customCleanerName : selectedCleaner;
    const taskPayload = tasks.map(t => ({
      task_name: t.task_name,
      requires_photo: t.requires_photo,
      photo_url: taskStates[t.id].photoUrl,
      completed: taskStates[t.id].completed
    }));

    // Pack notes, photos, inventory, maintenance alerts, private host messages, and cleaner email into JSON
    const notesPayload = JSON.stringify({
      text: notes,
      photos: additionalPhotos,
      hostMessage: hostMessage,
      cleanerEmail: cleanerEmail.trim(),
      maintenanceAlert: maintenanceAlert,
      maintenanceDesc: maintenanceAlert ? maintenanceDesc : '',
      supplies: {
        toiletPaper,
        soap,
        trashBags,
        paperTowels,
        customSupplies
      }
    });

    try {
      let res;
      if (activeReportId) {
        res = await fetch('/api/airbnb/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'checkout_session',
            reportId: activeReportId,
            cleaner_email: cleanerEmail.trim(),
            completed_at: new Date().toISOString(),
            end_latitude: coords?.lat || null,
            end_longitude: coords?.lng || null,
            notes: notesPayload
          })
        });
      } else {
        res = await fetch('/api/airbnb/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            cleaner_name: cleanerName.trim(),
            cleaner_email: cleanerEmail.trim(),
            started_at: startTime?.toISOString(),
            completed_at: new Date().toISOString(),
            start_latitude: startCoords?.lat || null,
            start_longitude: startCoords?.lng || null,
            end_latitude: coords?.lat || null,
            end_longitude: coords?.lng || null,
            notes: notesPayload,
            tasks: taskPayload
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(`turnproofs_autosave_${propertyId}`);
        setSubmittedReportId(activeReportId || data.reportId);
        setSuccess(true);
      } else {
        alert('Failed to submit report: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-4" />
        <span className="text-neutral-400 font-medium">Initializing mobile cleaning terminal...</span>
      </div>
    );
  }

  // PAUSED HOST STATE VIEW
  if (isHostPaused) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-black tracking-tight">Checklist Frozen (Account Paused)</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This property's TurnProofs account is currently paused by the host. Zero charges occur while paused, but mobile checklists and turnover reports are temporarily frozen.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 max-w-sm">
          Please contact your property manager or host to resume TurnProofs access.
        </div>
      </div>
    );
  }

  // SUCCESS STATE VIEW
  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
            <Check className="h-8 w-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Checkout Complete!</h2>
            <p className="text-sm text-neutral-400 mt-2">Your cleaning record has been verified and registered securely in the host archives.</p>
          </div>

          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Cleaner:</span>
              <span className="font-semibold">{selectedCleaner === 'custom' ? customCleanerName : selectedCleaner}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Duration:</span>
              <span className="font-semibold">{elapsedTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">GPS Evidence:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span>Verified</span>
                <Check className="h-3 w-3" />
              </span>
            </div>
            {cleanerEmail && (
              <div className="pt-2 mt-2 border-t border-neutral-800 text-[10px] text-emerald-400 font-semibold flex items-center justify-between">
                <span>📧 Copy Emailed to:</span>
                <span className="font-mono text-neutral-200 truncate max-w-[170px]">{cleanerEmail}</span>
              </div>
            )}
            {property?.cover_image_url?.includes('|||') && property.cover_image_url.split('|||')[1] && (
              <div className="pt-2.5 mt-2.5 border-t border-neutral-800 text-[10px] text-emerald-400 font-semibold flex items-start gap-1 leading-normal">
                <span>📧 sanitation report PDF automatically dispatched to: {property.cover_image_url.split('|||')[1]}</span>
              </div>
            )}
          </div>

          {submittedReportId && (
            <a
              href={`/airbnb/report/${submittedReportId}`}
              className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-sm text-center shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>{lang === 'en' ? 'View Verification Certificate' : 'Ver Certificado de Verificación'}</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm(lang === 'en' ? 'Start a fresh cleaning turnover session for a new guest booking?' : '¿Iniciar una nueva sesión de limpieza para una nueva reserva?')) {
                localStorage.removeItem(`turnproofs_autosave_${propertyId}`);
                setSuccess(false);
                setSubmittedReportId(null);
                setStarted(false);
                setWalkthroughDone(false);
                setElapsedTime('00:00');
                setStartTime(null);
                setNotes('');
                setAdditionalPhotos([]);
                setTaskStates({});
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>✨ {lang === 'en' ? 'Start New Guest Turnover' : 'Iniciar Nueva Limpieza'}</span>
          </button>
        </div>

        <div className="text-center text-xs text-neutral-600 pb-4 font-semibold">
          TurnProofs System Certification
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between select-none">
      
      {/* Property banner header */}
      <div className="relative h-44 bg-neutral-900 overflow-hidden shrink-0">
        <img
          src={property?.cover_image_url?.includes('|||') ? property.cover_image_url.split('|||')[0] : (property?.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80')}
          alt={property?.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        {/* Floating Language Toggle Pill */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
            className="px-3 py-1.5 rounded-full bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 text-[10px] font-extrabold uppercase tracking-wider text-rose-450 text-rose-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            🌐 {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/" className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1 hover:opacity-80 transition-opacity cursor-pointer">
            <ShieldCheck className="h-4 w-4" />
            <span className="uppercase tracking-wider">TurnProofs • {t.title}</span>
          </Link>
          <h2 className="font-extrabold text-xl truncate">{property?.name || 'Loading Rental Unit...'}</h2>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{property?.address}</p>
        </div>
      </div>

      {/* Main interactive terminal area */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        
        {/* STEP 1: SELECT NAME & CHECK IN */}
        {!started ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md space-y-4">
              <h3 className="font-bold text-base">
                {sessionId ? t.joinActive : t.selectProfile}
              </h3>
              
              {sessionId && (
                <p className="text-xs text-amber-400 font-semibold leading-relaxed">
                  {t.collaborativeMsg}
                </p>
              )}
              
              <div className="space-y-4">
                <select
                  value={selectedCleaner}
                  onChange={(e) => {
                    setSelectedCleaner(e.target.value);
                    if (e.target.value !== 'custom') setCustomCleanerName('');
                  }}
                  className="w-full px-3.5 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-white"
                >
                  <option value="">{t.chooseName}</option>
                  {cleaners.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="custom">{t.customName}</option>
                </select>

                {selectedCleaner === 'custom' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">{t.writeName}</label>
                    <input
                      type="text"
                      placeholder="e.g. David Miller"
                      value={customCleanerName}
                      onChange={(e) => setCustomCleanerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {gpsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              className="w-full py-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-base transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              <span>{sessionId ? t.joinBtn : t.checkInBtn}</span>
            </button>
          </div>
        ) : (
          
          /* STEP 2: ACTIVE CHECKLIST */
          <div className="max-w-md mx-auto space-y-6">
            
            {/* Cleaner + Live Timer banner */}
            <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-2xl">
              <div className="flex flex-col min-w-0 mr-3">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{t.activeTeam}</span>
                <span className="text-sm font-bold text-neutral-200 truncate">
                  {cleanersList || (selectedCleaner === 'custom' ? customCleanerName : selectedCleaner)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-400 font-mono text-sm font-bold shrink-0">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>{elapsedTime}</span>
              </div>
            </div>

            {/* Collaborative Invite Card */}
            {activeReportId && (
              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-350 text-neutral-300">
                    <Users className="h-4.5 w-4.5 text-rose-500" />
                    <span>{t.realtimeClean}</span>
                  </div>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/airbnb/clean/${propertyId}?sessionId=${activeReportId}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedSessionLink(true);
                      setTimeout(() => setCopiedSessionLink(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedSessionLink ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3 w-3" />
                        <span>{t.inviteCleaner}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal">
                  {t.sendInvite}
                </p>
              </div>
            )}

            {/* STEP 1 MANDATORY WALKTHROUGH AUDIT (OUR NICHE - CANNOT BE REMOVED) */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-lg ${
              walkthroughDone
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-rose-500/80 bg-linear-to-b from-rose-950/40 to-neutral-900/90'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full shrink-0 ${walkthroughDone ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                  <h3 className="font-extrabold text-sm text-white tracking-tight uppercase">
                    {lang === 'en' ? '🚨 STEP 1: INITIAL WALKTHROUGH AUDIT (PRIORITY #1)' : '🚨 PASO 1: AUDITORÍA DE INSPECCIÓN INICIAL (PRIORIDAD #1)'}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  walkthroughDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {walkthroughDone ? (lang === 'en' ? '🟢 Verified' : '🟢 Verificado') : (lang === 'en' ? '🔴 Mandatory First' : '🔴 Obligatorio')}
                </span>
              </div>

              <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                {lang === 'en'
                  ? 'Our TurnProofs Niche Requirement: Before touching linens or cleaning, walk through the property to inspect for pre-existing damage, red flags, or guest belongings.'
                  : 'Requisito Principal de TurnProofs: Antes de tocar la ropa de cama o limpiar, recorra la propiedad para inspeccionar daños preexistentes o pertenencias de los huéspedes.'
                }
              </p>

              {/* Action Buttons for Red Flags & Lost & Found */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setInstantModalType('damage');
                    setInstantDesc('');
                    setInstantPhotos([]);
                  }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/20 text-red-300 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertCircle className="h-4 w-4 text-red-400 group-hover:scale-110 transition-transform" />
                    <span>{lang === 'en' ? 'Flag Damage / Red Flag' : 'Reportar Daño / Objeto Roto'}</span>
                  </div>
                  <p className="text-[10px] text-red-400/80 mt-1">Instant urgent email alert to host</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInstantModalType('lost_found');
                    setInstantDesc('');
                    setInstantPhotos([]);
                  }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20 text-amber-300 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Camera className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{lang === 'en' ? 'Report Lost & Found' : 'Reportar Objeto Olvidado'}</span>
                  </div>
                  <p className="text-[10px] text-amber-400/80 mt-1">Passport, iPad, jewelry alert</p>
                </button>
              </div>

              {/* Mandatory Completion Checkbox */}
              <div className="mt-4 pt-3 border-t border-neutral-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkthroughDone}
                    onChange={(e) => setWalkthroughDone(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-neutral-950 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${walkthroughDone ? 'text-emerald-300' : 'text-neutral-200'}`}>
                    {lang === 'en' ? 'I have completed the initial walkthrough audit' : 'He completado la auditoría de inspección inicial'}
                  </span>
                </label>
              </div>
            </div>

            {/* STEP 2: ROOM-BY-ROOM CHECKLIST TASKS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">{t.checklistTasks}</h3>
              
              {tasks.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500">
                  {t.noTasks}
                </div>
              ) : (
                (() => {
                  // Group tasks by Room Name
                  const roomMap: Record<string, typeof tasks> = {};
                  tasks.forEach(task => {
                    let room = 'General / Entire Unit';
                    const match = task.task_name.match(/^\[(.*?)\]\s*(.*)$/);
                    if (match) {
                      room = match[1];
                    }
                    if (!roomMap[room]) roomMap[room] = [];
                    roomMap[room].push(task);
                  });

                  return (
                    <div className="space-y-4">
                      {Object.entries(roomMap).map(([roomName, roomTasks]) => {
                        const completedCount = roomTasks.filter(t => taskStates[t.id]?.completed).length;
                        const isRoomDone = completedCount === roomTasks.length && roomTasks.every(t => !t.requires_photo || taskStates[t.id]?.photoUrl);
                        const isExplicitlyCollapsed = collapsedRooms[roomName];
                        const isCollapsed = isExplicitlyCollapsed !== undefined ? isExplicitlyCollapsed : isRoomDone;

                        return (
                          <div
                            key={roomName}
                            className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
                              isRoomDone
                                ? 'border-emerald-500/80 bg-emerald-500/10'
                                : 'border-red-500/60 bg-red-500/5'
                            }`}
                          >
                            {/* Room Accordion Header */}
                            <div
                              onClick={() => setCollapsedRooms(prev => ({ ...prev, [roomName]: !isCollapsed }))}
                              className={`px-4 py-3 border-b flex items-center justify-between cursor-pointer transition-colors ${
                                isRoomDone ? 'bg-emerald-950/60 border-emerald-500/30' : 'bg-red-950/40 border-red-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`h-3 w-3 rounded-full shrink-0 ${isRoomDone ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                                <h4 className="font-extrabold text-sm text-neutral-100 truncate">{roomName}</h4>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  isRoomDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                }`}>
                                  {isRoomDone ? (lang === 'en' ? '🟢 Completed' : '🟢 Completado') : `🔴 ${completedCount}/${roomTasks.length} ${lang === 'en' ? 'Done' : 'Listo'}`}
                                </span>
                                <span className="text-neutral-400 font-bold text-xs">
                                  {isCollapsed ? '▼' : '▲'}
                                </span>
                              </div>
                            </div>

                            {/* Room Tasks List (Collapsible) */}
                            {!isCollapsed && (
                              <div className="p-3 space-y-3 bg-neutral-950/70">
                                {roomTasks.map((task) => {
                                  const status = taskStates[task.id] || { completed: false, photoUrl: null };
                                  const cleanTaskText = task.task_name.replace(/^\[.*?\]\s*/, '');

                                  return (
                                    <div
                                      key={task.id}
                                      className={`p-3.5 rounded-xl border transition-all ${
                                        status.completed
                                          ? 'border-emerald-500/30 bg-emerald-500/5'
                                          : 'border-neutral-800 bg-neutral-900/90'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <button
                                          onClick={() => toggleTask(task.id)}
                                          className="flex-1 text-left flex items-start gap-3 cursor-pointer"
                                        >
                                          <div className="mt-0.5 text-neutral-500 shrink-0">
                                            {status.completed ? (
                                              <CheckSquare className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                              <Square className="h-5 w-5" />
                                            )}
                                          </div>
                                          <span className={`text-xs font-semibold ${status.completed ? 'text-neutral-400 line-through' : 'text-neutral-200'}`}>
                                            {cleanTaskText}
                                          </span>
                                        </button>

                                        {/* Photo upload trigger */}
                                        <div className="ml-3 shrink-0">
                                          {status.photoUrl ? (
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-emerald-500/50">
                                              <img
                                                src={status.photoUrl}
                                                alt="verification"
                                                className="h-full w-full object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <label className="cursor-pointer h-9 w-9 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-colors">
                                              {uploadingTaskId === task.id ? (
                                                <Loader2 className="h-4 w-4 text-rose-500 animate-spin" />
                                              ) : (
                                                <>
                                                  <Camera className={`h-4.5 w-4.5 ${task.requires_photo ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-350'}`} />
                                                  <input
                                                    id={`file_input_${task.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handlePhotoUpload(task.id, e)}
                                                    className="hidden"
                                                    disabled={uploadingTaskId !== null}
                                                  />
                                                </>
                                              )}
                                            </label>
                                          )}
                                        </div>
                                      </div>

                                      {task.requires_photo && !status.photoUrl && (
                                        <div className="mt-2 text-[10px] text-amber-500 font-semibold uppercase flex items-center gap-1">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          <span>{lang === 'en' ? 'Photo evidence required for this room task' : 'Evidencia fotográfica requerida para esta tarea'}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Notes input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t.additionalNotes}</label>
              <textarea
                placeholder={t.writeNotes}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3.5 bg-neutral-900 border border-neutral-800 focus:border-rose-500 rounded-2xl outline-none text-sm text-white resize-none transition-all"
              />
            </div>

            {/* Additional general photos upload section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t.additionalPhotos}</label>
              <p className="text-[10px] text-neutral-500 leading-normal">{t.damageSupplyPhotos}</p>
              
              <div className="grid grid-cols-3 gap-3">
                {additionalPhotos.map((url, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden border border-neutral-850 relative group">
                    <img src={url} alt="additional" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAdditionalPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/80 hover:bg-black text-white text-[10px] flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl bg-neutral-900/50 border border-dashed border-neutral-850 hover:border-rose-500/40 flex flex-col items-center justify-center cursor-pointer transition-colors relative">
                  {uploadingAdditional ? (
                    <Loader2 className="h-5 w-5 text-rose-500 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5 text-neutral-500 mb-1 hover:text-rose-400" />
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">{t.addPhotoBtn}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalPhotoUpload}
                        className="hidden"
                        disabled={uploadingAdditional}
                      />
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Supply Inventory Levels Tracker */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">{t.supplyStock}</h4>
                <button
                  type="button"
                  onClick={() => setShowAddSupplyInput(!showAddSupplyInput)}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                >
                  {showAddSupplyInput ? '✕ Cancel' : (lang === 'en' ? '+ Add Supply Item' : '+ Añadir Suministro')}
                </button>
              </div>

              {/* Add Custom Supply Item Input */}
              {showAddSupplyInput && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 animate-fadeIn">
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Coffee Pods, Sponge, Laundry Detergent' : 'ej. Cápsulas de café, Esponja'}
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white outline-none px-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSupplyName.trim()) {
                        setCustomSupplies(prev => [...prev, { name: newSupplyName.trim(), level: 'low' }]);
                        setNewSupplyName('');
                        setShowAddSupplyInput(false);
                      }
                    }}
                    disabled={!newSupplyName.trim()}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 font-extrabold text-[10px] text-white disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {lang === 'en' ? 'Add' : 'Añadir'}
                  </button>
                </div>
              )}
              
              <div className="space-y-3.5">
                {[
                  { key: 'toiletPaper', label: t.toiletPaper, state: toiletPaper, setter: setToiletPaper },
                  { key: 'soap', label: t.soap, state: soap, setter: setSoap },
                  { key: 'trashBags', label: t.trashBags, state: trashBags, setter: setTrashBags },
                  { key: 'paperTowels', label: t.paperTowels, state: paperTowels, setter: setPaperTowels }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-neutral-400 font-medium">{item.label}</span>
                    <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 shrink-0">
                      {[
                        { val: 'full', label: t.full, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { val: 'low', label: t.low, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                        { val: 'out', label: t.out, color: 'text-red-400 bg-red-500/10 border-red-500/20' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => (item.setter as any)(opt.val)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            item.state === opt.val
                              ? `${opt.color} border shadow-xs`
                              : 'text-neutral-500 hover:text-neutral-350'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom Cleaner Added Supply Items */}
                {customSupplies.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-300 font-bold">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => setCustomSupplies(prev => prev.filter((_, i) => i !== idx))}
                        className="text-[10px] text-neutral-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 shrink-0">
                      {[
                        { val: 'full', label: t.full, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { val: 'low', label: t.low, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                        { val: 'out', label: t.out, color: 'text-red-400 bg-red-500/10 border-red-500/20' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setCustomSupplies(prev => prev.map((s, i) => i === idx ? { ...s, level: opt.val as any } : s));
                          }}
                          className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            item.level === opt.val
                              ? `${opt.color} border shadow-xs`
                              : 'text-neutral-500 hover:text-neutral-350'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance / Damage Flag */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-4 backdrop-blur-md">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintenanceAlert}
                  onChange={(e) => setMaintenanceAlert(e.target.checked)}
                  className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500 focus:ring-offset-neutral-950 bg-neutral-950 h-4 w-4"
                />
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">{t.maintenanceAlert}</span>
              </label>

              {maintenanceAlert && (
                <div className="space-y-2 animate-fade-in pt-1">
                  <textarea
                    placeholder={t.maintenanceDesc}
                    rows={2}
                    value={maintenanceDesc}
                    onChange={(e) => setMaintenanceDesc(e.target.value)}
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 focus:border-rose-500 rounded-xl outline-none text-xs text-white resize-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Private Note to Host */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t.directMsg}</label>
              <textarea
                placeholder={t.directMsgPlaceholder}
                rows={2}
                value={hostMessage}
                onChange={(e) => setHostMessage(e.target.value)}
                className="w-full p-3.5 bg-neutral-900 border border-neutral-800 focus:border-rose-500 rounded-2xl outline-none text-sm text-white resize-none transition-all"
              />
            </div>

            {/* Send Copy to Cleaner Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t.cleanerEmail}</label>
              <input
                type="email"
                placeholder={t.cleanerEmailPlaceholder}
                value={cleanerEmail}
                onChange={(e) => {
                  setCleanerEmail(e.target.value);
                  try {
                    localStorage.setItem('turnproofs_saved_cleaner_email', e.target.value);
                  } catch (err) {}
                }}
                className="w-full p-3.5 bg-neutral-900 border border-neutral-800 focus:border-rose-500 rounded-2xl outline-none text-sm text-white transition-all"
              />
            </div>


            {gpsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Sticky Floating Instant Alert Buttons (Always Accessible Mid-Clean) */}
            <div className="sticky bottom-20 z-30 pt-2">
              <div className="p-3 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-neutral-200 flex items-center gap-1.5 shrink-0">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span>{lang === 'en' ? 'Mid-Clean Issue?' : '¿Problema a mitad de limpieza?'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInstantModalType('damage');
                      setInstantDesc('');
                      setInstantPhotos([]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🚨 {lang === 'en' ? 'Flag Damage' : 'Reportar Daño'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInstantModalType('lost_found');
                      setInstantDesc('');
                      setInstantPhotos([]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🎒 {lang === 'en' ? 'Lost & Found' : 'Objeto Olvidado'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit checkout */}
            <button
              onClick={handleCheckOut}
              disabled={submitting || uploadingTaskId !== null}
              className="w-full py-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold text-base transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <span>{t.checkoutBtn}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* INSTANT ALERT POPUP MODAL (BEFORE CLEANING IS COMPLETED) */}
      {instantModalType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setInstantModalType(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-850 pb-4">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                instantModalType === 'damage' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {instantModalType === 'damage' ? <AlertCircle className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {instantModalType === 'damage' 
                    ? (lang === 'en' ? '🚨 Flag Broken Item / Damage Alert' : '🚨 Reportar Daño / Objeto Roto')
                    : (lang === 'en' ? '🎒 Report Guest Lost & Found' : '🎒 Reportar Objeto Olvidado')
                  }
                </h3>
                <p className="text-[11px] text-rose-400 font-semibold">
                  {lang === 'en' ? '⚡ Dispatches an INSTANT urgent email to host now!' : '⚡ ¡Envía un correo electrónico URGENTE AL INSTANTE al anfitrión ahora!'}
                </p>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                {instantModalType === 'damage'
                  ? (lang === 'en' ? 'Describe the damage or broken item:' : 'Describa el daño o elemento roto:')
                  : (lang === 'en' ? 'Describe the lost item & room location:' : 'Describa el objeto olvidado y ubicación:')
                }
              </label>
              <textarea
                rows={3}
                placeholder={instantModalType === 'damage'
                  ? (lang === 'en' ? 'e.g. Broken TV screen, wine stain on white couch in Living Room' : 'ej. Pantalla de TV rota, mancha de vino en sofá blanco')
                  : (lang === 'en' ? 'e.g. US Passport & iPad found in Master Bedroom top drawer' : 'ej. Pasaporte y iPad encontrados en cajón del dormitorio principal')
                }
                value={instantDesc}
                onChange={(e) => setInstantDesc(e.target.value)}
                className="w-full p-3.5 bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl outline-none text-xs text-white resize-none"
              />
            </div>

            {/* Photo Upload Option (Multiple Photos Supported) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">
                {lang === 'en' ? 'Attach Photo Evidence (Multiple Allowed):' : 'Adjuntar Fotos de Prueba (Múltiples permitidas):'}
              </label>

              {/* Grid of uploaded photos */}
              {instantPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {instantPhotos.map((url, i) => (
                    <div key={i} className="relative h-20 w-full rounded-xl overflow-hidden border border-emerald-500/50 group">
                      <img src={url} alt="Proof" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setInstantPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload trigger button */}
              <label className="h-16 w-full rounded-xl bg-neutral-950 border border-dashed border-neutral-800 hover:border-rose-500/50 flex items-center justify-center gap-2 cursor-pointer transition-colors px-3">
                {uploadingInstantPhoto ? (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading photo proof...</span>
                  </div>
                ) : (
                  <>
                    <Camera className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="text-xs text-neutral-300 font-bold">
                      {instantPhotos.length > 0 
                        ? (lang === 'en' ? '+ Add Another Photo' : '+ Añadir Otra Foto')
                        : (lang === 'en' ? '📷 Snap Photo of Damage / Lost Item' : '📷 Tomar Foto del Daño / Objeto')
                      }
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setUploadingInstantPhoto(true);
                        try {
                          const urls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const fileExt = file.name.split('.').pop() || 'jpg';
                            const filePath = `alerts/${propertyId}_${Date.now()}_${i}.${fileExt}`;
                            const publicUrl = await uploadFileToSupabase(file, filePath);
                            urls.push(publicUrl);
                          }
                          setInstantPhotos(prev => [...prev, ...urls]);
                        } catch (err: any) {
                          console.error(err);
                          alert('Photo upload failed: ' + (err.message || 'Error'));
                        } finally {
                          setUploadingInstantPhoto(false);
                        }
                      }}
                      className="hidden"
                    />
                  </>
                )}
              </label>
            </div>

            {/* Instant Success Banner */}
            {instantAlertSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fade-in">
                {lang === 'en' ? '⚡ URGENT ALERT DISPATCHED TO HOST IMMEDIATELY!' : '⚡ ¡ALERTA URGENTE ENVIADA AL ANFITRIÓN AL INSTANTE!'}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={sendingInstantAlert || !instantDesc.trim()}
                onClick={async () => {
                  setSendingInstantAlert(true);
                  try {
                    const res = await fetch('/api/airbnb/reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'instant_alert',
                        property_id: propertyId,
                        alertType: instantModalType,
                        cleaner_name: selectedCleaner === 'custom' ? customCleanerName : selectedCleaner,
                        description: instantDesc,
                        photoUrl: instantPhotos.join('|||')
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setInstantAlertSuccess(true);
                      setTimeout(() => {
                        setInstantModalType(null);
                        setInstantAlertSuccess(false);
                        setInstantPhotos([]);
                      }, 2000);
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error sending alert');
                  } finally {
                    setSendingInstantAlert(false);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-extrabold text-sm text-white transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {sendingInstantAlert ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <span>{lang === 'en' ? '⚡ Send Instant Urgent Alert Now' : '⚡ Enviar Alerta Urgente al Instante'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="py-6 border-t border-neutral-900 shrink-0 text-center text-[10px] text-neutral-600 font-medium">
        TurnProofs Mobile Verification System
      </footer>
    </div>
  );
}
