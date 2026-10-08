import React, { useState } from 'react';
import { Language, PresetItem } from '../types';
import { translations } from '../translations';
import { Bookmark, X, Trash2 } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  presets: PresetItem[];
  onApplyPreset: (preset: PresetItem) => void;
  onSaveCurrentPreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
}

const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  lang,
  presets,
  onApplyPreset,
  onSaveCurrentPreset,
  onDeletePreset
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const [newPresetName, setNewPresetName] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    onSaveCurrentPreset(newPresetName.trim());
    setNewPresetName('');
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const getPresetDisplayName = (preset: PresetItem) => {
    if (!preset.isDefault) return preset.name;
    switch (preset.id) {
      case 'raw-iphone': return t.presets.defaults.rawIphone;
      case 'night-flash': return t.presets.defaults.nightFlash;
      case 'casual-candid': return t.presets.defaults.casualCandid;
      case 'deep-dof': return t.presets.defaults.deepDof;
      case 'pov': return t.presets.defaults.pov;
      case 'automotive': return t.presets.defaults.automotive;
      default: return preset.name;
    }
  };

  const getPresetDisplayDesc = (preset: PresetItem) => {
    if (!preset.isDefault) return preset.description;
    switch (preset.id) {
      case 'raw-iphone': return t.presets.defaults.rawIphoneDesc;
      case 'night-flash': return t.presets.defaults.nightFlashDesc;
      case 'casual-candid': return t.presets.defaults.casualCandidDesc;
      case 'deep-dof': return t.presets.defaults.deepDofDesc;
      case 'pov': return t.presets.defaults.povDesc;
      case 'automotive': return t.presets.defaults.automotiveDesc;
      default: return preset.description;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark size={18} strokeWidth={1.5} className="text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans-alt uppercase tracking-wider">
              {t.presets.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-5 custom-scrollbar">
          {/* Save current configuration form */}
          <div className="bg-zinc-50 dark:bg-[#181818] p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-sans-alt">
              {t.presets.saveCurrent}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder={t.presets.presetNamePlaceholder}
                className="flex-grow bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!newPresetName.trim()}
                className="px-3.5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase font-sans-alt disabled:opacity-40 cursor-pointer"
              >
                {t.presets.saveBtn}
              </button>
            </div>
            {showSavedFeedback && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                {t.presets.savedAlert}
              </span>
            )}
          </div>

          {/* Presets Grid */}
          <div className="flex flex-col gap-2.5">
            {presets.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#161616] transition-all group"
              >
                <div className="flex flex-col pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans-alt uppercase tracking-wider">
                      {getPresetDisplayName(p)}
                    </span>
                    {p.isDefault && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                        {t.presets.defaultBadge}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {getPresetDisplayDesc(p)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyPreset(p);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#202020] hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase font-sans-alt tracking-wider transition-all cursor-pointer"
                  >
                    {t.presets.apply}
                  </button>

                  {!p.isDefault && (
                    <button
                      type="button"
                      onClick={() => onDeletePreset(p.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title={t.presets.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresetsModal;
