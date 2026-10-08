import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

interface IntroSplashProps {
  onComplete: () => void;
}

const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      handleProceed();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleProceed = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F3F5F7] dark:bg-[#0C0F14] text-[#15191E] dark:text-[#EDF0F3] transition-opacity duration-500 overflow-hidden select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Project TRX Splash Screen"
    >
      {/* Background Optical Mesh */}
      <div className="absolute inset-0 optical-mesh opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[130px] opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--trx-accent, #38BDF8)' }}
      />

      {/* Main Refined Presentation */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Optical Diaphragm Halo */}
        <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs flex items-center justify-center mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-display"
            style={{
              backgroundColor: 'var(--trx-accent, #38BDF8)',
              color: 'var(--trx-accent-contrast, #0F172A)',
            }}
          >
            TX
          </div>
        </div>

        {/* Brand Typographic Title */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-[#0F172A] dark:text-[#F0F6FC] mb-1.5 uppercase">
          PROJECT <span style={{ color: 'var(--trx-accent, #38BDF8)' }}>TRX</span>
        </h1>

        {/* Studio Descriptor */}
        <p className="font-mono text-[10px] tracking-[0.25em] text-[#64748B] dark:text-[#8B949E] uppercase mt-1 mb-4 font-semibold">
          {language === 'es' ? 'ESTUDIO DE IMAGEN Y ANÁLISIS ÓPTICO' : 'IMAGE & OPTICAL ANALYSIS STUDIO'}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed mb-6 max-w-xs">
          {language === 'es'
            ? 'Deconstrucción óptica y forense de la escena adaptada a tu propia identidad.'
            : 'Forensic optical scene deconstruction tailored to your own identity.'}
        </p>

        {/* Discreet Progress Bar */}
        <div className="w-40 h-1 bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden mb-5 relative">
          <div
            className="h-full w-full animate-[introProgress_2.8s_ease-out]"
            style={{ backgroundColor: 'var(--trx-accent, #38BDF8)' }}
          />
        </div>

        {/* Immediate Enter Button */}
        <button
          type="button"
          onClick={handleProceed}
          className="text-xs font-semibold tracking-wide transition-all py-2 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:bg-[#F1F5F9] dark:hover:bg-[#21262D] text-[#0F172A] dark:text-[#F0F6FC] cursor-pointer shadow-2xs"
        >
          {language === 'es' ? 'Entrar al estudio →' : 'Enter studio →'}
        </button>
      </div>

      <style>{`
        @keyframes introProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default IntroSplash;
