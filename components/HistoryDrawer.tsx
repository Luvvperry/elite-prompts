import React from 'react';
import { Language, GenerationOutput } from '../types';
import { translations } from '../translations';
import { History, X, Trash2, ArrowUpRight, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  history: GenerationOutput[];
  onRestore: (item: GenerationOutput) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  history,
  onRestore,
  onDelete,
  onClearAll
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.inputIdea && item.inputIdea.toLowerCase().includes(q)) ||
      item.v1.toLowerCase().includes(q) ||
      item.v2.toLowerCase().includes(q) ||
      item.v3.toLowerCase().includes(q) ||
      item.modality.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
      <div className="bg-white dark:bg-[#121212] border-l border-zinc-200 dark:border-zinc-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History size={18} strokeWidth={1.5} className="text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans-alt uppercase tracking-wider">
              {t.history.title}
            </h3>
            <span className="text-xs font-mono text-zinc-400">({history.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-mono text-zinc-400 hover:text-red-500 uppercase tracking-wider transition-colors mr-2 cursor-pointer"
              >
                {t.history.clearAll}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search input if history has items */}
        {history.length > 1 && (
          <div className="px-6 pt-4 pb-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
            />
          </div>
        )}

        {/* List */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-3 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 dark:text-zinc-500">
              <Clock size={32} strokeWidth={1.25} className="mb-3 opacity-60" />
              <p className="text-xs font-sans-alt">{history.length === 0 ? t.history.empty : 'No matching prompts found.'}</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.mode === 'image' ? t.history.imageRef : t.history.idea}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">
                        {item.modality}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400">
                      {dateStr}
                    </span>
                  </div>

                  {item.inputIdea && (
                    <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 line-clamp-2 italic">
                      "{item.inputIdea}"
                    </p>
                  )}

                  <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.v1 || item.v2}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-zinc-400 hover:text-red-500 text-xs transition-colors p-1 cursor-pointer"
                      title={t.history.delete}
                    >
                      <Trash2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onRestore(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-bold font-sans-alt uppercase tracking-wider text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                    >
                      <span>{t.history.restore}</span>
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
