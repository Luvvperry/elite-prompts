import React, { useEffect, useRef } from 'react';

type CosmicCanvasProps = {
  reducedMotion?: boolean;
};

type Star = { x: number; y: number; z: number; size: number; hue: number; speed: number };

const createStars = (count: number): Star[] => {
  let seed = 9137;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, () => ({
    x: (random() - 0.5) * 2,
    y: (random() - 0.5) * 2,
    z: 140 + random() * 860,
    size: 0.25 + random() * 1.35,
    hue: random() > 0.84 ? 92 + random() * 18 : 194 + random() * 42,
    speed: 0.24 + random() * 0.9,
  }));
};

const CosmicCanvas: React.FC<CosmicCanvasProps> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const stars = createStars(window.innerWidth < 700 ? 360 : 760);
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / Math.max(width, 1) - 0.5) * 18;
      targetY = (event.clientY / Math.max(height, 1) - 0.5) * 12;
    };

    const drawPlanet = (cx: number, cy: number, radius: number) => {
      const glow = context.createRadialGradient(cx - radius * .35, cy - radius * .42, radius * .05, cx, cy, radius * 1.75);
      glow.addColorStop(0, 'rgba(75, 151, 202, .11)');
      glow.addColorStop(.48, 'rgba(22, 77, 126, .07)');
      glow.addColorStop(1, 'rgba(22, 77, 126, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(cx, cy, radius * 1.75, 0, Math.PI * 2);
      context.fill();

      const planet = context.createRadialGradient(cx - radius * .3, cy - radius * .42, radius * .04, cx + radius * .25, cy + radius * .25, radius * 1.1);
      planet.addColorStop(0, 'rgba(115, 185, 226, .12)');
      planet.addColorStop(.42, 'rgba(27, 80, 124, .12)');
      planet.addColorStop(1, 'rgba(2, 10, 19, .02)');
      context.fillStyle = planet;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.beginPath();
      context.arc(cx, cy, radius * .985, 0, Math.PI * 2);
      context.clip();
      context.strokeStyle = 'rgba(158, 211, 239, .08)';
      context.lineWidth = 1;
      for (let i = -2; i <= 2; i += 1) {
        context.beginPath();
        context.ellipse(cx + i * radius * .12, cy + i * radius * .05, radius * (.88 - Math.abs(i) * .1), radius * (.15 + Math.abs(i) * .035), -0.22, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
    };

    const draw = () => {
      frame += 1;
      pointerX += (targetX - pointerX) * 0.025;
      pointerY += (targetY - pointerY) * 0.025;
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(2, 8, 16, .075)';
      context.fillRect(0, 0, width, height);

      const centerX = width * .59 + pointerX;
      const centerY = height * .39 + pointerY;
      const focal = Math.min(width, height) * .58;
      const drift = reducedMotion ? 0 : 1;

      if (width > 760) drawPlanet(width * .78 + pointerX * .45, height * .34 + pointerY * .3, Math.min(width, height) * .105);

      for (const star of stars) {
        const previousZ = star.z;
        if (!reducedMotion) star.z -= star.speed * drift;
        if (star.z < 8) {
          star.x = (Math.random() - .5) * 2;
          star.y = (Math.random() - .5) * 2;
          star.z = 980 + Math.random() * 50;
        }

        const x = centerX + (star.x / star.z) * focal * 100;
        const y = centerY + (star.y / star.z) * focal * 100;
        const previousX = centerX + (star.x / previousZ) * focal * 100;
        const previousY = centerY + (star.y / previousZ) * focal * 100;
        const alpha = Math.max(0, Math.min(.78, 1 - star.z / 1000));
        const size = Math.max(.35, star.size * (1 - star.z / 1120) * 1.35);
        if (x < -24 || x > width + 24 || y < -24 || y > height + 24) continue;

        context.strokeStyle = `hsla(${star.hue}, 70%, 78%, ${alpha})`;
        context.lineWidth = size;
        context.beginPath();
        context.moveTo(previousX, previousY);
        context.lineTo(x, y);
        context.stroke();
        if (alpha > .35) {
          context.fillStyle = `hsla(${star.hue}, 80%, 88%, ${alpha * .82})`;
          context.beginPath();
          context.arc(x, y, size * 1.1, 0, Math.PI * 2);
          context.fill();
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    draw();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="ep-cosmic-canvas" aria-hidden="true" />;
};

export default CosmicCanvas;
