import { useEffect, useRef, useState } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  /** How much the element moves relative to scroll (px per 100px scrolled) */
  speed?: number;
  className?: string;
  /** Vertical offset from the natural position (px) */
  offset?: number;
}

/**
 * Moves its children at a different rate than the page scroll, creating depth.
 */
export default function Parallax({
  children,
  speed = 0.25,
  className = '',
  offset = 0,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = elementCenter - viewportCenter;
      setOffsetY(distance * speed + offset);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed, offset]);

  return (
    <div ref={ref} className={className} style={{ transform: `translate3d(0, ${offsetY.toFixed(2)}px, 0)` }}>
      {children}
    </div>
  );
}
