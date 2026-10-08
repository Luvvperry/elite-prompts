import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { generateLifestylePrompts } from '../apiService';
import { LifestylePromptProposal, LifestyleResult, PromptResult } from '../types';
import ChampagneCapsuleButton from './ChampagneCapsuleButton';
import { createThumbnail, loadHistoryFromStorage } from '../historyStorage';

interface LifestyleSectionProps {
  onSaveToHistory?: (result: PromptResult) => void;
  initialResult?: LifestyleResult | null;
}

const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  onSaveToHistory,
  initialResult,
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialResult?.referenceImage || null);
  const [base64Data, setBase64Data] = useState<string | null>(initialResult?.referenceImage || null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LifestyleResult | null>(initialResult || null);

  // Session batches history so new ideas do not erase previous batches
  const [sessionBatches, setSessionBatches] = useState<LifestyleResult[]>(() => {
    return initialResult ? [initialResult] : [];
  });
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);

  // UI state
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedNegativeIndex, setCopiedNegativeIndex] = useState<number | null>(null);
  const [showNegativeFor, setShowNegativeFor] = useState<Record<number, boolean>>({});

  // Sync initialResult if passed
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      setSessionBatches((prev) => {
        if (!prev.some((b) => b.id === initialResult.id)) {
          return [initialResult, ...prev];
        }
        return prev;
      });
      if (initialResult.referenceImage) {
        setPreviewUrl(initialResult.referenceImage);
        setBase64Data(initialResult.referenceImage);
      }
    }
  }, [initialResult]);

  // Convert File to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(
        isEs
          ? 'Por favor sube un archivo de imagen válido (JPG, PNG, WEBP).'
          : 'Please upload a valid image file (JPG, PNG, WEBP).'
      );
      return;
    }
    setError(null);
    setSelectedFile(file);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setBase64Data(base64);
      setPreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Data(null);
    setError(null);
  };

  // Collect previous concepts from current session and stored history to avoid duplicates
  const collectPreviousConcepts = (): string[] => {
    const concepts: string[] = [];

    // 1. From all batches generated in this session
    sessionBatches.forEach((batch) => {
      batch.proposals.forEach((p) => {
        if (p.purpose) {
          const item = `Propósito: "${p.purpose}" (Cámara zoom: ${p.cameraZoom})`;
          if (!concepts.includes(item)) concepts.push(item);
        }
      });
    });

    // 2. From current result proposals
    if (result && result.proposals) {
      result.proposals.forEach((p) => {
        if (p.purpose) {
          const item = `Propósito: "${p.purpose}" (Cámara zoom: ${p.cameraZoom})`;
          if (!concepts.includes(item)) concepts.push(item);
        }
      });
    }

    // 3. From stored history (recent lifestyle batches)
    try {
      const stored = loadHistoryFromStorage();
      const storedLifestyle = stored.filter(
        (h) => h.isLifestyle && h.lifestyleData?.proposals
      );
      storedLifestyle.slice(0, 5).forEach((h) => {
        h.lifestyleData?.proposals.forEach((p) => {
          if (p.purpose) {
            const item = `Propósito histórico: "${p.purpose}"`;
            if (!concepts.includes(item)) concepts.push(item);
          }
        });
      });
    } catch (e) {
      console.warn('Failed to load stored lifestyle concepts:', e);
    }

    return concepts.slice(0, 20);
  };

  // Generate 5 Lifestyle proposals (initial or new ideas)
  const handleGenerate = async (isNewIdeas = false) => {
    if (!base64Data) {
      setError(
        isEs
          ? 'Sube una imagen de referencia estética para comenzar.'
          : 'Upload an aesthetic reference image to begin.'
      );
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const previousConcepts = isNewIdeas ? collectPreviousConcepts() : [];
      const data = await generateLifestylePrompts(
        base64Data,
        mimeType,
        language,
        previousConcepts
      );

      // Create compact thumbnail for storage to never exceed quota
      let thumbnail = '';
      try {
        thumbnail = await createThumbnail(base64Data, 180, 0.6);
      } catch (thumbErr) {
        console.warn('Failed to create lifestyle thumbnail:', thumbErr);
      }

      const newLifestyleResult: LifestyleResult = {
        id: Date.now().toString(),
        referenceImage: thumbnail || previewUrl || '',
        aestheticSummary: data.aestheticSummary,
        colorPalette: data.colorPalette,
        proposals: data.proposals,
        timestamp: Date.now(),
      };

      // Add to session batches without deleting previous ones
      setSessionBatches((prev) => [newLifestyleResult, ...prev]);
      setActiveBatchIndex(0);
      setResult({
        ...newLifestyleResult,
        referenceImage: previewUrl || thumbnail || '',
      });

      // Save to global TRX history as an independent entry (preserves previous batch in history)
      if (onSaveToHistory) {
        onSaveToHistory({
          id: newLifestyleResult.id,
          originalImage: thumbnail || undefined,
          positivePrompt: `[LIFESTYLE: 5 PROPUESTAS] "${
            data.proposals[0]?.purpose || 'Lifestyle curated'
          }" [0.5X · 1X · 2X/3X · 9:16]`,
          negativePrompt:
            data.proposals[0]?.negative || '[SIN PERSONAS · SIN MARCAS]',
          detectedSummary: isEs
            ? `5 propuestas lifestyle generadas a partir de la guía estética: ${data.aestheticSummary}`
            : `5 lifestyle proposals generated from aesthetic guide: ${data.aestheticSummary}`,
          timestamp: newLifestyleResult.timestamp,
          isLifestyle: true,
          lifestyleData: newLifestyleResult,
        });
      }
    } catch (err: any) {
      console.error('Error generating lifestyle proposals:', err);
      setError(
        err.message ||
          (isEs
            ? 'Error al generar las propuestas lifestyle.'
            : 'Failed to generate lifestyle proposals.')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySinglePositive = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopySingleNegative = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedNegativeIndex(index);
    setTimeout(() => setCopiedNegativeIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result || result.proposals.length === 0) return;
    const header = [
      'PROJECT TRX // LIFESTYLE SUITE (5 PROPUESTAS)',
      'FORMATO: Composición vertical 9:16 // CÁMARA DE CELULAR CON ZOOM COHERENTE',
      'REGLA ESTRICTA: Escenas 100% libres de personas y marcas comerciales',
      `Guía estética: ${result.aestheticSummary || 'Referencia visual'}`,
      `Fecha: ${new Date(result.timestamp).toLocaleString()}`,
      '==================================================\n',
    ].join('\n');

    const bodies = result.proposals.map((p, idx) => {
      return [
        `[PROPUESTA #${(idx + 1).toString().padStart(2, '0')}] ${p.purpose.toUpperCase()}`,
        `CÁMARA: Zoom ${p.cameraZoom} · Composición vertical 9:16`,
        '',
        '[PROMPT POSITIVO]',
        p.positive,
        '',
        p.negative,
        '--------------------------------------------------\n',
      ].join('\n');
    });

    const fullText = header + bodies.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* ──────────────────────────────────────────────────────────
          MAIN INPUT CONTAINER — Lifestyle Reference Uploader
         ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-4 relative overflow-hidden">
        {/* Header Telemetry Badge */}
        <div className="flex items-center justify-between border-b border-[#CBD5E1] dark:border-[#222A36] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)] animate-pulse" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#F1F5F9]">
              04 // Lifestyle
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
              [5_PROPUESTAS // 9:16_VERTICAL // SIN_PERSONAS]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
          </div>
        </div>

        {/* Section Description */}
        <div className="flex flex-col gap-1">
          <h2 className="text-sm sm:text-base font-bold font-mono text-[#0F172A] dark:text-[#F1F5F9]">
            {isEs
              ? 'Fotografías Lifestyle para Redes Sociales'
              : 'Curated Lifestyle Photography for Social Media'}
          </h2>
          <p className="text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] leading-relaxed">
            {isEs
              ? 'El motor analiza el entorno, terreno, clima, luz, colores y texturas de la imagen para idear 5 escenas variadas y verosímiles con zooms de celular y sin personas, listas para publicar.'
              : 'The engine analyzes the environment, terrain, climate, light, colors, and textures of the image to conceive 5 varied, plausible scenes with smartphone zoom and free of people, ready to post.'}
          </p>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TEXTO OBLIGATORIO SOBRE LA ZONA PARA SUBIR LA FOTO
           ────────────────────────────────────────────────────────── */}
        <div className="bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed shadow-2xs">
          <p>
            {isEs
              ? 'Sube una imagen como referencia. Después elige el prompt que más te guste: al generar la imagen combinaremos la foto y el prompt para conservar mejor su estilo visual. No necesitas escribir una idea manualmente.'
              : 'Upload an image as a reference. Then choose the prompt you like best: when generating the image we will combine the photo and prompt to better preserve its visual style. You do not need to write an idea manually.'}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isGenerating}
        />

        {/* Upload Dropzone / Image Preview */}
        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-[#CBD5E1] dark:border-[#222A36] hover:border-[var(--trx-accent,#00F0FF)] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all bg-[#F8FAFC]/50 dark:bg-[#080A0E]/50 group"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--trx-accent,#00F0FF)]/10 text-[var(--trx-accent,#00F0FF)] flex items-center justify-center transition-transform group-hover:scale-110">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {isEs ? 'Haz clic o arrastra tu foto de referencia estética' : 'Click or drag your aesthetic reference photo'}
              </span>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                {isEs ? 'Soporta JPG, PNG, WEBP · No necesitas escribir ninguna idea' : 'Supports JPG, PNG, WEBP · No idea text required'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#F8FAFC] dark:bg-[#080A0E] rounded-xl border border-[#CBD5E1] dark:border-[#222A36]">
            {/* Thumbnail Preview */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-lg overflow-hidden border border-[#CBD5E1] dark:border-[#222A36] bg-black">
              <img
                src={previewUrl}
                alt="Aesthetic reference"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[var(--trx-accent,#00F0FF)] backdrop-blur-xs">
                GUÍA ESTÉTICA
              </span>
            </div>

            {/* Info & Replace Controls */}
            <div className="flex-1 flex flex-col justify-between w-full h-full gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {selectedFile ? selectedFile.name : isEs ? 'Foto de referencia cargada' : 'Reference photo loaded'}
                  </span>
                  <span className="text-[10px] font-mono text-[#00FF66] font-bold">
                    [ACTIVA]
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                  {isEs
                    ? 'Esta imagen se conserva como guía estética tanto para generar ideas como para combinarse con el prompt al crear la imagen.'
                    : 'This image is preserved as an aesthetic guide for ideating and to combine with the prompt when creating the image.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-[#CBD5E1]/50 dark:border-[#222A36]/50">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] hover:border-[var(--trx-accent,#00F0FF)] transition-colors cursor-pointer min-h-[30px]"
                >
                  {isEs ? 'Cambiar imagen' : 'Change photo'}
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  disabled={isGenerating}
                  className="px-2.5 py-1 text-xs font-mono text-[#64748B] hover:text-rose-500 transition-colors cursor-pointer min-h-[30px]"
                >
                  {isEs ? 'Quitar' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs font-mono text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-bold hover:underline cursor-pointer shrink-0"
            >
              [✕]
            </button>
          </div>
        )}

        {/* Action Button: Generate Initial Proposals */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#CBD5E1]/50 dark:border-[#222A36]/50">
          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#8C9BAE] hidden sm:block">
            {previewUrl
              ? isEs
                ? 'Referencia lista: pulsa el botón para generar las 5 propuestas lifestyle.'
                : 'Reference ready: click button to generate 5 lifestyle proposals.'
              : isEs
              ? 'Sube una imagen para habilitar la generación lifestyle.'
              : 'Upload an image to enable lifestyle generation.'}
          </div>

          <ChampagneCapsuleButton
            onClick={() => handleGenerate(false)}
            disabled={!previewUrl || isGenerating}
            isLoading={isGenerating}
            loadingText={
              isEs
                ? 'Analizando contexto y creando 5 escenas...'
                : 'Analyzing context and conceiving 5 scenes...'
            }
            label={
              result
                ? isEs
                  ? 'Re-analizar y generar 5 propuestas'
                  : 'Re-analyze and generate 5 proposals'
                : isEs
                ? 'Generar 5 propuestas lifestyle'
                : 'Generate 5 lifestyle proposals'
            }
            secondaryLabel="[5X · 9:16 · CERO PERSONAS]"
            className="w-full sm:w-auto flex-1 min-h-[44px]"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          RESULTS SECTION — 5 Lifestyle Cards
         ────────────────────────────────────────────────────────── */}
      {result && result.proposals && result.proposals.length > 0 && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Summary & Quick Actions Toolbar */}
          <div className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 bg-[#00FF66]" />
                <h3 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                  {isEs ? '5 Propuestas Lifestyle Creadas' : '5 Lifestyle Proposals Created'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--trx-accent,#00F0FF)]/20 text-[var(--trx-accent,#00F0FF)] border border-[var(--trx-accent,#00F0FF)]/30">
                  9:16 VERTICAL
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] dark:bg-[#181D26] text-[#00FF66] border border-[#CBD5E1] dark:border-[#222A36]">
                  {isEs ? 'CERO PERSONAS' : 'NO PEOPLE'}
                </span>
                {sessionBatches.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] dark:bg-[#181D26] text-[var(--trx-accent,#00F0FF)] border border-[#CBD5E1] dark:border-[#222A36]">
                    {isEs
                      ? `LOTE ${sessionBatches.length - activeBatchIndex} DE ${sessionBatches.length}`
                      : `BATCH ${sessionBatches.length - activeBatchIndex} OF ${sessionBatches.length}`}
                  </span>
                )}
              </div>
              {result.aestheticSummary && (
                <p className="text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] mt-0.5">
                  ✨ {result.aestheticSummary}
                </p>
              )}
            </div>

            {/* Quick Actions & Batch History Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {sessionBatches.length > 1 && (
                <div className="flex items-center gap-1 bg-[#F1F5F9] dark:bg-[#080A0E] p-0.5 rounded-md border border-[#CBD5E1] dark:border-[#222A36]">
                  {sessionBatches.map((batch, bIdx) => (
                    <button
                      key={batch.id || bIdx}
                      type="button"
                      onClick={() => {
                        setActiveBatchIndex(bIdx);
                        setResult(batch);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        activeBatchIndex === bIdx
                          ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E]'
                          : 'text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                      }`}
                      title={isEs ? `Ver Lote #${sessionBatches.length - bIdx}` : `View Batch #${sessionBatches.length - bIdx}`}
                    >
                      #{sessionBatches.length - bIdx}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-mono font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>
                  {copiedAll
                    ? isEs
                      ? '¡LOTE COPIADO!'
                      : 'ALL COPIED!'
                    : isEs
                    ? 'Copiar las 5'
                    : 'Copy All 5'}
                </span>
              </button>
            </div>
          </div>

          {/* Grid of the 5 Proposals */}
          <div className="flex flex-col gap-3.5">
            {result.proposals.map((proposal, idx) => (
              <div
                key={proposal.id || idx}
                className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-all hover:border-[var(--trx-accent,#00F0FF)]/60"
              >
                {/* Proposal Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CBD5E1] dark:border-[#222A36] pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--trx-accent,#00F0FF)]/15 text-[var(--trx-accent,#00F0FF)] border border-[var(--trx-accent,#00F0FF)]/30">
                      PROPUESTA #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {proposal.purpose}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#181D26] text-[#64748B] dark:text-[#8C9BAE] border border-[#CBD5E1] dark:border-[#222A36]">
                      📱 ZOOM {proposal.cameraZoom.toUpperCase()} · 9:16
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySinglePositive(proposal.positive, idx)}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        copiedIndex === idx
                          ? 'bg-[#00FF66] text-[#080A0E]'
                          : 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] hover:opacity-90'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>
                        {copiedIndex === idx
                          ? isEs
                            ? '¡COPIADO!'
                            : 'COPIED!'
                          : isEs
                          ? 'Copiar prompt'
                          : 'Copy prompt'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Positive Prompt Body */}
                <div className="bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded-lg p-3 text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-wrap select-all">
                  {proposal.positive}
                </div>

                {/* Linked Reference Photo Notice */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1]/70 dark:border-[#222A36]/70">
                  <div className="flex items-center gap-2.5">
                    {previewUrl && (
                      <div className="w-9 h-9 rounded-md overflow-hidden border border-[#CBD5E1] dark:border-[#222A36] shrink-0 bg-black">
                        <img src={previewUrl} alt="Ref" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-[var(--trx-accent,#00F0FF)]">
                        {isEs ? 'FOTO DE REFERENCIA VINCULADA' : 'LINKED REFERENCE PHOTO'}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                        {isEs
                          ? 'Al generar la imagen, usa esta foto junto con el prompt para conservar su estilo visual'
                          : 'When generating the image, use this photo together with the prompt to preserve its visual style'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySinglePositive(proposal.positive, idx)}
                    className="text-[10px] font-mono font-bold text-[var(--trx-accent,#00F0FF)] hover:underline cursor-pointer shrink-0 self-end sm:self-auto"
                  >
                    {copiedIndex === idx
                      ? isEs
                        ? '¡Copiado para generar!'
                        : 'Copied to generate!'
                      : isEs
                      ? '[Copiar prompt para generar]'
                      : '[Copy prompt to generate]'}
                  </button>
                </div>

                {/* Negative Prompt Accordion */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setShowNegativeFor((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className="text-[10px] font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] cursor-pointer flex items-center gap-1"
                    >
                      <span>{showNegativeFor[idx] ? '[-]' : '[+]'}</span>
                      <span className="uppercase font-bold">
                        {isEs
                          ? 'Prompt negativo adaptado a la escena (sin personas ni marcas)'
                          : 'Scene-adapted negative prompt (no people or brands)'}
                      </span>
                    </button>

                    {showNegativeFor[idx] && (
                      <button
                        type="button"
                        onClick={() => handleCopySingleNegative(proposal.negative, idx)}
                        className="text-[10px] font-mono text-[var(--trx-accent,#00F0FF)] hover:underline cursor-pointer"
                      >
                        {copiedNegativeIndex === idx
                          ? isEs
                            ? '¡Copiado!'
                            : 'Copied!'
                          : isEs
                          ? '[Copiar negativo]'
                          : '[Copy negative]'}
                      </button>
                    )}
                  </div>

                  {showNegativeFor[idx] && (
                    <div className="bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded-lg p-2.5 text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] leading-relaxed whitespace-pre-wrap animate-in fade-in">
                      {proposal.negative}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ──────────────────────────────────────────────────────────
              AÑADIR NUEVAS IDEAS: BOTÓN «Generar nuevas ideas»
              (Muestra después de las cinco propuestas)
             ────────────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--trx-accent,#00F0FF)] animate-pulse" />
                <span className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                  {isEs ? 'Nuevas propuestas con la misma referencia' : 'New proposals with same reference'}
                </span>
              </div>
              <p className="text-xs font-mono text-[#64748B] dark:text-[#8C9BAE]">
                {isEs
                  ? 'Conserva la foto cargada y produce 5 propuestas claramente diferentes sin perder la estética ni borrar el historial anterior.'
                  : 'Preserves the loaded photo and produces 5 clearly different proposals without losing aesthetics or erasing past history.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-mono font-bold text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[46px]"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#080A0E] border-t-transparent rounded-full animate-spin" />
                  <span>{isEs ? 'Ideando nuevas propuestas...' : 'Ideating new proposals...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isEs ? 'Generar nuevas ideas' : 'Generate new ideas'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleSection;
