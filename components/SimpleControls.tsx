import React, { useState, useMemo, memo } from 'react';
import { 
  FullSettings, 
  AspectRatioType, 
  PhotographicStyle, 
  CaptureProfile,
  Language,
  OutputFormatId,
  CameraMode,
  CameraFeel
} from '../types';
import { translations } from '../translations';
import { 
  CAMERA_LIBRARY, 
  CAMERA_CATEGORIES, 
  getRecentCameras, 
  saveRecentCamera, 
  getFavoriteCameras, 
  toggleFavoriteCamera 
} from '../services/cameraLibrary';
import { 
  OUTPUT_FORMATS, 
  ASPECT_RATIOS_LIST 
} from '../services/outputFormats';
import { SearchableBottomSheet, SelectOption } from './SearchableBottomSheet';
import { 
  ArrowRight, 
  Smartphone, 
  ChevronRight, 
  Sliders, 
  Share2,
  Sparkles,
  Layers
} from 'lucide-react';

interface SimpleControlsProps {
  lang: Language;
  settings: FullSettings;
  onChange: (settings: FullSettings) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}

const SimpleControls: React.FC<SimpleControlsProps> = ({
  lang,
  settings,
  onChange,
  onGenerate,
  isLoading,
  canGenerate
}) => {
  const t = translations[lang];
  const ui = {
    pt: {
      models: 'modelos',
      tapSearch: 'Toque para buscar',
      cameraMode: 'Modo da câmera',
      cameraFeel: 'Comportamento',
      cameraLibrary: 'Biblioteca de câmeras',
      captureFormat: 'Formato de saída', options: 'opções', empty: 'Nenhuma opção encontrada', clear: 'Limpar filtro', done: 'Concluir', selectHint: 'Toque para selecionar · Esc para fechar'
    },
    es: {
      models: 'modelos',
      tapSearch: 'Toca para buscar',
      cameraMode: 'Modo de cámara',
      cameraFeel: 'Comportamiento',
      cameraLibrary: 'Biblioteca de cámaras',
      captureFormat: 'Formato de salida', options: 'opciones', empty: 'No se encontraron opciones', clear: 'Limpiar filtro', done: 'Listo', selectHint: 'Toca para seleccionar · Esc para cerrar'
    },
    en: {
      models: 'models',
      tapSearch: 'Tap to search',
      cameraMode: 'Camera mode',
      cameraFeel: 'Camera feel',
      cameraLibrary: 'Camera library',
      captureFormat: 'Output format', options: 'options', empty: 'No matching options found', clear: 'Clear filter', done: 'Done', selectHint: 'Tap to select · Esc to close'
    }
  }[lang === 'pt' || lang === 'es' || lang === 'en' ? lang : 'en'];

  // Camera Bottom Sheet State
  const [isCameraSheetOpen, setIsCameraSheetOpen] = useState(false);
  const [favoriteCameras, setFavoriteCameras] = useState<string[]>(() => getFavoriteCameras());
  const [recentCameras, setRecentCameras] = useState<string[]>(() => getRecentCameras());

  const cameraOptions: SelectOption[] = useMemo(() => {
    return CAMERA_LIBRARY.filter(c => c.id !== 'professional_camera').map(c => ({
      id: c.name,
      name: c.name,
      category: c.category,
      categoryLabel: t.options.cameraCategories[c.category] || c.category,
      badge: c.badge,
      sub: c.releaseYear ? `${c.releaseYear}` : undefined
    }));
  }, [t]);

  const cameraCategories = useMemo(() => {
    return CAMERA_CATEGORIES.map(cc => ({
      id: cc.id,
      label: t.options.cameraCategories[cc.labelKey] || cc.labelKey
    }));
  }, [t]);

  const handleSelectCamera = (opt: SelectOption) => {
    saveRecentCamera(opt.name);
    setRecentCameras(getRecentCameras());
    onChange({ ...settings, device: opt.name });
  };

  const handleToggleFavoriteCamera = (name: string) => {
    const updated = toggleFavoriteCamera(name);
    setFavoriteCameras(updated);
  };

  const photoStyles: { value: PhotographicStyle; label: string }[] = [
    { value: 'auto', label: t.options.photoStyles.auto },
    { value: 'casual_smartphone', label: t.options.photoStyles.casual_smartphone },
    { value: 'pov', label: t.options.photoStyles.pov },
    { value: 'candid', label: t.options.photoStyles.candid },
    { value: 'street_photography', label: t.options.photoStyles.street_photography },
    { value: 'social_media_ugc', label: t.options.photoStyles.social_media_ugc },
    { value: 'night_photography', label: t.options.photoStyles.night_photography },
    { value: 'portrait', label: t.options.photoStyles.portrait },
    { value: 'editorial', label: t.options.photoStyles.editorial },
    { value: 'fashion', label: t.options.photoStyles.fashion },
    { value: 'luxury_lifestyle', label: t.options.photoStyles.luxury_lifestyle },
    { value: 'automotive', label: t.options.photoStyles.automotive },
    { value: 'product_photography', label: t.options.photoStyles.product_photography },
    { value: 'architecture', label: t.options.photoStyles.architecture },
    { value: 'disposable_camera', label: t.options.photoStyles.disposable_camera },
    { value: '35mm_film', label: t.options.photoStyles.film35mm },
    { value: 'polaroid', label: t.options.photoStyles.polaroid }
  ];

  const captureProfileKeys: CaptureProfile[] = [
    'auto',
    'raw_smartphone',
    'clean_smartphone',
    'night_flash',
    'low_light',
    'candid',
    'social_media',
    'pov',
    'mirror',
    'selfie',
    'documentary',
    'automotive_casual',
    'object_pov_raw'
  ];

  const cameraModeKeys: CameraMode[] = [
    'auto',
    'rear_main',
    'rear_ultrawide',
    'rear_1x',
    'rear_2x',
    'rear_3x',
    'rear_telephoto',
    'front_camera',
    'mirror_selfie',
    'handheld_pov',
    'chest_pov',
    'overhead',
    'low_angle'
  ];

  const cameraFeelKeys: CameraFeel[] = [
    'auto',
    'very_raw',
    'casual',
    'clean',
    'slightly_shaky',
    'quick_snapshot',
    'distracted_capture',
    'social_media',
    'low_light',
    'direct_flash',
    'older_phone_look'
  ];

  const updateSetting = <K extends keyof FullSettings>(key: K, val: FullSettings[K]) => {
    onChange({ ...settings, [key]: val });
  };

  // Handle Output Format selection with auto-sync to Aspect Ratio
  const handleSelectOutputFormat = (formatId: OutputFormatId) => {
    const matched = OUTPUT_FORMATS.find(of => of.id === formatId);
    if (matched) {
      onChange({
        ...settings,
        outputFormat: formatId,
        aspectRatio: matched.defaultRatio !== 'auto' ? matched.defaultRatio : settings.aspectRatio
      });
    } else {
      onChange({ ...settings, outputFormat: formatId });
    }
  };

  // 8 prominent Aspect Ratios for quick 1-tap select in simple mode
  const prominentRatios = ASPECT_RATIOS_LIST.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      
      {/* 01 — CAMERA SELECTION (Searchable Bottom Sheet / Modal Trigger) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans flex items-center gap-1.5">
            <Smartphone size={14} className="text-[var(--text-secondary)]" />
            <span>{t.simple.opticalSystem}</span>
          </label>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            {CAMERA_LIBRARY.filter(c => c.id !== 'professional_camera').length}+ {ui.models}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCameraSheetOpen(true)}
          className="w-full h-12 px-3.5 bg-[var(--surface-secondary)] border border-[var(--border-main)] hover:border-[var(--border-active)] rounded-lg flex items-center justify-between transition-all cursor-pointer shadow-xs text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-white transition-colors">
              <Smartphone size={15} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] font-sans truncate">
                {settings.device || 'iPhone 16 Pro'}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                {t.simple.openLibrary} · {ui.tapSearch}
              </span>
            </div>
          </div>
          <ChevronRight size={15} className="text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Independent {ui.cameraMode} & {ui.cameraFeel} */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* {ui.cameraMode} */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans">
              {ui.cameraMode}
            </span>
            <div className="relative">
              <select
                value={settings.cameraMode || 'auto'}
                onChange={(e) => updateSetting('cameraMode', e.target.value as CameraMode)}
                className="w-full h-10 bg-[var(--surface-secondary)] border border-[var(--border-main)] rounded-lg px-3 text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer appearance-none hover:border-[var(--border-active)] transition-all font-sans shadow-xs"
              >
                {cameraModeKeys.map(key => (
                  <option key={key} value={key} className="bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                    {t.options.cameraModes[key] || key}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <ChevronRight size={13} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* {ui.cameraFeel} */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans">
              {ui.cameraFeel}
            </span>
            <div className="relative">
              <select
                value={settings.cameraFeel || 'auto'}
                onChange={(e) => updateSetting('cameraFeel', e.target.value as CameraFeel)}
                className="w-full h-10 bg-[var(--surface-secondary)] border border-[var(--border-main)] rounded-lg px-3 text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer appearance-none hover:border-[var(--border-active)] transition-all font-sans shadow-xs"
              >
                {cameraFeelKeys.map(key => (
                  <option key={key} value={key} className="bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                    {t.options.cameraFeels[key] || key}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <ChevronRight size={13} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA SEARCHABLE BOTTOM SHEET */}
      <SearchableBottomSheet
        isOpen={isCameraSheetOpen}
        onClose={() => setIsCameraSheetOpen(false)}
        title={ui.cameraLibrary}
        searchPlaceholder={t.simple.searchCamera || "Search camera..."}
        options={cameraOptions}
        categories={cameraCategories}
        selectedValue={settings.device}
        onSelect={handleSelectCamera}
        favorites={favoriteCameras}
        onToggleFavorite={handleToggleFavoriteCamera}
        recents={recentCameras}
        recentTitle={t.simple.recent || "Recent"}
        favoritesTitle={t.simple.favorites || "Favorites"}
        optionsLabel={ui.options}
        emptyLabel={ui.empty}
        clearLabel={ui.clear}
        doneLabel={ui.done}
        selectionHint={ui.selectHint}
      />

      {/* 02 — ASPECT RATIO & SOCIAL OUTPUT FORMAT */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">
            {t.simple.aspectRatio}
          </label>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            {settings.aspectRatio.toUpperCase()}
          </span>
        </div>

        {/* Quick Social Output Format Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={settings.outputFormat || 'auto'}
              onChange={(e) => handleSelectOutputFormat(e.target.value as OutputFormatId)}
              className="w-full h-10 bg-[var(--surface-secondary)] border border-[var(--border-main)] rounded-lg px-3 text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer appearance-none hover:border-[var(--border-active)] transition-all font-sans shadow-xs"
            >
              {OUTPUT_FORMATS.map(of => (
                <option key={of.id} value={of.id} className="bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                  {t.options.outputFormats[of.labelKey] || of.sub} ({of.defaultRatio})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <ChevronRight size={13} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* 1-Tap Aspect Ratio Grid */}
        <div className="grid grid-cols-4 gap-2">
          {prominentRatios.map(ar => {
            const isSelected = settings.aspectRatio === ar.value;
            return (
              <button
                key={ar.value}
                type="button"
                onClick={() => updateSetting('aspectRatio', ar.value)}
                className={`h-12 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-950 border-white shadow-xs font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-main)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div
                  className={`border rounded-[1px] mb-1 flex items-center justify-center ${
                    isSelected ? 'border-zinc-950' : 'border-current'
                  }`}
                  style={{ width: `${ar.iconW}px`, height: `${ar.iconH}px` }}
                />
                <span className="text-[11px] font-mono leading-none">{ar.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03 — PHOTOGRAPHIC STYLE */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">
          {t.simple.photoStyle}
        </label>
        <div className="relative">
          <select
            value={settings.photographicStyle}
            onChange={(e) => updateSetting('photographicStyle', e.target.value as PhotographicStyle)}
            className="w-full h-11 bg-[var(--surface-secondary)] border border-[var(--border-main)] rounded-lg px-3.5 text-xs sm:text-sm font-medium text-[var(--text-primary)] outline-none cursor-pointer appearance-none hover:border-[var(--border-active)] transition-all font-sans shadow-xs"
          >
            {photoStyles.map(ps => (
              <option key={ps.value} value={ps.value} className="bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                {ps.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* 04 — CAPTURE PROFILE (Defines how the photo should look and feel) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">
            {t.simple.captureProfile}
          </label>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            {t.options.captureProfiles[settings.captureProfile || 'auto']}
          </span>
        </div>

        <div className="relative">
          <select
            value={settings.captureProfile || 'auto'}
            onChange={(e) => updateSetting('captureProfile', e.target.value as CaptureProfile)}
            className="w-full h-11 bg-[var(--surface-secondary)] border border-[var(--border-main)] rounded-lg px-3.5 text-xs sm:text-sm font-medium text-[var(--text-primary)] outline-none cursor-pointer appearance-none hover:border-[var(--border-active)] transition-all font-sans shadow-xs"
          >
            {captureProfileKeys.map(cpKey => (
              <option key={cpKey} value={cpKey} className="bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                {t.options.captureProfiles[cpKey]}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </div>

        {/* Helpful active profile description banner */}
        <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface-secondary)] p-2.5 rounded-lg border border-white/[0.06] font-sans leading-relaxed">
          {t.options.captureProfileDescriptions[settings.captureProfile || 'auto']}
        </p>
      </div>

      {/* 05 — REALISM PRIORITY */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">
            {t.simple.realism}
          </label>
          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
            {settings.realismLevel}%
          </span>
        </div>
        <div className="py-2">
          <input
            type="range"
            min="50"
            max="100"
            value={settings.realismLevel}
            onChange={(e) => updateSetting('realismLevel', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span>{t.simple.balanced}</span>
          <span>{t.simple.forensic100}</span>
        </div>
      </div>

      {/* GENERATE PROMPTS BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full h-12 py-3 px-6 bg-white text-zinc-950 text-xs sm:text-sm font-bold uppercase tracking-widest font-sans transition-all duration-200 hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2.5 rounded-lg cursor-pointer shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>{t.simple.analyzing}</span>
            </>
          ) : (
            <>
              <span>{t.simple.generate}</span>
              <ArrowRight size={16} strokeWidth={2} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default memo(SimpleControls);
