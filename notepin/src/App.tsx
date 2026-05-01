/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { Note, NoteData } from './components/Note';
import { ContextMenu } from './components/ContextMenu';
import { MousePointer2, Shield, Lock, RefreshCw, X, Globe, List, ArrowRight, GripHorizontal, Trash, Info, Search, Download, Upload, AlertTriangle, StickyNote, Move, Share2, Cloud, Copy, Check } from 'lucide-react';

const NOTE_COLORS = [
  '#22d3ee', // Cyan
  '#f472b6', // Pink
  '#a855f7', // Purple
  '#facc15', // Yellow
  '#4ade80', // Green
];

const TRANSLATIONS = {
  sv: {
    addNote: "Lägg till anteckning",
    settings: "Inställningar",
    help: "Hjälpcenter",
    allNotes: "Sparade anteckningar",
    emptyNote: "Tom anteckning... Klicka för att redigera",
    selectLanguage: "Välj Språk",
    close: "Stäng",
    placeholder: "Skriv något...",
    firstNoteHint: "Öppna en sida och håll inne högerklick i 1 sekund för att skapa din första anteckning",
    goToFile: "Gå till sida",
    settingsIntro: "Hantera din data och inställningar för NotePin.",
    dataTitle: "Data",
    exportBackup: "Exportera backup",
    exportBackupHint: "Ladda ner alla anteckningar som JSON",
    importBackup: "Importera backup",
    importBackupHint: "Importera anteckningar från en JSON-backup",
    importMerge: "Slå ihop",
    importReplace: "Ersätt",
    importNoFile: "Välj en JSON-fil först.",
    importSuccess: "Importerade {count} anteckningar.",
    importError: "Kunde inte importera filen. Kontrollera att det är en giltig NotePin-backup (JSON).",
    dangerZone: "Farozon",
    dangerZoneHint: "Åtgärder här kan inte ångras.",
    deleteAllData: "Radera all data",
    deleteAllDataHint: "Tar bort alla anteckningar och inställningar för NotePin från din webbläsare.",
    deleteConfirm: "Jag förstår, radera",
    cancel: "Avbryt",
    deleteSuccess: "All data raderad.",
    deleteError: "Kunde inte radera data. Försök igen.",
    howToTitle: "Så använder du NotePin",
    howToIntro: "Snabbguide (webbsidor): håll inne högerklick i 1 sekund för att öppna menyn, skapa en anteckning och börja skriva direkt.",
    helpTitle: "Hur fungerar NotePin?",
    helpIntro: "Välkommen till NotePin. Här är en snabb genomgång av hur du maximerar din produktivitet.",
    helpCta: "Börja använda NotePin",
    helpSteps: [
      { k: "create", n: 1, t: "Skapa", d: "Håll inne högerklick i 1 sekund var som helst på sidan för att fästa en ny anteckning." },
      { k: "write", n: 2, t: "Skriv direkt", d: "Klicka inuti en anteckning för att börja skriva. Allt sparas automatiskt." },
      { k: "organize", n: 3, t: "Organisera", d: "Dra i det övre handtaget för att flytta, eller i nedre hörnet för att ändra storlek." },
      { k: "share", n: 6, t: "Dela", d: "Exportera dina anteckningar som backup eller importera dem igen när du vill." },
      { k: "sync", n: 7, t: "Synka", d: "Din data kan synkas via Chrome när det är tillgängligt och annars sparas lokalt." }
    ],
    features: [
      { t: "Skapa", d: "Håll inne högerklick i 1 sekund var som helst på sidan för att fästa en ny anteckning." },
      { t: "Skriv direkt", d: "Klicka inuti en anteckning för att börja skriva. Allt sparas automatiskt." },
      { t: "Organisera", d: "Dra i det övre handtaget för att flytta, eller i nedre hörnet för att ändra storlek." },
      { t: "Layering", d: "Klicka på en anteckning för att lyfta fram den framför andra." },
      { t: "Källspårning", d: "Vi sparar automatiskt länken där du skapade din anteckning." }
    ],
    browserUrl: "https://notepin.app/modern-annotation-system",
    browserTitle: "Contextual Architecture",
    langName: "Svenska"
    ,
    wallOfFameTitle: "THE WALL OF FAME",
    wallOfFameDesc: "Stöd utvecklingen av NotePin genom att köpa mig en kaffe. Ditt bidrag hjälper till att hålla detta tillägg gratis och under ständig förbättring!",
    buyMeCoffee: "Klicka här för att köpa mig en kaffe"
  },
  en: {
    addNote: "Add Sticky Note",
    settings: "Settings",
    help: "Help Center",
    allNotes: "Saved Notes",
    emptyNote: "Empty note... Click to edit",
    selectLanguage: "Select Language",
    close: "Close",
    placeholder: "Write something...",
    firstNoteHint: "Open any page and hold right-click for 1 second to create your first note",
    goToFile: "Go to page",
    settingsIntro: "Manage your data and settings for NotePin.",
    dataTitle: "Data",
    exportBackup: "Export backup",
    exportBackupHint: "Download all notes as JSON",
    importBackup: "Import backup",
    importBackupHint: "Import notes from a JSON backup",
    importMerge: "Merge",
    importReplace: "Replace",
    importNoFile: "Choose a JSON file first.",
    importSuccess: "Imported {count} notes.",
    importError: "Could not import the file. Make sure it is a valid NotePin JSON backup.",
    dangerZone: "Danger Zone",
    dangerZoneHint: "Actions here cannot be undone.",
    deleteAllData: "Delete all data",
    deleteAllDataHint: "Removes all NotePin notes and settings from your browser.",
    deleteConfirm: "I understand, delete",
    cancel: "Cancel",
    deleteSuccess: "All data deleted.",
    deleteError: "Could not delete data. Please try again.",
    howToTitle: "How to use NotePin",
    howToIntro: "Quick guide (web pages): hold right-click for 1 second to open the menu, add a note, and start typing immediately.",
    helpTitle: "How does NotePin work?",
    helpIntro: "Welcome to NotePin. Here's a quick guide on how to maximize your productivity.",
    helpCta: "Start using NotePin",
    helpSteps: [
      { k: "create", n: 1, t: "Create", d: "Hold right-click for 1 second anywhere on the page to pin a new note." },
      { k: "write", n: 2, t: "Write instantly", d: "Click inside a note to start typing. Everything is auto-saved." },
      { k: "organize", n: 3, t: "Organize", d: "Drag the top handle to move, or the bottom corner to resize." },
      { k: "share", n: 6, t: "Share", d: "Export your notes as a backup and import them back anytime." },
      { k: "sync", n: 7, t: "Sync", d: "Your data can sync via Chrome when available, otherwise it stays local." }
    ],
    features: [
      { t: "Create", d: "Hold right-click for 1 second anywhere on the page to pin a new note." },
      { t: "Easy Edit", d: "Click inside any note to start typing. Everything is auto-saved." },
      { t: "Organize", d: "Drag the top handle to move, or the bottom corner to resize." },
      { t: "Layering", d: "Click on any note to bring it to the front of others." },
      { t: "Source Tracking", d: "We automatically save the link where you created each note." }
    ],
    browserUrl: "https://notepin.app/modern-annotation-system",
    browserTitle: "Contextual Architecture",
    langName: "English",
    wallOfFameTitle: "THE WALL OF FAME",
    wallOfFameDesc: "Support NotePin development by buying me a coffee. Your contribution helps keep this extension free and continuously improving!",
    buyMeCoffee: "Click here to buy me a coffee"
  },
  es: {
    addNote: "Agregar nota",
    settings: "Configuración",
    help: "Ayuda",
    allNotes: "Notas guardadas",
    emptyNote: "Nota vacía... Haz clic para editar",
    selectLanguage: "Seleccionar idioma",
    close: "Cerrar",
    placeholder: "Escribe algo...",
    firstNoteHint: "Abre una página y mantén pulsado el clic derecho durante 1 segundo para crear tu primera nota",
    goToFile: "Ir a la página",
    settingsIntro: "Gestiona tus datos y la configuración de NotePin.",
    dataTitle: "Datos",
    exportBackup: "Exportar copia",
    exportBackupHint: "Descarga todas las notas como JSON",
    importBackup: "Importar copia",
    importBackupHint: "Importa notas desde una copia JSON",
    importMerge: "Combinar",
    importReplace: "Reemplazar",
    importNoFile: "Primero elige un archivo JSON.",
    importSuccess: "Se importaron {count} notas.",
    importError: "No se pudo importar el archivo. Asegúrate de que sea una copia JSON válida de NotePin.",
    dangerZone: "Zona de peligro",
    dangerZoneHint: "Estas acciones no se pueden deshacer.",
    deleteAllData: "Borrar todos los datos",
    deleteAllDataHint: "Elimina todas las notas y ajustes de NotePin del navegador.",
    deleteConfirm: "Entiendo, borrar",
    cancel: "Cancelar",
    deleteSuccess: "Todos los datos se han borrado.",
    deleteError: "No se pudieron borrar los datos. Inténtalo de nuevo.",
    howToTitle: "Cómo usar NotePin",
    howToIntro: "Guía rápida (páginas web): mantén pulsado el clic derecho durante 1 segundo para abrir el menú, crear una nota y escribir al instante.",
    helpTitle: "¿Cómo funciona NotePin?",
    helpIntro: "Bienvenido a NotePin. Aquí tienes una guía rápida para maximizar tu productividad.",
    helpCta: "Empezar con NotePin",
    helpSteps: [
      { k: "create", n: 1, t: "Crear", d: "Mantén pulsado el clic derecho durante 1 segundo en cualquier lugar para fijar una nota nueva." },
      { k: "write", n: 2, t: "Escribir", d: "Haz clic dentro de una nota para empezar a escribir. Se guarda automáticamente." },
      { k: "organize", n: 3, t: "Organizar", d: "Arrastra el asa superior para mover o la esquina para redimensionar." },
      { k: "share", n: 6, t: "Compartir", d: "Exporta tus notas como copia y vuelve a importarlas cuando quieras." },
      { k: "sync", n: 7, t: "Sincronizar", d: "Los datos se sincronizan en Chrome cuando está disponible; si no, se guardan localmente." }
    ],
    features: [
      { t: "Crear", d: "Mantén pulsado el clic derecho durante 1 segundo en cualquier lugar para fijar una nota nueva." },
      { t: "Edición fácil", d: "Haz clic en la nota para escribir. Todo se guarda automáticamente." },
      { t: "Organizar", d: "Arrastra la barra superior para mover o la esquina para redimensionar." },
      { t: "Capas", d: "Haz clic en una nota para traerla al frente." },
      { t: "Seguimiento", d: "Guardamos automáticamente el enlace donde creaste cada nota." }
    ],
    browserUrl: "https://notepin.app/modern-annotation-system",
    browserTitle: "Contextual Architecture",
    langName: "Español",
    wallOfFameTitle: "THE WALL OF FAME",
    wallOfFameDesc: "Apoya el desarrollo de NotePin comprándome un café. ¡Tu contribución ayuda a mantener esta extensión gratis y en mejora constante!",
    buyMeCoffee: "Haz clic aquí para comprarme un café"
  },
  fr: {
    addNote: "Ajouter une note",
    settings: "Paramètres",
    help: "Aide",
    allNotes: "Notes enregistrées",
    emptyNote: "Note vide... Cliquez pour modifier",
    selectLanguage: "Choisir la langue",
    close: "Fermer",
    placeholder: "Écrivez quelque chose...",
    firstNoteHint: "Ouvrez une page et maintenez le clic droit pendant 1 seconde pour créer votre première note",
    goToFile: "Aller à la page",
    settingsIntro: "Gérez vos données et les paramètres de NotePin.",
    dataTitle: "Données",
    exportBackup: "Exporter une sauvegarde",
    exportBackupHint: "Télécharger toutes les notes en JSON",
    importBackup: "Importer une sauvegarde",
    importBackupHint: "Importer des notes depuis une sauvegarde JSON",
    importMerge: "Fusionner",
    importReplace: "Remplacer",
    importNoFile: "Choisissez d'abord un fichier JSON.",
    importSuccess: "{count} notes importées.",
    importError: "Impossible d'importer le fichier. Assurez-vous qu'il s'agit d'une sauvegarde JSON NotePin valide.",
    dangerZone: "Zone de danger",
    dangerZoneHint: "Ces actions sont irréversibles.",
    deleteAllData: "Tout supprimer",
    deleteAllDataHint: "Supprime toutes les notes et réglages NotePin du navigateur.",
    deleteConfirm: "Je comprends, supprimer",
    cancel: "Annuler",
    deleteSuccess: "Toutes les données ont été supprimées.",
    deleteError: "Impossible de supprimer les données. Réessayez.",
    howToTitle: "Comment utiliser NotePin",
    howToIntro: "Guide rapide (pages web) : maintenez le clic droit pendant 1 seconde pour ouvrir le menu, ajouter une note et écrire immédiatement.",
    helpTitle: "Comment fonctionne NotePin ?",
    helpIntro: "Bienvenue sur NotePin. Voici un guide rapide pour maximiser votre productivité.",
    helpCta: "Commencer avec NotePin",
    helpSteps: [
      { k: "create", n: 1, t: "Créer", d: "Maintenez le clic droit pendant 1 seconde n'importe où pour épingler une note." },
      { k: "write", n: 2, t: "Écrire", d: "Cliquez dans une note pour commencer à écrire. Tout est sauvegardé automatiquement." },
      { k: "organize", n: 3, t: "Organiser", d: "Faites glisser la poignée du haut pour déplacer, ou le coin pour redimensionner." },
      { k: "share", n: 6, t: "Partager", d: "Exportez vos notes en sauvegarde et importez-les quand vous voulez." },
      { k: "sync", n: 7, t: "Synchroniser", d: "Les données se synchronisent via Chrome si possible, sinon elles restent locales." }
    ],
    features: [
      { t: "Créer", d: "Maintenez le clic droit pendant 1 seconde n'importe où pour épingler une note." },
      { t: "Édition directe", d: "Cliquez dans une note pour écrire. Tout est sauvegardé automatiquement." },
      { t: "Organiser", d: "Faites glisser la poignée du haut pour déplacer, ou le coin pour redimensionner." },
      { t: "Superposition", d: "Cliquez sur une note pour la mettre au premier plan." },
      { t: "Traçage", d: "Nous enregistrons le lien source pour chaque annotation." }
    ],
    browserUrl: "https://notepin.app/modern-annotation-system",
    browserTitle: "Contextual Architecture",
    langName: "Français",
    wallOfFameTitle: "THE WALL OF FAME",
    wallOfFameDesc: "Soutenez le développement de NotePin en m’offrant un café. Votre contribution aide à garder cette extension gratuite et en amélioration continue !",
    buyMeCoffee: "Cliquez ici pour m’offrir un café"
  }
};

type Language = keyof typeof TRANSLATIONS;
type PendingAnchor = Pick<
  NoteData,
  'selector' | 'offsetX' | 'offsetY' | 'containerSelector' | 'containerX' | 'containerY' | 'anchorTag' | 'anchorText'
>;

const LANGUAGE_FLAGS: Record<Language, string> = {
  sv: '🇸🇪',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
};

const LANGUAGE_CODES: Record<Language, string> = {
  sv: 'SE',
  en: 'GB',
  es: 'ES',
  fr: 'FR',
};

export default function App() {
  const isExtension = typeof chrome !== 'undefined' && !!chrome.storage;
  const searchParams = new URLSearchParams(window.location.search);
  const view = searchParams.get('view');
  const isStandaloneSettings = view === 'settings';
  const isExtensionPage = window.location.protocol === 'chrome-extension:';
  const isPopup = isExtension && isExtensionPage && !isStandaloneSettings && window.innerWidth <= 460 && window.innerHeight <= 720;
  const isContentScript = isExtension && !isExtensionPage;

  const getAssetUrl = (path: string) => {
    if (isExtension && typeof chrome.runtime?.getURL === 'function') {
      const relativePath = path.startsWith('/') ? path.slice(1) : path;
      return chrome.runtime.getURL(relativePath);
    }
    return path;
  };

  const [lang, setLang] = useState<Language>('sv');
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabHost, setActiveTabHost] = useState<string | null>(null);
  const [storageScope, setStorageScope] = useState<'sync' | 'local'>('local');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDanger, setShowDanger] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRafRef = useRef<number | null>(null);
  const missingAnchorAttemptRef = useRef<Record<string, number>>({});
  const mutationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesRef = useRef<NoteData[]>([]);
  const pendingAnchorRef = useRef<PendingAnchor | null>(null);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Export data as JSON file
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `notepin_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Polling for URL changes (important for SPAs like Stadium/YouTube)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.location.href !== currentUrl) {
        setCurrentUrl(window.location.href);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [currentUrl]);

  useEffect(() => {
    if (!isExtension || !isPopup) return;
    try {
      if (!chrome.runtime?.id) return;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime?.lastError) return;
        const url = tabs?.[0]?.url;
        if (!url) {
          setActiveTabHost(null);
          return;
        }
        try {
          setActiveTabHost(new URL(url).hostname);
        } catch {
          setActiveTabHost(null);
        }
      });
    } catch {
      setActiveTabHost(null);
    }
  }, [isExtension, isPopup]);
  
  
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (isExtension) {
        try {
          if (!chrome.runtime?.id) return;
          const get = (area: chrome.storage.StorageArea, keys: string[]) =>
            new Promise<Record<string, any>>((resolve) => area.get(keys, resolve));

          const keys = ['note-overlay-data', 'note-lang'];
          const syncResult = await get(chrome.storage.sync, keys);
          if (cancelled) return;

          if (syncResult['note-overlay-data'] || syncResult['note-lang']) {
            if (syncResult['note-overlay-data']) setNotes(syncResult['note-overlay-data']);
            if (syncResult['note-lang']) setLang(syncResult['note-lang'] as Language);
            setStorageScope('sync');
            setIsLoaded(true);
            return;
          }

          const localResult = await get(chrome.storage.local, keys);
          if (cancelled) return;
          if (localResult['note-overlay-data']) setNotes(localResult['note-overlay-data']);
          if (localResult['note-lang']) setLang(localResult['note-lang'] as Language);
          const hasLocalData = !!(localResult['note-overlay-data'] || localResult['note-lang']);
          if (hasLocalData) {
            const set = (area: chrome.storage.StorageArea, items: Record<string, any>) =>
              new Promise<void>((resolve, reject) =>
                area.set(items, () => (chrome.runtime?.lastError ? reject(chrome.runtime.lastError) : resolve())),
              );
            try {
              await set(chrome.storage.sync, {
                'note-overlay-data': localResult['note-overlay-data'],
                'note-lang': localResult['note-lang'],
              });
              setStorageScope('sync');
            } catch {
              setStorageScope('local');
            }
          } else {
            setStorageScope('local');
          }
          setIsLoaded(true);
        } catch {
          if (!cancelled) setIsLoaded(true);
        }
      } else {
        const savedNotes = localStorage.getItem('note-overlay-data');
        const savedLang = localStorage.getItem('note-lang');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedLang) setLang(savedLang as Language);
        setIsLoaded(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isExtension]);

  // Listen for the hold-to-open event dispatched from content.tsx
  useEffect(() => {
    if (!isContentScript) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; anchor?: PendingAnchor }>;
      pendingAnchorRef.current = ce.detail.anchor ?? null;
      setMenuPos({ x: ce.detail.x, y: ce.detail.y });
    };
    window.addEventListener('noteoverlay:open-menu', handler);
    return () => window.removeEventListener('noteoverlay:open-menu', handler);
  }, [isContentScript]);

  // Close the context menu when content.tsx signals an outside left-click
  useEffect(() => {
    if (!isContentScript) return;
    const handler = () => setMenuPos(null);
    window.addEventListener('noteoverlay:close-menu', handler);
    return () => window.removeEventListener('noteoverlay:close-menu', handler);
  }, [isContentScript]);

  // Auto-scroll to a note when the page is opened via "Gå till sida" (jump-hash)
  useEffect(() => {
    if (!isContentScript) return;
    if (!isLoaded) return;

    const hash = window.location.hash;
    const match = hash.match(/#notepin-jump-(.+)/);
    if (!match) return;

    const jumpId = match[1];
    const targetNote = notesRef.current.find(n => n.id === jumpId);
    if (!targetNote) return;

    // Scroll so the note is visible (note.y is page-absolute, subtract a small margin)
    const scrollTarget = Math.max(0, targetNote.y - 80);
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });

    // Clean the hash from the URL bar without reloading
    try {
      const cleanUrl = window.location.href.split('#notepin-jump-')[0];
      window.history.replaceState(null, '', cleanUrl);
    } catch {}
  }, [isContentScript, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      if (isExtension) {
        try {
          if (!chrome.runtime?.id) return;

          const set = (area: chrome.storage.StorageArea, items: Record<string, any>) =>
            new Promise<void>((resolve, reject) =>
              area.set(items, () => (chrome.runtime?.lastError ? reject(chrome.runtime.lastError) : resolve())),
            );

          const payload = {
            'note-overlay-data': notes,
            'note-lang': lang,
          };

          const primary = storageScope === 'sync' ? chrome.storage.sync : chrome.storage.local;
          set(primary, payload).catch(async () => {
            if (storageScope !== 'local') setStorageScope('local');
            try {
              await set(chrome.storage.local, payload);
            } catch {}
          });
        } catch {}
      } else {
        localStorage.setItem('note-overlay-data', JSON.stringify(notes));
        localStorage.setItem('note-lang', lang);
      }
    }, 250);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [notes, lang, isLoaded, isExtension, storageScope]);

  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const openSettingsWindow = useCallback(() => {
    if (isContentScript) {
      setShowSettings(true);
      setMenuPos(null);
      return;
    }

    if (isExtension) {
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' }, (res) => {
          setMenuPos(null);
          if (chrome.runtime?.lastError || !res?.ok) {
            console.error('NotePin failed to open settings.');
          }
        });
        if (isPopup) window.close();
        return;
      } catch {
        setMenuPos(null);
        if (isPopup) window.close();
        return;
      }
    }

    const url = `${window.location.pathname}?view=settings`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMenuPos(null);
    if (isPopup) window.close();
  }, [isContentScript, isExtension, isPopup]);
  
  // States for the list window position and size
  const [listSize, setListSize] = useState({ width: 640, height: 760 });
  const listResizeRef = React.useRef<HTMLDivElement>(null);
  const listDragControls = useDragControls();

  const t = TRANSLATIONS[lang];
  const helpSteps = ((t as any).helpSteps ?? (t as any).features ?? []) as any[];
  const helpCta = ((t as any).helpCta ?? t.close) as string;
  const hasAnchors = isContentScript && notes.some((n) => !!n.selector || !!n.containerSelector);

  const formatCount = useCallback((template: string, count: number) => template.replace('{count}', String(count)), []);

  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const contactEmail = "bynrnworld@gmail.com";

  const copyEmail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }, []);

  const Footer = () => (
    <div className="mt-auto pt-10 pb-6 text-center space-y-1.5 opacity-60 transition-opacity hover:opacity-100">
      <div className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">NotePin</div>
      <div className="text-[9px] text-slate-500 font-bold">Created 2026 by Robin Ayzit</div>
      <div 
        onClick={copyEmail}
        className="flex items-center justify-center gap-1.5 text-[10px] text-cyan-400 font-black cursor-pointer hover:text-cyan-300 transition-colors group"
      >
        <span>{contactEmail}</span>
        {copiedEmail ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-slate-600 group-hover:scale-110 transition-transform" />}
      </div>
    </div>
  );

  const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

  const isNoteData = (v: unknown): v is NoteData => {
    if (!isPlainObject(v)) return false;
    if (typeof v.id !== 'string') return false;
    if (!isFiniteNumber(v.x) || !isFiniteNumber(v.y)) return false;
    if (!isFiniteNumber(v.width) || !isFiniteNumber(v.height)) return false;
    if (typeof v.content !== 'string') return false;
    if (typeof v.color !== 'string') return false;
    if (!isFiniteNumber(v.timestamp)) return false;
    if (typeof v.url !== 'string') return false;
    if (typeof v.urlTitle !== 'string') return false;
    if (v.selector !== undefined && typeof v.selector !== 'string') return false;
    if (v.offsetX !== undefined && !isFiniteNumber(v.offsetX)) return false;
    if (v.offsetY !== undefined && !isFiniteNumber(v.offsetY)) return false;
    if (v.anchorTag !== undefined && typeof v.anchorTag !== 'string') return false;
    if (v.anchorText !== undefined && typeof v.anchorText !== 'string') return false;
    if (v.isMinimized !== undefined && typeof v.isMinimized !== 'boolean') return false;
    return true;
  };

  const handleImport = useCallback(
    async (mode: 'merge' | 'replace') => {
      setImportMessage(null);
      if (!importFile) {
        setImportMessage({ type: 'error', text: t.importNoFile });
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(await importFile.text());
      } catch {
        setImportMessage({ type: 'error', text: t.importError });
        return;
      }

      if (!Array.isArray(parsed)) {
        setImportMessage({ type: 'error', text: t.importError });
        return;
      }

      const imported = parsed.filter(isNoteData);
      if (imported.length !== parsed.length) {
        setImportMessage({ type: 'error', text: t.importError });
        return;
      }

      const normalizedImported = imported.map((n) => ({
        ...n,
        url: normalizeUrl(n.url),
      }));

      if (mode === 'replace') {
        setNotes(normalizedImported);
      } else {
        setNotes((prev) => {
          const byId = new Map<string, NoteData>(prev.map((n) => [n.id, n]));
          for (const n of normalizedImported) byId.set(n.id, n);
          return Array.from(byId.values());
        });
      }

      setImportMessage({ type: 'success', text: formatCount(t.importSuccess, normalizedImported.length) });
      setImportFile(null);
    },
    [formatCount, importFile, t],
  );

  const clearAllData = useCallback(async () => {
    setDeleteMessage(null);
    setDeleteBusy(true);
    try {
      if (isExtension) {
        if (chrome.runtime?.id) {
          const clear = (area: chrome.storage.StorageArea) =>
            new Promise<void>((resolve, reject) =>
              area.clear(() => (chrome.runtime?.lastError ? reject(chrome.runtime.lastError) : resolve())),
            );
          await Promise.allSettled([clear(chrome.storage.sync), clear(chrome.storage.local)]);
        }
      } else {
        localStorage.removeItem('note-overlay-data');
        localStorage.removeItem('note-lang');
      }

      setNotes([]);
      setLang('sv');
      setStorageScope(isExtension ? 'sync' : 'local');
      setImportFile(null);
      setImportMessage(null);
      setShowDanger(false);
      setDeleteMessage({ type: 'success', text: t.deleteSuccess });
    } catch {
      setDeleteMessage({ type: 'error', text: t.deleteError });
    } finally {
      setDeleteBusy(false);
    }
  }, [isExtension, t]);

  // List resize logic
  useEffect(() => {
    const minWidth = 380;
    const minHeight = 480;
    let startX: number;
    let startY: number;
    let startWidth: number;
    let startHeight: number;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = listSize.width;
      startHeight = listSize.height;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(minWidth, startWidth + (e.clientX - startX));
      const newHeight = Math.max(minHeight, startHeight + (e.clientY - startY));
      setListSize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const resizer = listResizeRef.current;
    if (resizer) resizer.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (resizer) resizer.removeEventListener('mousedown', onMouseDown);
    };
  }, [showAllNotes, showSettings, listSize.width, listSize.height]);

  // Removed old localStorage effects as they are now handled in the unified useEffect above

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const normalizeUrl = useCallback((url: string) => {
    try {
      // Strip jump hashes and trailing slashes
      const u = new URL(url.split('#notepin-jump-')[0]);
      let p = u.pathname;
      if (p.endsWith('/') && p.length > 1) p = p.slice(0, -1);
      return u.origin + p + u.search + u.hash;
    } catch (e) {
      return url.split('#notepin-jump-')[0].replace(/\/$/, '');
    }
  }, []);

  const getUniqueSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`;
    if (el.tagName === 'BODY') return 'body';
    
    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\s+/).filter(c => !c.includes(':')).join('.');
      if (classes) selector += `.${classes}`;
    }
    
    // Fallback to nth-child if needed
    const parent = el.parentElement;
    if (parent) {
      const children = Array.from(parent.children);
      const index = children.indexOf(el) + 1;
      selector = `${getUniqueSelector(parent)} > ${selector}:nth-child(${index})`;
    }
    
    return selector;
  };

  const findScrollableAncestor = (start: HTMLElement | null): HTMLElement | null => {
    const isScrollable = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const canScrollY =
        !['visible', 'clip'].includes(overflowY) &&
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        el.scrollHeight > el.clientHeight + 4;
      const canScrollX =
        !['visible', 'clip'].includes(overflowX) &&
        (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') &&
        el.scrollWidth > el.clientWidth + 4;
      return canScrollY || canScrollX;
    };

    let el: HTMLElement | null = start;
    for (let i = 0; i < 16 && el; i++) {
      if (el.tagName === 'HTML' || el.tagName === 'BODY') return null;
      if (isScrollable(el)) return el;
      el = el.parentElement;
    }
    return null;
  };

  const findElementByFallback = useCallback((tag: string, text: string): HTMLElement | null => {
    const query = text.trim().replace(/\s+/g, ' ');
    if (query.length < 3) return null;
    const selector = tag.toLowerCase();
    let nodes: Element[];
    try {
      nodes = Array.from(document.querySelectorAll(selector));
    } catch {
      return null;
    }
    const limit = 400;
    for (let i = 0; i < Math.min(nodes.length, limit); i++) {
      const el = nodes[i] as HTMLElement;
      const hay = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (hay && hay.includes(query)) return el;
    }
    return null;
  }, []);

  const updateAnchors = useCallback(() => {
    // Inaktiverad - vi vill inte att anteckningar ska följa med vid scroll
    return;
  }, []);

  const requestAnchorUpdate = useCallback(() => {
    if (anchorRafRef.current !== null) return;
    anchorRafRef.current = requestAnimationFrame(() => {
      anchorRafRef.current = null;
      updateAnchors();
    });
  }, [updateAnchors]);

  useEffect(() => {
    if (!isContentScript) return;
    if (!hasAnchors) return;

    const schedule = () => {
      if (mutationTimerRef.current) return;
      mutationTimerRef.current = setTimeout(() => {
        mutationTimerRef.current = null;
        requestAnchorUpdate();
      }, 250);
    };

    const onResize = () => {
      schedule();
    };

    const onScroll = () => {
      requestAnchorUpdate();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });

    let watchRaf: number | null = null;
    let lastWinX = window.scrollX;
    let lastWinY = window.scrollY;
    const lastContainers = new Map<string, { left: number; top: number }>();

    const watch = () => {
      watchRaf = requestAnimationFrame(watch);
      let changed = false;

      if (window.scrollX !== lastWinX || window.scrollY !== lastWinY) {
        lastWinX = window.scrollX;
        lastWinY = window.scrollY;
        changed = true;
      }

      const containerSelectors = new Set<string>();
      for (const n of notesRef.current) {
        if (n.containerSelector) containerSelectors.add(n.containerSelector);
      }

      for (const sel of containerSelectors) {
        let el: HTMLElement | null = null;
        try {
          el = document.querySelector(sel) as HTMLElement | null;
        } catch {
          el = null;
        }
        if (!el) continue;

        const prev = lastContainers.get(sel);
        const curLeft = el.scrollLeft;
        const curTop = el.scrollTop;
        if (!prev || prev.left !== curLeft || prev.top !== curTop) {
          lastContainers.set(sel, { left: curLeft, top: curTop });
          changed = true;
        }
      }

      if (changed) requestAnchorUpdate();
    };

    watchRaf = requestAnimationFrame(watch);

    const observer = new MutationObserver(() => {
      schedule();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    schedule();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      if (watchRaf !== null) cancelAnimationFrame(watchRaf);
      observer.disconnect();
      if (mutationTimerRef.current) {
        clearTimeout(mutationTimerRef.current);
        mutationTimerRef.current = null;
      }
      if (anchorRafRef.current !== null) {
        cancelAnimationFrame(anchorRafRef.current);
        anchorRafRef.current = null;
      }
    };
  }, [hasAnchors, isContentScript, requestAnchorUpdate]);

  const addNote = useCallback(() => {
    if (!menuPos) return;
    
    const newNote: NoteData = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      x: menuPos.x,
      y: menuPos.y,
      width: 256,
      height: 160,
      content: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      timestamp: Date.now(),
      url: normalizeUrl(window.location.href),
      urlTitle: document.title || t.browserTitle,
      // Ingen förankring - anteckningen är fri och viewport-fixad
      selector: undefined,
      offsetX: undefined,
      offsetY: undefined,
      containerSelector: undefined,
      containerX: undefined,
      containerY: undefined,
      anchorTag: undefined,
      anchorText: undefined,
    };
    
    setNotes(prev => [...prev, newNote]);
    setMenuPos(null);
  }, [menuPos, t, normalizeUrl]);

  const updateNote = (id: string, updates: Partial<NoteData>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const bringToFront = (id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note) return prev;
      // Update timestamp to now to make it the "newest" (top) note
      return prev.map(n => n.id === id ? { ...n, timestamp: Date.now() } : n);
    });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const closeModal = () => {
    setShowSettings(false);
    setShowAllNotes(false);
    setShowHelp(false);
  };

  if (isStandaloneSettings) {
    return (
      <div className="relative font-sans min-h-screen bg-[#0f172a]">
        <div className="absolute inset-0 mesh-bg z-0 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <img src={getAssetUrl('/icons/icon48.png')} className="w-8 h-8 object-contain" alt="Logo" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-black text-3xl tracking-tight leading-tight flex items-center gap-3">
                  NotePin
                  <span className="text-[11px] font-black bg-cyan-500/10 px-2 py-1 rounded-lg text-cyan-400 border border-cyan-500/20 shadow-lg">v1.0.2</span>
                </div>
                <div className="text-slate-300/70 text-xs font-black tracking-[0.25em] uppercase">{t.settings}</div>
              </div>
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm font-black hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              {t.close}
            </button>
          </div>

          <div className="glass rounded-3xl border border-white/10 p-8">
            <p className="text-slate-200/80 text-base leading-relaxed mb-6">
              {t.settingsIntro}
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em]">
                    {t.selectLanguage}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-bold">
                    <span className="text-base leading-none">{LANGUAGE_FLAGS[lang]}</span>
                    {LANGUAGE_CODES[lang]}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {(Object.keys(TRANSLATIONS) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                        lang === l ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{LANGUAGE_FLAGS[l]}</span>
                        <span className={`text-xs font-black tracking-widest ${lang === l ? 'text-cyan-200' : 'text-white/70'}`}>
                          {LANGUAGE_CODES[l]}
                        </span>
                      </div>
                      <div className={`mt-1 text-[11px] font-bold ${lang === l ? 'text-white' : 'text-white/70'}`}>
                        {TRANSLATIONS[l].langName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-5">
                <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em] mb-4">
                  {(t as any).dataTitle}
                </div>
                <div className="grid gap-3">
                  <button
                    onClick={exportData}
                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                        <Download size={20} />
                      </div>
                      <div className="text-left">
                        <span className="text-white font-black block">{t.exportBackup}</span>
                        <span className="text-xs text-slate-200/70">{t.exportBackupHint}</span>
                      </div>
                    </div>
                  </button>

                  <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Upload size={20} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-black block">{t.importBackup}</span>
                        <span className="text-xs text-slate-200/70">{t.importBackupHint}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <label className="px-3 py-2.5 rounded-2xl bg-slate-950/40 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setImportFile(file);
                            setImportMessage(null);
                          }}
                        />
                        <span className="text-sm text-white/80 truncate block">
                          {importFile ? importFile.name : 'backup.json'}
                        </span>
                      </label>
                      <button
                        onClick={() => handleImport('merge')}
                        className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-sm font-black hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                      >
                        {t.importMerge}
                      </button>
                      <button
                        onClick={() => handleImport('replace')}
                        className="px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-black hover:bg-red-500 hover:text-white transition-colors"
                      >
                        {t.importReplace}
                      </button>
                    </div>
                    {importMessage && (
                      <div
                        className={`mt-3 px-4 py-3 rounded-2xl border text-sm ${
                          importMessage.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                            : 'bg-red-500/10 border-red-500/20 text-red-200'
                        }`}
                      >
                        {importMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950/40 border border-white/10 overflow-hidden mt-4">
              <div className="px-5 py-4 flex items-center gap-2 border-b border-white/10 bg-white/5">
                <Info size={18} className="text-cyan-300" />
                <span className="text-white font-black text-lg">{t.howToTitle}</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-slate-50 text-lg leading-relaxed">{t.howToIntro}</p>
                <div className="space-y-3">
                  {t.features.map((f: any, i: number) => (
                    <div key={i} className="rounded-3xl bg-white/5 border border-white/10 p-4 flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 text-cyan-200 flex items-center justify-center font-black shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-black text-lg leading-tight">{f.t}</div>
                        <div className="mt-1 text-slate-50/85 text-base leading-relaxed">{f.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/25 bg-red-500/5 overflow-hidden mt-4">
              <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-red-500/15 bg-red-500/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-300">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-black text-lg leading-tight">{t.dangerZone}</div>
                    <div className="text-red-200/70 text-sm">{t.dangerZoneHint}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDanger((v) => !v);
                    setDeleteMessage(null);
                  }}
                  className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-bold hover:bg-red-500/20 transition-colors"
                >
                  {t.deleteAllData}
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-slate-100/80 text-base leading-relaxed">{t.deleteAllDataHint}</p>
                {showDanger && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowDanger(false)}
                      className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm font-bold hover:bg-white/10 transition-colors"
                      disabled={deleteBusy}
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={clearAllData}
                      className="px-4 py-2 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors disabled:opacity-60"
                      disabled={deleteBusy}
                    >
                      {t.deleteConfirm}
                    </button>
                  </div>
                )}
                {deleteMessage && (
                  <div
                    className={`px-4 py-3 rounded-2xl border text-sm ${
                      deleteMessage.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                        : 'bg-red-500/10 border-red-500/20 text-red-200'
                    }`}
                  >
                    {deleteMessage.text}
                  </div>
                )}
              </div>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative mt-4 overflow-hidden rounded-[28px] border border-cyan-300/35 bg-gradient-to-br from-[#071c2c] via-[#06233a] to-[#081421] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.6)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.20),transparent_46%)]" />
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                whileHover={{ x: 520, opacity: 1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="pointer-events-none absolute -inset-y-12 -left-28 w-48 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />

              <div className="relative flex items-start gap-5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300/95 to-orange-600 border border-white/10 shadow-[0_18px_54px_rgba(249,115,22,0.45)] flex items-center justify-center shrink-0">
                  <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-14 h-14 object-contain" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 text-cyan-200 font-black tracking-[0.22em] uppercase text-[11px]">
                    <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-6 h-6 object-contain opacity-90" />
                    <span className="truncate">{(t as any).wallOfFameTitle}</span>
                  </div>
                  <p className="mt-3 text-slate-100/80 text-base leading-relaxed">
                    {(t as any).wallOfFameDesc}
                  </p>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://buymeacoffee.com/nrnworld', '_blank', 'noopener,noreferrer')}
                    className="group mt-4 inline-flex items-center gap-3 rounded-2xl bg-cyan-300 px-6 py-3 text-slate-950 font-black shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071c2c]"
                  >
                    <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
                      <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-6 h-6 object-contain" />
                    </span>
                    <span className="truncate">{(t as any).buyMeCoffee}</span>
                    <ArrowRight size={16} className="ml-1 text-slate-900/70 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  // Global error handler
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error:', error.error);
      // You can add more error handling logic here, such as logging to a server
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div 
      className={`relative font-sans select-none transition-colors duration-500 ${
        isPopup ? 'w-[400px] h-[600px] bg-[#0f172a] overflow-hidden' : isContentScript ? 'fixed inset-0 w-full h-full bg-transparent pointer-events-none' : 'w-full min-h-screen bg-[#0f172a]'
      } ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
      onContextMenu={isContentScript ? undefined : handleContextMenu}
    >
      {!isExtension && <div className="absolute inset-0 mesh-bg z-0 pointer-events-none" />}

      {(!isExtension || isPopup) && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="flex-1 max-w-2xl mx-auto h-8 bg-slate-800/50 rounded-lg flex items-center px-3 gap-2 border border-white/5">
              <Lock size={14} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium truncate">{isExtension ? 'Extension Mode' : t.browserUrl}</span>
              <RefreshCw size={12} className="ml-auto text-slate-500" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="glass px-3 py-1 text-[10px] text-white font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs leading-none">{LANGUAGE_FLAGS[lang]}</span>
                {LANGUAGE_CODES[lang]}
              </div>
              <button 
                onClick={openSettingsWindow}
                className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs"
              >
                <Globe size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopup && !showSettings && !showAllNotes && !showHelp && (
        <div className="flex flex-col h-full p-6 pt-16 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 flex items-center justify-center mb-4">
              <img src={getAssetUrl('/icons/icon128.png')} className="w-full h-full object-contain drop-shadow-2xl" alt="Logo" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">NotePin</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Version 1.0.2</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass p-4 rounded-2xl flex flex-col items-center text-center border border-white/5">
              <span className="text-2xl font-black text-white">{notes.length}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Totalt sparade</span>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col items-center text-center border border-white/5">
               <span className="text-2xl font-black text-cyan-400">
                 {activeTabHost
                   ? notes.filter(n => {
                       try {
                         return new URL(n.url).hostname === activeTabHost;
                       } catch {
                         return false;
                       }
                     }).length
                   : 0}
               </span>
               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Denna sajt</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setShowAllNotes(true)}
              className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/10 transition-all group border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <List size={20} />
                </div>
                <span className="text-white font-bold">{t.allNotes}</span>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={openSettingsWindow}
              className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/10 transition-all group border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/20 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-colors">
                  <Globe size={20} />
                </div>
                <span className="text-white font-bold">{t.settings}</span>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => setShowHelp(true)}
              className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/10 transition-all group border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <Info size={20} />
                </div>
                <span className="text-white font-bold">{t.help}</span>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <Footer />
        </div>
      )}

      <AnimatePresence>
        {(showSettings || showAllNotes || showHelp) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-6 pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              drag
              dragControls={listDragControls}
              dragListener={false}
              dragMomentum={false}
              style={{ 
                width: listSize.width, 
                height: listSize.height,
                maxWidth: 'calc(100vw - 48px)',
                maxHeight: 'calc(100vh - 48px)'
              }}
              className="glass rounded-3xl shadow-2xl relative flex flex-col pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header/Drag Handle */}
              <div 
                onPointerDown={(e) => listDragControls.start(e)}
                className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 cursor-move shrink-0 rounded-t-3xl"
              >
                <div className="flex items-center gap-2">
                  <GripHorizontal size={14} className="text-white/40" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Panel</span>
                  <span className="text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded text-white/30 ml-1">v1.0.2</span>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-1 hover:bg-white/10 rounded-full text-white/40 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 flex flex-col">
                {showSettings ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-3xl font-black text-white mb-3 flex items-center gap-3 tracking-tight">
                      <Globe className="text-cyan-400" />
                      {t.settings}
                      <span className="text-[11px] font-black bg-cyan-500/10 px-2 py-1 rounded-lg text-cyan-400 border border-cyan-500/20 shadow-lg ml-2 self-center">v1.0.2</span>
                    </h2>
                    <p className="text-slate-200/80 text-base leading-relaxed mb-6">
                      {t.settingsIntro}
                    </p>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em]">
                            {t.selectLanguage}
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-xs font-bold">
                            <span className="text-base leading-none">{LANGUAGE_FLAGS[lang]}</span>
                            {LANGUAGE_CODES[lang]}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                          {(Object.keys(TRANSLATIONS) as Language[]).map((l) => (
                            <button
                              key={l}
                              onClick={() => setLang(l)}
                              className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                                lang === l
                                  ? 'bg-cyan-500/20 border-cyan-500/50'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none">{LANGUAGE_FLAGS[l]}</span>
                                <span className={`text-xs font-black tracking-widest ${lang === l ? 'text-cyan-200' : 'text-white/70'}`}>
                                  {LANGUAGE_CODES[l]}
                                </span>
                              </div>
                              <div className={`mt-1 text-[11px] font-bold ${lang === l ? 'text-white' : 'text-white/70'}`}>
                                {TRANSLATIONS[l].langName}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-5">
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em] mb-4">
                          {(t as any).dataTitle}
                        </div>
                        <div className="grid gap-3">
                          <button 
                            onClick={exportData}
                            className="w-full flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                                <Download size={20} />
                              </div>
                              <div className="text-left">
                                <span className="text-white font-black block">{t.exportBackup}</span>
                                <span className="text-xs text-slate-200/70">{t.exportBackupHint}</span>
                              </div>
                            </div>
                          </button>

                          <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                                <Upload size={20} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-white font-black block">{t.importBackup}</span>
                                <span className="text-xs text-slate-200/70">{t.importBackupHint}</span>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                              <label className="px-3 py-2.5 rounded-2xl bg-slate-950/40 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                                <input
                                  type="file"
                                  accept="application/json,.json"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setImportFile(file);
                                    setImportMessage(null);
                                  }}
                                />
                                <span className="text-sm text-white/80 truncate block">
                                  {importFile ? importFile.name : 'backup.json'}
                                </span>
                              </label>
                              <button
                                onClick={() => handleImport('merge')}
                                className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-sm font-black hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                              >
                                {t.importMerge}
                              </button>
                              <button
                                onClick={() => handleImport('replace')}
                                className="px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-black hover:bg-red-500 hover:text-white transition-colors"
                              >
                                {t.importReplace}
                              </button>
                            </div>
                            {importMessage && (
                              <div
                                className={`mt-3 px-4 py-3 rounded-2xl border text-sm ${
                                  importMessage.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                    : 'bg-red-500/10 border-red-500/20 text-red-200'
                                }`}
                              >
                                {importMessage.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-950/40 border border-white/10 overflow-hidden mt-4">
                      <div className="px-5 py-4 flex items-center gap-2 border-b border-white/10 bg-white/5">
                        <Info size={18} className="text-cyan-300" />
                        <span className="text-white font-black text-lg">{t.howToTitle}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <p className="text-slate-50 text-lg leading-relaxed">{t.howToIntro}</p>
                        <div className="space-y-3">
                          {t.features.map((f: any, i: number) => (
                            <div key={i} className="rounded-3xl bg-white/5 border border-white/10 p-4 flex gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 text-cyan-200 flex items-center justify-center font-black shrink-0">
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-black text-lg leading-tight">{f.t}</div>
                                <div className="mt-1 text-slate-50/85 text-base leading-relaxed">{f.d}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                      <div className="rounded-3xl border border-red-500/25 bg-red-500/5 overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-red-500/15 bg-red-500/5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-300">
                              <AlertTriangle size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-white font-black text-lg leading-tight">{t.dangerZone}</div>
                              <div className="text-red-200/70 text-sm">{t.dangerZoneHint}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowDanger((v) => !v);
                              setDeleteMessage(null);
                            }}
                            className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-bold hover:bg-red-500/20 transition-colors"
                          >
                            {t.deleteAllData}
                          </button>
                        </div>
                        <div className="p-5 space-y-4">
                          <p className="text-slate-100/80 text-base leading-relaxed">{t.deleteAllDataHint}</p>
                          {showDanger && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setShowDanger(false)}
                                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm font-bold hover:bg-white/10 transition-colors"
                                disabled={deleteBusy}
                              >
                                {t.cancel}
                              </button>
                              <button
                                onClick={clearAllData}
                                className="px-4 py-2 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors disabled:opacity-60"
                                disabled={deleteBusy}
                              >
                                {t.deleteConfirm}
                              </button>
                            </div>
                          )}
                          {deleteMessage && (
                            <div
                              className={`px-4 py-3 rounded-2xl border text-sm ${
                                deleteMessage.type === 'success'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                  : 'bg-red-500/10 border-red-500/20 text-red-200'
                              }`}
                            >
                              {deleteMessage.text}
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        className="relative mt-4 overflow-hidden rounded-[28px] border border-cyan-300/35 bg-gradient-to-br from-[#071c2c] via-[#06233a] to-[#081421] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.6)]"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.20),transparent_46%)]" />
                        <motion.div
                          initial={{ x: -120, opacity: 0 }}
                          whileHover={{ x: 520, opacity: 1 }}
                          transition={{ duration: 0.85, ease: 'easeOut' }}
                          className="pointer-events-none absolute -inset-y-12 -left-28 w-48 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />

                        <div className="relative flex items-start gap-5">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300/95 to-orange-600 border border-white/10 shadow-[0_18px_54px_rgba(249,115,22,0.45)] flex items-center justify-center shrink-0">
                            <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-14 h-14 object-contain" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 text-cyan-200 font-black tracking-[0.22em] uppercase text-[11px]">
                              <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-6 h-6 object-contain opacity-90" />
                              <span className="truncate">{(t as any).wallOfFameTitle}</span>
                            </div>
                            <p className="mt-3 text-slate-100/80 text-base leading-relaxed">
                              {(t as any).wallOfFameDesc}
                            </p>

                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.98 }}
                              onClick={() => window.open('https://buymeacoffee.com/nrnworld', '_blank', 'noopener,noreferrer')}
                              className="group mt-4 inline-flex items-center gap-3 rounded-2xl bg-cyan-300 px-6 py-3 text-slate-950 font-black shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071c2c]"
                            >
                              <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
                                <img src={getAssetUrl('/icons/Kaffe.icon.png')} alt="" className="w-6 h-6 object-contain" />
                              </span>
                              <span className="truncate">{(t as any).buyMeCoffee}</span>
                              <ArrowRight size={16} className="ml-1 text-slate-900/70 transition-transform group-hover:translate-x-0.5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                      <Footer />
                  </div>
                ) : showHelp ? (
                  <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="shrink-0">
                      <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3 tracking-tight">
                        <Shield className="text-cyan-400" />
                        {t.helpTitle}
                      </h2>
                      <div className="rounded-3xl bg-slate-950/50 border border-white/10 p-4">
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em] mb-3">
                          {t.selectLanguage}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {(Object.keys(TRANSLATIONS) as Language[]).map((l) => (
                            <button
                              key={l}
                              onClick={() => setLang(l)}
                              className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                                lang === l
                                  ? 'bg-cyan-500/20 border-cyan-500/50'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none">{LANGUAGE_FLAGS[l]}</span>
                                <span className={`text-xs font-black tracking-widest ${lang === l ? 'text-cyan-200' : 'text-white/70'}`}>
                                  {LANGUAGE_CODES[l]}
                                </span>
                              </div>
                              <div className={`mt-1 text-[11px] font-bold ${lang === l ? 'text-white' : 'text-white/70'}`}>
                                {TRANSLATIONS[l].langName}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 mt-5">
                      <div className="space-y-3">
                        {helpSteps.map((s: any) => {
                          const Icon =
                            s.k === 'create'
                              ? MousePointer2
                              : s.k === 'write'
                                ? StickyNote
                                : s.k === 'organize'
                                  ? Move
                                  : s.k === 'share'
                                    ? Share2
                                    : Cloud;
                          return (
                            <div
                              key={s.k}
                              className="rounded-3xl border border-white/10 bg-slate-950/40 overflow-hidden"
                            >
                              <div className="p-4 flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-purple-500/15 to-pink-500/20 border border-white/10 flex items-center justify-center text-cyan-200 shrink-0">
                                  <Icon size={26} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 text-white/80 flex items-center justify-center font-black text-xs shrink-0">
                                      {s.n}
                                    </div>
                                    <div className="text-white font-black text-lg leading-tight truncate">{s.t}</div>
                                  </div>
                                  <div className="mt-1 text-slate-50/90 text-base leading-snug">
                                    {s.d}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="shrink-0 pt-5">
                      <button
                        onClick={closeModal}
                        className="w-full rounded-3xl py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-black text-lg tracking-tight shadow-[0_20px_60px_rgba(34,211,238,0.25)] hover:brightness-110 transition-all"
                      >
                        {helpCta}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <List className="text-purple-400" />
                        {t.allNotes}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Sök anteckningar..."
                            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all w-40"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                      {notes.length === 0 ? (
                        <p className="text-slate-500 italic text-center py-8">{t.firstNoteHint}</p>
                      ) : (
                        notes
                          .filter(n => n.content.toLowerCase().includes(searchTerm.toLowerCase()) || n.urlTitle.toLowerCase().includes(searchTerm.toLowerCase()))
                          .sort((a,b) => b.timestamp - a.timestamp)
                          .map(note => (
                          <div key={note.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/20 transition-colors">
                            <p className="text-white text-sm mb-3 line-clamp-2 italic">"{note.content || '...'}"</p>
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-500 uppercase font-bold tracking-tighter">SOURCE</span>
                                <span className="text-cyan-400/80 font-medium truncate max-w-[150px]">{note.urlTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => deleteNote(note.id)}
                                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                  title="Ta bort"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => {
                                    // Append a jump-hash so the target page can auto-scroll to this note
                                    const jumpUrl = note.url + '#notepin-jump-' + note.id;
                                    if (isExtension) {
                                      window.open(jumpUrl, '_blank');
                                    } else {
                                      window.location.href = jumpUrl;
                                    }
                                    closeModal();
                                  }}
                                  className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-1 font-bold"
                                >
                                  {t.goToFile} <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resize Handle for Modal */}
              <div 
                ref={listResizeRef}
                className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-[210] flex items-end justify-end p-2 group/resize"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="w-3 h-3 border-r-2 border-b-2 border-white/20 group-hover/resize:border-white/50 transition-colors" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {[...notes]
          .filter(note => {
            if (!isContentScript) return true;
            return normalizeUrl(note.url) === normalizeUrl(currentUrl);
          })
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(note => (
          <Note 
            key={note.id} 
            note={note} 
            onUpdate={updateNote} 
            onDelete={deleteNote} 
            onFocus={() => bringToFront(note.id)}
            t={t}
            className="pointer-events-auto"
          />
        ))}
        {menuPos && (
          <ContextMenu 
            x={menuPos.x} 
            y={menuPos.y} 
            onAddNote={addNote}
            onOpenSettings={openSettingsWindow}
            onOpenAllNotes={() => setShowAllNotes(true)}
            onOpenHelp={() => setShowHelp(true)}
            onClose={() => setMenuPos(null)} 
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
