import React from 'react';
import { ArrowRight, Loader2, SlidersHorizontal, Wand2 } from 'lucide-react';
import { Language, ViewMode } from '../types';
import { translations } from '../translations';

interface MobileCommandDockProps {
  lang: Language;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onGenerate: () => void;
  onScrollOutput: () => void;
  canGenerate: boolean;
  isLoading: boolean;
  hasOutput: boolean;
}

const copy = {
  pt: { result: 'Resultado' },
  es: { result: 'Resultado' },
  en: { result: 'Output' }
} as const;

const MobileCommandDock: React.FC<MobileCommandDockProps> = ({
  lang,
  viewMode,
  onSetViewMode,
  onGenerate,
  onScrollOutput,
  canGenerate,
  isLoading,
  hasOutput
}) => {
  const ui = copy[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];
  const t = translations[lang];

  return (
    <div className="mobile-command-dock lg:hidden">
      <div className="mobile-dock-mode" aria-label={t.nav.simpleMode}>
        <button type="button" onClick={() => onSetViewMode('simple')} className={viewMode === 'simple' ? 'is-active' : ''}>
          <Wand2 size={15} />
          <span>{t.nav.simpleMode}</span>
        </button>
        <button type="button" onClick={() => onSetViewMode('advanced')} className={viewMode === 'advanced' ? 'is-active' : ''}>
          <SlidersHorizontal size={15} />
          <span>{t.nav.advancedMode}</span>
        </button>
      </div>

      {hasOutput && (
        <button type="button" onClick={onScrollOutput} className="mobile-dock-output">
          {ui.result}
        </button>
      )}

      <button type="button" onClick={onGenerate} disabled={!canGenerate || isLoading} className="mobile-dock-generate">
        {isLoading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
        <span>{isLoading ? t.simple.generating : t.simple.generate}</span>
      </button>
    </div>
  );
};

export default MobileCommandDock;
