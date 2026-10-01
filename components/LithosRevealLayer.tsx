import React, { useEffect, useRef, useState } from 'react';

const BASE_IMAGE = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png';
const REVEAL_IMAGE = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png';

type Point = { x: number; y: number };

/** Decorative-only visual layer. It never captures input and never changes layout. */
const LithosRevealLayer: React.FC = () => {
  const raw = useRef<Point>({ x: -500, y: -500 });
  const smooth = useRef<Point>({ x: -500, y: -500 });
  const frame = useRef<number | null>(null);
  const [point, setPoint] = useState<Point>({ x: -500, y: -500 });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      raw.current = { x: event.clientX, y: event.clientY };
    };
    const animate = () => {
      smooth.current.x += (raw.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (raw.current.y - smooth.current.y) * 0.1;
      setPoint({ ...smooth.current });
      frame.current = window.requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    frame.current = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className="lithos-reveal-layer" aria-hidden="true">
      <div className="lithos-reveal-base" style={{ backgroundImage: `url(${BASE_IMAGE})` }} />
      <div
        className="lithos-reveal-image"
        style={{
          backgroundImage: `url(${REVEAL_IMAGE})`,
          ['--lithos-x' as string]: `${point.x}px`,
          ['--lithos-y' as string]: `${point.y}px`,
        }}
      />
      <div className="lithos-reveal-vignette" />
    </div>
  );
};

export default LithosRevealLayer;
