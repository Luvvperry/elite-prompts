import React from 'react';
import { ExtractedPalette } from '../types';

interface AmbientHaloProps {
  imageUrl?: string | null;
  palette?: ExtractedPalette | null;
  className?: string;
}

const AmbientHalo: React.FC<AmbientHaloProps> = ({
  imageUrl,
  palette,
  className = '',
}) => {
  // If no reference photo, show subtle neutral cool aura
  const hasImage = !!imageUrl;

  const accentColor = palette?.primaryAccentHex || 'var(--trx-accent, #00F0FF)';
  const ambientGlow = palette?.ambientGlow || 'var(--trx-ambient-glow, rgba(0, 240, 255, 0.22))';
  const ambientSoft = palette?.ambientSoft || 'var(--trx-ambient-soft, rgba(0, 240, 255, 0.08))';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none -z-10 flex items-center justify-center transition-all duration-700 ease-out overflow-hidden select-none ${className}`}
    >
      {/* Primary diffuse aura matching photo dominant tone */}
      <div
        className={`w-[115%] h-[115%] max-w-[700px] max-h-[500px] rounded-[48px] blur-[90px] sm:blur-[120px] transition-all duration-700 ease-out ${
          hasImage ? 'opacity-35 dark:opacity-40 scale-100' : 'opacity-10 dark:opacity-15 scale-95'
        }`}
        style={{
          background: `radial-gradient(ellipse at center, ${ambientGlow} 0%, ${ambientSoft} 55%, transparent 75%)`,
        }}
      />

      {/* Secondary directional accent rim light (soft and non-destructive) */}
      {hasImage && (
        <div
          className="absolute -inset-4 rounded-[40px] blur-[60px] opacity-25 dark:opacity-30 transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(circle at 75% 25%, ${accentColor} 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
};

export default AmbientHalo;
