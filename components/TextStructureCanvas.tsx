import React, { useEffect, useRef, useState, useMemo } from 'react';

interface TextStructureCanvasProps {
  text: string;
  isGenerating: boolean;
  hasResult: boolean;
  className?: string;
}

interface TextNode {
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  depth: number; // 0..2
  size: number;
  alpha: number;
  angle: number;
  spin: number;
  isGlyph: boolean;
}

interface ParticlePulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const TextStructureCanvas: React.FC<TextStructureCanvasProps> = ({
  text,
  isGenerating,
  hasResult,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const stateRef = useRef<'idle' | 'generating' | 'converging'>('idle');
  const convergeProgressRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Update states
  useEffect(() => {
    if (isGenerating) {
      stateRef.current = 'generating';
      convergeProgressRef.current = 0;
    } else if (stateRef.current === 'generating' && hasResult) {
      stateRef.current = 'converging';
      convergeProgressRef.current = 0;
    } else if (!isGenerating && !hasResult) {
      stateRef.current = 'idle';
    }
  }, [isGenerating, hasResult]);

  // Extract typographic fragments from text
  const fragments = useMemo(() => {
    const raw = text.trim();
    if (!raw) return ['CONCEPT', 'TRX', 'OPTICS', 'RAW', 'LIGHT'];

    const words = raw
      .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    if (words.length === 0) return ['IDEA', 'OPTIC'];

    if (words.length === 1) {
      const single = words[0];
      const chars = single.split('');
      const slices: string[] = [single];
      for (let i = 0; i < chars.length; i++) {
        slices.push(chars[i]);
      }
      return slices.slice(0, 10);
    }

    // Mix of words and leading glyphs
    const tokens: string[] = [];
    words.slice(0, 8).forEach((w) => {
      tokens.push(w);
      if (w.length > 3) {
        tokens.push(w.slice(0, 2).toUpperCase());
      }
    });
    return tokens.slice(0, 12);
  }, [text]);

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

    // Build text nodes based on fragments
    const nodes: TextNode[] = fragments.map((token, idx) => {
      const angle = (idx / fragments.length) * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      return {
        label: token,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        baseX: Math.cos(angle) * dist,
        baseY: Math.sin(angle) * dist,
        depth: Math.floor(Math.random() * 3),
        size: token.length <= 2 ? 11 : 12 + Math.random() * 3,
        alpha: 0.6 + Math.random() * 0.35,
        angle: (Math.random() - 0.5) * 0.2,
        spin: (Math.random() - 0.5) * 0.05,
        isGlyph: token.length <= 2,
      };
    });

    const particles: ParticlePulse[] = [];
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;

      if (reducedMotion) {
        if (currentState === 'generating') {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(4, 4, width - 8, height - 8);
        }
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      if (currentState === 'converging') {
        convergeProgressRef.current += delta * 2.2;
        if (convergeProgressRef.current >= 1) {
          stateRef.current = 'idle';
          convergeProgressRef.current = 1;
        }
      }

      if (currentState === 'idle') {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const targetBottomY = height * 0.95; // target convergence point

      // Global alpha and contraction
      let globalAlpha = 1.0;
      let convergenceFactor = 0; // 0: spread out, 1: converged to prompt card

      if (currentState === 'generating') {
        globalAlpha = 0.9;
        convergenceFactor = 0;
      } else if (currentState === 'converging') {
        const p = convergeProgressRef.current;
        convergenceFactor = Math.pow(p, 1.8);
        globalAlpha = Math.max(0, 1 - p * 1.2);
      }

      if (globalAlpha <= 0.001) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Spawn subtle cyan particles
      if (currentState === 'generating' && particles.length < 35 && Math.random() > 0.6) {
        particles.push({
          x: centerX + (Math.random() - 0.5) * 160,
          y: centerY + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          size: 1 + Math.random() * 2,
          alpha: 0.8,
          life: 0,
          maxLife: 1.2 + Math.random() * 0.8,
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const pProg = p.life / p.maxLife;
        const curAlpha = (1 - pProg) * p.alpha * globalAlpha;

        ctx.fillStyle = `rgba(0, 240, 255, ${curAlpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // Update positions of text nodes
      nodes.forEach((node, i) => {
        const osc = Math.sin(time * 0.0015 + i);
        const oscY = Math.cos(time * 0.0012 + i * 1.3);

        const currentDistX = node.baseX + osc * 15;
        const currentDistY = node.baseY + oscY * 12;

        const currentTargetX = centerX + currentDistX * (1 - convergenceFactor);
        const currentTargetY =
          centerY + currentDistY * (1 - convergenceFactor) + (targetBottomY - centerY) * convergenceFactor;

        node.x = currentTargetX;
        node.y = currentTargetY;
        node.angle += node.spin * delta;
      });

      // Draw connective lattice lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.35 * globalAlpha;

            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw micro reticle dot at midpoint
            if (dist < 60) {
              const midX = (n1.x + n2.x) * 0.5;
              const midY = (n1.y + n2.y) * 0.5;
              ctx.fillStyle = `rgba(0, 255, 102, ${lineAlpha * 1.4})`;
              ctx.fillRect(midX - 1, midY - 1, 2, 2);
            }
          }
        }
      }

      // Draw typographic nodes
      nodes.forEach((node) => {
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle * (1 - convergenceFactor));

        const scale = (1 - convergenceFactor * 0.6);
        ctx.scale(scale, scale);

        const itemAlpha = node.alpha * globalAlpha;

        // Background chip
        ctx.fillStyle = `rgba(8, 10, 14, ${0.75 * itemAlpha})`;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.45 * itemAlpha})`;
        ctx.lineWidth = 1;

        ctx.font = node.isGlyph
          ? `bold ${Math.round(node.size * 1.2)}px ui-monospace, SFMono-Regular, Menlo, monospace`
          : `600 ${Math.round(node.size)}px ui-monospace, SFMono-Regular, Menlo, monospace`;

        const metrics = ctx.measureText(node.label);
        const paddingX = node.isGlyph ? 6 : 8;
        const paddingY = 4;
        const boxW = metrics.width + paddingX * 2;
        const boxH = node.size + paddingY * 2;

        ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

        // Text fill
        ctx.fillStyle = node.isGlyph
          ? `rgba(0, 240, 255, ${0.95 * itemAlpha})`
          : `rgba(241, 245, 249, ${0.9 * itemAlpha})`;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, 0, 1);

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [fragments, reducedMotion]);

  if (!isGenerating && !hasResult && stateRef.current === 'idle') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full z-20 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};

export default TextStructureCanvas;
