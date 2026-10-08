import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { generatePromptFromIdea } from '../apiService';
import { getStoredSettings, saveStoredSettings, subscribeToSettings } from '../settingsService';
import ChampagneCapsuleButton from './ChampagneCapsuleButton';
import TextStructureCanvas from './TextStructureCanvas';

const TEMPLATE_EXAMPLE = `Subject A: [exact action with a real object and natural body position]. Wardrobe: [fabric, fit, seams, folds, contact points and small imperfections]. Environment: [specific location, foreground objects, middle distance and ordinary background]. Camera: rear smartphone camera, 24mm equivalent main lens at 1x, camera height [ ], distance [ ], vertical 9:16, focus on [ ]. Light: [real source, direction, falloff and shadow softness]. Capture imperfections: [one or two plausible phone defects only]. Use the separate personal reference image for identity only; do not describe or copy another person's face or body.`;

const IdeaBuilderSection: React.FC = () => {
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [autoText, setAutoText] = useState('');
  const [manualText, setManualText] = useState(TEMPLATE_EXAMPLE);

  // Quick calibration parameters
  const [gesture, setGesture] = useState('auto');
  const [customGesture, setCustomGesture] = useState('');
  const [mood, setMood] = useState('auto');
  const [customMood, setCustomMood] = useState('');
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    positive: string;
    negative: string;
    detectedSummary?: string;
  } | null>(null);

  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [syncedNotice, setSyncedNotice] = useState(false);
  const [savedMeasurementsToast, setSavedMeasurementsToast] = useState<string | null>(null);

  // Load defaults from stored settings
  useEffect(() => {
    const s = getStoredSettings();
    if (s.heightCm) setHeightCm(s.heightCm);
    if (s.weightKg) setWeightKg(s.weightKg);

    const unsub = subscribeToSettings((newSettings) => {
      if (newSettings.heightCm) setHeightCm(newSettings.heightCm);
      if (newSettings.weightKg) setWeightKg(newSettings.weightKg);
    });
    return unsub;
  }, []);

  const handleSaveMeasurements = () => {
    const current = getStoredSettings();
    saveStoredSettings({
      ...current,
      heightCm,
      weightKg,
    });
    setSavedMeasurementsToast(language === 'es' ? 'Medidas guardadas' : 'Measurements saved');
    setTimeout(() => setSavedMeasurementsToast(null), 2500);
  };

  const handleLoadSavedMeasurements = () => {
    const s = getStoredSettings();
    if (s.heightCm) setHeightCm(s.heightCm);
    if (s.weightKg) setWeightKg(s.weightKg);
    setSavedMeasurementsToast(language === 'es' ? 'Medidas cargadas' : 'Measurements loaded');
    setTimeout(() => setSavedMeasurementsToast(null), 2000);
  };

  const handleResetTemplate = () => {
    setManualText(TEMPLATE_EXAMPLE);
  };

  const GESTURE_OPTIONS = [
    { id: 'auto', label: `[AUTO] ${t('gestureAuto')}` },
    { id: 'relaxed standing posture', label: t('gestureStanding') },
    { id: 'sitting candidly', label: t('gestureSitting') },
    { id: 'walking mid-stride', label: t('gestureWalking') },
    { id: 'leaning against wall', label: t('gestureLeaning') },
    { id: 'hand touching hair/face', label: t('gestureHandFace') },
    { id: 'hands in pockets', label: t('gesturePockets') },
    { id: 'custom', label: `[+] ${t('gestureCustom')}` },
  ];

  const MOOD_OPTIONS = [
    { id: 'auto', label: `[AUTO] ${t('moodAuto')}` },
    { id: 'confident and calm', label: t('moodConfident') },
    { id: 'melancholic and contemplative', label: t('moodMelancholic') },
    { id: 'intense editorial expression', label: t('moodEditorial') },
    { id: 'warm and gentle smile', label: t('moodSmiling') },
    { id: 'mysterious and alluring', label: t('moodMysterious') },
    { id: 'custom', label: `[+] ${t('moodCustom')}` },
  ];

  const ASPECT_RATIO_PRESETS = [
    { id: 'auto', label: 'AUTO' },
    { id: '9:16', label: '9:16' },
    { id: '1:1', label: '1:1' },
    { id: '16:9', label: '16:9' },
    { id: '3:4', label: '3:4' },
    { id: '4:3', label: '4:3' },
  ];

  const handleGenerate = async () => {
    const textToProcess = mode === 'auto' ? autoText.trim() : manualText.trim();
    if (!textToProcess) {
      setError(t('emptyIdeaError'));
      return;
    }

    const effectiveGesture =
      gesture === 'custom'
        ? customGesture.trim() || 'auto'
        : gesture === 'auto'
        ? 'auto'
        : GESTURE_OPTIONS.find((o) => o.id === gesture)?.label || gesture;

    const effectiveMood =
      mood === 'custom'
        ? customMood.trim() || 'auto'
        : mood === 'auto'
        ? 'auto'
        : MOOD_OPTIONS.find((o) => o.id === mood)?.label || mood;

    try {
      setError(null);
      setGeneratedResult(null);
      setIsGenerating(true);
      const result = await generatePromptFromIdea(
        textToProcess,
        effectiveGesture,
        effectiveMood,
        aspectRatio,
        heightCm ? parseFloat(heightCm) : null,
        weightKg ? parseFloat(weightKg) : null,
        mode,
        language
      );
      setGeneratedResult(result);
    } catch (err: any) {
      console.error('Idea generation error:', err);
      setError(err.message || t('ideaGenerationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPositive = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult.positive);
      setCopiedPositive(true);
      setTimeout(() => setCopiedPositive(false), 2000);
    } catch (err) {
      console.error('Failed to copy positive prompt:', err);
    }
  };

  const handleCopyNegative = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult.negative);
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    } catch (err) {
      console.error('Failed to copy negative prompt:', err);
    }
  };

  const handleCopySummary = async () => {
    if (!generatedResult?.detectedSummary) return;
    try {
      await navigator.clipboard.writeText(generatedResult.detectedSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleApplySummaryCorrections = () => {
    if (!generatedResult?.detectedSummary) return;
    const isEs = language === 'es';
    const prefix = isEs ? '[AJUSTES DEL CONCEPTO: ' : '[CONCEPT ADJUSTMENTS: ';
    const currentPos = generatedResult.positive;
    const updated = currentPos.includes(prefix)
      ? currentPos.replace(new RegExp(`\\${prefix}[^\\]]+\\]`), `${prefix}${generatedResult.detectedSummary.trim().replace(/\n+/g, '; ')}]`)
      : `${currentPos}\n\n${prefix}${generatedResult.detectedSummary.trim().replace(/\n+/g, '; ')}]`;

    setGeneratedResult({ ...generatedResult, positive: updated });
    setSyncedNotice(true);
    setTimeout(() => setSyncedNotice(false), 2500);
  };

  const handleCopyAll = async () => {
    if (!generatedResult) return;
    try {
      const isEs = language === 'es';
      const fullText = `${isEs ? 'PROMPT POSITIVO:' : 'POSITIVE PROMPT:'}\n${generatedResult.positive}\n\n${isEs ? 'PROMPT NEGATIVO:' : 'NEGATIVE PROMPT:'}\n${generatedResult.negative}${generatedResult.detectedSummary ? `\n\n${isEs ? 'RESUMEN CONCEPTUAL:' : 'CONCEPT SUMMARY:'}\n${generatedResult.detectedSummary}` : ''}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy full prompt:', err);
    }
  };

  return (
    <div className="relative flex flex-col gap-3 max-w-4xl mx-auto w-full animate-in fade-in duration-300 pb-20 md:pb-6 select-none">
      {/* Visual Text Structuring and Convergence Animation Layer */}
      <TextStructureCanvas
        text={mode === 'auto' ? autoText : manualText}
        isGenerating={isGenerating}
        hasResult={Boolean(generatedResult)}
      />

      {/* 01: Mode Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD5E1] dark:border-[#222A36]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)]" />
            <h2 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] tracking-wider uppercase">
              02 // {t('tabIdeaBuilder')}
            </h2>
          </div>
          <p className="text-[10px] text-[#64748B] dark:text-[#8C9BAE] mt-0.5 font-mono">
            {mode === 'auto' ? '[MODO 01: LENGUAJE NATURAL]' : '[MODO 02: PLANTILLA FORENSE]'}
          </p>
        </div>

        {/* Compact Mode Tabs */}
        <div className="inline-flex p-0.5 bg-[#F1F5F9] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[34px] ${
              mode === 'auto'
                ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-2xs'
                : 'text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <span>[ 01 AUTOMÁTICO ]</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[34px] ${
              mode === 'manual'
                ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-2xs'
                : 'text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
            }`}
          >
            <span>[ 02 MANUAL ]</span>
          </button>
        </div>
      </div>

      {/* 02: Focused Input Area */}
      <div className="rounded-xl p-3 sm:p-3.5 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
          <span>{mode === 'auto' ? '02.1 // ENTRADA DE IDEA LIBRE' : '02.1 // VARIABLES FORENSES ENTRE CORCHETES'}</span>

          {mode === 'manual' && (
            <button
              type="button"
              onClick={handleResetTemplate}
              className="text-[11px] hover:underline flex items-center gap-1 text-[var(--trx-accent,#00F0FF)] cursor-pointer min-h-[30px]"
            >
              <span>[ ↺ RESET ]</span>
            </button>
          )}
        </div>

        {mode === 'auto' ? (
          <textarea
            value={autoText}
            onChange={(e) => setAutoText(e.target.value)}
            placeholder={t('autoModePlaceholder')}
            rows={3}
            className="w-full p-2.5 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#4B5869] focus:outline-none resize-y leading-relaxed font-sans select-text"
          />
        ) : (
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={5}
            className="w-full p-2.5 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#4B5869] focus:outline-none resize-y leading-relaxed select-text"
          />
        )}
      </div>

      {/* 03: Optical Refinement Stations */}
      <div className="rounded-xl p-3 sm:p-3.5 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1 border-b border-[#CBD5E1] dark:border-[#222A36]">
          <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] uppercase">
            02.2 // {t('refineControlsTitle')}
          </span>
          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
            [OPTICAL TELEMETRY]
          </span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Gesto */}
          <div>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-0.5 uppercase">
              // {t('gestureTitle')}
            </span>
            <select
              value={gesture}
              onChange={(e) => setGesture(e.target.value)}
              disabled={isGenerating}
              className="w-full py-1.5 px-2 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
            >
              {GESTURE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {gesture === 'custom' && (
              <input
                type="text"
                value={customGesture}
                onChange={(e) => setCustomGesture(e.target.value)}
                placeholder={t('customGesturePlaceholder')}
                disabled={isGenerating}
                className="w-full mt-1 py-1 px-2 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] min-h-[34px] select-text"
              />
            )}
          </div>

          {/* Estado de Ánimo */}
          <div>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-0.5 uppercase">
              // {t('moodTitle')}
            </span>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={isGenerating}
              className="w-full py-1.5 px-2 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
            >
              {MOOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {mood === 'custom' && (
              <input
                type="text"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder={t('customMoodPlaceholder')}
                disabled={isGenerating}
                className="w-full mt-1 py-1 px-2 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] min-h-[34px] select-text"
              />
            )}
          </div>

          {/* Relación de Aspecto */}
          <div>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-0.5 uppercase">
              // {t('aspectRatio')}
            </span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
              className="w-full py-1.5 px-2 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
            >
              {ASPECT_RATIO_PRESETS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Medidas Físicas */}
          <div>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-0.5 uppercase">
              // {t('physicalMeasurements')}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="260"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  disabled={isGenerating}
                  className="w-full py-1.5 px-2 pr-6 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] min-h-[36px] select-text"
                />
                <span className="absolute right-1.5 top-2 text-[9px] font-mono text-[#64748B]">cm</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="350"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  disabled={isGenerating}
                  className="w-full py-1.5 px-2 pr-6 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] min-h-[36px] select-text"
                />
                <span className="absolute right-1.5 top-2 text-[9px] font-mono text-[#64748B]">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Measurements Toolbar */}
        <div className="flex flex-wrap items-center justify-between pt-1.5 border-t border-[#CBD5E1]/70 dark:border-[#222A36]/70 text-xs gap-2">
          <div className="flex items-center gap-1.5 w-full xs:w-auto">
            <button
              type="button"
              onClick={handleLoadSavedMeasurements}
              className="flex-1 xs:flex-none py-1 px-2.5 min-h-[34px] rounded text-[11px] font-mono font-medium bg-[#F1F5F9] dark:bg-[#080A0E] hover:bg-[#E2E8F0] dark:hover:bg-[#181D26] text-[#0F172A] dark:text-[#F1F5F9] border border-[#CBD5E1] dark:border-[#222A36] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title={t('useSavedMeasurements')}
            >
              <svg className="w-3.5 h-3.5 text-[var(--trx-accent,#00F0FF)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="truncate">{t('useSavedMeasurements')}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveMeasurements}
              className="flex-1 xs:flex-none py-1 px-2.5 min-h-[34px] rounded text-[11px] font-mono font-medium bg-white dark:bg-[#181D26] hover:bg-[#F8FAFC] dark:hover:bg-[#222A36] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] border border-[#CBD5E1] dark:border-[#222A36] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title={t('saveMeasurementsAsDefault')}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="truncate">{t('saveMeasurementsAsDefault')}</span>
            </button>
          </div>

          {savedMeasurementsToast && (
            <span className="text-[11px] font-mono text-[#00FF66] font-bold flex items-center gap-1">
              <span>✓</span>
              <span>{savedMeasurementsToast}</span>
            </span>
          )}
        </div>
      </div>

      {/* 04: Action Button */}
      <div className="flex justify-end pt-1">
        <ChampagneCapsuleButton
          onClick={handleGenerate}
          disabled={isGenerating || (mode === 'auto' ? !autoText.trim() : !manualText.trim())}
          isLoading={isGenerating}
          loadingText={t('generatingFinalPrompt')}
          label={t('generateFinalPrompt')}
          className="w-auto"
        />
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded flex items-center gap-2 text-xs font-mono text-[#FF3366]">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 05: Clean Generated Document Result */}
      {!isGenerating && generatedResult && (
        <div className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-sm flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD5E1] dark:border-[#222A36]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00FF66]" />
              <h3 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                04 // {language === 'es' ? 'PROMPT SINTETIZADO' : 'SYNTHESIZED PROMPT'}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-h-[36px] uppercase tracking-wider ${
                copiedAll
                  ? 'bg-[#00FF66] text-[#080A0E]'
                  : 'bg-[#0F172A] hover:bg-[#181D26] dark:bg-[var(--trx-accent,#00F0FF)] dark:hover:brightness-110 text-white dark:text-[#080A0E] active:scale-98'
              }`}
            >
              {copiedAll ? (
                <span>[ ¡COPIADO COMPLETO! ]</span>
              ) : (
                <span>[ COPIAR PROMPT COMPLETO ]</span>
              )}
            </button>
          </div>

          {/* Editable Detected Idea Summary */}
          {generatedResult.detectedSummary && (
            <div className="border rounded p-2.5 flex flex-col gap-1.5 bg-[#F8FAFC] dark:bg-[#080A0E] border-[#CBD5E1] dark:border-[#222A36]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                  04.0 // {t('detectedIdeaSummaryTitle')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="text-[11px] font-mono hover:underline font-bold px-1.5 py-0.5 cursor-pointer text-[var(--trx-accent,#00F0FF)]"
                  >
                    {copiedSummary ? '[ COPIADO ]' : '[ COPIAR RESUMEN ]'}
                  </button>

                  <button
                    type="button"
                    onClick={handleApplySummaryCorrections}
                    style={{
                      backgroundColor: 'var(--trx-accent, #00F0FF)',
                      color: 'var(--trx-accent-contrast, #080A0E)',
                    }}
                    className="text-[11px] font-mono font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span>[ APLICAR AL PROMPT ]</span>
                  </button>
                </div>
              </div>

              <textarea
                value={generatedResult.detectedSummary}
                onChange={(e) => setGeneratedResult({ ...generatedResult, detectedSummary: e.target.value })}
                rows={2}
                className="w-full p-2 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none resize-y select-text"
                placeholder={t('detectedSummaryPlaceholder')}
              />

              {syncedNotice && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#00FF66] font-bold">
                  <span>✓</span>
                  <span>{t('summarySaved')}</span>
                </div>
              )}
            </div>
          )}

          {/* Positive Prompt */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              <span>04.1 // {language === 'es' ? 'PROMPT POSITIVO' : 'POSITIVE PROMPT'}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#64748B] dark:text-[#8C9BAE]">
                  [{generatedResult.positive.split(/\s+/).filter(Boolean).length} WORDS]
                </span>
                <button
                  type="button"
                  onClick={handleCopyPositive}
                  className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[32px] ${
                    copiedPositive
                      ? 'bg-[#00FF66] text-[#080A0E]'
                      : 'bg-[#F1F5F9] dark:bg-[#181D26] hover:bg-[#E2E8F0] dark:hover:bg-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] border border-[#CBD5E1] dark:border-[#2C3645]'
                  }`}
                >
                  {copiedPositive ? '[ COPIADO ]' : '[ COPIAR ]'}
                </button>
              </div>
            </div>

            <textarea
              value={generatedResult.positive}
              onChange={(e) => setGeneratedResult({ ...generatedResult, positive: e.target.value })}
              rows={5}
              className="w-full p-2.5 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs sm:text-[13px] text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed focus:outline-none resize-y select-text"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1 pt-1.5 border-t border-[#CBD5E1] dark:border-[#222A36]">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              <span className="text-[#64748B] dark:text-[#8C9BAE]">04.2 // {language === 'es' ? 'PROMPT NEGATIVO' : 'NEGATIVE PROMPT'}</span>
              <button
                type="button"
                onClick={handleCopyNegative}
                className="text-xs font-mono font-bold hover:underline transition-colors cursor-pointer text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] min-h-[30px] flex items-center"
              >
                {copiedNegative ? '[ COPIADO ]' : '[ COPIAR NEGATIVO ]'}
              </button>
            </div>

            <textarea
              value={generatedResult.negative}
              onChange={(e) => setGeneratedResult({ ...generatedResult, negative: e.target.value })}
              rows={3}
              className="w-full p-2.5 bg-white/70 dark:bg-[#080A0E]/70 border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs text-[#64748B] dark:text-[#8C9BAE] italic leading-relaxed focus:outline-none resize-y select-text"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaBuilderSection;
