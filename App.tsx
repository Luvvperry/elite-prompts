import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FullSettings,
  GenerationOutput,
  InputMode,
  ModalityType,
  Language,
  PromptLanguage,
  ReferenceImage,
  ReferenceRole,
  PresetItem,
  AutoDetectedParams,
  ViewMode
} from './types';
import {
  generateAllPrompts,
  magicEnhanceIdea,
  refinePrompt
} from './services/geminiService';
import { optimizeReferenceImage } from './services/imageUtils';
import { translations } from './translations';
import { auditTranslations } from './services/i18nAudit';
import Header from './components/Header';
import InputZone from './components/InputZone';
import SimpleControls from './components/SimpleControls';
import AdvancedControls from './components/AdvancedControls';
import PromptDisplay from './components/PromptDisplay';
import PresetsModal from './components/PresetsModal';
import HistoryDrawer from './components/HistoryDrawer';
import { LanguageBottomSheet } from './components/LanguageBottomSheet';
import { SettingsSheet } from './components/SettingsSheet';
import StudioStatusRail from './components/StudioStatusRail';
import CommandPalette from './components/CommandPalette';
import MobileCommandDock from './components/MobileCommandDock';
import ToastHost, { ToastPayload } from './components/ToastHost';


const normalizeInterfaceLanguage = (value: string | null | undefined): Language => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'es' || normalized.startsWith('es-') || normalized.includes('span') || normalized.includes('españ')) return 'es';
  if (normalized === 'pt' || normalized === 'pt-br' || normalized === 'pt_br' || normalized === 'ptbr' || normalized.includes('portugu')) return 'pt';
  return 'en';
};

const normalizePromptLanguage = (value: string | null | undefined): PromptLanguage => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'auto') return 'auto';
  return normalizeInterfaceLanguage(normalized);
};

const defaultSettings: FullSettings = {
  // Legacy Basic
  strictRealism: true,
  device: 'iPhone 16 Pro',
  look: 'RAW',
  sharpness: 'Natural',
  hdr: 'Natural',

  // Simple Controls
  outputModel: 'gemini-3.1-pro-preview',
  aspectRatio: '3:4',
  photographicStyle: 'casual_smartphone',
  captureProfile: 'auto',
  realismLevel: 95,

  // Independent Camera Controls
  cameraMode: 'auto',
  cameraFeel: 'auto',

  // Advanced Sliders
  imperfectionLevel: 45,
  cinematicLevel: 10,
  stylizationLevel: 0,
  backgroundDetailLevel: 80,
  blurLevel: 5,

  // Advanced Subject
  subjectCount: 'auto',
  subjectHeight: '',
  bodyPosition: 'auto',
  orientation: 'auto',
  weightDistribution: 'auto',
  posture: 'auto',
  customPosture: '',
  expression: 'auto',
  customExpression: '',
  gaze: 'auto',
  actionDescription: '',

  // Advanced Camera
  cameraDevice: 'auto',
  cameraLens: 'auto',
  cameraDistance: 'auto',
  cameraHeight: 'auto',
  cameraAngle: 'auto',
  cameraFraming: 'auto',

  // Advanced Light
  lightTime: 'auto',
  lightSource: 'auto',
  flashMode: 'auto',
  flashBehavior: 'normal',

  // Imperfections Toggles
  imperfections: {
    motionBlur: false,
    slightFocusMiss: true,
    digitalNoise: true,
    flashBlowout: false,
    whiteBalanceShift: false,
    compression: false,
    lensSmudge: false,
    minorCameraShake: true
  },

  // Wardrobe
  wardrobe: {
    top: '',
    bottom: '',
    shoes: '',
    outerwear: '',
    accessories: '',
    headwear: '',
    jewelryWatch: '',
    customDetails: '',
    referenceLock: true
  },

  // Vehicle
  vehicle: {
    customVehicle: '',
    modelLock: true,
    exteriorColor: '',
    interiorColor: '',
    driverPassenger: 'auto',
    doorState: 'auto',
    subjectRelation: 'leaning_against'
  },

  // Environment
  environment: {
    location: '',
    setting: '',
    background: '',
    timeOfDay: '',
    weather: '',
    crowd: '',
    naturalClutter: true,
    mood: 'ordinary',
    avoidPostcard: true,
    avoidGenericLuxury: true
  },

  // Reference Priority
  referencePriority: 'absolute',

  // Fine Control
  fineControl: {
    subject: '',
    action: '',
    location: '',
    environment: '',
    background: '',
    atmosphere: '',
    imperfections: '',
    purpose: '',
    referenceUse: '',
    textInsideImage: '',
    avoid: '',
    additionalInstructions: ''
  },

  // Auto Detect
  autoDetect: true,

  // POV
  pov: {
    handVisibility: 'auto',
    gripType: 'auto',
    heldObject: '',
    pointOfViewHeight: 'auto'
  }
};

const defaultPresets: PresetItem[] = [
  {
    id: 'raw-iphone',
    name: 'RAW iPhone Snapshot',
    isDefault: true,
    description: 'Ultra-authentic handheld smartphone capture with natural flaws.',
    settings: {
      device: 'iPhone 16 Pro',
      look: 'RAW',
      sharpness: 'Natural',
      photographicStyle: 'casual_smartphone',
      realismLevel: 98,
      imperfectionLevel: 55,
      cinematicLevel: 0,
      blurLevel: 0,
      cameraDevice: 'iphone_rear',
      cameraLens: '1x'
    }
  },
  {
    id: 'night-flash',
    name: 'Night Direct Flash',
    isDefault: true,
    description: 'Direct on-camera phone flash at night, fast falloff and dark background.',
    settings: {
      photographicStyle: 'night_photography',
      lightTime: 'night',
      lightSource: 'phone_flash',
      flashMode: 'on',
      flashBehavior: 'hard_direct',
      realismLevel: 95,
      imperfectionLevel: 50
    }
  },
  {
    id: 'casual-candid',
    name: 'Casual Candid',
    isDefault: true,
    description: 'Unposed everyday moment, neutral grading, unstaged geometry.',
    settings: {
      photographicStyle: 'candid',
      posture: 'distracted',
      gaze: 'away_from_camera',
      realismLevel: 95,
      cinematicLevel: 5
    }
  },
  {
    id: 'deep-dof',
    name: 'Deep Depth of Field',
    isDefault: true,
    description: 'Sharp foreground to background, no artificial blur or portrait cutout.',
    settings: {
      photographicStyle: 'street_photography',
      blurLevel: 0,
      cameraFraming: 'wide_environmental',
      realismLevel: 95
    }
  },
  {
    id: 'pov',
    name: 'First-Person POV',
    isDefault: true,
    description: 'Over-the-shoulder or hands visible, direct realistic interaction.',
    settings: {
      photographicStyle: 'pov',
      cameraHeight: 'chest',
      cameraDistance: 'close'
    }
  },
  {
    id: 'automotive',
    name: 'Automotive Forensic',
    isDefault: true,
    description: 'High fidelity car geometry, accurate reflections and textures.',
    settings: {
      photographicStyle: 'automotive',
      realismLevel: 95,
      vehicle: {
        customVehicle: '',
        modelLock: true,
        exteriorColor: '',
        interiorColor: '',
        driverPassenger: 'auto',
        doorState: 'auto',
        subjectRelation: 'leaning_against'
      }
    }
  }
];

const App: React.FC = () => {
  // Theme & Language states
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('ep_lang');
    return stored ? normalizeInterfaceLanguage(stored) : 'pt';
  });

  const [promptLang, setPromptLang] = useState<PromptLanguage>(() => {
    const stored = localStorage.getItem('ep_prompt_lang');
    return stored ? normalizePromptLanguage(stored) : 'auto';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('ep_theme');
    return stored ? stored === 'dark' : true;
  });

  // App Workflow States
  const [mode, setMode] = useState<InputMode>('image');
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [modality, setModality] = useState<ModalityType>('person');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('person');

  const handleModalityChange = useCallback((m: ModalityType, typeId?: string) => {
    setModality(m);
    if (typeId) setSelectedTypeId(typeId);
  }, []);

  // Inputs
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [ideaText, setIdeaText] = useState<string>('');

  // Settings & Results
  const [settings, setSettings] = useState<FullSettings>(defaultSettings);
  const [generation, setGeneration] = useState<GenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [magicStatus, setMagicStatus] = useState<'idle' | 'enhancing' | 'success' | 'error' | 'timeout'>('idle');
  const isMagicEnhancing = magicStatus === 'enhancing';
  const [detectedParams, setDetectedParams] = useState<AutoDetectedParams | undefined>(undefined);

  // Modals & Drawers
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [focusMode, setFocusMode] = useState<boolean>(() => localStorage.getItem('ep_focus_mode') === 'true');
  const [toast, setToast] = useState<ToastPayload>(null);
  const [selectedEngine, setSelectedEngine] = useState<'v1' | 'v2' | 'v3' | 'compare'>('v2');
  const [isLazyLoadingEngine, setIsLazyLoadingEngine] = useState(false);
  const isGeneratingRef = useRef<boolean>(false);
  const generateControllerRef = useRef<AbortController | null>(null);
  const generateRequestIdRef = useRef(0);
  const magicRequestIdRef = useRef(0);
  const magicControllerRef = useRef<AbortController | null>(null);
  const ideaRevisionRef = useRef(0);

  // Presets & History persistence
  const [presets, setPresets] = useState<PresetItem[]>(() => {
    const saved = localStorage.getItem('ep_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...defaultPresets, ...parsed];
      } catch (e) {
        return defaultPresets;
      }
    }
    return defaultPresets;
  });

  const [history, setHistory] = useState<GenerationOutput[]>(() => {
    const saved = localStorage.getItem('ep_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Dark Mode Sync with DOM
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ep_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ep_theme', 'light');
    }
  }, [isDark]);

  // Persist Language selections
  useEffect(() => {
    localStorage.setItem('ep_lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ep_prompt_lang', promptLang);
  }, [promptLang]);

  useEffect(() => {
    localStorage.setItem('ep_focus_mode', focusMode ? 'true' : 'false');
  }, [focusMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    // Unmount cleanup is intentionally separate from configuration changes.
    return () => {
      magicRequestIdRef.current += 1;
      magicControllerRef.current?.abort();
      magicControllerRef.current = null;
    };
  }, []);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ id: Date.now(), type, message });
  }, []);

  const scrollToSection = useCallback((target: 'input' | 'settings' | 'output') => {
    const id = target === 'input' ? 'studio-input' : target === 'settings' ? 'studio-settings' : 'studio-output';
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Handle Multi-Reference Image Add with automatic client-side optimization
  const handleAddReferences = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach(async (file) => {
      const dataUrl = await optimizeReferenceImage(file, 1536);
      if (!dataUrl) return;

      const newRef: ReferenceImage = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        dataUrl,
        name: file.name,
        roles: ['outfit'],
        subjectAssignment: 'General'
      };
      setReferences(prev => {
        if (prev.length === 0) newRef.roles = ['full_image'];
        return [...prev, newRef];
      });
    });
  }, []);

  const handleRemoveReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleUpdateReferenceRole = useCallback((id: string, roles: ReferenceRole[]) => {
    setReferences(prev => prev.map(r => r.id === id ? { ...r, roles } : r));
  }, []);

  const handleUpdateSubjectAssignment = useCallback((id: string, subjectAssignment: 'Subject A' | 'Subject B' | 'General') => {
    setReferences(prev => prev.map(r => r.id === id ? { ...r, subjectAssignment } : r));
  }, []);

  const handleIdeaChange = useCallback((nextIdea: string) => {
    ideaRevisionRef.current += 1;
    setIdeaText(nextIdea);
  }, []);

  // Magic Enhance Idea — request lifecycle is fully owned here; prompt logic is untouched.
  const handleMagicEnhance = useCallback(async () => {
    const originalIdea = ideaText;
    if (!originalIdea.trim() || isMagicEnhancing || magicControllerRef.current) return;

    const requestContext = { idea: originalIdea, modality, inputRevision: ideaRevisionRef.current };
    const requestId = ++magicRequestIdRef.current;
    magicControllerRef.current?.abort();
    const controller = new AbortController();
    magicControllerRef.current = controller;
    setMagicStatus('enhancing');

    const uiMessage: Record<Language, { failed: string; timeout: string; rateLimit: string }> = {
      pt: {
        failed: 'Magic Enhance não conseguiu concluir. Tente novamente.',
        timeout: 'Magic Enhance demorou demais. Tente novamente.',
        rateLimit: 'Magic Enhance está com muita demanda agora. Tente novamente em instantes.'
      },
      es: {
        failed: 'Magic Enhance no pudo completarse. Inténtalo de nuevo.',
        timeout: 'Magic Enhance tardó demasiado. Inténtalo de nuevo.',
        rateLimit: 'Magic Enhance tiene demasiada demanda ahora. Inténtalo de nuevo en unos instantes.'
      },
      en: {
        failed: 'Magic Enhance couldn’t finish. Try again.',
        timeout: 'Magic Enhance took too long. Try again.',
        rateLimit: 'Magic Enhance is under heavy demand right now. Try again in a moment.'
      }
    };

    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 42000);
    const logMagic = (message: string) => {
      if (import.meta.env.DEV) console.debug(`[MAGIC] ${message}`, requestId);
    };
    try {
      logMagic('request started');
      const enhanced = await magicEnhanceIdea(requestContext.idea, requestContext.modality, controller.signal);
      logMagic('API resolved');
      if (requestId !== magicRequestIdRef.current) return;
      if (ideaRevisionRef.current === requestContext.inputRevision) {
        handleIdeaChange(enhanced);
      }
      setMagicStatus('success');
      logMagic('success');
    } catch (error: any) {
      if (requestId !== magicRequestIdRef.current) return;
      if (timedOut || error?.message === 'TIMEOUT') {
        setMagicStatus('timeout');
        showToast('error', uiMessage[lang].timeout);
        logMagic('timeout');
      } else if (error?.name === 'AbortError') {
        setMagicStatus('error');
        logMagic('aborted');
      } else {
        setMagicStatus('error');
        showToast('error', error?.message === 'RATE_LIMIT' ? uiMessage[lang].rateLimit : uiMessage[lang].failed);
        if (import.meta.env.DEV) console.debug('[MAGIC] error', requestId, error);
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (magicControllerRef.current === controller) magicControllerRef.current = null;
      if (requestId === magicRequestIdRef.current) {
        setMagicStatus(prev => prev === 'enhancing' ? 'error' : prev);
      }
      logMagic('cleanup');
    }
  }, [ideaText, modality, isMagicEnhancing, lang, showToast, handleIdeaChange]);

  // Generate Prompts with targetEngine support, double-click lock, and request cancellation
  const handleGenerate = async () => {
    if (isLoading || isGeneratingRef.current) return;
    if (mode === 'image' && references.length === 0 && !ideaText.trim()) return;
    if (mode === 'idea' && !ideaText.trim()) return;

    isGeneratingRef.current = true;
    generateControllerRef.current?.abort();
    const controller = new AbortController();
    generateControllerRef.current = controller;
    const currentReqId = ++generateRequestIdRef.current;

    setIsLoading(true);
    try {
      const resolvedPromptLang: PromptLanguage = promptLang === 'auto' ? lang : promptLang;

      const result = await generateAllPrompts({
        mode,
        modality,
        promptLanguage: resolvedPromptLang,
        ideaText,
        references,
        settings,
        selectedTypeId,
        targetEngine: selectedEngine,
        signal: controller.signal
      });

      if (currentReqId !== generateRequestIdRef.current) return;

      const newOutput: GenerationOutput = {
        id: `gen_${Date.now()}`,
        timestamp: Date.now(),
        v1: result.v1 || '',
        v2: result.v2 || '',
        v3: result.v3 || '',
        negativePrompt: result.negativePrompt,
        mode,
        modality,
        selectedTypeId,
        promptLanguage: resolvedPromptLang,
        inputIdea: ideaText || undefined,
        referenceImagesMeta: references.map(r => ({ name: r.name, roles: r.roles })),
        autoDetected: result.autoDetected,
        settingsSnapshot: { ...settings }
      };

      setGeneration(newOutput);
      if (result.autoDetected) {
        setDetectedParams(result.autoDetected);
      }

      // Save to History
      const updatedHistory = [newOutput, ...history.slice(0, 24)];
      setHistory(updatedHistory);
      localStorage.setItem('ep_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error(err);
      showToast('error', err.message || translations[lang].errors.failed);
    } finally {
      if (currentReqId === generateRequestIdRef.current) {
        setIsLoading(false);
        isGeneratingRef.current = false;
        generateControllerRef.current = null;
      }
    }
  };

  // Lazy load single engine on demand when user switches tabs without redoing other engines
  const handleLazyLoadEngine = useCallback(async (engine: 'v1' | 'v2' | 'v3') => {
    if (!generation || generation[engine] || isLazyLoadingEngine) return;
    setIsLazyLoadingEngine(true);
    try {
      const resolvedPromptLang: PromptLanguage = promptLang === 'auto' ? lang : promptLang;
      const res = await generateAllPrompts({
        mode,
        modality,
        promptLanguage: resolvedPromptLang,
        ideaText,
        references,
        settings,
        selectedTypeId,
        targetEngine: engine,
        skipAutoDetect: true
      });
      const updatedText = res[engine];
      if (updatedText) {
        setGeneration(prev => {
          if (!prev) return prev;
          const updated = { ...prev, [engine]: updatedText };
          setHistory(hist => {
            const newHist = hist.map(h => h.id === prev.id ? updated : h);
            try { localStorage.setItem('ep_history', JSON.stringify(newHist)); } catch {}
            return newHist;
          });
          return updated;
        });
      }
    } catch (e: any) {
      console.error(`Lazy load ${engine} failed:`, e);
    } finally {
      setIsLazyLoadingEngine(false);
    }
  }, [generation, isLazyLoadingEngine, promptLang, lang, mode, modality, ideaText, references, settings, selectedTypeId]);

  // Refine a single engine without random re-generation
  const handleRefinePrompt = useCallback(async (engine: 'v1' | 'v2' | 'v3', instruction: string) => {
    if (!generation) return;
    const originalText = generation[engine];
    const refined = await refinePrompt(engine, originalText, instruction);

    const updated: GenerationOutput = {
      ...generation,
      [engine]: refined
    };
    setGeneration(updated);

    // Update in history as well
    const updatedHistory = history.map(h => h.id === generation.id ? updated : h);
    setHistory(updatedHistory);
    localStorage.setItem('ep_history', JSON.stringify(updatedHistory));
  }, [generation, history]);

  // Preset operations
  const handleSaveCurrentPreset = useCallback((name: string) => {
    const newPreset: PresetItem = {
      id: `custom_${Date.now()}`,
      name,
      settings: { ...settings }
    };
    const customOnly = presets.filter(p => !p.isDefault);
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('ep_presets', JSON.stringify([...customOnly, newPreset]));
  }, [settings, presets]);

  const handleApplyPreset = (preset: PresetItem) => {
    setSettings(prev => ({
      ...prev,
      ...preset.settings
    }));
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    const customOnly = updated.filter(p => !p.isDefault);
    localStorage.setItem('ep_presets', JSON.stringify(customOnly));
  };

  // History operations
  const handleRestoreFromHistory = (item: GenerationOutput) => {
    setGeneration(item);
    setMode(item.mode);
    setModality(item.modality);
    if (item.selectedTypeId) setSelectedTypeId(item.selectedTypeId);
    if (item.inputIdea) setIdeaText(item.inputIdea);
    if (item.settingsSnapshot) setSettings(item.settingsSnapshot);
    if (item.autoDetected) setDetectedParams(item.autoDetected);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('ep_history', JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('ep_history');
  };

  const canGenerate = (mode === 'image' && (references.length > 0 || ideaText.trim().length > 0)) || (mode === 'idea' && ideaText.trim().length > 0);

  const workspaceLabels = {
    pt: { input: 'Entrada', controls: 'Controles', output: 'Saída', liveWorkspace: 'Workspace ativo' },
    es: { input: 'Entrada', controls: 'Controles', output: 'Salida', liveWorkspace: 'Workspace activo' },
    en: { input: 'Input', controls: 'Controls', output: 'Output', liveWorkspace: 'Active workspace' }
  }[lang];

  return (
    <div className={`app-shell min-h-screen selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 flex flex-col relative transition-colors duration-200 ${focusMode ? 'is-focus-mode' : ''}`}>

      {/* Application chrome */}
      <Header
        lang={lang}
        onOpenLanguageSheet={() => setIsLanguageSheetOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommand={() => setIsCommandOpen(true)}
        historyCount={history.length}
        presetsCount={presets.length}
      />

      {(isLoading || isMagicEnhancing) && <div className="generation-progress" aria-hidden="true"><span /></div>}

      <div className="pro-shell lg:pl-[64px]">
        <main className="studio-main flex-grow w-full relative z-10 pb-28 lg:pb-8">
          <div className="studio-frame">
            <StudioStatusRail
              lang={lang}
              mode={mode}
              selectedTypeId={selectedTypeId}
              settings={settings}
              referencesCount={references.length}
              focusMode={focusMode}
              onToggleFocus={() => setFocusMode(v => !v)}
              onOpenCommand={() => setIsCommandOpen(true)}
            />

            <div className="studio-grid pro-studio-grid items-start">
              {/* Input pane */}
              <section id="studio-input" className="studio-input-pane min-w-0 scroll-mt-24">
                <div className="pane-heading">
                  <div>
                    <span className="pane-eyebrow">{workspaceLabels.input}</span>
                    <p className="pane-description">{mode === 'image' ? translations[lang].nav.fromImage : translations[lang].nav.fromIdea}</p>
                  </div>
                </div>

                <InputZone
                  lang={lang}
                  mode={mode}
                  onModeChange={setMode}
                  modality={modality}
                  onModalityChange={handleModalityChange}
                  selectedTypeId={selectedTypeId}
                  ideaText={ideaText}
                  onIdeaChange={handleIdeaChange}
                  references={references}
                  onAddReferences={handleAddReferences}
                  onRemoveReference={handleRemoveReference}
                  onUpdateReferenceRole={handleUpdateReferenceRole}
                  onUpdateSubjectAssignment={handleUpdateSubjectAssignment}
                  onMagicEnhance={handleMagicEnhance}
                  isMagicEnhancing={isMagicEnhancing}
                  camera={settings.device}
                  cameraMode={settings.cameraMode}
                  captureProfile={settings.captureProfile}
                />
              </section>

              {/* Controls pane */}
              <section id="studio-settings" className="studio-settings-pane min-w-0 scroll-mt-24">
                <div className="pane-heading pane-heading-controls">
                  <div>
                    <span className="pane-eyebrow">{workspaceLabels.controls}</span>
                    <p className="pane-description">{viewMode === 'simple' ? translations[lang].simple.modeHint : translations[lang].advanced.modeHint}</p>
                  </div>

                  <div className="mode-switch" role="tablist" aria-label={translations[lang].nav.simpleMode}>
                    <button
                      type="button"
                      onClick={() => setViewMode('simple')}
                      className={viewMode === 'simple' ? 'is-active' : ''}
                    >
                      {translations[lang].nav.simpleMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('advanced')}
                      className={viewMode === 'advanced' ? 'is-active' : ''}
                    >
                      {translations[lang].nav.advancedMode}
                    </button>
                  </div>
                </div>

                {viewMode === 'simple' ? (
                  <div className="workspace-panel controls-panel p-4 sm:p-5">
                    <SimpleControls
                      lang={lang}
                      settings={settings}
                      onChange={setSettings}
                      onGenerate={handleGenerate}
                      isLoading={isLoading}
                      canGenerate={canGenerate}
                    />
                  </div>
                ) : (
                  <div className="advanced-panel-shell">
                    <AdvancedControls
                      lang={lang}
                      settings={settings}
                      onChange={setSettings}
                      onGenerate={handleGenerate}
                      isLoading={isLoading}
                      canGenerate={canGenerate}
                      detectedParams={detectedParams}
                      modality={modality}
                      selectedTypeId={selectedTypeId}
                    />
                  </div>
                )}
              </section>

              {/* Output pane */}
              <section id="studio-output" className="studio-output-pane min-w-0 scroll-mt-24">
                <div className="pane-heading">
                  <div>
                    <span className="pane-eyebrow">{workspaceLabels.output}</span>
                    <p className="pane-description">V1 · V2 · V3</p>
                  </div>
                </div>
                <PromptDisplay
                  lang={lang}
                  generation={generation}
                  isLoading={isLoading}
                  selectedEngine={selectedEngine}
                  onSelectEngine={setSelectedEngine}
                  onRefinePrompt={handleRefinePrompt}
                  onSaveToPresets={handleSaveCurrentPreset}
                  onLazyLoadEngine={handleLazyLoadEngine}
                  isLazyLoading={isLazyLoadingEngine}
                />
              </section>
            </div>
          </div>
        </main>
      </div>

      <footer className="studio-footer mt-auto lg:pl-[64px]">
        <span className="studio-footer-line" />
      </footer>

      {/* 4. Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        lang={lang}
        presets={presets}
        onApplyPreset={handleApplyPreset}
        onSaveCurrentPreset={handleSaveCurrentPreset}
        onDeletePreset={handleDeletePreset}
      />

      {/* 5. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
        history={history}
        onRestore={handleRestoreFromHistory}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* 6. Language Bottom Sheet */}
      <LanguageBottomSheet
        isOpen={isLanguageSheetOpen}
        onClose={() => setIsLanguageSheetOpen(false)}
        currentLang={lang}
        currentPromptLang={promptLang}
        onApply={(newLang, newPromptLang) => {
          setLang(normalizeInterfaceLanguage(newLang));
          setPromptLang(normalizePromptLanguage(newPromptLang));
        }}
      />

      {/* 7. Settings Sheet */}
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        onOpenLanguage={() => {
          setIsSettingsOpen(false);
          setIsLanguageSheetOpen(true);
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenHistory={() => {
          setIsSettingsOpen(false);
          setIsHistoryOpen(true);
        }}
        onOpenPresets={() => {
          setIsSettingsOpen(false);
          setIsPresetsOpen(true);
        }}
        historyCount={history.length}
        presetsCount={presets.length}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(v => !v)}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        lang={lang}
        isDark={isDark}
        focusMode={focusMode}
        viewMode={viewMode}
        onOpenLanguage={() => setIsLanguageSheetOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleTheme={() => setIsDark(v => !v)}
        onToggleFocus={() => setFocusMode(v => !v)}
        onSetViewMode={setViewMode}
        onJump={scrollToSection}
      />

      <MobileCommandDock
        lang={lang}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onGenerate={handleGenerate}
        onScrollOutput={() => scrollToSection('output')}
        canGenerate={canGenerate}
        isLoading={isLoading}
        hasOutput={Boolean(generation)}
      />

      <ToastHost toast={toast} onClose={() => setToast(null)} />

    </div>
  );
};

export default App;
