import React from 'react';

interface ChampagneCapsuleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  label: string;
  secondaryLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

const ChampagneCapsuleButton: React.FC<ChampagneCapsuleButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  label,
  secondaryLabel,
  className = '',
  variant = 'primary',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        backgroundColor: disabled ? undefined : 'var(--trx-accent, #00F0FF)',
        color: disabled ? undefined : 'var(--trx-accent-contrast, #080A0E)',
      }}
      className={`group relative inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded font-mono font-bold text-xs tracking-wider uppercase transition-all duration-150 select-none ${
        disabled
          ? 'bg-[#E2E8F0] dark:bg-[#181D26] text-[#94A3B8] dark:text-[#4B5869] border border-[#CBD5E1] dark:border-[#222A36] cursor-not-allowed shadow-none'
          : 'border border-current hover:brightness-110 active:scale-[0.985] cursor-pointer shadow-xs'
      } ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText || label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Micro-pixel square indicator */}
          <span className="w-1.5 h-1.5 bg-current shrink-0 opacity-90" />
          <span>{label}</span>
          {secondaryLabel && (
            <span className="text-[10px] opacity-75 hidden sm:inline font-normal">
              // {secondaryLabel}
            </span>
          )}
          <svg
            className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 opacity-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default ChampagneCapsuleButton;
