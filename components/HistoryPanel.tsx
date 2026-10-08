import React from 'react';
import { PromptResult } from '../types';
import { useLanguage } from '../LanguageContext';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptResult[];
  onSelect: (item: PromptResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#080A0E] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#D8E0E8] dark:border-[#242D38]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#D8E0E8] dark:border-[#242D38] flex items-center justify-between bg-[#F6F8FA] dark:bg-[#12161E]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF66]" />
            <div>
              <h2 className="font-mono font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6F9] uppercase tracking-wider">
                04 // {t('historyTitle')}
              </h2>
              <span className="text-[10px] text-[#64748B] dark:text-[#8C9BAE] font-mono">
                [{history.length} {isEs ? 'REGISTROS' : 'RECORDS'}]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-2 py-1 text-[11px] font-mono font-bold text-[#64748B] hover:text-[#FF3366] rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                [ {t('clearHistory')} ]
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-[#E2E8F0] dark:hover:bg-[#1A202C] rounded transition-colors text-[#64748B] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center font-mono font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-[#64748B] dark:text-[#8C9BAE] mt-16 text-xs font-mono">
              [ {t('noHistory')} ] <br />
              <span className="text-[11px] opacity-75">{t('noHistoryDesc')}</span>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#F6F8FA] dark:bg-[#12161E] border border-[#D8E0E8] dark:border-[#242D38] rounded p-2.5 flex flex-col gap-1.5 hover:border-[var(--trx-accent,#00F0FF)] transition-all group relative cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <div className="flex justify-between items-start text-[10px] font-mono">
                  <span className="text-[var(--trx-accent,#00F0FF)] font-bold">
                    #{(idx + 1).toString().padStart(2, '0')} // {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.isBatch && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[var(--trx-accent,#00F0FF)]/20 text-[var(--trx-accent,#00F0FF)] border border-[var(--trx-accent,#00F0FF)]/30">
                        LOTE: {item.batchData?.prompts.length || item.batchData?.quantity || 100}
                      </span>
                    )}
                    {item.isLifestyle && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FFCC00]/20 text-[#FFCC00] border border-[#FFCC00]/30">
                        LIFESTYLE: {item.lifestyleData?.proposals.length || 5}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="text-[#64748B] hover:text-[#FF3366] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                      title={t('delete')}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  {item.originalImage ? (
                    <img
                      src={item.originalImage}
                      alt="Thumbnail"
                      className="w-12 h-12 object-cover rounded border border-[#D8E0E8] dark:border-[#242D38] shrink-0 bg-[#080A0E]"
                    />
                  ) : item.isBatch ? (
                    <div className="w-12 h-12 rounded border border-[#D8E0E8] dark:border-[#222A36] shrink-0 bg-[#E2E8F0] dark:bg-[#080A0E] flex flex-col items-center justify-center text-[var(--trx-accent,#00F0FF)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold mt-0.5">BATCH</span>
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#0F172A] dark:text-[#F3F6F9] line-clamp-3 font-mono leading-relaxed">
                      {item.positivePrompt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.isLifestyle && (
                        <span className="text-[10px] font-mono text-[#FFCC00] font-medium">
                          ✨ 5 fotos sin personas
                        </span>
                      )}
                      {item.isBatch && item.batchData?.gender && (
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                          👤 {item.batchData.gender === 'woman' ? 'Mujer' : 'Hombre'}
                        </span>
                      )}
                      {item.isBatch && item.batchData?.country && (
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8C9BAE]">
                          🌍 {item.batchData.country}
                        </span>
                      )}
                      {item.isBatch && (item.batchData?.heightCm || item.batchData?.weightKg) && (
                        <span className="text-[10px] font-mono text-[var(--trx-accent,#00F0FF)] font-medium">
                          📏 {[item.batchData.heightCm ? `${item.batchData.heightCm} cm` : '', item.batchData.weightKg ? `${item.batchData.weightKg} kg` : ''].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
