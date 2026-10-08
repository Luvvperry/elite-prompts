import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { generatePromptBatch } from '../apiService';
import { BatchPromptItem, BatchPromptResult, PromptResult } from '../types';
import { COUNTRIES, detectCountryFromText } from '../countries';
import ChampagneCapsuleButton from './ChampagneCapsuleButton';

interface PromptBatchSectionProps {
  onSaveToHistory?: (result: PromptResult) => void;
  initialBatch?: BatchPromptResult | null;
  defaultHeightCm?: string;
  defaultWeightKg?: string;
}

const PromptBatchSection: React.FC<PromptBatchSectionProps> = ({
  onSaveToHistory,
  initialBatch,
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  // Form State
  const [ideaText, setIdeaText] = useState(initialBatch?.idea || '');
  const [quantity, setQuantity] = useState<number>(initialBatch?.quantity || 100);
  const [customQtyInput, setCustomQtyInput] = useState<string>('');

  // Gender Selection State (Optional buttons: «Mujer» / «Hombre», neither selected by default)
  const [selectedGender, setSelectedGender] = useState<'woman' | 'man' | null>(() => {
    if (initialBatch?.gender === 'woman') return 'woman';
    if (initialBatch?.gender === 'man') return 'man';
    return null;
  });

  // Physical Measurements State (Height & Weight - only included when explicitly entered for this batch, never preloaded)
  const [heightCm, setHeightCm] = useState<string>(() => {
    return initialBatch?.heightCm || '';
  });
  const [weightKg, setWeightKg] = useState<string>(() => {
    return initialBatch?.weightKg || '';
  });

  // Country State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    if (initialBatch?.country) {
      const match = COUNTRIES.find((c) => c.es === initialBatch.country || c.en === initialBatch.country);
      return match ? match.code : 'none';
    }
    return 'none';
  });
  const [isManualCountrySelection, setIsManualCountrySelection] = useState<boolean>(Boolean(initialBatch?.country));
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Accordion state (closed by default)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Execution & Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 100 });
  const [error, setError] = useState<string | null>(null);

  // Results State
  const [generatedBatch, setGeneratedBatch] = useState<BatchPromptResult | null>(() => {
    if (!initialBatch) return null;
    // Normalize initialBatch prompts if they were legacy string[]
    const normalizedPrompts: BatchPromptItem[] = initialBatch.prompts.map((p, idx) => {
      if (typeof p === 'string') {
        return {
          id: `initial_${idx}`,
          positive: p,
          negative: isEs ? '[PROMPT NEGATIVO]\n\nExclusiones automáticas.' : '[NEGATIVE PROMPT]\n\nAutomatic exclusions.',
        };
      }
      return p;
    });
    return {
      ...initialBatch,
      prompts: normalizedPrompts,
    };
  });

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndices, setCopiedIndices] = useState<Record<number, boolean>>({});
  const [showNegativeForIndex, setShowNegativeForIndex] = useState<Record<number, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // Real-time automatic country detection from ideaText
  const detectedCountry = useMemo(() => {
    return detectCountryFromText(ideaText);
  }, [ideaText]);

  // Sync auto-detected country if user hasn't explicitly locked a manual choice
  useEffect(() => {
    if (!isManualCountrySelection) {
      if (detectedCountry) {
        setSelectedCountryCode(detectedCountry.code);
      } else {
        setSelectedCountryCode('none');
      }
    }
  }, [detectedCountry, isManualCountrySelection]);

  // Selected Country Object
  const selectedCountryObj = useMemo(() => {
    return COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
  }, [selectedCountryCode]);

  const selectedCountryName = isEs ? selectedCountryObj.es : selectedCountryObj.en;

  // Filtered countries for search menu
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) => c.es.toLowerCase().includes(q) || c.en.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const handleSelectQuantity = (qty: number) => {
    setQuantity(qty);
    setCustomQtyInput('');
  };

  const handleCustomQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomQtyInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(Math.min(300, Math.max(1, parsed)));
    }
  };

  const handleResetToAutoCountry = () => {
    setIsManualCountrySelection(false);
    if (detectedCountry) {
      setSelectedCountryCode(detectedCountry.code);
    } else {
      setSelectedCountryCode('none');
    }
  };

  const handleManualCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    setIsManualCountrySelection(true);
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
  };

  const handleGenerate = async () => {
    if (!ideaText.trim()) {
      setError(isEs ? 'Por favor escribe una idea para generar el lote.' : 'Please enter an idea to generate the batch.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgress({ completed: 0, total: quantity });

      const countryParam = selectedCountryCode !== 'none' ? selectedCountryName : undefined;
      const cleanHeight = heightCm.trim() || undefined;
      const cleanWeight = weightKg.trim() || undefined;

      const rawItems = await generatePromptBatch(
        ideaText,
        quantity,
        countryParam,
        language,
        (progressData) => {
          setProgress({ completed: progressData.completed, total: progressData.total });
        },
        cleanHeight,
        cleanWeight,
        selectedGender
      );

      const batchResult: BatchPromptResult = {
        id: Date.now().toString(),
        idea: ideaText.trim(),
        quantity: rawItems.length,
        country: countryParam,
        detectedCountry: detectedCountry ? (isEs ? detectedCountry.nameEs : detectedCountry.nameEn) : undefined,
        heightCm: cleanHeight,
        weightKg: cleanWeight,
        gender: selectedGender || undefined,
        prompts: rawItems,
        timestamp: Date.now(),
      };

      setGeneratedBatch(batchResult);
      setCurrentPage(1);
      setFilterQuery('');

      // Save to global TRX history
      if (onSaveToHistory) {
        const genderTag = selectedGender
          ? ` [${selectedGender === 'woman' ? (isEs ? 'Mujer' : 'Woman') : (isEs ? 'Hombre' : 'Man')}]`
          : '';
        const measurementsTag = cleanHeight || cleanWeight
          ? ` [${[cleanHeight ? `${cleanHeight} cm` : '', cleanWeight ? `${cleanWeight} kg` : ''].filter(Boolean).join(' · ')}]`
          : '';
        onSaveToHistory({
          id: batchResult.id,
          positivePrompt: `[LOTE: ${rawItems.length} PROMPTS] "${ideaText.trim()}"${countryParam ? ` (${countryParam})` : ''}${genderTag}${measurementsTag}`,
          negativePrompt: rawItems[0]?.negative || '[LOTE COMPLETO DE VARIACIONES]',
          detectedSummary: isEs
            ? `Lote de ${rawItems.length} prompts fotográficos (24mm 1x, 9:16 vertical) generados a partir de: "${ideaText.trim()}"${countryParam ? ` en ${countryParam}` : ''}${selectedGender ? ` (Sujeto: ${selectedGender === 'woman' ? 'Mujer' : 'Hombre'})` : ''}${cleanHeight || cleanWeight ? ` (Sujeto A: ${[cleanHeight ? `${cleanHeight} cm` : '', cleanWeight ? `${cleanWeight} kg` : ''].filter(Boolean).join(', ')})` : ''}.`
            : `Batch of ${rawItems.length} photographic prompts (24mm 1x, 9:16 vertical) generated from: "${ideaText.trim()}"${countryParam ? ` set in ${countryParam}` : ''}${selectedGender ? ` (Subject: ${selectedGender === 'woman' ? 'Woman' : 'Man'})` : ''}${cleanHeight || cleanWeight ? ` (Subject A: ${[cleanHeight ? `${cleanHeight} cm` : '', cleanWeight ? `${cleanWeight} kg` : ''].filter(Boolean).join(', ')})` : ''}.`,
          timestamp: batchResult.timestamp,
          isBatch: true,
          batchData: batchResult,
        });
      }
    } catch (err: any) {
      console.error('Batch generation error:', err);
      setError(err.message || (isEs ? 'Error al generar el lote de prompts.' : 'Error generating prompt batch.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (!generatedBatch || generatedBatch.prompts.length === 0) return;
    const countryHeader = generatedBatch.country ? ` | Contexto: ${generatedBatch.country}` : '';
    const genderHeader = generatedBatch.gender ? ` | Sujeto: ${generatedBatch.gender === 'woman' ? 'Mujer' : 'Hombre'}` : '';
    const measurementsHeader = (generatedBatch.heightCm || generatedBatch.weightKg)
      ? ` | Sujeto A: ${[generatedBatch.heightCm ? `${generatedBatch.heightCm} cm` : '', generatedBatch.weightKg ? `${generatedBatch.weightKg} kg` : ''].filter(Boolean).join(', ')}`
      : '';
    const fullText = [
      `PROJECT TRX // LOTE DE PROMPTS (${generatedBatch.prompts.length})`,
      `CÁMARA: Cámara principal de celular real, 24 mm equivalente, 1x, perspectiva natural`,
      `FORMATO: Composición vertical 9:16`,
      `Idea: "${generatedBatch.idea}"${countryHeader}${genderHeader}${measurementsHeader}`,
      `Fecha: ${new Date(generatedBatch.timestamp).toLocaleString()}`,
      `==================================================`,
      '',
      ...generatedBatch.prompts.map((p, idx) => {
        const positive = typeof p === 'string' ? p : p.positive;
        const negative = typeof p === 'string' ? '' : p.negative;
        return `[PROMPT #${(idx + 1).toString().padStart(3, '0')}]\n${positive}\n\n${negative}\n--------------------------------------------------\n`;
      }),
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopySinglePositive = (item: BatchPromptItem | string, index: number) => {
    const positiveText = typeof item === 'string' ? item : item.positive;
    navigator.clipboard.writeText(positiveText);
    setCopiedIndices((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedIndices((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const handleCopySingleNegative = (item: BatchPromptItem | string) => {
    const negativeText = typeof item === 'string' ? '' : item.negative;
    if (negativeText) {
      navigator.clipboard.writeText(negativeText);
    }
  };

  const handleDownloadTxt = () => {
    if (!generatedBatch) return;
    const countryHeader = generatedBatch.country ? ` | Contexto: ${generatedBatch.country}` : '';
    const genderHeader = generatedBatch.gender ? ` | Sujeto: ${generatedBatch.gender === 'woman' ? 'Mujer' : 'Hombre'}` : '';
    const measurementsHeader = (generatedBatch.heightCm || generatedBatch.weightKg)
      ? ` | Sujeto A: ${[generatedBatch.heightCm ? `${generatedBatch.heightCm} cm` : '', generatedBatch.weightKg ? `${generatedBatch.weightKg} kg` : ''].filter(Boolean).join(', ')}`
      : '';
    const fullText = [
      `PROJECT TRX — OPTICAL SIGNAL STATION`,
      `LOTE DE PROMPTS FOTOGRÁFICOS (${generatedBatch.prompts.length})`,
      `ESPECIFICACIÓN: Cámara celular real 24 mm equivalente, 1x, Composición vertical 9:16`,
      `Idea: "${generatedBatch.idea}"${countryHeader}${genderHeader}${measurementsHeader}`,
      `Fecha: ${new Date(generatedBatch.timestamp).toLocaleString()}`,
      `==================================================`,
      '',
      ...generatedBatch.prompts.map((p, idx) => {
        const positive = typeof p === 'string' ? p : p.positive;
        const negative = typeof p === 'string' ? '' : p.negative;
        return `[#${(idx + 1).toString().padStart(3, '0')}]\n${positive}\n\n${negative}\n\n--------------------------------------------------\n`;
      }),
    ].join('\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeIdea = generatedBatch.idea.slice(0, 25).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `trx_lote_${generatedBatch.prompts.length}_${safeIdea || 'prompts'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!generatedBatch) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(generatedBatch, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    const safeIdea = generatedBatch.idea.slice(0, 25).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `trx_lote_${generatedBatch.prompts.length}_${safeIdea || 'prompts'}.json`;
    link.click();
  };

  // Filtered prompts list
  const filteredPromptsWithIndex = useMemo(() => {
    if (!generatedBatch) return [];
    return generatedBatch.prompts
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!filterQuery.trim()) return true;
        const q = filterQuery.toLowerCase().trim();
        const pos = typeof item === 'string' ? item : item.positive;
        const neg = typeof item === 'string' ? '' : item.negative;
        return pos.toLowerCase().includes(q) || neg.toLowerCase().includes(q);
      });
  }, [generatedBatch, filterQuery]);

  const totalPages = Math.ceil(filteredPromptsWithIndex.length / PAGE_SIZE) || 1;
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPromptsWithIndex.slice(start, start + PAGE_SIZE);
  }, [filteredPromptsWithIndex, currentPage]);

  const buttonLabel = isEs
    ? `Generar ${quantity} prompts`
    : `Generate ${quantity} prompts`;

  return (
    <div className="flex flex-col gap-3.5 max-w-4xl mx-auto w-full">
      {/* ──────────────────────────────────────────────────────────
          MAIN INPUT CONTAINER — Minimal, Direct, Automatic
         ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-3.5 relative overflow-hidden">
        {/* Header Telemetry Badge */}
        <div className="flex items-center justify-between border-b border-[#CBD5E1] dark:border-[#222A36] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)] animate-pulse" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#F1F5F9]">
              03 // {isEs ? 'Lotes de prompts' : 'Prompt Batches'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
              [24MM_1X // 9:16_VERTICAL]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
          </div>
        </div>

        {/* Single Main Field: ¿Qué idea quieres convertir en prompts? */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              {isEs ? '¿Qué idea quieres convertir en prompts?' : 'What idea do you want to turn into prompts?'}
            </label>
            <span className="text-[10px] text-[#64748B] dark:text-[#8C9BAE] font-normal font-mono">
              {isEs ? '*Único dato requerido' : '*Only required input'}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder={
                isEs
                  ? 'Ej: Sentado en un cuarto oscuro en Turquía tomando té, luz de smartphone y lámpara lejana...'
                  : 'E.g.: Sitting in a dimly lit room in Turkey sipping tea, subtle phone screen glow...'
              }
              rows={3}
              disabled={isGenerating}
              className="w-full bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded-lg p-3 text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] dark:placeholder-[#4B5563] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)] focus:ring-1 focus:ring-[var(--trx-accent,#00F0FF)] transition-all resize-y min-h-[80px]"
            />
          </div>

          {/* Automatic Country Detection Banner */}
          {detectedCountry && !isManualCountrySelection && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--trx-accent,#00F0FF)]/10 border border-[var(--trx-accent,#00F0FF)]/30 text-[11px] font-mono text-[var(--trx-accent,#00F0FF)] animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <span>🌍</span>
                <span className="font-bold">
                  {isEs ? 'País:' : 'Country:'} {detectedCountry.nameEs}
                </span>
                <span className="text-[#64748B] dark:text-[#8C9BAE]">
                  · {isEs ? 'Detectado en tu idea' : 'Detected from your idea'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOptionsOpen(true)}
                className="text-[10px] underline hover:opacity-80 cursor-pointer font-bold"
              >
                {isEs ? '[Cambiar]' : '[Change]'}
              </button>
            </div>
          )}

          {isManualCountrySelection && selectedCountryCode !== 'none' && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#F1F5F9] dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#222A36] text-[11px] font-mono text-[#0F172A] dark:text-[#F1F5F9] animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <span>🌍</span>
                <span>
                  {isEs ? 'País seleccionado manualmente:' : 'Manually selected country:'}{' '}
                  <strong>{selectedCountryName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetToAutoCountry}
                className="text-[10px] text-[var(--trx-accent,#00F0FF)] hover:underline cursor-pointer font-bold"
              >
                {isEs ? '[Auto-detectar]' : '[Auto-detect]'}
              </button>
            </div>
          )}

          {/* Selector de Género Opcional: «Mujer» / «Hombre» (ninguno seleccionado por defecto) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#CBD5E1]/60 dark:border-[#222A36]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {isEs ? 'Sujeto A (Opcional):' : 'Subject A (Optional):'}
              </span>
              <div className="inline-flex rounded-lg border border-[#CBD5E1] dark:border-[#222A36] p-0.5 bg-[#F8FAFC] dark:bg-[#080A0E] gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedGender((prev) => (prev === 'woman' ? null : 'woman'))}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                    selectedGender === 'woman'
                      ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
                      : 'text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  {isEs ? 'Mujer' : 'Woman'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender((prev) => (prev === 'man' ? null : 'man'))}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                    selectedGender === 'man'
                      ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
                      : 'text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  {isEs ? 'Hombre' : 'Man'}
                </button>
              </div>
              {selectedGender && (
                <button
                  type="button"
                  onClick={() => setSelectedGender(null)}
                  className="text-[10px] font-mono text-[#64748B] hover:text-[#FF3366] transition-colors cursor-pointer"
                  title={isEs ? 'Restablecer a neutro' : 'Reset to neutral'}
                >
                  [{isEs ? 'Deseleccionar' : 'Deselect'}]
                </button>
              )}
            </div>

            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
              {selectedGender === 'woman'
                ? (isEs ? '• Sujeto A: Mujer en todo el lote' : '• Subject A: Woman across batch')
                : selectedGender === 'man'
                  ? (isEs ? '• Sujeto A: Hombre en todo el lote' : '• Subject A: Man across batch')
                  : (isEs ? '• Sujeto A: Neutral y universal' : '• Subject A: Neutral & universal')}
            </span>
          </div>
        </div>

        {/* Dynamic Main Execution Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <ChampagneCapsuleButton
            onClick={handleGenerate}
            disabled={isGenerating || !ideaText.trim()}
            isLoading={isGenerating}
            loadingText={
              isEs
                ? `Generando lote... ${progress.completed} / ${progress.total}`
                : `Generating batch... ${progress.completed} / ${progress.total}`
            }
            label={buttonLabel}
            secondaryLabel={
              [
                selectedGender ? (selectedGender === 'woman' ? (isEs ? 'Mujer' : 'Woman') : (isEs ? 'Hombre' : 'Man')) : '',
                selectedCountryCode !== 'none' ? selectedCountryName : ''
              ].filter(Boolean).join(' · ') || undefined
            }
            className="w-full sm:w-auto flex-1 min-h-[44px]"
          />
        </div>

        {/* ──────────────────────────────────────────────────────────
            OPCIONES ACCORDION — Initially Closed
           ────────────────────────────────────────────────────────── */}
        <div className="border-t border-[#CBD5E1] dark:border-[#222A36] pt-2">
          <button
            type="button"
            onClick={() => setIsOptionsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between py-1.5 px-1 text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--trx-accent,#00F0FF)] font-bold">
                {isOptionsOpen ? '[-]' : '[+]'}
              </span>
              <span className="font-semibold uppercase tracking-wider">
                {isEs ? 'Opciones' : 'Options'}
              </span>
              <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B]">
                ({quantity} prompts{selectedGender ? ` · ${selectedGender === 'woman' ? (isEs ? 'Mujer' : 'Woman') : (isEs ? 'Hombre' : 'Man')}` : ''}{selectedCountryCode !== 'none' ? `, ${selectedCountryName}` : ''}{heightCm || weightKg ? ` · ${[heightCm ? `${heightCm} cm` : '', weightKg ? `${weightKg} kg` : ''].filter(Boolean).join(' / ')}` : ''})
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {isOptionsOpen ? (isEs ? 'CERRAR' : 'CLOSE') : (isEs ? 'CONFIGURAR' : 'CONFIGURE')}
            </span>
          </button>

          {isOptionsOpen && (
            <div className="pt-3 pb-1 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {/* Option 1: Quantity */}
              <div className="flex flex-col gap-2 p-3 bg-[#F8FAFC] dark:bg-[#080A0E] rounded-lg border border-[#CBD5E1] dark:border-[#222A36]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                    {isEs ? 'Cantidad de prompts' : 'Prompt Quantity'}
                  </label>
                  <span className="text-[10px] font-mono text-[var(--trx-accent,#00F0FF)] font-bold">
                    {quantity}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[25, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectQuantity(preset)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
                        quantity === preset && !customQtyInput
                          ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold border-[var(--trx-accent,#00F0FF)]'
                          : 'bg-white dark:bg-[#11151C] text-[#64748B] dark:text-[#8C9BAE] border-[#CBD5E1] dark:border-[#222A36] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                    {isEs ? 'Personalizada:' : 'Custom:'}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={customQtyInput}
                    onChange={handleCustomQtyChange}
                    placeholder="1 - 300"
                    className="w-24 px-2 py-1 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)]"
                  />
                </div>
              </div>

              {/* Option 2: Country Selection (Optional, with automatic detection & search) */}
              <div className="flex flex-col gap-2 p-3 bg-[#F8FAFC] dark:bg-[#080A0E] rounded-lg border border-[#CBD5E1] dark:border-[#222A36] relative">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                    {isEs ? 'País (Opcional)' : 'Country (Optional)'}
                  </label>
                  <div className="flex items-center gap-1">
                    {isManualCountrySelection && (
                      <button
                        type="button"
                        onClick={handleResetToAutoCountry}
                        className="text-[9px] font-mono text-[var(--trx-accent,#00F0FF)] hover:underline cursor-pointer"
                        title={isEs ? 'Restablecer a detección automática' : 'Reset to auto-detection'}
                      >
                        [AUTO]
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                      {selectedCountryName}
                    </span>
                  </div>
                </div>

                {/* Country selector trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] hover:border-[var(--trx-accent,#00F0FF)] transition-all cursor-pointer text-left"
                  >
                    <span className="truncate">{selectedCountryName}</span>
                    <span className="text-[10px] text-[#64748B] ml-2">▼</span>
                  </button>

                  {/* Searchable Country Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 max-h-56 overflow-hidden">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={isEs ? 'Buscar país o ciudad...' : 'Search country or city...'}
                        className="w-full px-2 py-1 bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)] mb-1"
                        autoFocus
                      />
                      <div className="overflow-y-auto max-h-40 flex flex-col gap-0.5 custom-scrollbar">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleManualCountrySelect(country.code)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                              selectedCountryCode === country.code
                                ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold'
                                : 'text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26]'
                            }`}
                          >
                            {isEs ? country.es : country.en}
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <span className="text-[11px] font-mono text-[#64748B] p-2 text-center">
                            {isEs ? 'No se encontraron países' : 'No countries found'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] mt-0.5">
                  {isEs
                    ? '• Cámara fija: Celular 24 mm equiv. (1×), encuadre vertical 9:16'
                    : '• Fixed camera: Smartphone 24mm equiv. (1×), 9:16 vertical'}
                </div>
              </div>

              {/* Option 3: Estatura y Peso (Opcional - Solo si el usuario los escribe expresamente para este lote) */}
              <div className="sm:col-span-2 flex flex-col gap-2.5 p-3 bg-[#F8FAFC] dark:bg-[#080A0E] rounded-lg border border-[#CBD5E1] dark:border-[#222A36]">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📏</span>
                    <label className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                      {isEs ? 'Estatura y Peso (Opcional)' : 'Height & Weight (Optional)'}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {(heightCm || weightKg) && (
                      <span className="text-[10px] font-mono text-[var(--trx-accent,#00F0FF)] font-bold">
                        [ {[heightCm ? `${heightCm} CM` : '', weightKg ? `${weightKg} KG` : ''].filter(Boolean).join(' · ')} ]
                      </span>
                    )}
                    {(heightCm || weightKg) && (
                      <button
                        type="button"
                        onClick={() => {
                          setHeightCm('');
                          setWeightKg('');
                        }}
                        className="text-[10px] font-mono text-[#64748B] hover:text-[#FF3366] transition-colors cursor-pointer"
                        title={isEs ? 'Limpiar medidas' : 'Clear measurements'}
                      >
                        [{isEs ? 'Borrar' : 'Clear'}]
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] leading-relaxed">
                  {isEs
                    ? 'Incluye en cada prompt únicamente las medidas que escribas expresamente para este lote. Si dejas un campo vacío, se omitirá de forma limpia sin valores predeterminados.'
                    : 'Includes only measurements explicitly entered for this batch. If left empty, that measurement is omitted with no preloaded values.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Height field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] flex items-center justify-between">
                      <span>{isEs ? 'Estatura' : 'Height'}</span>
                      <span className="text-[9px] text-[#94A3B8]">{isEs ? 'Opcional' : 'Optional'}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={50}
                        max={250}
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        placeholder="cm"
                        disabled={isGenerating}
                        className="w-full py-1.5 px-2.5 pr-8 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] dark:placeholder-[#4B5563] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)] transition-all min-h-[36px]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Weight field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] flex items-center justify-between">
                      <span>{isEs ? 'Peso' : 'Weight'}</span>
                      <span className="text-[9px] text-[#94A3B8]">{isEs ? 'Opcional' : 'Optional'}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={30}
                        max={300}
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="kg"
                        disabled={isGenerating}
                        className="w-full py-1.5 px-2.5 pr-8 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] dark:placeholder-[#4B5563] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)] transition-all min-h-[36px]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#CBD5E1]/50 dark:border-[#222A36]/50">
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                    {isEs ? '• Sin datos precargados ni guardados automáticamente' : '• No preloaded or auto-saved values'}
                  </span>
                  <span className="text-[9px] font-mono text-[#94A3B8] dark:text-[#64748B]">
                    {heightCm && weightKg
                      ? (isEs ? 'Estatura y peso activos' : 'Height & weight active')
                      : heightCm
                        ? (isEs ? 'Solo estatura activa' : 'Only height active')
                        : weightKg
                          ? (isEs ? 'Solo peso activo' : 'Only weight active')
                          : (isEs ? 'Sin medidas (omitidas)' : 'No measurements (omitted)')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Progress Bar */}
        {isGenerating && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#CBD5E1] dark:border-[#222A36] animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--trx-accent,#00F0FF)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)] animate-ping rounded-full" />
                {isEs ? 'GENERANDO VARIANTES CON MOTOR DE ANALIZADOR...' : 'GENERATING VARIANTS WITH ANALYZER ENGINE...'}
              </span>
              <span className="text-[#64748B] dark:text-[#8C9BAE]">
                {progress.completed} / {progress.total} [
                {Math.round((progress.completed / Math.max(1, progress.total)) * 100)}%]
              </span>
            </div>
            <div className="w-full h-2 bg-[#E2E8F0] dark:bg-[#080A0E] rounded-full overflow-hidden border border-[#CBD5E1] dark:border-[#222A36]">
              <div
                className="h-full bg-[var(--trx-accent,#00F0FF)] transition-all duration-300 shadow-[0_0_8px_var(--trx-accent,#00F0FF)]"
                style={{ width: `${Math.min(100, (progress.completed / Math.max(1, progress.total)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded text-xs font-mono text-rose-800 dark:text-rose-300 flex items-center justify-between">
            <span>[ERROR] {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-900 dark:text-rose-200 font-bold hover:underline cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          BATCH RESULTS DECK — Numbered list, download, copy all, copy single
         ────────────────────────────────────────────────────────── */}
      {generatedBatch && (
        <div className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Batch Summary & Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CBD5E1] dark:border-[#222A36] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00FF66]" />
                <h3 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                  {isEs ? 'Lote de Prompts Generado' : 'Generated Prompt Batch'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--trx-accent,#00F0FF)]/20 text-[var(--trx-accent,#00F0FF)] border border-[var(--trx-accent,#00F0FF)]/30">
                  {generatedBatch.prompts.length} PROMPTS
                </span>
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                  [24MM · 9:16]
                </span>
                {generatedBatch.gender && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] dark:bg-[#181D26] text-[var(--trx-accent,#00F0FF)] border border-[#CBD5E1] dark:border-[#222A36]">
                    👤 {generatedBatch.gender === 'woman' ? (isEs ? 'MUJER' : 'WOMAN') : (isEs ? 'HOMBRE' : 'MAN')}
                  </span>
                )}
                {(generatedBatch.heightCm || generatedBatch.weightKg) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] dark:bg-[#181D26] text-[var(--trx-accent,#00F0FF)] border border-[#CBD5E1] dark:border-[#222A36]">
                    📏 {[generatedBatch.heightCm ? `${generatedBatch.heightCm} cm` : '', generatedBatch.weightKg ? `${generatedBatch.weightKg} kg` : ''].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] mt-1 line-clamp-1">
                "{generatedBatch.idea}" {generatedBatch.country ? `[${generatedBatch.country}]` : ''} {generatedBatch.gender ? `[${generatedBatch.gender === 'woman' ? (isEs ? 'Mujer' : 'Woman') : (isEs ? 'Hombre' : 'Man')}]` : ''} {generatedBatch.heightCm || generatedBatch.weightKg ? `[${[generatedBatch.heightCm ? `${generatedBatch.heightCm}cm` : '', generatedBatch.weightKg ? `${generatedBatch.weightKg}kg` : ''].filter(Boolean).join(', ')}]` : ''}
              </p>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Copy All Button */}
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-mono font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>{copiedAll ? (isEs ? '¡LOTE COPIADO!' : 'BATCH COPIED!') : (isEs ? 'Copiar todo el lote' : 'Copy All Prompts')}</span>
              </button>

              {/* Download TXT */}
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-2.5 py-1.5 rounded bg-[#F1F5F9] dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] font-mono font-semibold text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#202734] transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                title="Descargar archivo TXT"
              >
                <svg className="w-3.5 h-3.5 text-[#00FF66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>.TXT</span>
              </button>

              {/* Download JSON */}
              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-2.5 py-1.5 rounded bg-[#F1F5F9] dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] font-mono font-semibold text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#202734] transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                title="Descargar archivo JSON"
              >
                <span>.JSON</span>
              </button>
            </div>
          </div>

          {/* Search & Pagination Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#F8FAFC] dark:bg-[#080A0E] p-2 rounded-lg border border-[#CBD5E1] dark:border-[#222A36]">
            {/* Search filter within batch */}
            <div className="w-full sm:w-64 relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => {
                  setFilterQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isEs ? 'Filtrar en el lote...' : 'Filter in batch...'}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded text-xs font-mono text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[var(--trx-accent,#00F0FF)]"
              />
              {filterQuery && (
                <button
                  type="button"
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1.5 text-xs text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[#0F172A] dark:text-[#F1F5F9]"
                >
                  ◀
                </button>
                <span className="px-2 text-[#64748B] dark:text-[#8C9BAE]">
                  {isEs ? 'Pág.' : 'Page'} {currentPage} / {totalPages} ({filteredPromptsWithIndex.length})
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[#0F172A] dark:text-[#F1F5F9]"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Numbered Prompts Grid / List */}
          <div className="flex flex-col gap-3">
            {paginatedPrompts.map(({ item, index }) => {
              const positive = typeof item === 'string' ? item : item.positive;
              const negative = typeof item === 'string' ? '' : item.negative;
              const isNegativeVisible = showNegativeForIndex[index];

              return (
                <div
                  key={index}
                  className="p-3.5 sm:p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] hover:border-[var(--trx-accent,#00F0FF)] transition-all flex flex-col gap-2.5 group relative"
                >
                  {/* Prompt Card Header */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E2632] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--trx-accent,#00F0FF)]">
                        #{(index + 1).toString().padStart(3, '0')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#64748B]" />
                      <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] uppercase">
                        {isEs ? 'Prompt Forense (24mm 1× · 9:16)' : 'Forensic Prompt (24mm 1× · 9:16)'}
                      </span>
                    </div>

                    {/* Actions: Copy Prompt & Toggle Negative */}
                    <div className="flex items-center gap-1.5">
                      {negative && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowNegativeForIndex((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          className="px-2 py-1 text-[10px] font-mono rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
                        >
                          {isNegativeVisible ? (isEs ? 'Ocultar negativo' : 'Hide negative') : (isEs ? 'Ver negativo' : 'View negative')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopySinglePositive(item, index)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer min-h-[32px] flex items-center gap-1.5 ${
                          copiedIndices[index]
                            ? 'bg-[#00FF66] text-[#080A0E]'
                            : 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] hover:opacity-90 shadow-2xs'
                        }`}
                      >
                        <span>{copiedIndices[index] ? '✓' : '⧉'}</span>
                        <span>{copiedIndices[index] ? (isEs ? '¡COPIADO!' : 'COPIED!') : (isEs ? 'Copiar prompt' : 'Copy prompt')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Positive Prompt Body — Starts directly with Subject A: if subjects present */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-wrap select-text">
                      {positive}
                    </p>
                  </div>

                  {/* Collapsible Surgical Negative Prompt */}
                  {isNegativeVisible && negative && (
                    <div className="p-2.5 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex flex-col gap-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-rose-800 dark:text-rose-300 uppercase">
                          {isEs ? 'Prompt Negativo Quirúrgico' : 'Surgical Negative Prompt'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleNegative(item)}
                          className="text-[10px] font-mono text-rose-700 dark:text-rose-300 hover:underline cursor-pointer font-bold"
                        >
                          {isEs ? '[Copiar negativo]' : '[Copy negative]'}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-rose-800 dark:text-rose-300 leading-relaxed whitespace-pre-wrap select-text">
                        {negative}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPromptsWithIndex.length === 0 && (
              <div className="text-center py-8 text-xs font-mono text-[#64748B] dark:text-[#8C9BAE]">
                {isEs ? 'No se encontraron prompts con ese filtro.' : 'No prompts matched that filter.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptBatchSection;
