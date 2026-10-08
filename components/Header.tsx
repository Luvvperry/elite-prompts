import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenExamples: () => void;
  onOpenInspiration: () => void;
  historyCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenExamples,
  onOpenInspiration,
  historyCount = 0
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 mb-4 max-w-6xl mx-auto w-full">
      <div className="glass-card rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Brand Identity: Project TRX + Realismo Forense */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-900 text-[#faf8f5] dark:bg-violet-600 dark:text-white flex items-center justify-center font-display font-bold text-xs shadow-sm">
            TX
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-[#1a1917] dark:text-[#f4f4f5] leading-none">
              Project TRX
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono tracking-wider uppercase mt-0.5">
              {language === 'es' ? 'Estudio Forense' : 'Forensic Studio'}
            </span>
          </div>
        </div>

        {/* Right Tools: Grouped modal triggers, Theme & Language toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={onOpenInspiration}
            className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title={language === 'es' ? 'Inspiración' : 'Inspiration'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{language === 'es' ? 'Inspiración' : 'Inspiration'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExamples}
            className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title={language === 'es' ? 'Ejemplos' : 'Examples'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{language === 'es' ? 'Ejemplos' : 'Examples'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer relative flex items-center gap-1.5"
            title={language === 'es' ? 'Historial' : 'History'}
          >
            <span>{language === 'es' ? 'Historial' : 'History'}</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Selector Capsule: Original vs Negro */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 rounded-full p-0.5 ml-1">
            <button
              type="button"
              onClick={() => setTheme('original')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                theme === 'original'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              title={t('themeToggleToLight')}
            >
              <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{t('themeOriginal')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('negro')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                theme === 'negro'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              title={t('themeToggleToDark')}
            >
              <svg className="w-3 h-3 text-violet-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span className="hidden sm:inline">{t('themeNegro')}</span>
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 rounded-full p-0.5 ml-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              ES
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
