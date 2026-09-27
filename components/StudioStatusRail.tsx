import React, { memo, useMemo } from 'react';
import { Maximize2, Minimize2, Image as ImageIcon, Lightbulb, Camera, Ratio, Layers3, Search } from 'lucide-react';
import { FullSettings, InputMode, Language } from '../types';
import { TYPE_LIBRARY } from '../services/typeLibrary';
import { translations } from '../translations';

interface StudioStatusRailProps {
  lang: Language;
  mode: InputMode;
  selectedTypeId: string;
  settings: FullSettings;
  referencesCount: number;
  focusMode: boolean;
  onToggleFocus: () => void;
  onOpenCommand: () => void;
}

const copy = {
  pt: { source: 'Fonte', type: 'Tipo', camera: 'Câmera', format: 'Formato', references: 'Referências', command: 'Comandos', focus: 'Modo foco' },
  es: { source: 'Fuente', type: 'Tipo', camera: 'Cámara', format: 'Formato', references: 'Referencias', command: 'Comandos', focus: 'Modo foco' },
  en: { source: 'Source', type: 'Type', camera: 'Camera', format: 'Format', references: 'References', command: 'Command', focus: 'Focus mode' }
} as const;

const StudioStatusRail: React.FC<StudioStatusRailProps> = ({
  lang,
  mode,
  selectedTypeId,
  settings,
  referencesCount,
  focusMode,
  onToggleFocus,
  onOpenCommand
}) => {
  const ui = copy[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];
  const t = translations[lang];
  const activeType = useMemo(() => TYPE_LIBRARY.find(item => item.id === selectedTypeId), [selectedTypeId]);
  const typeLabel = activeType ? (t.options.typesList[activeType.labelKey] || activeType.labelKey.replace(/_/g, ' ')) : selectedTypeId;
  const sourceLabel = mode === 'image' ? t.nav.fromImage : t.nav.fromIdea;

  const items = [
    { icon: mode === 'image' ? ImageIcon : Lightbulb, label: ui.source, value: sourceLabel },
    { icon: Layers3, label: ui.type, value: typeLabel },
    { icon: Camera, label: ui.camera, value: settings.device || 'Auto' },
    { icon: Ratio, label: ui.format, value: settings.aspectRatio || 'Auto' }
  ];

  return (
    <div className="context-bar">
      <div className="context-bar-scroll">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="context-item">
            <Icon size={13} strokeWidth={1.7} />
            <span className="context-label">{label}</span>
            <span className="context-value">{value}</span>
          </div>
        ))}
        {referencesCount > 0 && (
          <div className="context-item context-item-muted">
            <span className="context-label">{ui.references}</span>
            <span className="context-value">{referencesCount}</span>
          </div>
        )}
      </div>
      <div className="context-actions hidden sm:flex">
        <button type="button" onClick={onOpenCommand} className="context-action" title={ui.command}>
          <Search size={14} strokeWidth={1.7} />
        </button>
        <button type="button" onClick={onToggleFocus} className="context-action" title={ui.focus}>
          {focusMode ? <Minimize2 size={14} strokeWidth={1.7} /> : <Maximize2 size={14} strokeWidth={1.7} />}
        </button>
      </div>
    </div>
  );
};

export default memo(StudioStatusRail);
