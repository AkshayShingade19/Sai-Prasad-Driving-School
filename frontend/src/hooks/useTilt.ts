import { useRef, useCallback, useState } from 'react';

export interface TiltOptions {
  /** Max rotation in degrees */
  max?: number;
  /** Scale applied on hover */
  scale?: number;
  /** Translate the card toward the cursor (px) */
  lift?: number;
  /** Enable the moving glare highlight */
  glare?: boolean;
}

/**
 * Mouse-following 3D tilt.
 * Returns a ref plus handlers to spread onto the target element.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}) {
  const { max = 9, scale = 1.02, lift = 6, glare = true } = options;
  const ref = useRef<T>(null);
  const [tilting, setTilting] = useState(false);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;

      const rotateY = px * max * 2;
      const rotateX = -py * max * 2;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2,
      )}deg) translate3d(${(px * lift).toFixed(2)}px, ${(py * lift).toFixed(2)}px, 0) scale(${scale})`;

      if (glare) {
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
      }
    },
    [max, scale, lift, glare],
  );

  const onMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setTilting(true);
    el.classList.add('is-tilting');
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setTilting(false);
    el.classList.remove('is-tilting');
    el.style.transform = '';
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(
        px * max
      ).toFixed(2)}deg) scale(${scale})`;
    },
    [max, scale],
  );

  return {
    ref,
    tilting,
    handlers: { onMouseMove, onMouseEnter, onMouseLeave, onTouchMove },
  };
}
