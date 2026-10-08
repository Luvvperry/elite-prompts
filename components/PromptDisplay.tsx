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
  selectedEngine?: 'v1' | 'v2' | 'v3' | 'compare';
  onSelectEngine?: (engine: 'v1' | 'v2' | 'v3' | 'compare') => void;
  onRefinePrompt: (engine: 'v1' | 'v2' | 'v3', instruction: string) => Promise<void>;
  onSaveToPresets: (name: string) => void;
  onLazyLoadEngine?: (engine: 'v1' | 'v2' | 'v3') => Promise<void>;
  isLazyLoading?: boolean;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({
  lang,
  generation,
  isLoading,
  selectedEngine,
  onSelectEngine,
  onRefinePrompt,
  onSaveToPresets,
  onLazyLoadEngine,
  isLazyLoading
}) => {
  const t = translations[lang];

  type TabType = 'v1' | 'v2' | 'v3' | 'compare';
  const [internalTab, setInternalTab] = useState<TabType>('v2');
  const activeTab = selectedEngine || internalTab;
  const setActiveTab = (tab: TabType) => {
    setInternalTab(tab);
    onSelectEngine?.(tab);
    if (generation && tab !== 'compare' && !generation[tab] && onLazyLoadEngine) {
      onLazyLoadEngine(tab);
    }
  };

  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [showNegative, setShowNegative] = useState<boolean>(false);

  // Refine modal state
  const [isRefining, setIsRefining] = useState(false);
  const [refineEngine, setRefineEngine] = useState<'v1' | 'v2' | 'v3'>('v1');
  const [refineInput, setRefineInput] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);

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
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAction(actionId);
    setTimeout(() => setCopiedAction(null), 2200);
  };

  const getCurrentPromptText = () => {
    if (!generation) return '';
    switch (activeTab) {
      case 'v1': return generation.v1;
      case 'v2': return generation.v2;
      case 'v3': return generation.v3;
      default: return '';
    }
  };

  const getEngineTitle = (engine: 'v1' | 'v2' | 'v3') => {
    switch (engine) {
      case 'v1': return t.output.v1Title;
      case 'v2': return t.output.v2Title;
      case 'v3': return t.output.v3Title;
    }
  };

  const handleCopyAll = () => {
    if (!generation) return;
    const parts = [];
    if (generation.v1) parts.push(`=== ${t.output.v1Title} ===\n\n${generation.v1}`);
    if (generation.v2) parts.push(`=== ${t.output.v2Title} ===\n\n${generation.v2}`);
    if (generation.v3) parts.push(`=== ${t.output.v3Title} ===\n\n${generation.v3}`);
    if (parts.length > 0) {
      copyWithFeedback(parts.join('\n\n'), 'copy-all');
    }
  };

  const openRefineModal = (engine: 'v1' | 'v2' | 'v3') => {
    setRefineEngine(engine);
    setRefineInput('');
    setIsRefining(true);
  };

  const handleApplyRefine = async () => {
    if (!refineInput.trim() || refineLoading) return;
    setRefineLoading(true);
    try {
      await onRefinePrompt(refineEngine, refineInput.trim());
      setIsRefining(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRefineLoading(false);
    }
  };

  const promptText = getCurrentPromptText();
  const charCount = promptText.length;
  const wordCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
  const tokenEst = Math.round(charCount / 4);
  const ratioLabel = generation?.settingsSnapshot?.aspectRatio || '3:4';
  const deviceLabel = generation?.settingsSnapshot?.device || 'iPhone 16 Pro';

  return (
    <div className="workspace-panel prompt-console overflow-hidden flex flex-col h-full relative transition-colors">

      {/* Top Header with Editorial Segmented Tabs & Global Actions (Always Visible) */}
      <div className="prompt-console-head px-4 sm:px-5 py-3.5 border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">

        {/* Tabs: V1 | V2 | V3 | Compare */}
        <div className="prompt-engine-tabs flex items-center gap-1 p-1 rounded-xl border">
          <button
            type="button"
            onClick={() => setActiveTab('v1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
              activeTab === 'v1'
                ? 'bg-white dark:bg-[#242424] text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            {t.output.v1Tab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('v2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
              activeTab === 'v2'
                ? 'bg-white dark:bg-[#242424] text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            {t.output.v2Tab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('v3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
              activeTab === 'v3'
                ? 'bg-white dark:bg-[#242424] text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            {t.output.v3Tab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
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
        {generation && (
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
        )}
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div className="prompt-console-state h-full min-h-[460px] flex flex-col items-center justify-center p-8 sm:p-12 relative transition-colors">
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
      )}

      {/* 2. Empty State */}
      {!isLoading && !generation && (
        <div className="prompt-console-state h-full min-h-[460px] flex flex-col items-center justify-center text-center p-8 sm:p-12 transition-colors">
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
      )}

      {/* 3. Loaded State */}
      {!isLoading && generation && (
        <div className="prompt-console-body flex-grow p-5 sm:p-7 overflow-auto custom-scrollbar flex flex-col gap-6">

          {/* VIEW 1: SINGLE TAB (V1, V2, or V3) */}
          {activeTab !== 'compare' && (
            !promptText ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                {isLazyLoading ? (
                  <>
                    <div className="w-10 h-10 border-2 border-zinc-200 dark:border-[var(--border-main)] border-t-zinc-950 dark:border-t-white rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-[var(--text-primary)] uppercase tracking-wider font-sans">
                      {t.simple.analyzing} {getEngineTitle(activeTab as any)}...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-zinc-500 font-mono">
                      {getEngineTitle(activeTab as any)} ainda não gerado.
                    </p>
                    <button
                      type="button"
                      onClick={() => onLazyLoadEngine?.(activeTab as any)}
                      className="px-4 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-all cursor-pointer shadow-xs"
                    >
                      {t.simple.generate} {getEngineTitle(activeTab as any)}
                    </button>
                  </>
                )}
              </div>
            ) : (
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
              {generation.negativePrompt && (
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
              )}

              {/* Prompt Text Box */}
              <div className="relative rounded-xl bg-zinc-50/80 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-5 sm:p-6 transition-colors">
                <pre className="prompt-code text-xs sm:text-[13.5px] leading-[1.8] font-mono whitespace-pre-wrap select-text">
                  {promptText}
                </pre>
              </div>

              {/* Collapsible Negative Prompt Section */}
              {showNegative && generation.negativePrompt && (
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
          ))}

          {/* VIEW 2: COMPARE ALL SIDE-BY-SIDE */}
          {activeTab === 'compare' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* V1 Column */}
              <div className="flex flex-col gap-3 rounded-xl bg-zinc-50/90 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70 dark:border-[var(--border-main)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">
                    {t.output.v1Tab}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {generation.v1?.length || 0} {t.output.statsCharacters}
                    </span>
                    {generation.v1 && (
                      <button
                        type="button"
                        onClick={() => copyWithFeedback(generation.v1, 'v1-col')}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                        title={t.output.copy}
                      >
                        {copiedAction === 'v1-col' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                {generation.v1 ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-text flex-grow">
                    {generation.v1}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 flex-grow">
                    <button
                      type="button"
                      onClick={() => onLazyLoadEngine?.('v1')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 cursor-pointer"
                    >
                      {t.simple.generate} V1
                    </button>
                  </div>
                )}
              </div>

              {/* V2 Column */}
              <div className="flex flex-col gap-3 rounded-xl bg-zinc-50/90 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70 dark:border-[var(--border-main)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">
                    {t.output.v2Tab}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {generation.v2?.length || 0} {t.output.statsCharacters}
                    </span>
                    {generation.v2 && (
                      <button
                        type="button"
                        onClick={() => copyWithFeedback(generation.v2, 'v2-col')}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                        title={t.output.copy}
                      >
                        {copiedAction === 'v2-col' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                {generation.v2 ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-text flex-grow">
                    {generation.v2}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 flex-grow">
                    <button
                      type="button"
                      onClick={() => onLazyLoadEngine?.('v2')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 cursor-pointer"
                    >
                      {t.simple.generate} V2
                    </button>
                  </div>
                )}
              </div>

              {/* V3 Column */}
              <div className="flex flex-col gap-3 rounded-xl bg-zinc-50/90 dark:bg-[var(--bg-deep)] border border-zinc-200/90 dark:border-[var(--border-main)]/80 p-5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70 dark:border-[var(--border-main)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">
                    {t.output.v3Tab}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {generation.v3?.length || 0} {t.output.statsCharacters}
                    </span>
                    {generation.v3 && (
                      <button
                        type="button"
                        onClick={() => copyWithFeedback(generation.v3, 'v3-col')}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                        title={t.output.copy}
                      >
                        {copiedAction === 'v3-col' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                {generation.v3 ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-text flex-grow">
                    {generation.v3}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 flex-grow">
                    <button
                      type="button"
                      onClick={() => onLazyLoadEngine?.('v3')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 cursor-pointer"
                    >
                      {t.simple.generate} V3
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

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
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder={t.output.refineInputPlaceholder}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[var(--border-main)] rounded-xl p-3 text-xs text-zinc-900 dark:text-[var(--text-primary)] outline-none font-mono resize-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />

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
