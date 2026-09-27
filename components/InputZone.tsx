import React, { useState, useMemo, useRef, memo } from 'react';
import { 
  InputMode, 
  ModalityType, 
  ReferenceImage, 
  ReferenceRole, 
  Language,
  CameraMode,
  CaptureProfile
} from '../types';
import { translations } from '../translations';
import { TYPE_LIBRARY, TYPE_CATEGORIES, getRecentTypes, saveRecentType, getFavoriteTypes, toggleFavoriteType } from '../services/typeLibrary';
import { SearchableBottomSheet, SelectOption } from './SearchableBottomSheet';
import { getContextualStarters, getIntelligentComplements } from '../services/contextualStarters';
import { 
  ImageIcon, 
  Lightbulb, 
  Upload, 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  Layers,
  RefreshCw,
  Plus
} from 'lucide-react';

interface InputZoneProps {
  lang: Language;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  modality: ModalityType;
  onModalityChange: (m: ModalityType, typeId?: string) => void;
  selectedTypeId?: string;
  ideaText: string;
  onIdeaChange: (text: string) => void;
  references: ReferenceImage[];
  onAddReferences: (files: FileList | null) => void;
  onRemoveReference: (id: string) => void;
  onUpdateReferenceRole: (id: string, roles: ReferenceRole[]) => void;
  onUpdateSubjectAssignment: (id: string, assignment: 'General' | 'Subject A' | 'Subject B') => void;
  onMagicEnhance: () => void;
  isMagicEnhancing: boolean;
  camera?: string;
  cameraMode?: CameraMode;
  captureProfile?: CaptureProfile;
}

const InputZone: React.FC<InputZoneProps> = ({
  lang,
  mode,
  onModeChange,
  modality,
  onModalityChange,
  selectedTypeId = 'person',
  ideaText,
  onIdeaChange,
  references,
  onAddReferences,
  onRemoveReference,
  onUpdateReferenceRole,
  onUpdateSubjectAssignment,
  onMagicEnhance,
  isMagicEnhancing,
  camera,
  cameraMode,
  captureProfile
}) => {
  const t = translations[lang];
  const ui = {
    pt: {
      source: 'Origem',
      type: 'Tipo',
      change: 'Alterar',
      cameraTypeTitle: 'Tipo de fotografia',
      quickStarts: 'Começos rápidos',
      shuffle: 'Trocar',
      suggestions: 'Sugestões para sua ideia',
      characters: 'caracteres',
      addMore: 'Adicionar',
      typeSearch: 'Buscar tipo...',
      recent: 'Recentes',
      favorites: 'Favoritos', options: 'opções', empty: 'Nenhuma opção encontrada', clear: 'Limpar filtro', done: 'Concluir', selectHint: 'Toque para selecionar · Esc para fechar'
    },
    es: {
      source: 'Origen',
      type: 'Tipo',
      change: 'Cambiar',
      cameraTypeTitle: 'Tipo de fotografía',
      quickStarts: 'Inicios rápidos',
      shuffle: 'Cambiar',
      suggestions: 'Sugerencias para tu idea',
      characters: 'caracteres',
      addMore: 'Añadir',
      typeSearch: 'Buscar tipo...',
      recent: 'Recientes',
      favorites: 'Favoritos', options: 'opciones', empty: 'No se encontraron opciones', clear: 'Limpiar filtro', done: 'Listo', selectHint: 'Toca para seleccionar · Esc para cerrar'
    },
    en: {
      source: 'Source',
      type: 'Type',
      change: 'Change',
      cameraTypeTitle: 'Photography type',
      quickStarts: 'Quick starts',
      shuffle: 'Shuffle',
      suggestions: 'Suggestions for your idea',
      characters: 'characters',
      addMore: 'Add',
      typeSearch: 'Search type...',
      recent: 'Recent',
      favorites: 'Favorites', options: 'options', empty: 'No matching options found', clear: 'Clear filter', done: 'Done', selectHint: 'Tap to select · Esc to close'
    }
  }[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Type bottom sheet state
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);
  const [recentTypes, setRecentTypes] = useState<string[]>(() => getRecentTypes());
  const [favoriteTypes, setFavoriteTypes] = useState<string[]>(() => getFavoriteTypes());
  
  // Shuffle key for contextual starters
  const [shuffleKey, setShuffleKey] = useState<number>(0);

  // Active Type metadata
  const activeTypeItem = useMemo(() => {
    return TYPE_LIBRARY.find(ti => ti.id === selectedTypeId) || TYPE_LIBRARY[0];
  }, [selectedTypeId]);

  // Format Type options for SearchableBottomSheet
  const typeOptions: SelectOption[] = useMemo(() => {
    return TYPE_LIBRARY.map(ti => ({
      id: ti.id,
      name: t.options.typesList[ti.labelKey] || ti.labelKey.replace(/_/g, ' '),
      category: ti.category,
      categoryLabel: t.options.typeCategories[ti.category] || ti.category.toUpperCase(),
      badge: ti.badge,
      sub: ti.description?.[lang] || ti.description?.en || undefined
    }));
  }, [t, lang]);

  const typeCategories = useMemo(() => {
    return TYPE_CATEGORIES.map(c => ({
      id: c.id,
      label: t.options.typeCategories[c.labelKey] || c.labelKey
    }));
  }, [t]);

  const handleSelectTypeOption = (opt: SelectOption) => {
    saveRecentType(opt.id);
    setRecentTypes(getRecentTypes());
    const matched = TYPE_LIBRARY.find(ti => ti.id === opt.id);
    if (matched) {
      onModalityChange(matched.modalityMap, matched.id);
    }
  };

  const handleToggleFavoriteType = (id: string) => {
    const updated = toggleFavoriteType(id);
    setFavoriteTypes(updated);
  };

  const allRoles: { role: ReferenceRole; label: string }[] = [
    { role: 'identity', label: t.upload.roles.identity },
    { role: 'face', label: t.upload.roles.face },
    { role: 'outfit', label: t.upload.roles.outfit },
    { role: 'pose', label: t.upload.roles.pose },
    { role: 'location', label: t.upload.roles.location },
    { role: 'vehicle', label: t.upload.roles.vehicle },
    { role: 'lighting', label: t.upload.roles.lighting },
    { role: 'style', label: t.upload.roles.style },
    { role: 'object', label: t.upload.roles.object },
    { role: 'full_image', label: t.upload.roles.full_image },
  ];

  const handleRoleToggle = (refId: string, currentRoles: ReferenceRole[], roleToToggle: ReferenceRole) => {
    let nextRoles: ReferenceRole[];
    if (currentRoles.includes(roleToToggle)) {
      nextRoles = currentRoles.filter(r => r !== roleToToggle);
      if (nextRoles.length === 0) nextRoles = ['full_image'];
    } else {
      nextRoles = [...currentRoles.filter(r => r !== 'full_image'), roleToToggle];
    }
    onUpdateReferenceRole(refId, nextRoles);
  };

  const activeTypeName = t.options.typesList[activeTypeItem.labelKey] || activeTypeItem.labelKey.replace(/_/g, ' ');

  // 100% Dynamic Contextual Starters
  const starters = useMemo(() => {
    return getContextualStarters({
      language: lang,
      modality,
      typeId: selectedTypeId,
      sourceMode: mode,
      camera,
      cameraMode,
      captureProfile,
      shuffleKey
    });
  }, [lang, modality, selectedTypeId, mode, camera, cameraMode, captureProfile, shuffleKey]);

  // Intelligent Suggestions for when user already typed
  const intelligentComplements = useMemo(() => {
    return getIntelligentComplements(lang);
  }, [lang]);

  const handleAppendComplement = (appendStr: string) => {
    const trimmed = ideaText.trim();
    if (!trimmed) {
      onIdeaChange(appendStr.replace(/^, /, ''));
    } else {
      onIdeaChange(trimmed + appendStr);
    }
  };

  return (
    <div className="workspace-panel p-3.5 sm:p-4 flex flex-col gap-4">
      
      {/* ==================================================== */}
      {/* 01. SOURCE SELECTOR (FROM IMAGE | FROM IDEA)         */}
      {/* ==================================================== */}
      <div className="flex flex-col gap-3">
        <div className="section-kicker"><span>01</span><span>{ui.source}</span></div>
        <div className="segmented-control flex items-center p-1 w-full">
          <button
            type="button"
            onClick={() => onModeChange('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer font-sans ${
              mode === 'image'
                ? 'bg-[var(--selected-bg)] text-[var(--selected-text)] border border-[var(--border-active)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ImageIcon size={15} strokeWidth={1.75} />
            <span>{t.nav.fromImage}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onModeChange('idea')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer font-sans ${
              mode === 'idea'
                ? 'bg-[var(--selected-bg)] text-[var(--selected-text)] border border-[var(--border-active)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lightbulb size={15} strokeWidth={1.75} />
            <span>{t.nav.fromIdea}</span>
          </button>
        </div>

        {/* 02. TYPE SELECTOR (CLICK OPENS SEARCHABLE BOTTOM SHEET) */}
        <div className="control-row flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={14} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans shrink-0">
              {ui.type}:
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate font-sans">
              {activeTypeName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTypeSheetOpen(true)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer shrink-0 font-sans"
          >
            <span>{ui.change}</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* TYPE SEARCHABLE BOTTOM SHEET */}
      <SearchableBottomSheet
        isOpen={isTypeSheetOpen}
        onClose={() => setIsTypeSheetOpen(false)}
        title={ui.cameraTypeTitle}
        searchPlaceholder={t.simple.searchType || ui.typeSearch}
        options={typeOptions}
        categories={typeCategories}
        selectedValue={activeTypeItem.id}
        onSelect={handleSelectTypeOption}
        favorites={favoriteTypes}
        onToggleFavorite={handleToggleFavoriteType}
        recents={recentTypes}
        recentTitle={t.simple.recent || ui.recent}
        favoritesTitle={t.simple.favorites || ui.favorites}
        optionsLabel={ui.options}
        emptyLabel={ui.empty}
        clearLabel={ui.clear}
        doneLabel={ui.done}
        selectionHint={ui.selectHint}
      />

      {/* ==================================================== */}
      {/* 03. INPUT CANVAS (DOMINANT WORKSPACE FOCUS)           */}
      {/* ==================================================== */}

      {/* MODE 1: FROM IMAGE (IMAGE UPLOAD & METADATA) */}
      {mode === 'image' && (
        <div className="flex flex-col gap-3">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={(e) => onAddReferences(e.target.files)}
            className="hidden"
          />

          {references.length === 0 ? (
            /* Clean Minimalist Upload Zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="upload-zone p-7 sm:p-9 cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
            >
              <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors border border-white/[0.08]">
                <Upload size={20} strokeWidth={1.75} />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] font-sans mb-1">
                {t.upload.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mb-2 font-sans">
                {t.upload.dragDrop}
              </p>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {t.upload.maxSize}
              </span>
            </div>
          ) : (
            /* Reference Gallery */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-sans">
                  {t.upload.referenceList} ({references.length})
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[var(--text-primary)] hover:underline font-sans cursor-pointer"
                >
                  + {ui.addMore}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="reference-card p-3 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ref.dataUrl}
                        alt={ref.name}
                        className="w-14 h-14 rounded-lg object-cover bg-black shrink-0 border border-white/[0.08]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate block font-sans">
                          {ref.name}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          {ref.roles.join(', ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveReference(ref.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
                        title={t.upload.remove}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Role tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-white/[0.06]">
                      {allRoles.map((r) => {
                        const isAssigned = ref.roles.includes(r.role);
                        return (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => handleRoleToggle(ref.id, ref.roles, r.role)}
                            className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
                              isAssigned
                                ? 'bg-white text-zinc-950 font-bold'
                                : 'bg-[#101011] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/[0.06]'
                            }`}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FROM IDEA (DOMINANT WORKSPACE TEXTAREA) */}
      {mode === 'idea' && (
        <div className="flex flex-col gap-3">
          
          {/* Main Textarea Container */}
          <div className="idea-editor overflow-hidden transition-all">
            <textarea
              rows={4}
              value={ideaText}
              onChange={(e) => onIdeaChange(e.target.value)}
              placeholder={t.idea.placeholder}
              className="w-full bg-transparent p-4 sm:p-5 text-[13px] sm:text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none min-h-[148px] leading-[1.65]"
            />
            
            {/* Action Bar Under Textarea */}
            <div className="px-4 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {ideaText.length} {ui.characters}
              </span>

              <button
                type="button"
                onClick={onMagicEnhance}
                disabled={!ideaText.trim() || isMagicEnhancing}
                className="h-8 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[var(--text-primary)] text-xs font-semibold font-sans flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-white/[0.08]"
                title={t.idea.magicHint}
              >
                <Sparkles size={13} className={isMagicEnhancing ? 'animate-spin' : ''} />
                <span>{isMagicEnhancing ? t.idea.magicEnhancing : t.idea.magicEnhance}</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC CONTEXTUAL QUICK STARTERS */}
          {!ideaText.trim() ? (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans">
                  {ui.quickStarts}
                </span>
                
                <button
                  type="button"
                  onClick={() => setShuffleKey(prev => prev + 1)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-sans"
                  title={ui.shuffle}
                >
                  <RefreshCw size={11} className="transition-transform active:rotate-180" />
                  <span>{ui.shuffle}</span>
                </button>
              </div>

              <div className="quick-start-strip flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
                {starters.map((starter) => (
                  <button
                    key={starter.id}
                    type="button"
                    onClick={() => onIdeaChange(starter.promptText)}
                    className="quick-start-card min-w-[255px] sm:min-w-[275px] p-3 flex items-center justify-between gap-3 transition-all cursor-pointer text-left group snap-start"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)] font-sans truncate group-hover:text-white">
                        {starter.title}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] font-sans truncate line-clamp-1">
                        {starter.promptText}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* SMART ADDITIVE SUGGESTIONS (WHEN TEXT IS PRESENT) */
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans">
                {ui.suggestions}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {intelligentComplements.map((comp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendComplement(comp.appendText)}
                    className="h-7 px-2.5 rounded-lg bg-[#0A0A0B] hover:bg-[#151516] border border-white/[0.08] hover:border-white/[0.18] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-all cursor-pointer font-sans"
                  >
                    <Plus size={11} className="text-[var(--text-muted)]" />
                    <span>{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default memo(InputZone);
