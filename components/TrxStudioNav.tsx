import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import TrxLogo from './TrxLogo';

export type TrxStudioView = 'analyzer' | 'ideaBuilder' | 'promptBatches' | 'lifestyle';

interface TrxStudioNavProps {
  currentView: TrxStudioView;
  onSelectView: (view: TrxStudioView) => void;
  onOpenHistory: () => void;
  onOpenExamples: () => void;
  onOpenInspiration: () => void;
  onOpenMobileSettings?: () => void;
  historyCount: number;
}

const TrxStudioNav: React.FC<TrxStudioNavProps> = ({
  currentView,
  onSelectView,
  onOpenHistory,
  onOpenExamples,
  onOpenInspiration,
  onOpenMobileSettings,
  historyCount,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const isEs = language === 'es';

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          DESKTOP: Left Technical Studio Console Rail
         ────────────────────────────────────────────────────────── */}
      <nav
        className="hidden md:flex flex-col justify-between w-60 lg:w-64 h-[calc(100vh-2rem)] sticky top-4 rounded-xl p-4 bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-xs select-none shrink-0"
        aria-label="Studio Console Navigation"
      >
        {/* Brand Lockup with TRX Original Optical Reticle Mark */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <TrxLogo size="md" />
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs tracking-widest text-[#0F172A] dark:text-[#F1F5F9] uppercase">
                PROJECT TRX
              </span>
              <span className="text-[9px] font-mono text-[#64748B] dark:text-[#8C9BAE] tracking-widest">
                OPTICAL SIGNAL STATION
              </span>
            </div>
          </div>

          {/* Primary Numbered Navigation Stations */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#CBD5E1] dark:border-[#222A36]">
            {/* Station 01: Analizador */}
            <button
              type="button"
              onClick={() => onSelectView('analyzer')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                currentView === 'analyzer'
                  ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-xs'
                  : 'text-[#64748B] dark:text-[#8C9BAE] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-75">01 //</span>
                <span className="truncate">{t('tabAnalyzer')}</span>
              </div>
              <span className="w-1.5 h-1.5 bg-current" />
            </button>

            {/* Station 02: Construye tu idea */}
            <button
              type="button"
              onClick={() => onSelectView('ideaBuilder')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                currentView === 'ideaBuilder'
                  ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-xs'
                  : 'text-[#64748B] dark:text-[#8C9BAE] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-75">02 //</span>
                <span className="truncate">{t('tabIdeaBuilder')}</span>
              </div>
              <span className="w-1.5 h-1.5 bg-current" />
            </button>

            {/* Station 03: Lotes de prompts */}
            <button
              type="button"
              onClick={() => onSelectView('promptBatches')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                currentView === 'promptBatches'
                  ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-xs'
                  : 'text-[#64748B] dark:text-[#8C9BAE] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-75">03 //</span>
                <span className="truncate">{t('tabBatches')}</span>
              </div>
              <span className="w-1.5 h-1.5 bg-current" />
            </button>

            {/* Station 04: Lifestyle */}
            <button
              type="button"
              onClick={() => onSelectView('lifestyle')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                currentView === 'lifestyle'
                  ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] shadow-xs'
                  : 'text-[#64748B] dark:text-[#8C9BAE] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-75">04 //</span>
                <span className="truncate">Lifestyle</span>
              </div>
              <span className="w-1.5 h-1.5 bg-current" />
            </button>

            {/* Station 05: History Archive */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-75">05 //</span>
                <span>{t('history')}</span>
              </div>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30">
                  {historyCount}
                </span>
              )}
            </button>
          </div>

          {/* Resources & Showcase */}
          <div className="flex flex-col gap-1 pt-2 border-t border-[#CBD5E1] dark:border-[#222A36]">
            <span className="px-3 text-[9px] font-mono uppercase tracking-widest text-[#64748B] dark:text-[#8C9BAE]">
              ARCHIVE // {t('resources')}
            </span>
            <button
              type="button"
              onClick={onOpenExamples}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] transition-colors cursor-pointer text-left"
            >
              <span className="text-[#00FF66]">›</span>
              <span>{t('examples')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenInspiration}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-[#64748B] dark:text-[#8C9BAE] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] transition-colors cursor-pointer text-left"
            >
              <span className="text-[#FFCC00]">›</span>
              <span>{t('inspiration')}</span>
            </button>
          </div>
        </div>

        {/* Footer Settings & Language Switcher */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[#CBD5E1] dark:border-[#222A36]">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded text-xs font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#181D26] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-2xs" style={{ backgroundColor: isDark ? '#FFCC00' : '#00F0FF' }} />
              <span>{isDark ? 'LGT_MODE' : 'CRT_MODE'}</span>
            </button>

            <div className="flex items-center gap-0.5 bg-[#F1F5F9] dark:bg-[#080A0E] p-0.5 rounded border border-[#CBD5E1] dark:border-[#222A36]">
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
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────
          MOBILE: Console Navigation Bottom Bar (<768px)
          Features named destinations, SVG optical icons, pixel indicators, 44px hitboxes
         ────────────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] max-w-md p-1 rounded-xl bg-white/95 dark:bg-[#11151C]/95 border border-[#CBD5E1] dark:border-[#222A36] shadow-2xl backdrop-blur-md flex items-center justify-around select-none"
        aria-label="Mobile Navigation"
      >
        {/* 01: Analizador */}
        <button
          type="button"
          onClick={() => onSelectView('analyzer')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] transition-all cursor-pointer ${
            currentView === 'analyzer'
              ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
          }`}
        >
          {/* Lens Icon */}
          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
            {t('tabAnalyzer')}
          </span>
        </button>

        {/* 02: Construye tu idea */}
        <button
          type="button"
          onClick={() => onSelectView('ideaBuilder')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] transition-all cursor-pointer ${
            currentView === 'ideaBuilder'
              ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
          }`}
        >
          {/* Pen / Drafting Icon */}
          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
            {isEs ? 'Construir' : 'Build'}
          </span>
        </button>

        {/* 03: Lotes de prompts */}
        <button
          type="button"
          onClick={() => onSelectView('promptBatches')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] transition-all cursor-pointer ${
            currentView === 'promptBatches'
              ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
          }`}
        >
          {/* Stack / Batch Layers Icon */}
          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
            {t('tabBatchesShort')}
          </span>
        </button>

        {/* 04: Lifestyle */}
        <button
          type="button"
          onClick={() => onSelectView('lifestyle')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] transition-all cursor-pointer ${
            currentView === 'lifestyle'
              ? 'bg-[var(--trx-accent,#00F0FF)] text-[#080A0E] font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
          }`}
        >
          {/* Aesthetic Lifestyle Photo Framing Icon */}
          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
            Lifestyle
          </span>
        </button>

        {/* 05: Historial */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] relative cursor-pointer"
        >
          {/* History Archive Icon */}
          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
            {t('history')}
          </span>
          {historyCount > 0 && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-[#00FF66] rounded-full" />
          )}
        </button>

        {/* 05: Ajustes */}
        {onOpenMobileSettings && (
          <button
            type="button"
            onClick={onOpenMobileSettings}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg min-h-[44px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] cursor-pointer"
          >
            {/* Tuning Sliders Icon */}
            <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-[10px] font-mono tracking-tight leading-none uppercase">
              {t('settings')}
            </span>
          </button>
        )}
      </nav>
    </>
  );
};

export default TrxStudioNav;
