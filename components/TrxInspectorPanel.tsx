import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { ExifData } from '../types';
import ChampagneCapsuleButton from './ChampagneCapsuleButton';

interface TrxInspectorPanelProps {
  lensType: string;
  setLensType: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
  heightCm: string;
  setHeightCm: (val: string) => void;
  weightKg: string;
  setWeightKg: (val: string) => void;
  detailLevel: number;
  setDetailLevel: (val: number) => void;
  addNoise: boolean;
  setAddNoise: (val: boolean) => void;
  keepExactWardrobe: boolean;
  setKeepExactWardrobe: (val: boolean) => void;
  manualBrand: string;
  setManualBrand: (val: string) => void;
  customInstructions: string;
  setCustomInstructions: (val: string) => void;
  exifData: ExifData | null;
  isAnalyzing: boolean;
  onGenerate: () => void;
  hasReference: boolean;
  className?: string;
  hideHeader?: boolean;

  // Settings persistence props
  onSaveSettings?: () => void;
  onResetSettings?: () => void;
  onLoadSavedSettings?: () => void;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: (enabled: boolean) => void;
  hasCustomSettingsSaved?: boolean;
  savedNotification?: string | null;
}

const TrxInspectorPanel: React.FC<TrxInspectorPanelProps> = ({
  lensType,
  setLensType,
  aspectRatio,
  setAspectRatio,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  detailLevel,
  setDetailLevel,
  addNoise,
  setAddNoise,
  keepExactWardrobe,
  setKeepExactWardrobe,
  manualBrand,
  setManualBrand,
  customInstructions,
  setCustomInstructions,
  exifData,
  isAnalyzing,
  onGenerate,
  hasReference,
  className = '',
  hideHeader = false,
  onSaveSettings,
  onResetSettings,
  onLoadSavedSettings,
  autoSaveEnabled,
  onToggleAutoSave,
  hasCustomSettingsSaved,
  savedNotification,
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  // Collapsible stations
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    optical: true,
    wardrobe: true,
    physical: false,
    advanced: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const LENS_OPTIONS = [
    { id: 'auto', label: `[AUTO] ${t('autoLens')}` },
    { id: '14mm ultra-wide lens', label: `14mm // ${t('ultraWide')}` },
    { id: '24mm wide-angle lens', label: `24mm // ${t('wideAngle')}` },
    { id: '35mm standard lens', label: `35mm // ${t('standardLens')}` },
    { id: '50mm portrait lens', label: `50mm // ${t('portraitLens')}` },
    { id: '85mm telephoto lens', label: `85mm // ${t('telephotoLens')}` },
    { id: '100mm macro lens', label: `100mm // ${t('macroLens')}` },
  ];

  const ASPECT_RATIO_PRESETS = [
    { id: 'auto', label: 'AUTO', w: 10, h: 10 },
    { id: '9:16', label: '9:16', w: 8, h: 14 },
    { id: '1:1', label: '1:1', w: 11, h: 11 },
    { id: '16:9', label: '16:9', w: 14, h: 8 },
    { id: '3:4', label: '3:4', w: 9, h: 12 },
    { id: '4:3', label: '4:3', w: 12, h: 9 },
  ];

  return (
    <aside
      className={`w-full flex flex-col justify-between rounded-xl p-3 sm:p-4 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-xs select-none ${className}`}
    >
      <div className="flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-0.5">
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1] dark:border-[#222A36]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--trx-accent,#00F0FF)]" />
              <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] tracking-wider uppercase">
                03 // {t('studioSettings')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {hasCustomSettingsSaved ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[var(--trx-accent,#00F0FF)]/10 text-[var(--trx-accent,#00F0FF)] border border-[var(--trx-accent,#00F0FF)]/30">
                  <span className="w-1 h-1 bg-[var(--trx-accent,#00F0FF)]" />
                  PRESET
                </span>
              ) : (
                <span className="text-[9px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                  DEFAULT
                </span>
              )}
            </div>
          </div>
        )}

        {/* Technical Presets Bar */}
        <div className="p-2 rounded bg-[#F8FAFC] dark:bg-[#0C0F14] border border-[#CBD5E1] dark:border-[#222A36] flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={onSaveSettings}
              disabled={isAnalyzing}
              style={{
                backgroundColor: 'var(--trx-accent, #00F0FF)',
                color: 'var(--trx-accent-contrast, #080A0E)',
              }}
              className="flex-1 py-1.5 px-2 min-h-[36px] rounded text-[11px] font-mono font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 uppercase tracking-wide"
              title={t('saveSettingsAsDefault')}
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.4} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="truncate">{t('saveSettingsAsDefault')}</span>
            </button>

            {hasCustomSettingsSaved && (
              <button
                type="button"
                onClick={onLoadSavedSettings}
                disabled={isAnalyzing}
                className="py-1.5 px-2 min-h-[36px] rounded text-[11px] font-mono font-medium bg-white dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#2C3645] text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#222A36] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                title={t('loadSavedSettings')}
              >
                <svg className="w-3 h-3 shrink-0 text-[var(--trx-accent,#00F0FF)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline truncate">{t('loadSavedSettings')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetSettings}
              disabled={isAnalyzing}
              className="py-1.5 px-2.5 min-h-[36px] rounded text-[11px] font-mono font-medium bg-white dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#2C3645] text-[#64748B] hover:text-[#FF3366] hover:border-[#FF3366] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              title={t('resetDefaults')}
            >
              <span>↺</span>
              <span className="hidden sm:inline truncate">{t('resetDefaults')}</span>
            </button>
          </div>

          {/* Auto-save telemetry */}
          <div className="flex items-center justify-between pt-1 border-t border-[#CBD5E1]/60 dark:border-[#222A36]/60 text-[10px] font-mono">
            <span className="text-[#64748B] dark:text-[#8C9BAE]">{t('autoSaveSettings')}</span>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 min-h-[30px]">
              <input
                type="checkbox"
                checked={!!autoSaveEnabled}
                onChange={(e) => onToggleAutoSave?.(e.target.checked)}
                disabled={isAnalyzing}
                className="sr-only peer"
              />
              <div
                style={{
                  backgroundColor: autoSaveEnabled ? 'var(--trx-accent, #00F0FF)' : undefined,
                }}
                className="w-6 h-3.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-2xs after:h-3 after:w-3 after:transition-all"
              />
            </label>
          </div>

          {savedNotification && (
            <div className="py-1 px-1.5 rounded text-[10px] font-mono flex items-center gap-1 bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 animate-in fade-in">
              <span>✓</span>
              <span className="font-semibold">{savedNotification}</span>
            </div>
          )}
        </div>

        {/* EXIF Data Strip */}
        {exifData && (
          <div className="p-2 rounded bg-[#F8FAFC] dark:bg-[#0C0F14] border border-[#CBD5E1] dark:border-[#222A36] text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9] shrink-0 text-[#00FF66]">[EXIF]</span>
            <span className="truncate">
              {exifData.Make || exifData.Model ? `${exifData.Make || ''} ${exifData.Model || ''}`.trim() : ''}
              {exifData.FocalLength ? ` · ${exifData.FocalLength}mm` : ''}
              {exifData.FNumber ? ` · f/${exifData.FNumber}` : ''}
              {exifData.ISO ? ` · ISO ${exifData.ISO}` : ''}
            </span>
          </div>
        )}

        {/* 03.1: ÓPTICA Y FORMATO */}
        <div className="rounded bg-[#F8FAFC]/50 dark:bg-[#0C0F14]/50 border border-[#CBD5E1] dark:border-[#222A36] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('optical')}
            className="w-full p-2 sm:p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#181D26]/50 transition-colors min-h-[40px]"
          >
            <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[var(--trx-accent,#00F0FF)]" />
              <span>03.1 // {t('cameraLens')} & {t('aspectRatio')}</span>
            </span>
            <span className="text-xs font-mono text-[#64748B]">{openSections.optical ? '[-]' : '[+]'}</span>
          </button>

          {openSections.optical && (
            <div className="p-2 sm:p-2.5 pt-0 flex flex-col gap-2 border-t border-[#CBD5E1]/70 dark:border-[#222A36]/70">
              {/* Lens Selection */}
              <div>
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-1">
                  {t('focalLength')}
                </span>
                <select
                  value={lensType}
                  onChange={(e) => setLensType(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full py-1.5 px-2 rounded text-xs font-mono bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none cursor-pointer min-h-[36px]"
                >
                  {LENS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio Presets */}
              <div>
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-1">
                  {t('aspectRatio')}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {ASPECT_RATIO_PRESETS.map((ratio) => {
                    const isSelected = aspectRatio === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setAspectRatio(ratio.id)}
                        disabled={isAnalyzing}
                        style={{
                          backgroundColor: isSelected ? 'var(--trx-accent, #00F0FF)' : undefined,
                          color: isSelected ? 'var(--trx-accent-contrast, #080A0E)' : undefined,
                        }}
                        className={`py-1 px-1 rounded text-[10px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[32px] ${
                          isSelected
                            ? 'font-bold shadow-2xs border border-current'
                            : 'bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                        }`}
                      >
                        <div
                          className="border border-current opacity-70"
                          style={{ width: `${ratio.w}px`, height: `${ratio.h}px` }}
                        />
                        <span>{ratio.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 03.2: ROPA Y MARCAS */}
        <div className="rounded bg-[#F8FAFC]/50 dark:bg-[#0C0F14]/50 border border-[#CBD5E1] dark:border-[#222A36] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('wardrobe')}
            className="w-full p-2 sm:p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#181D26]/50 transition-colors min-h-[40px]"
          >
            <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00FF66]" />
              <span>03.2 // {t('clothingAndAccessoriesTitle')}</span>
            </span>
            <span className="text-xs font-mono text-[#64748B]">{openSections.wardrobe ? '[-]' : '[+]'}</span>
          </button>

          {openSections.wardrobe && (
            <div className="p-2 sm:p-2.5 pt-0 flex flex-col gap-2 border-t border-[#CBD5E1]/70 dark:border-[#222A36]/70">
              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                    {t('keepExactWardrobeOption')}
                  </span>
                  <span className="text-[9px] text-[#64748B] dark:text-[#8C9BAE]">
                    {isEs ? 'Transferir ropa exacta de escena' : 'Transfer exact reference clothing'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 min-h-[30px]">
                  <input
                    type="checkbox"
                    checked={keepExactWardrobe}
                    onChange={(e) => setKeepExactWardrobe(e.target.checked)}
                    disabled={isAnalyzing}
                    className="sr-only peer"
                  />
                  <div
                    style={{
                      backgroundColor: keepExactWardrobe ? 'var(--trx-accent, #00F0FF)' : undefined,
                    }}
                    className="w-6 h-3.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-2xs after:h-3 after:w-3 after:transition-all"
                  />
                </label>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-1">
                  {t('manualBrandTitle')}
                </span>
                <input
                  type="text"
                  value={manualBrand}
                  onChange={(e) => setManualBrand(e.target.value)}
                  placeholder={t('manualBrandPlaceholder')}
                  disabled={isAnalyzing}
                  className="w-full py-1.5 px-2 rounded text-xs font-mono bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none min-h-[36px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 03.3: DATOS FÍSICOS */}
        <div className="rounded bg-[#F8FAFC]/50 dark:bg-[#0C0F14]/50 border border-[#CBD5E1] dark:border-[#222A36] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('physical')}
            className="w-full p-2 sm:p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#181D26]/50 transition-colors min-h-[40px]"
          >
            <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FFCC00]" />
              <span>03.3 // {t('physicalMeasurements')}</span>
            </span>
            <span className="text-xs font-mono text-[#64748B]">{openSections.physical ? '[-]' : '[+]'}</span>
          </button>

          {openSections.physical && (
            <div className="p-2 sm:p-2.5 pt-0 flex flex-col gap-2 border-t border-[#CBD5E1]/70 dark:border-[#222A36]/70">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-1">
                    {t('height')} (cm)
                  </span>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="175"
                    disabled={isAnalyzing}
                    className="w-full py-1.5 px-2 rounded text-xs font-mono bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none min-h-[36px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE] block mb-1">
                    {t('weight')} (kg)
                  </span>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="70"
                    disabled={isAnalyzing}
                    className="w-full py-1.5 px-2 rounded text-xs font-mono bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none min-h-[36px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 03.4: PARÁMETROS AVANZADOS */}
        <div className="rounded bg-[#F8FAFC]/50 dark:bg-[#0C0F14]/50 border border-[#CBD5E1] dark:border-[#222A36] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('advanced')}
            className="w-full p-2 sm:p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#181D26]/50 transition-colors min-h-[40px]"
          >
            <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF3366]" />
              <span>03.4 // {t('advancedCalibration')}</span>
            </span>
            <span className="text-xs font-mono text-[#64748B]">{openSections.advanced ? '[-]' : '[+]'}</span>
          </button>

          {openSections.advanced && (
            <div className="p-2 sm:p-2.5 pt-0 flex flex-col gap-2 border-t border-[#CBD5E1]/70 dark:border-[#222A36]/70">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#64748B] dark:text-[#8C9BAE]">{t('detailLevel')}</span>
                  <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    [{detailLevel}/5]
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(parseInt(e.target.value))}
                  disabled={isAnalyzing}
                  className="w-full accent-[var(--trx-accent)] cursor-pointer h-1.5"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
                <span className="text-[11px] font-mono text-[#0F172A] dark:text-[#F1F5F9]">
                  {t('simulateImperfections')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 min-h-[30px]">
                  <input
                    type="checkbox"
                    checked={addNoise}
                    onChange={(e) => setAddNoise(e.target.checked)}
                    disabled={isAnalyzing}
                    className="sr-only peer"
                  />
                  <div
                    style={{
                      backgroundColor: addNoise ? 'var(--trx-accent, #00F0FF)' : undefined,
                    }}
                    className="w-6 h-3.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-2xs after:h-3 after:w-3 after:transition-all"
                  />
                </label>
              </div>

              <div>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={t('customInstructionsPlaceholder')}
                  disabled={isAnalyzing}
                  rows={2}
                  className="w-full py-1.5 px-2.5 rounded text-xs font-mono bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button Pinned at Bottom */}
      <div className="pt-2.5 border-t border-[#CBD5E1] dark:border-[#222A36] mt-2 flex justify-end">
        <ChampagneCapsuleButton
          onClick={onGenerate}
          disabled={!hasReference || isAnalyzing}
          isLoading={isAnalyzing}
          loadingText={t('reviewingScene')}
          label={t('generateTrxPromptAction')}
          className="w-full"
        />
      </div>
    </aside>
  );
};

export default TrxInspectorPanel;
