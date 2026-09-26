import React, { useEffect } from 'react';
import { FullSettings, Language } from '../types';
import { Bookmark, ChevronRight, Focus, Globe2, History, Moon, Settings as SettingsIcon, Sun, X, Zap } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenLanguage: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  settings: FullSettings;
  onUpdateSettings: (settings: FullSettings) => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  historyCount: number;
  presetsCount: number;
  focusMode: boolean;
  onToggleFocus: () => void;
}

const copy = {
  pt: {
    title: 'Configurações', subtitle: 'Preferências do workspace', general: 'Geral', language: 'Idioma', appearance: 'Aparência', dark: 'Modo escuro', light: 'Modo claro', switchDark: 'Usar escuro', switchLight: 'Usar claro', focus: 'Modo foco', focusSub: 'Reduz a interface e amplia o workspace', focusOn: 'Ativo', focusOff: 'Desativado', behavior: 'Comportamento', autoDetect: 'Auto Detect', autoDetectSub: 'Analisa a cena e sugere parâmetros contextuais', data: 'Workspace', presets: 'Predefinições', presetsSub: 'Perfis salvos', history: 'Histórico', historySub: 'Gerações anteriores', done: 'Concluir'
  },
  es: {
    title: 'Configuración', subtitle: 'Preferencias del workspace', general: 'General', language: 'Idioma', appearance: 'Apariencia', dark: 'Modo oscuro', light: 'Modo claro', switchDark: 'Usar oscuro', switchLight: 'Usar claro', focus: 'Modo foco', focusSub: 'Reduce la interfaz y amplía el workspace', focusOn: 'Activo', focusOff: 'Desactivado', behavior: 'Comportamiento', autoDetect: 'Auto Detect', autoDetectSub: 'Analiza la escena y sugiere parámetros contextuales', data: 'Workspace', presets: 'Preajustes', presetsSub: 'Perfiles guardados', history: 'Historial', historySub: 'Generaciones anteriores', done: 'Listo'
  },
  en: {
    title: 'Settings', subtitle: 'Workspace preferences', general: 'General', language: 'Language', appearance: 'Appearance', dark: 'Dark mode', light: 'Light mode', switchDark: 'Use dark', switchLight: 'Use light', focus: 'Focus mode', focusSub: 'Reduces chrome and expands the workspace', focusOn: 'Active', focusOff: 'Off', behavior: 'Behavior', autoDetect: 'Auto Detect', autoDetectSub: 'Analyzes the scene and suggests contextual parameters', data: 'Workspace', presets: 'Presets', presetsSub: 'Saved profiles', history: 'History', historySub: 'Previous generations', done: 'Done'
  }
} as const;

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenLanguage,
  isDark,
  onToggleTheme,
  settings,
  onUpdateSettings,
  onOpenHistory,
  onOpenPresets,
  historyCount,
  presetsCount,
  focusMode,
  onToggleFocus
}) => {
  const ui = copy[lang];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isOpen && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const langNames: Record<Language, string> = { pt: 'Português (BR)', en: 'English', es: 'Español' };
  const row = 'w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-main)] hover:border-[var(--border-active)] flex items-center justify-between transition-all text-left';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/65 animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-[var(--surface-main)] border-t sm:border border-[var(--border-main)] rounded-t-2xl sm:rounded-2xl shadow-[var(--shadow-float)] overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden"><div className="w-9 h-1 bg-[var(--border-active)] rounded-full" /></div>

        <div className="px-5 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]"><SettingsIcon size={16} /></div>
            <div><h3 className="text-sm font-semibold text-[var(--text-primary)]">{ui.title}</h3><p className="text-[11px] text-[var(--text-muted)]">{ui.subtitle}</p></div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-6 max-h-[74vh] overflow-y-auto custom-scrollbar">
          <section className="flex flex-col gap-2">
            <span className="section-kicker"><span>01</span><span>{ui.general}</span></span>
            <button type="button" onClick={() => { onClose(); onOpenLanguage(); }} className={row}>
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[var(--surface-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]"><Globe2 size={15} /></div><div><div className="text-xs font-medium text-[var(--text-primary)]">{ui.language}</div><div className="text-[10px] text-[var(--text-muted)]">{langNames[lang]}</div></div></div>
              <ChevronRight size={15} className="text-[var(--text-muted)]" />
            </button>

            <div className={row}>
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[var(--surface-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]">{isDark ? <Moon size={15} /> : <Sun size={15} />}</div><div><div className="text-xs font-medium text-[var(--text-primary)]">{ui.appearance}</div><div className="text-[10px] text-[var(--text-muted)]">{isDark ? ui.dark : ui.light}</div></div></div>
              <button type="button" onClick={onToggleTheme} className="px-3 py-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--surface-main)] text-[11px] font-medium text-[var(--text-primary)]">{isDark ? ui.switchLight : ui.switchDark}</button>
            </div>

            <div className={row}>
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[var(--surface-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]"><Focus size={15} /></div><div><div className="text-xs font-medium text-[var(--text-primary)]">{ui.focus}</div><div className="text-[10px] text-[var(--text-muted)]">{ui.focusSub}</div></div></div>
              <button type="button" onClick={onToggleFocus} className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${focusMode ? 'bg-[var(--selected-bg)] text-[var(--selected-text)] border-transparent' : 'border-[var(--border-main)] bg-[var(--surface-main)] text-[var(--text-primary)]'}`}>{focusMode ? ui.focusOn : ui.focusOff}</button>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <span className="section-kicker"><span>02</span><span>{ui.behavior}</span></span>
            <div className={row}>
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[var(--surface-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]"><Zap size={15} /></div><div><div className="text-xs font-medium text-[var(--text-primary)]">{ui.autoDetect}</div><div className="text-[10px] text-[var(--text-muted)]">{ui.autoDetectSub}</div></div></div>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.autoDetect} onChange={(e) => onUpdateSettings({ ...settings, autoDetect: e.target.checked })} className="sr-only peer" /><div className="w-9 h-5 bg-[var(--border-active)] rounded-full peer peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></label>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <span className="section-kicker"><span>03</span><span>{ui.data}</span></span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { onClose(); onOpenPresets(); }} className="p-3.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-main)] hover:border-[var(--border-active)] text-left">
                <div className="flex items-center justify-between text-[var(--text-secondary)]"><Bookmark size={16} /><span className="text-[10px] font-mono">{presetsCount}</span></div><div className="mt-2 text-xs font-medium text-[var(--text-primary)]">{ui.presets}</div><div className="text-[10px] text-[var(--text-muted)]">{ui.presetsSub}</div>
              </button>
              <button type="button" onClick={() => { onClose(); onOpenHistory(); }} className="p-3.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-main)] hover:border-[var(--border-active)] text-left">
                <div className="flex items-center justify-between text-[var(--text-secondary)]"><History size={16} /><span className="text-[10px] font-mono">{historyCount}</span></div><div className="mt-2 text-xs font-medium text-[var(--text-primary)]">{ui.history}</div><div className="text-[10px] text-[var(--text-muted)]">{ui.historySub}</div>
              </button>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-[var(--border-main)] flex justify-end"><button type="button" onClick={onClose} className="h-10 px-5 rounded-lg bg-white text-black text-xs font-semibold">{ui.done}</button></div>
      </div>
    </div>
  );
};
