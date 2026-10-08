import React from 'react';

const ProjectTrxBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Static Matte Micro-dot Matrix Texture */}
      <div className="absolute inset-0 trx-dot-matrix opacity-40 dark:opacity-55" />

      {/* 2. Slow Ambient Wandering Signal Pixels */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[var(--trx-accent,#00F0FF)] rounded-2xs animate-drift-1 blur-[0.5px]" />
      <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#00FF66] rounded-2xs animate-drift-2 blur-[0.5px]" />
      <div className="absolute top-0 left-0 w-1 h-1 bg-[#FF3366] rounded-2xs animate-drift-3 blur-[0.5px]" />
      <div className="absolute top-0 left-0 w-1 h-1 bg-[#FFCC00] rounded-2xs animate-drift-1 opacity-40" />

      {/* 3. Subtle Horizontal Sweep Pulse (Every 14s) */}
      <div className="animate-ambient-sweep" />

      {/* 4. Optical Vignette Edge Shading */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,10,14,0.45)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,10,14,0.85)_100%)]" />

      {/* 5. Precise Technical Crosshairs on Canvas Corners */}
      <div className="absolute top-3 left-3 text-[#222A36] text-[8px] font-mono select-none opacity-60 hidden sm:block">
        + TRX.SYS // 00.00
      </div>
      <div className="absolute top-3 right-3 text-[#222A36] text-[8px] font-mono select-none opacity-60 hidden sm:block">
        + OPT.MATRIX // 99.99
      </div>
      <div className="absolute bottom-3 left-3 text-[#222A36] text-[8px] font-mono select-none opacity-60 hidden sm:block">
        + ISO.RAW // FORENSIC
      </div>
      <div className="absolute bottom-3 right-3 text-[#222A36] text-[8px] font-mono select-none opacity-60 hidden sm:block">
        + SEC.OK // RUN
      </div>
    </div>
  );
};

export default ProjectTrxBackground;
