import { useEffect, useRef, useState } from 'react';

export interface RevealOptions {
  /** Delay in ms before the reveal triggers */
  delay?: number;
  /** Direction the element animates in from */
  from?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  /** Trigger once the element is this % visible */
  threshold?: number;
}

/**
 * Scroll-reveal animation using IntersectionObserver.
 * Adds `is-visible` class once the element enters the viewport.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options: RevealOptions = {}) {
  const { delay = 0, from = 'up', threshold = 0.15 } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion: show immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    // Safety net: never leave content permanently hidden
    const safety = setTimeout(() => setVisible(true), 4000);

    // Already in viewport on mount (e.g. above-the-fold)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => {
        clearTimeout(t);
        clearTimeout(safety);
      };
    }

    // Use a lower threshold for elements taller than the viewport
    const useThreshold = rect.height > window.innerHeight ? 0 : threshold;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
          clearTimeout(safety);
        }
      },
      { threshold: useThreshold, rootMargin: '0px 0px -60px 0px' },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [delay, threshold]);

  return { ref, visible, from };
}
