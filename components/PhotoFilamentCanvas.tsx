import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PhotoFilamentCanvasProps {
  imageUrl: string | null;
  isAnalyzing: boolean;
  className?: string;
}

interface Filament {
  originX: number; // normalized 0..1
  originY: number; // normalized 0..1
  targetRadius: number; // dispersion distance in px
  angle: number; // outward radian
  curveBias: number;
  length: number;
  speed: number;
  phase: number;
  depthLayer: number; // 0 (back), 1 (mid), 2 (fore)
  color: { r: number; g: number; b: number };
  tipColor: { r: number; g: number; b: number };
  thickness: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: { r: number; g: number; b: number };
}

const DEFAULT_PALETTE = [
  { r: 0, g: 240, b: 255 },   // Cyan TRX
  { r: 243, g: 246, b: 249 }, // Optical Pearl
  { r: 0, g: 255, b: 102 },   // Phosphor Green
  { r: 255, g: 204, b: 0 },   // Amber
  { r: 140, g: 155, b: 174 }, // Slate
];

export const PhotoFilamentCanvas: React.FC<PhotoFilamentCanvasProps> = ({
  imageUrl,
  isAnalyzing,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Optical color samples extracted from the user's image
  const sampledColorsRef = useRef<{ r: number; g: number; b: number }[]>(DEFAULT_PALETTE);

  // Animation phase: 'idle' | 'upload_pulse' | 'analyzing' | 'recomposing'
  const stateRef = useRef<'idle' | 'upload_pulse' | 'analyzing' | 'recomposing'>('idle');
  const pulseProgressRef = useRef<number>(0);
  const recomposeProgressRef = useRef<number>(1);
  const scanYRef = useRef<number>(0);

  // Track image url changes for upload pulse
  const prevImageUrlRef = useRef<string | null>(null);

  // Check prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Sample colors and luminance from image
  useEffect(() => {
    if (!imageUrl) {
      sampledColorsRef.current = DEFAULT_PALETTE;
      prevImageUrlRef.current = null;
      stateRef.current = 'idle';
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const offscreen = document.createElement('canvas');
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const w = 48;
        const h = 48;
        offscreen.width = w;
        offscreen.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h).data;
        const colors: { r: number; g: number; b: number }[] = [];

        // Sample grid points with good saturation & distinct areas
        for (let y = 4; y < h; y += 8) {
          for (let x = 4; x < w; x += 8) {
            const idx = (y * w + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
            if (a > 60) {
              colors.push({ r, g, b });
            }
          }
        }

        if (colors.length >= 4) {
          sampledColorsRef.current = colors;
        } else {
          sampledColorsRef.current = DEFAULT_PALETTE;
        }
      } catch (err) {
        // Fallback for tainted canvas
        sampledColorsRef.current = DEFAULT_PALETTE;
      }

      // If imageUrl just changed and not currently analyzing, trigger upload pulse
      if (prevImageUrlRef.current !== imageUrl && !isAnalyzing) {
        prevImageUrlRef.current = imageUrl;
        stateRef.current = 'upload_pulse';
        pulseProgressRef.current = 0;
      }
    };
  }, [imageUrl, isAnalyzing]);

  // Transition state changes
  useEffect(() => {
    if (isAnalyzing) {
      stateRef.current = 'analyzing';
      recomposeProgressRef.current = 0;
    } else if (stateRef.current === 'analyzing') {
      // Trigger recomposition back into the photo
      stateRef.current = 'recomposing';
      recomposeProgressRef.current = 0;
    }
  }, [isAnalyzing]);

  // Main animation engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Generate filaments
    const FILAMENT_COUNT = 65;
    const filaments: Filament[] = [];

    for (let i = 0; i < FILAMENT_COUNT; i++) {
      // Pick position around photo contours and perimeter
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let ox = 0.5;
      let oy = 0.5;
      let angle = 0;

      if (side === 0) {
        ox = 0.15 + Math.random() * 0.7;
        oy = 0.05 + Math.random() * 0.2;
        angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
      } else if (side === 1) {
        ox = 0.75 + Math.random() * 0.2;
        oy = 0.15 + Math.random() * 0.7;
        angle = 0 + (Math.random() - 0.5) * 1.0;
      } else if (side === 2) {
        ox = 0.15 + Math.random() * 0.7;
        oy = 0.75 + Math.random() * 0.2;
        angle = Math.PI / 2 + (Math.random() - 0.5) * 1.0;
      } else {
        ox = 0.05 + Math.random() * 0.2;
        oy = 0.15 + Math.random() * 0.7;
        angle = Math.PI + (Math.random() - 0.5) * 1.0;
      }

      const palette = sampledColorsRef.current;
      const baseColor = palette[Math.floor(Math.random() * palette.length)] || DEFAULT_PALETTE[0];
      const tipColor = Math.random() > 0.4 ? { r: 0, g: 240, b: 255 } : { r: 255, g: 255, b: 255 };

      filaments.push({
        originX: ox,
        originY: oy,
        targetRadius: 35 + Math.random() * 65,
        angle,
        curveBias: (Math.random() - 0.5) * 2.2,
        length: 25 + Math.random() * 50,
        speed: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        depthLayer: Math.floor(Math.random() * 3), // 0: deep, 1: mid, 2: foreground
        color: baseColor,
        tipColor,
        thickness: 1 + Math.random() * 1.8,
      });
    }

    // Active floating particles
    const particles: Particle[] = [];
    const MAX_PARTICLES = 50;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;

      // Handle reduced motion mode
      if (reducedMotion) {
        if (currentState === 'analyzing') {
          // Subtle static cyan edge glow
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, width - 20, height - 20);
        }
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Update state progress
      if (currentState === 'upload_pulse') {
        pulseProgressRef.current += delta * 1.4; // completes in ~700ms
        if (pulseProgressRef.current >= 1) {
          stateRef.current = 'idle';
          pulseProgressRef.current = 0;
        }
      } else if (currentState === 'recomposing') {
        recomposeProgressRef.current += delta * 2.5; // snaps back in ~400ms
        if (recomposeProgressRef.current >= 1) {
          stateRef.current = 'idle';
          recomposeProgressRef.current = 1;
        }
      }

      if (currentState === 'idle') {
        // Nothing to draw when completely idle
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Calculate dispersion intensity multiplier
      let intensity = 0;
      if (currentState === 'analyzing') {
        intensity = 1.0;
      } else if (currentState === 'upload_pulse') {
        // Smooth sine arch: 0 -> 1 -> 0
        intensity = Math.sin(pulseProgressRef.current * Math.PI) * 0.7;
      } else if (currentState === 'recomposing') {
        // Rapid ease-out return: 1 -> 0
        intensity = Math.max(0, 1 - recomposeProgressRef.current);
      }

      if (intensity <= 0.001) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Update scanline (travels top-to-bottom)
      if (currentState === 'analyzing') {
        scanYRef.current = (scanYRef.current + delta * 0.45) % 1.0;
        const scanYPx = scanYRef.current * height;

        // Render soft scanline beam
        const scanGrad = ctx.createLinearGradient(0, scanYPx - 25, 0, scanYPx + 25);
        scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        scanGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.35)');
        scanGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanYPx - 25, width, 50);

        // Scanline sharp center thread
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanYPx);
        ctx.lineTo(width, scanYPx);
        ctx.stroke();

        // Spawn ambient particles near the scanline
        if (particles.length < MAX_PARTICLES && Math.random() > 0.4) {
          const px = Math.random() * width;
          const py = scanYPx + (Math.random() - 0.5) * 15;
          const palette = sampledColorsRef.current;
          const pColor = palette[Math.floor(Math.random() * palette.length)] || DEFAULT_PALETTE[0];

          particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 45,
            vy: (Math.random() - 0.5) * 45,
            size: 1 + Math.random() * 2,
            alpha: 0,
            maxAlpha: 0.6 + Math.random() * 0.4,
            life: 0,
            maxLife: 0.8 + Math.random() * 1.2,
            color: pColor,
          });
        }
      }

      // Render & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Fade in and out
        const pAlpha =
          progress < 0.2
            ? (progress / 0.2) * p.maxAlpha
            : (1 - (progress - 0.2) / 0.8) * p.maxAlpha;

        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${pAlpha * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render organic filaments in 3 depth layers
      const depthConfigs = [
        { scale: 0.8, alphaMul: 0.45, blur: 0, widthMul: 0.8 }, // background
        { scale: 1.0, alphaMul: 0.75, blur: 0, widthMul: 1.0 }, // midground
        { scale: 1.25, alphaMul: 0.95, blur: 0, widthMul: 1.3 }, // foreground
      ];

      for (let layer = 0; layer < 3; layer++) {
        const dConf = depthConfigs[layer];

        for (let i = 0; i < filaments.length; i++) {
          const f = filaments[i];
          if (f.depthLayer !== layer) continue;

          // Organic oscillation
          const osc = Math.sin(time * 0.002 * f.speed + f.phase);
          const currentSpread = f.targetRadius * intensity * dConf.scale;

          const startX = f.originX * width;
          const startY = f.originY * height;

          // End point expanding outward
          const effectiveAngle = f.angle + osc * 0.35;
          const endX = startX + Math.cos(effectiveAngle) * currentSpread;
          const endY = startY + Math.sin(effectiveAngle) * currentSpread;

          // Cubic Bezier control points for flowing organic curvature
          const midDist = currentSpread * 0.55;
          const perpAngle = effectiveAngle + Math.PI / 2;
          const curvature = f.curveBias * (15 + osc * 12);

          const cp1X = startX + Math.cos(effectiveAngle) * (midDist * 0.4) + Math.cos(perpAngle) * curvature;
          const cp1Y = startY + Math.sin(effectiveAngle) * (midDist * 0.4) + Math.sin(perpAngle) * curvature;

          const cp2X = startX + Math.cos(effectiveAngle) * (midDist * 0.85) - Math.cos(perpAngle) * (curvature * 0.5);
          const cp2Y = startY + Math.sin(effectiveAngle) * (midDist * 0.85) - Math.sin(perpAngle) * (curvature * 0.5);

          // Filament stroke
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

          // Color gradient along filament body
          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, `rgba(${f.color.r}, ${f.color.g}, ${f.color.b}, 0.05)`);
          grad.addColorStop(0.65, `rgba(${f.color.r}, ${f.color.g}, ${f.color.b}, ${0.7 * dConf.alphaMul * intensity})`);
          grad.addColorStop(1, `rgba(${f.tipColor.r}, ${f.tipColor.g}, ${f.tipColor.b}, ${0.95 * dConf.alphaMul * intensity})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = f.thickness * dConf.widthMul;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Luminous tip bead
          const tipRadius = (1.4 + (osc + 1) * 0.6) * dConf.scale;
          ctx.fillStyle = `rgba(${f.tipColor.r}, ${f.tipColor.g}, ${f.tipColor.b}, ${0.95 * intensity})`;
          ctx.beginPath();
          ctx.arc(endX, endY, tipRadius, 0, Math.PI * 2);
          ctx.fill();

          // Delicate glow around foreground tips
          if (layer === 2) {
            ctx.fillStyle = `rgba(0, 240, 255, ${0.3 * intensity})`;
            ctx.beginPath();
            ctx.arc(endX, endY, tipRadius * 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full z-20 ${className}`}
      aria-hidden="true"
    />
  );
};

export default PhotoFilamentCanvas;
