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
  refinePrompt, 
  detectContextualParams 
} from './services/geminiService';
import { translations } from './translations';
import { auditTranslations } from './services/i18nAudit';
import { UsageGateModal } from './components/UsageGateModal';
import { MAX_GENERATIONS, getUsageState, registerGeneration, UsageState } from './services/usageGate';
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
import LanguageGate from './components/LanguageGate';
import UpdateAnnouncementModal from './components/UpdateAnnouncementModal';
import VisualReasoningPanel from './components/VisualReasoningPanel';


const normalizeInterfaceLanguage = (value: string | null | undefined): Language => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'es' || normalized.startsWith('es-') || normalized.includes('span') || normalized.includes('españ')) return 'es';
  if (normalized === 'pt' || normalized === 'pt-br' || normalized === 'pt_br' || normalized === 'ptbr' || normalized.includes('portugu')) return 'pt';
  return 'en';
};

const normalizePromptLanguage = (value: string | null | undefined): PromptLanguage => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'auto') return 'auto';
  if (normalized === 'english' || normalized.includes('inglês') || normalized.includes('ingles') || normalized.includes('english')) return 'en';
  if (normalized === 'spanish' || normalized.includes('español') || normalized.includes('espanhol') || normalized.includes('espan')) return 'es';
  if (normalized === 'portuguese' || normalized.includes('português') || normalized.includes('portugues')) return 'pt';
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
  aspectRatio: '9:16',
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
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) return normalizeInterfaceLanguage(urlLang);
    const stored = localStorage.getItem('ep_lang');
    return stored ? normalizeInterfaceLanguage(stored) : 'en';
  });

  const [hasChosenLanguage, setHasChosenLanguage] = useState<boolean>(false);

  const [promptLang, setPromptLang] = useState<PromptLanguage>(() => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) return normalizePromptLanguage(urlLang);
    const stored = localStorage.getItem('ep_prompt_lang');
    return stored ? normalizePromptLanguage(stored) : 'auto';
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
  const [usage, setUsage] = useState<UsageState>(() => getUsageState());
  const [magicStatus, setMagicStatus] = useState<'idle' | 'enhancing' | 'success' | 'error' | 'timeout'>('idle');
  const isMagicEnhancing = magicStatus === 'enhancing';
  const [detectedParams, setDetectedParams] = useState<AutoDetectedParams | undefined>(undefined);

  // Modals & Drawers
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isUsageGateOpen, setIsUsageGateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [focusMode, setFocusMode] = useState<boolean>(() => localStorage.getItem('ep_focus_mode') === 'true');
  // JSON is opt-in: every new app session starts in the normal text format.
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastPayload>(null);
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

  // Elite Prompts is intentionally dark-only on the hosted Vercel edition.
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.classList.add('dark');
    localStorage.setItem('ep_theme', 'dark');
  }, []);

  // Persist Language selections
  useEffect(() => {
    localStorage.setItem('ep_lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  }, [lang]);

  const handleChooseLanguage = useCallback((nextLanguage: Language) => {
    setLang(nextLanguage);
    setPromptLang(nextLanguage);
    setHasChosenLanguage(true);
    localStorage.setItem('ep_language_chosen', 'true');
    localStorage.setItem('ep_lang', nextLanguage);
    localStorage.setItem('ep_prompt_lang', nextLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('ep_prompt_lang', promptLang);
  }, [promptLang]);

  useEffect(() => {
    localStorage.setItem('ep_focus_mode', focusMode ? 'true' : 'false');
  }, [focusMode]);

  useEffect(() => {
    localStorage.setItem('ep_json_mode', jsonMode ? 'true' : 'false');
  }, [jsonMode]);

  useEffect(() => {
    if (hasChosenLanguage && localStorage.getItem('elite_v4_announcement_seen') !== 'true') setIsUpdateOpen(true);
  }, [hasChosenLanguage]);

  const closeUpdate = useCallback(() => {
    localStorage.setItem('elite_v4_announcement_seen', 'true');
    setIsUpdateOpen(false);
  }, []);

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

  // Handle Multi-Reference Image Add
  const handleAddReferences = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
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
      };
      reader.readAsDataURL(file);
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

  // Generate All Prompts
  const handleGenerate = async () => {
    if (isLoading) return;
    if (mode === 'image' && references.length === 0 && !ideaText.trim()) return;
    if (mode === 'idea' && !ideaText.trim()) return;
    if (!usage.unlocked && usage.count >= MAX_GENERATIONS) {
      setIsUsageGateOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const resolvedPromptLang: PromptLanguage = promptLang === 'auto' ? lang : promptLang;

      const result = await generateAllPrompts(
        mode,
        modality,
        resolvedPromptLang,
        ideaText,
        references,
        settings,
        selectedTypeId,
        jsonMode ? 'json' : 'text'
      );

      const newOutput: GenerationOutput = {
        id: `gen_${Date.now()}`,
        timestamp: Date.now(),
        v1: result.v1,
        v2: result.v2,
        v3: result.v3,
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
      setDetectedParams(result.autoDetected);
      setUsage(registerGeneration());

      // Save to History
      const updatedHistory = [newOutput, ...history.slice(0, 24)];
      setHistory(updatedHistory);
      localStorage.setItem('ep_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error(err);
      const modelBusyMessage: Record<Language, string> = {
        pt: 'O provedor de IA está com alta demanda agora. Tente gerar novamente em alguns segundos.',
        es: 'El proveedor de IA tiene mucha demanda ahora. Intenta generar de nuevo en unos segundos.',
        en: 'The AI provider is under heavy demand right now. Try generating again in a few seconds.'
      };
      showToast('error', err?.message === 'MODEL_BUSY' ? modelBusyMessage[lang] : (err.message || translations[lang].errors.failed));
    } finally {
      setIsLoading(false);
    }
  };

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
    pt: { input: 'Entrada', controls: 'Controles', output: 'Saída', kicker: 'Laboratório de imagem / 03 engines', headline: 'Da imagem à intenção.', subline: 'Transforme evidência visual em prompts que parecem fotografias reais.' },
    es: { input: 'Entrada', controls: 'Controles', output: 'Salida', kicker: 'Laboratorio de imagen / 03 engines', headline: 'De la imagen a la intención.', subline: 'Convierte evidencia visual en prompts que parecen fotografías reales.' },
    en: { input: 'Input', controls: 'Controls', output: 'Output', kicker: 'Image laboratory / 03 engines', headline: 'From image to intent.', subline: 'Turn visual evidence into prompts that feel like real photographs.' }
  }[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];

  return (
    <div className={`app-shell elite-v4-app min-h-screen selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 flex flex-col relative transition-colors duration-200 ${focusMode ? 'is-focus-mode' : ''}`}>
      {!hasChosenLanguage && <LanguageGate onChoose={handleChooseLanguage} />}
      <div className={hasChosenLanguage ? '' : 'language-gated-app'} aria-hidden={!hasChosenLanguage}>
      {/* Application chrome */}
      <Header
        lang={lang}
        onForceEnglishPrompts={() => {
          setPromptLang('en');
          localStorage.setItem('ep_prompt_lang', 'en');
          showToast('success', 'Prompts will be generated in English.');
        }}
        jsonMode={jsonMode}
        onToggleJsonMode={() => {
          setJsonMode(value => !value);
          showToast('success', jsonMode ? 'JSON format disabled.' : 'JSON format enabled.');
        }}
        onOpenLanguageSheet={() => setIsLanguageSheetOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpdates={() => setIsUpdateOpen(true)}
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

              <section className="v4-hero" aria-labelledby="ep-masthead-title">
                <div className="ep-masthead-copy">
                  <span className="ep-masthead-kicker"><i />VISUAL PROMPT ENGINE / V4</span>
                  <h1 id="ep-masthead-title">{lang === 'pt' ? <>imagens não falham pela IA.<br/><em>falham por cenas mal entendidas.</em></> : lang === 'es' ? <>las imágenes no fallan por la ia.<br/><em>fallan por escenas mal entendidas.</em></> : <>images don't fail because of AI.<br/><em>they fail when the scene is misunderstood.</em></>}</h1>
                  <p>{lang === 'pt' ? 'Analise identidade, câmera, luz, física e ambiente antes de construir cada prompt.' : lang === 'es' ? 'Analiza identidad, cámara, luz, física y entorno antes de construir cada prompt.' : 'Analyze identity, camera, light, physics and environment before building each prompt.'}</p>
                  <div className="v4-hero-actions"><button className="v4-primary-button" onClick={() => scrollToSection('input')}>{lang === 'pt' ? 'Criar prompt' : lang === 'es' ? 'Crear prompt' : 'Create prompt'} <span>↗</span></button><button className="v4-ghost-button" onClick={() => document.getElementById('how-it-thinks')?.scrollIntoView({behavior:'smooth'})}>{lang === 'pt' ? 'Ver como pensa' : lang === 'es' ? 'Ver cómo piensa' : 'See how it thinks'}</button></div>
                  <div className="v4-hero-meta"><span>03 ENGINES</span><i/> <span>VISUAL REASONING</span><i/> <span>IDENTITY CONSISTENCY</span></div>
                </div>
                <div className="v4-hero-mockup" aria-hidden="true"><div className="mockup-back mockup-back-a">CAMERA MODEL<br/><b>24mm · 1X</b><br/>1.8m distance</div><div className="mockup-back mockup-back-b">LIGHT PHYSICS<br/><b>CAMERA-LEFT</b><br/>soft falloff</div><div className="mockup-window"><div className="mockup-top"><span><i/> VISUAL REASONING</span><small>V1 / V2 / V3</small></div><div className="mockup-body"><div className="mockup-thumb"><div className="mockup-photo-lines"/></div><div className="mockup-states"><span><b/> IDENTITY <em>LOCKED</em></span><span><b/> CAMERA GEOMETRY <em>LOCKED</em></span><span><b/> LIGHT + PHYSICS <em>ANALYZING</em></span><span><b/> CONSISTENCY CHECK</span></div></div><div className="mockup-footer">ordinary smartphone capture <span>9:16</span></div></div></div>
              </section>

              <VisualReasoningPanel lang={lang} detected={detectedParams} referencesCount={references.length} isLoading={isLoading || isMagicEnhancing} />

              <section id="how-it-thinks" className="v4-how-it-thinks"><span className="ep-masthead-kicker"><i />HOW IT THINKS</span><h2>{lang === 'pt' ? <>não escreve primeiro.<br/><em>entende primeiro.</em></> : lang === 'es' ? <>no escribe primero.<br/><em>entiende primero.</em></> : <>it doesn't write first.<br/><em>it understands first.</em></>}</h2><div className="v4-pipeline"><span>IDEA</span><i>↓</i><span>REFERENCE ANALYSIS</span><i>↓</i><span>SCENE GEOMETRY</span><i>↓</i><span>LIGHT + PHYSICS</span><i>↓</i><span>CONSISTENCY CHECK</span><i>↓</i><span className="pipeline-accent">V1 / V2 / V3</span></div></section>

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
                  settings={settings}
                  onSettingsChange={setSettings}
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
                  jsonMode={jsonMode}
                  onRefinePrompt={handleRefinePrompt}
                  onSaveToPresets={handleSaveCurrentPreset}
                />
              </section>
            </div>
          </div>
        </main>
      </div>

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
        focusMode={focusMode}
        viewMode={viewMode}
        onOpenLanguage={() => setIsLanguageSheetOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
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

      <UsageGateModal
        open={isUsageGateOpen}
        lang={lang}
        onClose={() => setIsUsageGateOpen(false)}
        onUnlocked={() => setUsage(getUsageState())}
      />

      <UpdateAnnouncementModal open={isUpdateOpen} lang={lang} onClose={closeUpdate} onTry={() => { closeUpdate(); scrollToSection('input'); }} />

      <ToastHost toast={toast} lang={lang} onClose={() => setToast(null)} />

      </div>
    </div>
  );
};

export default App;
