import React, { useState, useEffect } from 'react';
import { ImageAnalysis } from '../types';
import { useLanguage } from '../LanguageContext';

interface ResultCardProps {
  prompt: string;
  negativePrompt: string;
  detectedSummary?: string;
  analysis?: ImageAnalysis | string;
  previewUrl?: string | null;
  onPromptChange?: (newPrompt: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  prompt,
  negativePrompt,
  detectedSummary,
  analysis,
  previewUrl,
  onPromptChange,
}) => {
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editablePositive, setEditablePositive] = useState(prompt);
  const [editableSummary, setEditableSummary] = useState(detectedSummary || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syncedNotice, setSyncedNotice] = useState(false);
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  useEffect(() => {
    setEditablePositive(prompt);
  }, [prompt]);

  useEffect(() => {
    if (detectedSummary !== undefined) {
      setEditableSummary(detectedSummary);
    }
  }, [detectedSummary]);

  const handlePositiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditablePositive(val);
    onPromptChange?.(val);
  };

  const handleApplySummaryToPrompt = () => {
    if (!editableSummary.trim()) return;
    const prefix = isEs ? '[AJUSTES DEL CONCEPTO: ' : '[CONCEPT ADJUSTMENTS: ';
    const currentPos = editablePositive;
    const updated = currentPos.includes(prefix)
      ? currentPos.replace(new RegExp(`\\${prefix}[^\\]]+\\]`), `${prefix}${editableSummary.trim().replace(/\n+/g, '; ')}]`)
      : `${currentPos}\n\n${prefix}${editableSummary.trim().replace(/\n+/g, '; ')}]`;

    setEditablePositive(updated);
    onPromptChange?.(updated);
    setSyncedNotice(true);
    setTimeout(() => setSyncedNotice(false), 2500);
  };

  const handleCopyPositive = async () => {
    try {
      await navigator.clipboard.writeText(editablePositive);
      setCopiedPositive(true);
      setTimeout(() => setCopiedPositive(false), 2000);
    } catch (err) {
      console.error('Failed to copy positive prompt:', err);
    }
  };

  const handleCopyNegative = async () => {
    try {
      await navigator.clipboard.writeText(negativePrompt);
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    } catch (err) {
      console.error('Failed to copy negative prompt:', err);
    }
  };

  const handleCopySummary = async () => {
    if (!editableSummary) return;
    try {
      await navigator.clipboard.writeText(editableSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      const full = `${isEs ? 'PROMPT POSITIVO:' : 'POSITIVE PROMPT:'}\n${editablePositive}\n\n${isEs ? 'PROMPT NEGATIVO:' : 'NEGATIVE PROMPT:'}\n${negativePrompt}${editableSummary ? `\n\n${isEs ? 'RESUMEN DETECTADO:' : 'DETECTED SUMMARY:'}\n${editableSummary}` : ''}`;
      await navigator.clipboard.writeText(full);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  return (
    <div className="w-full rounded-xl p-3.5 sm:p-4 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-sm flex flex-col gap-3 animate-in fade-in duration-300 select-none">
      {/* Station 04 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD5E1] dark:border-[#222A36]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00FF66]" />
          <h3 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] tracking-wider uppercase">
            04 // {t('generatedBlueprint')}
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

      {/* Editable Detected Scene Summary */}
      {editableSummary && (
        <div className="border rounded p-2.5 flex flex-col gap-1.5 bg-[#F8FAFC] dark:bg-[#080A0E] border-[#CBD5E1] dark:border-[#222A36]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="font-mono font-bold text-[11px] text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wide">
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
                onClick={handleApplySummaryToPrompt}
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
            value={editableSummary}
            onChange={(e) => setEditableSummary(e.target.value)}
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

      {/* Primary Prompt Layout */}
      <div className="flex flex-col gap-2.5">
        {/* Positive Prompt */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            <span>04.1 // {t('positiveBlueprint')}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#64748B] dark:text-[#8C9BAE]">
                [{editablePositive.split(/\s+/).filter(Boolean).length} WORDS]
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
            value={editablePositive}
            onChange={handlePositiveChange}
            rows={6}
            className="w-full p-3 bg-white dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs sm:text-[13px] text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-wrap break-words resize-y focus:outline-none select-text"
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-1 pt-1.5 border-t border-[#CBD5E1] dark:border-[#222A36]">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            <span className="text-[#64748B] dark:text-[#8C9BAE]">04.2 // {t('negativeBlueprint')}</span>
            <button
              type="button"
              onClick={handleCopyNegative}
              className="text-xs font-mono font-bold hover:underline transition-colors cursor-pointer text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] min-h-[30px] flex items-center"
            >
              {copiedNegative ? '[ COPIADO ]' : '[ COPIAR NEGATIVO ]'}
            </button>
          </div>

          <textarea
            value={negativePrompt}
            readOnly
            rows={3}
            className="w-full p-2.5 bg-white/80 dark:bg-[#080A0E]/80 border border-[#CBD5E1] dark:border-[#222A36] rounded font-mono text-xs text-[#64748B] dark:text-[#8C9BAE] italic leading-relaxed focus:outline-none resize-y select-text"
          />
        </div>
      </div>

      {/* Forensic Quality & Brand Breakdown */}
      {analysis && (
        <div className="pt-2 border-t border-[#CBD5E1] dark:border-[#222A36]">
          <div className="rounded p-2.5 bg-[#F8FAFC] dark:bg-[#080A0E] border border-[#CBD5E1] dark:border-[#222A36] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                04.3 // {t('imageQualityAnalysis')}
              </span>
              {typeof analysis !== 'string' && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-mono font-bold hover:underline cursor-pointer text-[var(--trx-accent,#00F0FF)]"
                >
                  {showAdvanced ? '[-] CERRAR' : '[+] VER DETALLES'}
                </button>
              )}
            </div>

            {typeof analysis === 'string' ? (
              <p className="text-xs text-[#64748B] dark:text-[#8C9BAE] font-mono">{analysis}</p>
            ) : (
              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                    <span className="text-[9px] text-[#64748B] dark:text-[#8C9BAE] block uppercase font-bold">CALIDAD</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{analysis.quality}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                    <span className="text-[9px] text-[#64748B] dark:text-[#8C9BAE] block uppercase font-bold">ENTORNO</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{analysis.environment}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                    <span className="text-[9px] text-[#64748B] dark:text-[#8C9BAE] block uppercase font-bold">LUZ</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{analysis.lighting}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                    <span className="text-[9px] text-[#64748B] dark:text-[#8C9BAE] block uppercase font-bold">PALETA</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{analysis.colorPalette}</span>
                  </div>
                </div>

                {/* Detailed Wardrobe, Brand OCR & Capture Authenticity */}
                {(analysis.wardrobeAnalysis || analysis.brandAnalysis || analysis.captureAuthenticity) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-[#CBD5E1] dark:border-[#222A36]">
                    {analysis.wardrobeAnalysis && (
                      <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                        <span className="text-[9px] text-[var(--trx-accent,#00F0FF)] block uppercase font-bold">ROPA Y ACCESORIOS</span>
                        <span className="text-[11px] text-[#0F172A] dark:text-[#F1F5F9] leading-snug font-sans">{analysis.wardrobeAnalysis}</span>
                      </div>
                    )}
                    {analysis.brandAnalysis && (
                      <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                        <span className="text-[9px] text-[#00FF66] block uppercase font-bold">DETECCIÓN DE MARCAS</span>
                        <span className="text-[11px] text-[#0F172A] dark:text-[#F1F5F9] leading-snug">{analysis.brandAnalysis}</span>
                      </div>
                    )}
                    {analysis.captureAuthenticity && (
                      <div className="p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                        <span className="text-[9px] text-[#FFCC00] block uppercase font-bold">CAPTURA REAL</span>
                        <span className="text-[11px] text-[#0F172A] dark:text-[#F1F5F9] leading-snug font-sans">{analysis.captureAuthenticity}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
