import React, { useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import PhotoFilamentCanvas from './PhotoFilamentCanvas';

interface UploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onClearScene?: () => void;
  onIdentityFileSelect?: (file: File) => void;
  identityFile?: File | null;
  identityPreviewUrl?: string | null;
  onClearIdentity?: () => void;
  onSwapRoles?: () => void;
  disabled: boolean;
  isAnalyzing?: boolean;
}

const Uploader: React.FC<UploaderProps> = ({
  onFileSelect,
  selectedFile,
  previewUrl,
  onClearScene,
  onIdentityFileSelect,
  identityFile,
  identityPreviewUrl,
  onClearIdentity,
  onSwapRoles,
  disabled,
  isAnalyzing,
}) => {
  const sceneInputRef = useRef<HTMLInputElement>(null);
  const identityInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();

  const analyzing = isAnalyzing ?? disabled;
  const isEs = language === 'es';

  const handleSceneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = '';
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onIdentityFileSelect) {
      onIdentityFileSelect(file);
    }
    e.target.value = '';
  };

  const handleOpenScenePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      sceneInputRef.current?.click();
    }
  };

  const handleOpenIdentityPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      identityInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={sceneInputRef}
        onChange={handleSceneChange}
        className="hidden"
        accept="image/*"
        disabled={disabled}
      />
      <input
        type="file"
        ref={identityInputRef}
        onChange={handleIdentityChange}
        className="hidden"
        accept="image/*"
        disabled={disabled}
      />

      {/* ──────────────────────────────────────────────────────────
          MAIN CENTRAL OPTICAL VIEWPORT (VISOR PRINCIPAL)
         ────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-xl overflow-hidden bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36] shadow-xs">
        {/* Telemetry Bar Above Viewport */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#CBD5E1] dark:border-[#222A36] bg-[#F8FAFC] dark:bg-[#0C0F14] text-[11px] font-mono select-none">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 ${
                analyzing
                  ? 'bg-[#FF3366] animate-ping'
                  : previewUrl
                  ? 'bg-[#00FF66]'
                  : 'bg-[var(--trx-accent,#00F0FF)]'
              }`}
            />
            <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
              01 // {t('sceneReferenceRole')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#64748B] dark:text-[#8C9BAE]">
            <span className="hidden xs:inline">[OPTICAL MATRIX]</span>
            <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              {analyzing
                ? (isEs ? 'ANALIZANDO ESCENA' : 'SCANNING SCENE')
                : previewUrl
                ? (isEs ? 'ESCENA CALIBRADA' : 'SCENE CALIBRATED')
                : (isEs ? 'EN ESPERA' : 'STANDBY')}
            </span>
          </div>
        </div>

        {/* The Viewport Camera Chamber */}
        <div
          onClick={() => !previewUrl && !disabled && sceneInputRef.current?.click()}
          className={`relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] min-h-[260px] sm:min-h-[340px] max-h-[480px] flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none bg-[#080A0E] ${
            !previewUrl ? 'cursor-pointer group' : ''
          }`}
        >
          {/* L-Bracket Optical Reticles in 4 Corners */}
          <div className="pointer-events-none absolute inset-2.5 sm:inset-4 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--trx-accent,#00F0FF)]" />
              <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--trx-accent,#00F0FF)]" />
            </div>

            <div className="flex justify-between items-end">
              <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--trx-accent,#00F0FF)]" />
              <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--trx-accent,#00F0FF)]" />
            </div>
          </div>

          {previewUrl ? (
            <>
              {/* Image Preview Stage */}
              <img
                key={previewUrl}
                src={previewUrl}
                alt="Reference scene"
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 z-10 stage-image-enter ${
                  analyzing ? 'opacity-85' : 'opacity-100'
                }`}
              />

              {/* Photo-derived Volumetric Filament Dispersion and Recomposition Animation */}
              <PhotoFilamentCanvas imageUrl={previewUrl} isAnalyzing={analyzing} />

              {/* Viewport Floating Action Bar */}
              {!analyzing && (
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenScenePicker}
                    className="bg-[#080A0E]/90 hover:bg-[#11151C] text-[#F1F5F9] px-2.5 py-1 rounded border border-[#222A36] text-[11px] font-mono font-semibold shadow-md hover:border-[var(--trx-accent,#00F0FF)] transition-all flex items-center gap-1 cursor-pointer backdrop-blur-md min-h-[34px]"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--trx-accent,#00F0FF)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{t('changePhoto')}</span>
                  </button>

                  {onClearScene && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearScene();
                      }}
                      className="bg-[#080A0E]/90 hover:bg-rose-950 text-[#F1F5F9] hover:text-[#FF3366] p-1.5 rounded border border-[#222A36] text-xs shadow-md transition-all cursor-pointer backdrop-blur-md min-h-[34px] min-w-[34px] flex items-center justify-center hover:border-[#FF3366]"
                      title={t('removePhoto')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Standby Optical Framing Content */
            <div className="relative z-20 flex flex-col items-center text-center max-w-sm px-4 py-2 select-none">
              {/* Central Reticle Icon */}
              <div className="w-12 h-12 rounded flex items-center justify-center mb-3 bg-[#11151C] border border-[#222A36] text-[var(--trx-accent,#00F0FF)] group-hover:border-[var(--trx-accent,#00F0FF)] transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={1.8}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                </svg>
              </div>

              <p className="font-mono font-bold text-xs sm:text-sm text-[#F1F5F9] mb-1 tracking-wide uppercase">
                {t('dragDrop')}
              </p>
              <p className="text-[10px] font-mono text-[#8C9BAE] mb-3">
                RAW · JPG · PNG · WEBP // 24-BIT FORENSIC
              </p>

              <button
                type="button"
                onClick={handleOpenScenePicker}
                style={{
                  backgroundColor: 'var(--trx-accent, #00F0FF)',
                  color: 'var(--trx-accent-contrast, #080A0E)',
                }}
                className="px-4 py-2 rounded text-xs font-mono font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 min-h-[40px] uppercase tracking-wider"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.4} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('choosePhoto')}</span>
              </button>
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────
            INTEGRATED SECONDARY CALIBRATION DOCK (02 // IDENTIDAD FACIAL)
            Cleanly docked at the base of the viewport chamber
           ────────────────────────────────────────────────────────── */}
        <div className="p-2.5 sm:p-3 bg-[#F8FAFC] dark:bg-[#0C0F14] border-t border-[#CBD5E1] dark:border-[#222A36] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00FF66]" />
              <span className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-wider uppercase">
                02 // {t('identityPhotoRole')}
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#00FF66]/10 text-[#00FF66] font-semibold border border-[#00FF66]/30">
                {identityPreviewUrl ? (isEs ? 'CALIBRADA' : 'CALIBRATED') : t('optionalBadge')}
              </span>
            </div>

            {identityPreviewUrl && previewUrl && onSwapRoles && !analyzing && (
              <button
                type="button"
                onClick={onSwapRoles}
                className="text-[11px] font-mono text-[var(--trx-accent,#00F0FF)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                title={t('swapRoles')}
              >
                <span>[ ⇄ {t('swapRoles')} ]</span>
              </button>
            )}
          </div>

          {identityPreviewUrl ? (
            <div className="flex items-center gap-2.5 p-2 rounded bg-white dark:bg-[#11151C] border border-[#CBD5E1] dark:border-[#222A36]">
              <div className="relative w-10 h-10 rounded overflow-hidden border border-[#CBD5E1] dark:border-[#2C3645] shrink-0 bg-[#080A0E]">
                <img
                  src={identityPreviewUrl}
                  alt="Identity Reference"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#00FF66]" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-xs font-mono font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                  {identityFile ? identityFile.name : (isEs ? 'Identidad vinculada' : 'Linked identity')}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#8C9BAE] font-mono">
                  {isEs ? 'Rostro asignado al Sujeto A' : 'Face assigned to Subject A'}
                </span>
              </div>

              {!analyzing && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenIdentityPicker}
                    className="text-[11px] font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] px-2 py-1 rounded bg-[#F1F5F9] dark:bg-[#181D26] border border-[#CBD5E1] dark:border-[#2C3645] cursor-pointer"
                  >
                    {t('changePhoto')}
                  </button>
                  {onClearIdentity && (
                    <button
                      type="button"
                      onClick={onClearIdentity}
                      className="p-1 rounded text-[#64748B] hover:text-[#FF3366] cursor-pointer"
                      title={t('removePhoto')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenIdentityPicker}
              disabled={analyzing}
              className="w-full py-1.5 px-3 rounded border border-dashed border-[#CBD5E1] dark:border-[#222A36] hover:border-[#00FF66] bg-white/50 dark:bg-[#11151C]/50 hover:bg-white dark:hover:bg-[#11151C] transition-all flex items-center justify-center gap-2 text-xs font-mono font-semibold text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer disabled:cursor-not-allowed min-h-[38px]"
            >
              <span className="w-3 h-3 rounded-2xs bg-[#00FF66]/20 text-[#00FF66] flex items-center justify-center font-bold text-[9px]">
                +
              </span>
              <span>{t('addIdentityPhoto')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uploader;
