import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Clock3, Focus, Globe2, History, Search, Settings, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Language, ViewMode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  focusMode: boolean;
  viewMode: ViewMode;
  onOpenLanguage: () => void;
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  onOpenHistory: () => void;
  onToggleFocus: () => void;
  onSetViewMode: (mode: ViewMode) => void;
  onJump: (target: 'input' | 'settings' | 'output') => void;
}

type CommandItem = {
  id: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  run: () => void;
  keywords: string;
};

const copy = {
  pt: {
    title: 'Central de comandos', subtitle: 'Navegue e controle o workspace', search: 'Buscar comando…',
    input: 'Ir para entrada', inputD: 'Referência, ideia e contexto', settings: 'Ir para controles', settingsD: 'Modo Simple / Advanced', output: 'Ir para resultado', outputD: 'V1, V2, V3, V4, V5, V6 e comparação',
    simple: 'Ativar Simple', advanced: 'Ativar Advanced', presets: 'Abrir predefinições', history: 'Abrir histórico', language: 'Idioma e saída', appSettings: 'Configurações',
    theme: 'Alternar tema', focus: 'Alternar modo foco', empty: 'Nenhum comando encontrado', active: 'Ativo', mode: 'Modo do workspace', presetsD: 'Configurações de captura salvas', historyD: 'Gerações anteriores', settingsD2: 'Preferências do workspace', darkToLight: 'Escuro → Claro', lightToDark: 'Claro → Escuro', onToOff: 'Ligado → Desligado', offToOn: 'Desligado → Ligado'
  },
  es: {
    title: 'Centro de comandos', subtitle: 'Navega y controla el workspace', search: 'Buscar comando…',
    input: 'Ir a entrada', inputD: 'Referencia, idea y contexto', settings: 'Ir a controles', settingsD: 'Modo Simple / Advanced', output: 'Ir al resultado', outputD: 'V1, V2, V3, V4, V5, V6 y comparación',
    simple: 'Activar Simple', advanced: 'Activar Advanced', presets: 'Abrir preajustes', history: 'Abrir historial', language: 'Idioma y salida', appSettings: 'Configuración',
    theme: 'Cambiar tema', focus: 'Cambiar modo foco', empty: 'No se encontró ningún comando', active: 'Activo', mode: 'Modo del workspace', presetsD: 'Configuraciones de captura guardadas', historyD: 'Generaciones anteriores', settingsD2: 'Preferencias del workspace', darkToLight: 'Oscuro → Claro', lightToDark: 'Claro → Oscuro', onToOff: 'Activado → Desactivado', offToOn: 'Desactivado → Activado'
  },
  en: {
    title: 'Command Center', subtitle: 'Navigate and control the workspace', search: 'Search command…',
    input: 'Jump to input', inputD: 'Reference, idea and context', settings: 'Jump to controls', settingsD: 'Simple / Advanced mode', output: 'Jump to output', outputD: 'V1, V2, V3, V4, V5, V6 and compare',
    simple: 'Activate Simple', advanced: 'Activate Advanced', presets: 'Open presets', history: 'Open history', language: 'Language & output', appSettings: 'Settings',
    theme: 'Toggle theme', focus: 'Toggle Focus Mode', empty: 'No commands found', active: 'Active', mode: 'Workspace mode', presetsD: 'Saved capture setups', historyD: 'Previous generations', settingsD2: 'Workspace preferences', darkToLight: 'Dark → Light', lightToDark: 'Light → Dark', onToOff: 'On → Off', offToOn: 'Off → On'
  }
} as const;

const CommandPalette: React.FC<CommandPaletteProps> = (props) => {
  const { isOpen, onClose, lang } = props;
  const ui = copy[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const runAndClose = (fn: () => void) => () => {
    onClose();
    window.setTimeout(fn, 10);
  };

  const commands: CommandItem[] = useMemo(() => [
    { id: 'input', label: ui.input, detail: ui.inputD, icon: Sparkles, run: runAndClose(() => props.onJump('input')), keywords: 'input idea reference source' },
    { id: 'controls', label: ui.settings, detail: ui.settingsD, icon: SlidersHorizontal, run: runAndClose(() => props.onJump('settings')), keywords: 'controls settings simple advanced' },
    { id: 'output', label: ui.output, detail: ui.outputD, icon: Focus, run: runAndClose(() => props.onJump('output')), keywords: 'output prompt result v1 v2 v3 compare' },
    { id: 'simple', label: ui.simple, detail: props.viewMode === 'simple' ? ui.active : ui.mode, icon: Sparkles, run: runAndClose(() => props.onSetViewMode('simple')), keywords: 'simple mode' },
    { id: 'advanced', label: ui.advanced, detail: props.viewMode === 'advanced' ? ui.active : ui.mode, icon: SlidersHorizontal, run: runAndClose(() => props.onSetViewMode('advanced')), keywords: 'advanced mode' },
    { id: 'presets', label: ui.presets, detail: ui.presetsD, icon: Bookmark, run: runAndClose(props.onOpenPresets), keywords: 'preset saved profile' },
    { id: 'history', label: ui.history, detail: ui.historyD, icon: History, run: runAndClose(props.onOpenHistory), keywords: 'history previous prompt' },
    { id: 'language', label: ui.language, detail: lang.toUpperCase(), icon: Globe2, run: runAndClose(props.onOpenLanguage), keywords: 'language idioma português english español prompt output' },
    { id: 'settings', label: ui.appSettings, detail: ui.settingsD2, icon: Settings, run: runAndClose(props.onOpenSettings), keywords: 'app settings preferences' },
    { id: 'focus', label: ui.focus, detail: props.focusMode ? ui.onToOff : ui.offToOn, icon: Focus, run: runAndClose(props.onToggleFocus), keywords: 'focus immersive mode' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [ui, props.viewMode, props.focusMode, lang]);

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? commands.filter(item => `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(normalized))
    : commands;

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onMouseDown={onClose}>
      <div className="command-palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <div>
            <div className="command-title">{ui.title}</div>
            <div className="command-subtitle">{ui.subtitle}</div>
          </div>
          <button type="button" className="command-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="command-search-wrap">
          <Search size={17} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ui.search} />
          <kbd>ESC</kbd>
        </div>

        <div className="command-list">
          {filtered.map(({ id, label, detail, icon: Icon, run }) => (
            <button key={id} type="button" className="command-item" onClick={run}>
              <span className="command-item-icon"><Icon size={16} /></span>
              <span className="command-item-copy"><strong>{label}</strong><small>{detail}</small></span>
              <Clock3 size={13} className="command-item-arrow" />
            </button>
          ))}
          {filtered.length === 0 && <div className="command-empty">{ui.empty}</div>}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
