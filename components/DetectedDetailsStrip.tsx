import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

interface DetectedDetailsStripProps {
  summary: string;
  onSyncWithPrompt: (updatedSummaryText: string) => void;
  className?: string;
}

interface ParsedDetails {
  sujetos: string;
  pose: string;
  ropa: string;
  entorno: string;
  luz: string;
}

const parseSummaryText = (text: string, isEs: boolean): ParsedDetails => {
  const result: ParsedDetails = {
    sujetos: isEs ? '1 sujeto principal' : '1 primary subject',
    pose: isEs ? 'Postura natural observable' : 'Natural observable stance',
    ropa: isEs ? 'Vestimenta casual identificada' : 'Casual clothing identified',
    entorno: isEs ? 'Escena real preservada' : 'Authentic setting preserved',
    luz: isEs ? 'Luz ambiental y sombras reales' : 'Ambient natural light & shadows',
  };

  if (!text) return result;

  const lines = text.split('\n');
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    const parts = line.split(':');
    const content = parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim();
    if (!content) return;

    if (lower.includes('sujeto') || lower.includes('subject') || lower.includes('persona')) {
      result.sujetos = content;
    } else if (lower.includes('pose') || lower.includes('postura') || lower.includes('mirada') || lower.includes('acción') || lower.includes('action')) {
      result.pose = content;
    } else if (lower.includes('ropa') || lower.includes('vestimenta') || lower.includes('wardrobe') || lower.includes('clothing') || lower.includes('calzado')) {
      result.ropa = content;
    } else if (lower.includes('entorno') || lower.includes('setting') || lower.includes('mural') || lower.includes('banca') || lower.includes('lugar') || lower.includes('environment')) {
      result.entorno = content;
    } else if (lower.includes('luz') || lower.includes('light') || lower.includes('iluminación') || lower.includes('sombras') || lower.includes('fotografía') || lower.includes('cámara')) {
      result.luz = content;
    } else if (lower.includes('composición') || lower.includes('composition')) {
      result.sujetos = `${content} · ${result.sujetos}`;
    }
  });

  return result;
};

const DetectedDetailsStrip: React.FC<DetectedDetailsStripProps> = ({
  summary,
  onSyncWithPrompt,
  className = '',
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  const [details, setDetails] = useState<ParsedDetails>(() => parseSummaryText(summary, isEs));
  const [activeEditingKey, setActiveEditingKey] = useState<keyof ParsedDetails | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    setDetails(parseSummaryText(summary, isEs));
  }, [summary, isEs]);

  const handleFieldChange = (key: keyof ParsedDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyChanges = () => {
    const formatted = [
      `${isEs ? 'Sujetos y composición' : 'Subjects & composition'}: ${details.sujetos}`,
      `${isEs ? 'Pose y acción' : 'Pose & action'}: ${details.pose}`,
      `${isEs ? 'Ropa y calzado' : 'Wardrobe & footwear'}: ${details.ropa}`,
      `${isEs ? 'Entorno y fondo' : 'Environment & background'}: ${details.entorno}`,
      `${isEs ? 'Luz y sombras' : 'Lighting & shadows'}: ${details.luz}`,
    ].join('\n');

    onSyncWithPrompt(formatted);
    setActiveEditingKey(null);
    setSynced(true);
    setTimeout(() => setSynced(false), 2400);
  };

  const fields: { key: keyof ParsedDetails; label: string; icon: string }[] = [
    { key: 'sujetos', label: t('detectedSubjects'), icon: '👤' },
    { key: 'pose', label: t('detectedPose'), icon: '🧍' },
    { key: 'ropa', label: t('detectedWardrobe'), icon: '🧥' },
    { key: 'entorno', label: t('detectedEnvironment'), icon: '🏛️' },
    { key: 'luz', label: t('detectedLighting'), icon: '💡' },
  ];

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 bg-[#F4F1E9] dark:bg-[#152220] border border-[#DDD7CA] dark:border-[#243A37] shadow-xs flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-[#DDD7CA]/70 dark:border-[#243A37]/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9AC3B5]" />
          <span className="text-xs font-bold text-[#101A19] dark:text-[#F4F1E9] font-mono tracking-wider uppercase">
            {t('detectedStripTitle')}
          </span>
          <span className="text-[11px] text-[#6F8480] dark:text-[#9AC3B5] font-light hidden sm:inline">
            ({isEs ? 'editable antes de copiar' : 'editable before copying'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {synced && (
            <span className="text-[11px] text-[#6F9D8F] dark:text-[#9AC3B5] font-medium flex items-center gap-1 animate-in fade-in">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isEs ? '¡Sincronizado!' : 'Synced!'}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleApplyChanges}
            className="px-3 py-1 bg-[#D8C29C] hover:bg-[#E2CFA9] active:bg-[#C5AE86] text-[#101A19] rounded-full text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{t('syncToPromptAction')}</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 Detected Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {fields.map(({ key, label, icon }) => {
          const isEditing = activeEditingKey === key;
          const value = details[key];

          return (
            <div
              key={key}
              onClick={() => !isEditing && setActiveEditingKey(key)}
              className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer group ${
                isEditing
                  ? 'bg-white dark:bg-[#1B2C2A] border-[#D8C29C] ring-2 ring-[#D8C29C]/30 shadow-xs'
                  : 'bg-white/70 dark:bg-[#1A2B29]/70 hover:bg-white dark:hover:bg-[#1A2B29] border-[#DDD7CA]/80 dark:border-[#243A37] hover:border-[#9AC3B5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#6F8480] dark:text-[#9AC3B5] uppercase tracking-wider flex items-center gap-1">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
                <span className="text-[9px] text-[#6F8480] opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎
                </span>
              </div>

              {isEditing ? (
                <textarea
                  autoFocus
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  onBlur={() => setActiveEditingKey(null)}
                  rows={2}
                  className="w-full bg-transparent border-0 text-xs text-[#101A19] dark:text-[#F4F1E9] p-0 font-sans focus:outline-none resize-none leading-relaxed"
                />
              ) : (
                <p className="text-[11px] text-[#101A19] dark:text-[#F4F1E9] line-clamp-2 leading-relaxed">
                  {value}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetectedDetailsStrip;
