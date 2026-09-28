import React, { useEffect, useState } from 'react';
import { Language, PromptLanguage } from '../types';
import { Check, Globe2, X } from 'lucide-react';

interface LanguageBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  currentPromptLang: PromptLanguage;
  onApply: (lang: Language, promptLang: PromptLanguage) => void;
}

const copy = {
  pt: {
    title: 'Idioma', subtitle: 'Interface e saída dos prompts', interface: 'Idioma da interface', prompt: 'Idioma dos prompts', auto: 'Automático', autoDesc: 'Usa o idioma atual da interface', apply: 'Aplicar', cancel: 'Cancelar',
    promptPt: 'Prompts em Português', promptEn: 'Prompts em Inglês', promptEs: 'Prompts em Espanhol'
  },
  es: {
    title: 'Idioma', subtitle: 'Interfaz y salida de los prompts', interface: 'Idioma de la interfaz', prompt: 'Idioma de los prompts', auto: 'Automático', autoDesc: 'Usa el idioma actual de la interfaz', apply: 'Aplicar', cancel: 'Cancelar',
    promptPt: 'Prompts en Portugués', promptEn: 'Prompts en Inglés', promptEs: 'Prompts en Español'
  },
  en: {
    title: 'Language', subtitle: 'Interface and prompt output', interface: 'Interface language', prompt: 'Prompt language', auto: 'Automatic', autoDesc: 'Uses the current interface language', apply: 'Apply', cancel: 'Cancel',
    promptPt: 'Prompts in Portuguese', promptEn: 'Prompts in English', promptEs: 'Prompts in Spanish'
  }
} as const;

export const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({
  isOpen,
  onClose,
  currentLang,
  currentPromptLang,
  onApply
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLang);
  const [selectedPromptLang, setSelectedPromptLang] = useState<PromptLanguage>(currentPromptLang);
  const ui = copy[selectedLang];

  useEffect(() => {
    if (isOpen) {
      setSelectedLang(currentLang);
      setSelectedPromptLang(currentPromptLang);
    }
  }, [isOpen, currentLang, currentPromptLang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isOpen && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const interfaceOptions: { id: Language; label: string; sub: string }[] = [
    { id: 'pt', label: 'Português Brasileiro', sub: 'Português (Brasil)' },
    { id: 'en', label: 'English', sub: 'English (US)' },
    { id: 'es', label: 'Español', sub: 'Español' }
  ];

  const promptOptions: { id: PromptLanguage; label: string; sub: string }[] = [
    { id: 'auto', label: ui.auto, sub: ui.autoDesc },
    { id: 'pt', label: 'Português Brasileiro', sub: ui.promptPt },
    { id: 'en', label: 'English', sub: ui.promptEn },
    { id: 'es', label: 'Español', sub: ui.promptEs }
  ];

  const row = (selected: boolean) =>
    `w-full px-3.5 py-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer text-left ${selected
      ? 'bg-[var(--selected-bg)] border-[var(--border-active)] text-[var(--selected-text)]'
      : 'bg-[var(--surface-secondary)] border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]'}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/65 animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-[var(--surface-main)] border-t sm:border border-[var(--border-main)] rounded-t-2xl sm:rounded-2xl shadow-[var(--shadow-float)] overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden"><div className="w-9 h-1 bg-[var(--border-active)] rounded-full" /></div>

        <div className="px-5 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-[var(--border-main)] bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-secondary)]"><Globe2 size={16} /></div>
            <div><h3 className="text-sm font-semibold text-[var(--text-primary)]">{ui.title}</h3><p className="text-[11px] text-[var(--text-muted)]">{ui.subtitle}</p></div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-6 max-h-[74vh] overflow-y-auto custom-scrollbar">
          <section className="flex flex-col gap-2.5">
            <span className="section-kicker"><span>01</span><span>{ui.interface}</span></span>
            <div className="flex flex-col gap-1.5">
              {interfaceOptions.map(opt => {
                const selected = selectedLang === opt.id;
                return <button key={opt.id} type="button" onClick={() => setSelectedLang(opt.id)} className={row(selected)}>
                  <div className="flex flex-col"><span className="text-xs font-medium">{opt.label}</span><span className="text-[10px] opacity-65">{opt.sub}</span></div>
                  {selected && <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center"><Check size={12} strokeWidth={2.5} /></div>}
                </button>;
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <span className="section-kicker"><span>02</span><span>{ui.prompt}</span></span>
            <div className="flex flex-col gap-1.5">
              {promptOptions.map(opt => {
                const selected = selectedPromptLang === opt.id;
                return <button key={opt.id} type="button" onClick={() => setSelectedPromptLang(opt.id)} className={row(selected)}>
                  <div className="flex flex-col"><span className="text-xs font-medium">{opt.label}</span><span className="text-[10px] opacity-65">{opt.sub}</span></div>
                  {selected && <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center"><Check size={12} strokeWidth={2.5} /></div>}
                </button>;
              })}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-[var(--border-main)] flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg border border-[var(--border-main)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{ui.cancel}</button>
          <button type="button" onClick={() => { onApply(selectedLang, selectedPromptLang); onClose(); }} className="flex-1 h-10 rounded-lg bg-white text-black text-xs font-semibold">{ui.apply}</button>
        </div>
      </div>
    </div>
  );
};
