import React, { useState, useEffect, memo } from 'react';
import { Language, GenerationOutput } from '../types';
import { translations } from '../translations';
import { 
  Copy, 
  Check, 
  Bookmark, 
  Wand2, 
  Columns, 
  Camera,
  X,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface PromptDisplayProps {
  lang: Language;
  generation: GenerationOutput | null;
  isLoading: boolean;
  jsonMode: boolean;
  onRefinePrompt: (engine: 'v1' | 'v2' | 'v3', instruction: string) => Promise<void>;
  onSaveToPresets: (name: string) => void;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({
  lang,
  generation,
  isLoading,
  jsonMode,
  onRefinePrompt,
  onSaveToPresets
}) => {
  const t = translations[lang];

  type EngineType = 'v1' | 'v2' | 'v3';
  type TabType = EngineType | 'compare';
  const [activeTab, setActiveTab] = useState<TabType>('v1');
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [showNegative, setShowNegative] = useState<boolean>(false);

  // Refine modal state
  const [isRefining, setIsRefining] = useState(false);
  const [refineEngine, setRefineEngine] = useState<EngineType>('v1');
  const [refineInput, setRefineInput] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState('');

  // Loading text rotation
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % t.output.loadingSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, t.output.loadingSteps.length]);

  const copyWithFeedback = (text: string, actionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionId);
    setTimeout(() => setCopiedAction(null), 2200);
  };

  const parseStructuredPrompt = (text: string) => {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // Plain-text generations remain valid if JSON mode is enabled after generation.
    }
    return { prompt: text };
  };

  const getCurrentPromptText = () => {
    if (!generation) return '';
    const prompt = activeTab === 'v1' ? generation.v1 : activeTab === 'v2' ? generation.v2 : activeTab === 'v3' ? generation.v3 : '';
    if (jsonMode && activeTab !== 'compare') return JSON.stringify(parseStructuredPrompt(prompt), null, 2);
    switch (activeTab) {
      case 'v1': return generation.v1;
      case 'v2': return generation.v2;
      case 'v3': return generation.v3;
      default: return '';
    }
  };

  const engineLabels: Record<EngineType, { tab: string; title: string }> = {
    v1: { tab: lang === 'pt' ? 'V1 Master' : lang === 'es' ? 'V1 Maestro' : 'V1 Master', title: lang === 'pt' ? 'V1 — Prompt Master Adaptativo' : lang === 'es' ? 'V1 — Prompt Maestro Adaptativo' : 'V1 — Master Adaptive Prompt' },
    v2: { tab: t.output.v2Tab, title: t.output.v2Title },
    v3: { tab: t.output.v3Tab, title: t.output.v3Title }
  };

  const getEngineTitle = (engine: EngineType) => engineLabels[engine].title;

  const handleCopyAll = () => {
    if (!generation) return;
    if (jsonMode) {
      copyWithFeedback(JSON.stringify({
        v1: parseStructuredPrompt(generation.v1),
        v2: parseStructuredPrompt(generation.v2),
        v3: parseStructuredPrompt(generation.v3)
      }, null, 2), 'copy-all');
      return;
    }
    const allText = (['v1', 'v2', 'v3'] as EngineType[])
      .map(engine => `=== ${engineLabels[engine].title} ===\n\n${generation[engine] || ''}`)
      .join('\n\n');
    copyWithFeedback(allText, 'copy-all');
  };

  const openRefineModal = (engine: EngineType) => {
    setRefineEngine(engine);
    setRefineInput('');
    setRefineError('');
    setIsRefining(true);
  };

  const handleApplyRefine = async () => {
    if (!refineInput.trim() || refineLoading) return;
    setRefineLoading(true);
    setRefineError('');
    try {
      await onRefinePrompt(refineEngine, refineInput.trim());
      setIsRefining(false);
    } catch (err) {
      console.error(err);
      setRefineError(err instanceof Error ? err.message : 'Não foi possível aplicar o ajuste. Tente novamente.');
    } finally {
      setRefineLoading(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="workspace-panel prompt-console prompt-console-state h-full min-h-[560px] flex flex-col items-center justify-center p-8 sm:p-12 relative transition-colors">
        <div className="flex flex-col items-center max-w-md text-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-zinc-200 dark:border-[var(--border-main)] border-t-zinc-950 dark:border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-zinc-900 dark:text-white">
              <Camera size={22} strokeWidth={1.75} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-zinc-900 dark:text-[var(--text-primary)] font-sans uppercase tracking-wider">
              {t.output.loadingSteps[loadingTextIndex] || t.output.loadingTitle}
            </p>
            <p className="text-xs text-zinc-400 dark:text-[var(--text-muted)] font-mono">
              {t.output.loadingSub}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!generation) {
    return (
      <div className="workspace-panel prompt-console prompt-console-state h-full min-h-[560px] flex flex-col items-center justify-center text-center p-8 sm:p-12 transition-colors">
        <div className="w-16 h-16 bg-zinc-50 dark:bg-[var(--surface-elevated)] rounded-xl flex items-center justify-center mb-6 text-zinc-400 dark:text-[var(--text-muted)] border border-zinc-200/60 dark:border-[var(--border-main)]">
          <Camera size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-[var(--text-primary)] font-sans uppercase tracking-wider mb-2">
          {t.output.emptyTitle}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-[var(--text-secondary)] max-w-sm leading-relaxed font-sans">
          {t.output.emptySub}
        </p>
      </div>
    );
  }

  const promptText = getCurrentPromptText();
  const charCount = promptText.length;
  const wordCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
  const tokenEst = Math.round(charCount / 4);
  const ratioLabel = generation.settingsSnapshot?.aspectRatio || '9:16';
  const deviceLabel = generation.settingsSnapshot?.device || 'iPhone 16 Pro';

  return (
    <div className="workspace-panel prompt-console overflow-hidden flex flex-col h-full relative transition-colors">
      
      {/* Top Header with Editorial Segmented Tabs & Global Actions */}
      <div className="prompt-console-head px-4 sm:px-5 py-3.5 border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        
        {/* Visible engine tabs keep all six engines discoverable without changing behavior. */}
        <div className="prompt-engine-tabs prompt-engine-tabs-visible" role="tablist" aria-label="Prompt engines">
          {(['v1', 'v2', 'v3'] as EngineType[]).map((engine) => (
            <button
              key={engine}
              type="button"
              role="tab"
              aria-selected={activeTab === engine}
              onClick={() => setActiveTab(engine)}
              className={`prompt-engine-tab ${activeTab === engine ? 'is-active' : ''}`}
            >
              <span className="prompt-engine-tab-code">{engine.toUpperCase()}</span>
              <span className="prompt-engine-tab-name">{engineLabels[engine].tab.replace(/^V[1-6]\s*[·—-]?\s*/i, '')}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`engine-compare-button prompt-engine-tab prompt-engine-tab-compare flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-[#242424] text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Columns size={13} strokeWidth={1.75} />
            <span className="hidden sm:inline">{t.output.compare}</span>
          </button>
        </div>

        {/* Global Action: Copy All */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer ${
              copiedAction === 'copy-all'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-100 dark:bg-[var(--surface-elevated)] text-zinc-700 dark:text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-[var(--border-main)] hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {copiedAction === 'copy-all' ? <Check size={13} /> : <Copy size={13} />}
            <span className="hidden sm:inline">
              {copiedAction === 'copy-all' ? t.output.copiedAll : t.output.copyAll}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="prompt-console-body flex-grow p-5 sm:p-7 overflow-auto custom-scrollbar flex flex-col gap-6">
        
        {/* VIEW 1: SINGLE TAB (V1, V2, or V3) */}
        {activeTab !== 'compare' && (
          <div className="flex flex-col gap-4">
            
            {/* Engine Header Kicker & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-[var(--border-main)]/80 gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-[#F2F2F2] font-sans uppercase tracking-wider">
                  {getEngineTitle(activeTab as any)}
                </h4>
                
                {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Rule) */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-[var(--text-muted)] mt-1">
                  <span>{deviceLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ratioLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{charCount} {t.output.statsCharacters}</span>
                  <span aria-hidden="true">·</span>
                  <span>~{tokenEst} {t.output.statsTokens}</span>
                </div>
              </div>

              {/* Action Bar for Active Engine */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Refine Button */}
                <button
                  type="button"
                  onClick={() => openRefineModal(activeTab as any)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider text-zinc-700 dark:text-[var(--text-secondary)] bg-zinc-100 dark:bg-[var(--surface-elevated)] hover:bg-zinc-200 dark:hover:bg-[#222] border border-zinc-200 dark:border-[var(--border-main)] transition-all cursor-pointer"
                  title={t.output.refineTooltip}
                >
                  <Wand2 size={13} strokeWidth={1.5} />
                  <span>{t.output.refine}</span>
                </button>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={() => onSaveToPresets(`${getEngineTitle(activeTab as any)} ${t.output.snapshotSaved}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider text-zinc-700 dark:text-[var(--text-secondary)] bg-zinc-100 dark:bg-[var(--surface-elevated)] hover:bg-zinc-200 dark:hover:bg-[#222] border border-zinc-200 dark:border-[var(--border-main)] transition-all cursor-pointer"
                  title={t.output.save}
                >
                  <Bookmark size={13} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{t.output.save}</span>
                </button>

                {/* Primary Copy Button */}
                <button
                  type="button"
                  onClick={() => copyWithFeedback(promptText, activeTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all border cursor-pointer ${
                    copiedAction === activeTab
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs'
                  }`}
                >
                  {copiedAction === activeTab ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedAction === activeTab ? t.output.copied : t.output.copy}</span>
                </button>
              </div>
            </div>

            {/* Negative Prompt Toggle Bar */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNegative(!showNegative)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border border-zinc-200/80 dark:border-[var(--border-main)] bg-zinc-50 dark:bg-[var(--surface-elevated)] text-zinc-600 dark:text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert size={12} />
                <span>{t.output.negativePromptTitle}</span>
                {showNegative ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Prompt Text Box */}
            <div className="relative rounded-xl bg-zinc-50/80 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-5 sm:p-6 transition-colors">
              <pre className="prompt-code text-xs sm:text-[13.5px] leading-[1.8] font-mono whitespace-pre-wrap select-text">
                {promptText}
              </pre>
            </div>

            {/* Collapsible Negative Prompt Section */}
            {showNegative && (
              <div className="p-4 rounded-xl bg-zinc-50/90 dark:bg-[var(--surface-secondary)] border border-zinc-200 dark:border-[var(--border-main)] flex flex-col gap-2 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      {t.output.negativePromptTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyWithFeedback(generation.negativePrompt || '', 'negative-copy')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                      copiedAction === 'negative-copy'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-white dark:bg-[#1c1c1c] text-zinc-700 dark:text-[var(--text-secondary)] border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {copiedAction === 'negative-copy' ? '✓ Copied' : t.output.copyNegative}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-600 dark:text-[var(--text-secondary)] leading-relaxed bg-white dark:bg-[#080808] p-3 rounded-xl border border-zinc-200/70 dark:border-[var(--border-main)]">
                  {generation.negativePrompt}
                </p>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: COMPARE ALL SIDE-BY-SIDE */}
        {activeTab === 'compare' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {(['v1', 'v2', 'v3'] as EngineType[]).map((engine) => {
              const text = generation[engine] || '';
              return (
                <div key={engine} className="prompt-compare-card flex flex-col gap-3 rounded-xl bg-zinc-50/90 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70 dark:border-[var(--border-main)]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-900 dark:text-[var(--text-primary)] truncate">{engineLabels[engine].tab}</span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-[var(--text-muted)]">{text.length} {t.output.statsCharacters}</span>
                    </div>
                    <button type="button" onClick={() => copyWithFeedback(text, `${engine}-col`)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer" title={`${t.output.copy} ${engine.toUpperCase()}`}>
                      {copiedAction === `${engine}-col` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="text-xs text-zinc-700 dark:text-[var(--text-secondary)] font-mono leading-relaxed whitespace-pre-wrap select-text max-h-[520px] overflow-auto custom-scrollbar">{text}</pre>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* INLINE PRECISION REFINE MODAL */}
      {isRefining && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-zinc-200 dark:border-[var(--border-main)] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[var(--border-main)]">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-[var(--text-primary)] font-sans uppercase tracking-wider">
                  {t.output.refinePromptTitle} ({getEngineTitle(refineEngine)})
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[var(--text-secondary)] font-sans mt-1">
                  {t.output.refinePromptSub}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRefining(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

              <textarea
              rows={3}
              value={refineInput}
                onChange={(e) => { setRefineInput(e.target.value); setRefineError(''); }}
              placeholder={t.output.refineInputPlaceholder}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[var(--border-main)] rounded-xl p-3 text-xs text-zinc-900 dark:text-[var(--text-primary)] outline-none font-mono resize-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
              {refineError && (
                <p className="text-xs leading-relaxed text-red-400" role="alert">
                  {refineError}
                </p>
              )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRefining(false)}
                className="px-4 py-2 text-xs font-semibold font-sans uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                {t.output.refineCancel}
              </button>
              <button
                type="button"
                onClick={handleApplyRefine}
                disabled={!refineInput.trim() || refineLoading}
                className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold font-sans uppercase tracking-wider rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {refineLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{t.output.refining}</span>
                  </>
                ) : (
                  <>
                    <span>{t.output.refineApply}</span>
                    <ArrowRight size={13} strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default memo(PromptDisplay);
