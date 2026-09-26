import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Star, Check, Sparkles, Clock } from 'lucide-react';

export interface SelectOption {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  badge?: string;
  sub?: string;
}

interface SearchableBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  options: SelectOption[];
  categories: { id: string; label: string }[];
  selectedValue: string;
  onSelect: (option: SelectOption) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  recents: string[];
  recentTitle?: string;
  favoritesTitle?: string;
  optionsLabel?: string;
  emptyLabel?: string;
  clearLabel?: string;
  doneLabel?: string;
  selectionHint?: string;
}

export const SearchableBottomSheet: React.FC<SearchableBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  searchPlaceholder,
  options,
  categories,
  selectedValue,
  onSelect,
  favorites,
  onToggleFavorite,
  recents,
  recentTitle = 'Recent',
  favoritesTitle = 'Favorites',
  optionsLabel = 'options',
  emptyLabel = 'No matching options found',
  clearLabel = 'Clear filter',
  doneLabel = 'Done',
  selectionHint = 'Tap to select · Esc to close'
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Options
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter(opt => {
      const matchesSearch = !q || 
        opt.name.toLowerCase().includes(q) || 
        (opt.sub && opt.sub.toLowerCase().includes(q)) ||
        (opt.categoryLabel && opt.categoryLabel.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === 'favorites') {
        return favorites.includes(opt.id) || favorites.includes(opt.name);
      }
      if (activeCategory === 'recents') {
        return recents.includes(opt.id) || recents.includes(opt.name);
      }
      if (activeCategory === 'all') return true;
      return opt.category === activeCategory;
    });
  }, [options, search, activeCategory, favorites, recents]);

  // Group by category when viewing 'all' and no search
  const groupedOptions = useMemo(() => {
    if (search.trim() || activeCategory !== 'all') return null;
    const groups: Record<string, SelectOption[]> = {};
    for (const opt of filteredOptions) {
      const catKey = opt.category;
      if (!groups[catKey]) groups[catKey] = [];
      groups[catKey].push(opt);
    }
    return groups;
  }, [filteredOptions, search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div 
      className="search-sheet fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/65 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="search-sheet-panel w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
          <div className="search-sheet-handle" />
        </div>

        {/* Header */}
        <div className="search-sheet-header px-5 pt-3 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              {filteredOptions.length} {optionsLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="search-sheet-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="search-sheet-search px-5 py-3">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="search-sheet-input w-full h-11 pl-10 pr-9 text-xs sm:text-sm font-sans outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Horizontal scrollable) */}
        <div className="search-sheet-categories px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Recents Pill */}
          {recents.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory(activeCategory === 'recents' ? 'all' : 'recents')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'recents'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'bg-zinc-100 dark:bg-[#1c1c1f] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#252528]'
              }`}
            >
              <Clock size={12} />
              <span>{recentTitle}</span>
            </button>
          )}

          {/* Favorites Pill */}
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory(activeCategory === 'favorites' ? 'all' : 'favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'favorites'
                  ? 'bg-[var(--selected-bg)] text-[var(--selected-text)] shadow-xs'
                  : 'bg-zinc-100 dark:bg-[#1c1c1f] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#252528]'
              }`}
            >
              <Star size={12} className={activeCategory === 'favorites' ? 'fill-white' : ''} />
              <span>{favoritesTitle}</span>
            </button>
          )}

          {categories.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'bg-zinc-100 dark:bg-[#1c1c1f] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#252528]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar flex flex-col gap-1 min-h-[260px]">
          {filteredOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 dark:text-zinc-500">
              <Search size={28} strokeWidth={1.5} className="mb-2 opacity-50" />
              <p className="text-xs font-sans">{emptyLabel}</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="mt-3 text-xs text-zinc-900 dark:text-zinc-100 underline underline-offset-2 cursor-pointer"
              >
                {clearLabel}
              </button>
            </div>
          ) : groupedOptions ? (
            // Grouped View by Category
            Object.entries(groupedOptions).map(([catKey, items]) => {
              const catObj = categories.find(c => c.id === catKey);
              const catTitle = catObj ? catObj.label : catKey.toUpperCase();
              return (
                <div key={catKey} className="mb-4">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-sans">
                    {catTitle}
                  </div>
                  <div className="flex flex-col gap-1">
                    {items.map(opt => renderItemRow(opt))}
                  </div>
                </div>
              );
            })
          ) : (
            // Flat Filtered View
            filteredOptions.map(opt => renderItemRow(opt))
          )}
        </div>

        {/* Footer */}
        <div className="search-sheet-footer p-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            {selectionHint}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 cursor-pointer shadow-xs font-sans uppercase tracking-wider"
          >
            {doneLabel}
          </button>
        </div>

      </div>
    </div>
  );

  function renderItemRow(opt: SelectOption) {
    const isSelected = selectedValue === opt.id || selectedValue === opt.name;
    const isFav = favorites.includes(opt.id) || favorites.includes(opt.name);

    return (
      <div
        key={opt.id}
        onClick={() => {
          onSelect(opt);
          onClose();
        }}
        className={`group w-full min-h-[46px] px-3.5 py-2.5 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
          isSelected
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
            : 'hover:bg-zinc-100 dark:hover:bg-[#1a1a1d] text-zinc-800 dark:text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate font-sans">
                {opt.name}
              </span>
              {opt.badge && (
                <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {opt.badge}
                </span>
              )}
            </div>
            {opt.sub && (
              <span className={`text-[10px] font-mono truncate mt-0.5 ${
                isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                {opt.sub}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Favorite Star Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(opt.id || opt.name);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isFav
                ? 'text-amber-400 fill-amber-400'
                : isSelected
                  ? 'text-zinc-300 dark:text-zinc-600 hover:text-white'
                  : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400'
            }`}
            title="Toggle favorite"
          >
            <Star size={14} className={isFav ? 'fill-current' : ''} />
          </button>

          {/* Selected Checkmark */}
          {isSelected && (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isSelected ? 'text-white dark:text-zinc-900' : ''
            }`}>
              <Check size={16} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
    );
  }
};
