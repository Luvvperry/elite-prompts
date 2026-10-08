import React, { useState, useEffect } from 'react';
import TrxStudioNav from './components/TrxStudioNav';
import TrxInspectorPanel from './components/TrxInspectorPanel';
import Uploader from './components/Uploader';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import ExamplesModal from './components/ExamplesModal';
import InspirationModal from './components/InspirationModal';
import IdeaBuilderSection from './components/IdeaBuilderSection';
import PromptBatchSection from './components/PromptBatchSection';
import LifestyleSection from './components/LifestyleSection';
import ProjectTrxBackground from './components/ProjectTrxBackground';
import IntroSplash from './components/IntroSplash';
import AmbientHalo from './components/AmbientHalo';
import ChampagneCapsuleButton from './components/ChampagneCapsuleButton';
import TrxLogo from './components/TrxLogo';
import { analyzeImage } from './apiService';
import { AppStatus, PromptResult, ExifData, DEFAULT_USER_SETTINGS, BatchPromptResult, LifestyleResult } from './types';
import { TrxStudioView } from './components/TrxStudioNav';
import { getStoredSettings, saveStoredSettings, clearStoredSettings, hasCustomSettings } from './settingsService';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import exifr from 'exifr';
import { saveHistoryToStorage, loadHistoryFromStorage, createThumbnail } from './historyStorage';

const App: React.FC = () => {
  // Intro splash: 2.8s gentle reveal
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('project_trx_intro_seen_v3');
    } catch (e) {
      return true;
    }
  });

  // Direct workspace view: 'analyzer' | 'ideaBuilder' | 'promptBatches' | 'lifestyle'
  const [currentView, setCurrentView] = useState<TrxStudioView>('analyzer');
  const [activeBatch, setActiveBatch] = useState<BatchPromptResult | null>(null);
  const [activeLifestyle, setActiveLifestyle] = useState<LifestyleResult | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [identityPreviewUrl, setIdentityPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedPrompt, setGeneratedPrompt] = useState<{
    positive: string;
    negative: string;
    detectedSummary?: string;
    analysis?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mobile bottom sheet inspector drawer state
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState<boolean>(false);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  const [history, setHistory] = useState<PromptResult[]>(() => loadHistoryFromStorage());

  // Optical & photographic controls state initialized from stored settings
  const initialSettings = getStoredSettings();
  const [lensType, setLensType] = useState<string>(initialSettings.lensType || 'auto');
  const [aspectRatio, setAspectRatio] = useState<string>(initialSettings.aspectRatio || 'auto');
  const [heightCm, setHeightCm] = useState<string>(initialSettings.heightCm || '');
  const [weightKg, setWeightKg] = useState<string>(initialSettings.weightKg || '');
  const [detailLevel, setDetailLevel] = useState<number>(initialSettings.detailLevel ?? 3);
  const [addNoise, setAddNoise] = useState<boolean>(initialSettings.addNoise ?? false);
  const [keepExactWardrobe, setKeepExactWardrobe] = useState<boolean>(initialSettings.keepExactWardrobe ?? true);
  const [manualBrand, setManualBrand] = useState<string>(initialSettings.manualBrand || '');
  const [customInstructions, setCustomInstructions] = useState<string>(initialSettings.customInstructions || '');
  const [exifData, setExifData] = useState<ExifData | null>(null);

  // Settings persistence states
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(!!initialSettings.autoSaveEnabled);
  const [hasSavedSettings, setHasSavedSettings] = useState<boolean>(() => hasCustomSettings());
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // Guardar ajustes actuales como predeterminados
  const handleSaveSettings = () => {
    saveStoredSettings({
      lensType,
      aspectRatio,
      heightCm,
      weightKg,
      detailLevel,
      addNoise,
      keepExactWardrobe,
      manualBrand,
      customInstructions,
      autoSaveEnabled,
    });
    setHasSavedSettings(true);
    setSavedNotification(t('settingsSavedToast'));
    setTimeout(() => setSavedNotification(null), 3500);
  };

  // Cargar ajustes guardados previamente
  const handleLoadSavedSettings = () => {
    const saved = getStoredSettings();
    setLensType(saved.lensType || 'auto');
    setAspectRatio(saved.aspectRatio || 'auto');
    setHeightCm(saved.heightCm || '');
    setWeightKg(saved.weightKg || '');
    setDetailLevel(saved.detailLevel ?? 3);
    setAddNoise(saved.addNoise ?? false);
    setKeepExactWardrobe(saved.keepExactWardrobe ?? true);
    setManualBrand(saved.manualBrand || '');
    setCustomInstructions(saved.customInstructions || '');
    setSavedNotification(language === 'es' ? 'Ajustes guardados cargados' : 'Saved settings loaded');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  // Restablecer a los valores predeterminados de fábrica
  const handleResetSettings = () => {
    clearStoredSettings();
    setLensType(DEFAULT_USER_SETTINGS.lensType);
    setAspectRatio(DEFAULT_USER_SETTINGS.aspectRatio);
    setHeightCm(DEFAULT_USER_SETTINGS.heightCm);
    setWeightKg(DEFAULT_USER_SETTINGS.weightKg);
    setDetailLevel(DEFAULT_USER_SETTINGS.detailLevel);
    setAddNoise(DEFAULT_USER_SETTINGS.addNoise);
    setKeepExactWardrobe(DEFAULT_USER_SETTINGS.keepExactWardrobe);
    setManualBrand(DEFAULT_USER_SETTINGS.manualBrand);
    setCustomInstructions(DEFAULT_USER_SETTINGS.customInstructions);
    setHasSavedSettings(false);
    setSavedNotification(t('resetDefaultsToast'));
    setTimeout(() => setSavedNotification(null), 3000);
  };

  // Alternar guardado automático
  const handleToggleAutoSave = (enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    saveStoredSettings({
      lensType,
      aspectRatio,
      heightCm,
      weightKg,
      detailLevel,
      addNoise,
      keepExactWardrobe,
      manualBrand,
      customInstructions,
      autoSaveEnabled: enabled,
    });
    if (enabled) {
      setHasSavedSettings(true);
      setSavedNotification(language === 'es' ? 'Auto-guardado activo' : 'Auto-save active');
    } else {
      setSavedNotification(language === 'es' ? 'Auto-guardado inactivo' : 'Auto-save inactive');
    }
    setTimeout(() => setSavedNotification(null), 3000);
  };

  // Sincronizar automáticamente si autoSaveEnabled está activo
  useEffect(() => {
    if (autoSaveEnabled) {
      saveStoredSettings({
        lensType,
        aspectRatio,
        heightCm,
        weightKg,
        detailLevel,
        addNoise,
        keepExactWardrobe,
        manualBrand,
        customInstructions,
        autoSaveEnabled: true,
      });
      setHasSavedSettings(true);
    }
  }, [
    autoSaveEnabled,
    lensType,
    aspectRatio,
    heightCm,
    weightKg,
    detailLevel,
    addNoise,
    keepExactWardrobe,
    manualBrand,
    customInstructions,
  ]);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('project_trx_intro_seen_v3', 'true');
    } catch (e) {}
    setShowIntro(false);
  };

  useEffect(() => {
    const loaded = loadHistoryFromStorage();
    if (loaded && loaded.length > 0) {
      setHistory(loaded);
    }
  }, []);

  const saveHistory = (newHistory: PromptResult[]) => {
    setHistory(newHistory);
    saveHistoryToStorage(newHistory);
  };

  const handleSaveBatchToHistory = (item: PromptResult) => {
    setHistory((prevHistory) => {
      const newHistoryList = [item, ...prevHistory.filter((h) => h.id !== item.id)].slice(0, 25);
      saveHistoryToStorage(newHistoryList);
      return newHistoryList;
    });
  };

  const handleSaveLifestyleToHistory = (item: PromptResult) => {
    setHistory((prevHistory) => {
      const newHistoryList = [item, ...prevHistory.filter((h) => h.id !== item.id)].slice(0, 25);
      saveHistoryToStorage(newHistoryList);
      return newHistoryList;
    });
  };

  const handleSelectHistory = (item: PromptResult) => {
    if (item.isLifestyle && item.lifestyleData) {
      setActiveLifestyle(item.lifestyleData);
      setCurrentView('lifestyle');
      setIsHistoryOpen(false);
      return;
    }

    if (item.isBatch && item.batchData) {
      setActiveBatch(item.batchData);
      setCurrentView('promptBatches');
      setIsHistoryOpen(false);
      return;
    }

    setGeneratedPrompt({
      positive: item.positivePrompt,
      negative: item.negativePrompt,
      detectedSummary: item.detectedSummary,
      analysis: item.analysis,
    });
    if (item.originalImage) {
      setPreviewUrl(item.originalImage);
      setSelectedFile(null);
    }
    if (item.identityImage) {
      setIdentityPreviewUrl(item.identityImage);
      setIdentityFile(null);
    }
    setStatus(AppStatus.SUCCESS);
    setCurrentView('analyzer');
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    saveHistory(newHistory);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setGeneratedPrompt(null);
    setError(null);
    setStatus(AppStatus.IDLE);

    try {
      const exif = await exifr.parse(file, [
        'Make',
        'Model',
        'FNumber',
        'ExposureTime',
        'ISO',
        'FocalLength',
      ]);
      if (exif) {
        setExifData(exif);
      }
    } catch (err) {
      console.error('Failed to parse EXIF data', err);
    }
  };

  const handleIdentityFileSelect = (file: File) => {
    setIdentityFile(file);
    const url = URL.createObjectURL(file);
    setIdentityPreviewUrl(url);
    setError(null);
  };

  const handleClearScene = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExifData(null);
    setGeneratedPrompt(null);
    setStatus(AppStatus.IDLE);
  };

  const handleClearIdentity = () => {
    setIdentityFile(null);
    setIdentityPreviewUrl(null);
  };

  const handleSwapRoles = () => {
    const tempFile = selectedFile;
    const tempUrl = previewUrl;
    setSelectedFile(identityFile);
    setPreviewUrl(identityPreviewUrl);
    setIdentityFile(tempFile);
    setIdentityPreviewUrl(tempUrl);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    try {
      setStatus(AppStatus.ANALYZING);
      setError(null);
      setIsMobileSettingsOpen(false);

      const sceneDataUrl = await readFileAsDataURL(selectedFile);
      let identityDataUrl: string | null = null;
      if (identityFile) {
        identityDataUrl = await readFileAsDataURL(identityFile);
      }

      const prompt = await analyzeImage(
        sceneDataUrl,
        selectedFile.type,
        lensType,
        detailLevel,
        addNoise,
        customInstructions,
        exifData,
        aspectRatio,
        heightCm ? parseFloat(heightCm) : null,
        weightKg ? parseFloat(weightKg) : null,
        language,
        identityDataUrl,
        identityFile ? identityFile.type : null,
        keepExactWardrobe,
        manualBrand
      );

      setGeneratedPrompt(prompt);
      setStatus(AppStatus.SUCCESS);

      try {
        const thumbnail = await createThumbnail(sceneDataUrl);
        const identityThumb = identityDataUrl ? await createThumbnail(identityDataUrl) : undefined;

        const newHistoryItem: PromptResult = {
          id: Date.now().toString(),
          originalImage: thumbnail,
          identityImage: identityThumb,
          positivePrompt: prompt.positive,
          negativePrompt: prompt.negative,
          detectedSummary: prompt.detectedSummary,
          analysis: prompt.analysis,
          timestamp: Date.now(),
        };
        setHistory((prevHistory) => {
          const newHistoryList = [newHistoryItem, ...prevHistory].slice(0, 20);
          saveHistoryToStorage(newHistoryList);
          return newHistoryList;
        });
      } catch (thumbErr) {
        console.error('Failed to create history thumbnail', thumbErr);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || t('analysisFailed'));
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-[#0F172A] dark:text-[#F1F5F9] selection:bg-[var(--trx-accent)]/20 selection:text-[var(--trx-accent)] transition-colors duration-300">
      {/* 1. Cinematic Studio Intro */}
      {showIntro && <IntroSplash onComplete={handleIntroComplete} />}

      {/* 2. Living Ambient Background with Micro-dot Matrix and Drifting Signal Pixels */}
      <ProjectTrxBackground />

      {/* 3. Global Tools Modals */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />
      <ExamplesModal isOpen={isExamplesOpen} onClose={() => setIsExamplesOpen(false)} />
      <InspirationModal isOpen={isInspirationOpen} onClose={() => setIsInspirationOpen(false)} />

      {/* 4. WORKSPACE DESKTOP & MOBILE INTEGRATED LAYOUT */}
      <div className="w-full max-w-[1500px] mx-auto p-2 sm:p-4 lg:p-5 flex flex-col md:flex-row gap-3.5 lg:gap-5 min-h-screen pb-20 md:pb-6 overflow-x-hidden">
        {/* Left Vertical Studio Rail (Desktop) & Floating Mobile Nav */}
        <TrxStudioNav
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            setIsMobileSettingsOpen(false);
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenExamples={() => setIsExamplesOpen(true)}
          onOpenInspiration={() => setIsInspirationOpen(true)}
          onOpenMobileSettings={() => setIsMobileSettingsOpen(true)}
          historyCount={history.length}
        />

        {/* Central Stage & Command Workspace */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Mobile Top Header - Clean, compact telemetry bar */}
          <div className="md:hidden flex items-center justify-between p-2 px-3 rounded-xl bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-2xs select-none">
            <div className="flex items-center gap-2">
              <TrxLogo size="sm" />
              <div className="flex flex-col">
                <span className="font-mono font-black text-[11px] tracking-wider uppercase text-[#0F172A] dark:text-[#F1F5F9] leading-none">
                  PROJECT TRX
                </span>
                <span className="font-mono text-[8px] text-[#64748B] dark:text-[#8C9BAE] tracking-tight leading-tight mt-0.5">
                  OPTICAL SIGNAL STATION
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="flex items-center bg-[#F1F5F9] dark:bg-[#080A0E] p-0.5 rounded border border-[#CBD5E1] dark:border-[#222A36]">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-all cursor-pointer ${
                    language === 'es'
                      ? 'bg-white dark:bg-[#181D26] text-[#0F172A] dark:text-[#F1F5F9] font-bold'
                      : 'text-[#64748B]'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-white dark:bg-[#181D26] text-[#0F172A] dark:text-[#F1F5F9] font-bold'
                      : 'text-[#64748B]'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 min-h-[30px] min-w-[30px] rounded bg-[#F1F5F9] dark:bg-[#181D26] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] border border-[#CBD5E1] dark:border-[#2C3645] flex items-center justify-center cursor-pointer font-mono text-[10px]"
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span className="w-2 h-2 rounded-2xs" style={{ backgroundColor: isDark ? '#FFCC00' : '#00F0FF' }} />
              </button>
            </div>
          </div>

          {/* MAIN STAGE CONTENT */}
          {currentView === 'analyzer' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-5 items-start">
              {/* Central Viewport & Result Section (Lg: 8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                {/* Image Stage Container with Ambient Optical Halo */}
                <div className="relative rounded-xl overflow-hidden">
                  <AmbientHalo imageUrl={previewUrl} />

                  {/* Main Uploader with internal self-contained scanning robots */}
                  <Uploader
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    previewUrl={previewUrl}
                    onClearScene={handleClearScene}
                    onIdentityFileSelect={handleIdentityFileSelect}
                    identityFile={identityFile}
                    identityPreviewUrl={identityPreviewUrl}
                    onClearIdentity={handleClearIdentity}
                    onSwapRoles={handleSwapRoles}
                    disabled={status === AppStatus.ANALYZING}
                    isAnalyzing={status === AppStatus.ANALYZING}
                  />
                </div>

                {/* Tactical Command Bar (Mobile & Desktop) */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {/* Mobile Quick Optics/Settings Button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileSettingsOpen(true)}
                    className="lg:hidden flex-1 sm:flex-none py-2 px-3 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-xs font-mono font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--trx-accent,#00F0FF)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>{language === 'es' ? 'Óptica y ajustes' : 'Optics & Settings'}</span>
                  </button>

                  {/* Primary Generation Execution Button */}
                  <ChampagneCapsuleButton
                    onClick={handleGenerate}
                    disabled={!selectedFile || status === AppStatus.ANALYZING}
                    isLoading={status === AppStatus.ANALYZING}
                    loadingText={t('reviewingScene')}
                    label={t('generateTrxPromptAction')}
                    className="flex-1 sm:flex-none"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded flex flex-col gap-2 shadow-xs select-none">
                    <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 text-xs font-mono font-bold">
                      <svg className="w-4 h-4 text-[#FF3366] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>[ERROR // {t('unexpectedError')}]</span>
                    </div>
                    <p className="text-rose-800 dark:text-rose-300 text-xs font-mono leading-relaxed">{error}</p>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold rounded transition-colors cursor-pointer min-h-[34px]"
                      >
                        [ {t('retry')} ]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setStatus(AppStatus.IDLE);
                        }}
                        className="py-1 px-3 bg-white dark:bg-[#181D26] border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold rounded transition-colors cursor-pointer min-h-[34px]"
                      >
                        [ {t('clear')} ]
                      </button>
                    </div>
                  </div>
                )}

                {/* Smooth Morphing Results Section */}
                {generatedPrompt && (
                  <div className="animate-in fade-in duration-300">
                    <ResultCard
                      prompt={generatedPrompt.positive}
                      negativePrompt={generatedPrompt.negative}
                      detectedSummary={generatedPrompt.detectedSummary}
                      analysis={generatedPrompt.analysis}
                      onPromptChange={(updated) => {
                        setGeneratedPrompt((prev) => (prev ? { ...prev, positive: updated } : null));
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Right Inspector Panel (Lg: 4 cols) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-4">
                <TrxInspectorPanel
                  lensType={lensType}
                  setLensType={setLensType}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  heightCm={heightCm}
                  setHeightCm={setHeightCm}
                  weightKg={weightKg}
                  setWeightKg={setWeightKg}
                  detailLevel={detailLevel}
                  setDetailLevel={setDetailLevel}
                  addNoise={addNoise}
                  setAddNoise={setAddNoise}
                  keepExactWardrobe={keepExactWardrobe}
                  setKeepExactWardrobe={setKeepExactWardrobe}
                  manualBrand={manualBrand}
                  setManualBrand={setManualBrand}
                  customInstructions={customInstructions}
                  setCustomInstructions={setCustomInstructions}
                  exifData={exifData}
                  isAnalyzing={status === AppStatus.ANALYZING}
                  onGenerate={handleGenerate}
                  hasReference={!!selectedFile}
                  onSaveSettings={handleSaveSettings}
                  onResetSettings={handleResetSettings}
                  onLoadSavedSettings={handleLoadSavedSettings}
                  autoSaveEnabled={autoSaveEnabled}
                  onToggleAutoSave={handleToggleAutoSave}
                  hasCustomSettingsSaved={hasSavedSettings}
                  savedNotification={savedNotification}
                />
              </div>
            </div>
          ) : currentView === 'ideaBuilder' ? (
            /* CONSTRUYE TU IDEA STAGE */
            <div className="w-full">
              <IdeaBuilderSection />
            </div>
          ) : currentView === 'promptBatches' ? (
            /* LOTES DE PROMPTS STAGE */
            <div className="w-full">
              <PromptBatchSection
                initialBatch={activeBatch}
                onSaveToHistory={handleSaveBatchToHistory}
              />
            </div>
          ) : (
            /* LIFESTYLE STAGE */
            <div className="w-full">
              <LifestyleSection
                initialResult={activeLifestyle}
                onSaveToHistory={handleSaveLifestyleToHistory}
              />
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MOBILE BOTTOM SHEET: "Óptica y ajustes"
         ────────────────────────────────────────────────────────── */}
      {isMobileSettingsOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
          onClick={() => setIsMobileSettingsOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] bg-white dark:bg-[#11151C] rounded-t-2xl border-t border-[#CBD5E1] dark:border-[#222A36] p-3.5 sm:p-4 flex flex-col gap-3 shadow-2xl overflow-y-auto select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto shrink-0" />
            <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1] dark:border-[#222A36]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)]" />
                <span className="font-mono font-bold text-xs tracking-wider uppercase text-[#0F172A] dark:text-[#F1F5F9]">
                  03 // {language === 'es' ? 'Óptica y ajustes' : 'Optics & Settings'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSettingsOpen(false)}
                className="w-8 h-8 rounded bg-[#F1F5F9] dark:bg-[#181D26] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] flex items-center justify-center text-xs font-mono font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <TrxInspectorPanel
              lensType={lensType}
              setLensType={setLensType}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              heightCm={heightCm}
              setHeightCm={setHeightCm}
              weightKg={weightKg}
              setWeightKg={setWeightKg}
              detailLevel={detailLevel}
              setDetailLevel={setDetailLevel}
              addNoise={addNoise}
              setAddNoise={setAddNoise}
              keepExactWardrobe={keepExactWardrobe}
              setKeepExactWardrobe={setKeepExactWardrobe}
              manualBrand={manualBrand}
              setManualBrand={setManualBrand}
              customInstructions={customInstructions}
              setCustomInstructions={setCustomInstructions}
              exifData={exifData}
              isAnalyzing={status === AppStatus.ANALYZING}
              onGenerate={() => {
                setIsMobileSettingsOpen(false);
                handleGenerate();
              }}
              hasReference={!!selectedFile}
              onSaveSettings={handleSaveSettings}
              onResetSettings={handleResetSettings}
              onLoadSavedSettings={handleLoadSavedSettings}
              autoSaveEnabled={autoSaveEnabled}
              onToggleAutoSave={handleToggleAutoSave}
              hasCustomSettingsSaved={hasSavedSettings}
              savedNotification={savedNotification}
              hideHeader={true}
              className="border-none shadow-none p-0 bg-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
