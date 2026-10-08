import React from 'react';

interface TrxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrxLogo: React.FC<TrxLogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: { box: 'w-6 h-6', icon: 20 },
    md: { box: 'w-7.5 h-7.5', icon: 24 },
    lg: { box: 'w-9 h-9', icon: 28 },
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-lg bg-[#12161E] border border-[#242D38] overflow-hidden ${dimensions.box} ${className}`}
      title="Project TRX // Optical Studio"
    >
      {/* 4 Micro-pixel Corner Sensors */}
      <span className="absolute top-0.5 left-0.5 w-1 h-1 bg-[#FF3366] rounded-2xs" />
      <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-[#00FF66] rounded-2xs" />
      <span className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-[#FFCC00] rounded-2xs" />
      <span className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-[#00F0FF] rounded-2xs" />

      {/* Optical Reticle Aperture SVG */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#F3F6F9]"
      >
        {/* Optical Lens Focus Ring */}
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 1.5" opacity="0.8" />
        {/* Core Focal Center */}
        <rect x="10.5" y="10.5" width="3" height="3" fill="var(--trx-accent, #00F0FF)" />
        {/* Crosshair telemetry lines */}
        <line x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        <line x1="12" y1="19.5" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        <line x1="2" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        <line x1="19.5" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      </svg>
    </div>
  );
};

export default TrxLogo;
