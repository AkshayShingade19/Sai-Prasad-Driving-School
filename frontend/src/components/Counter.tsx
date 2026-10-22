import { useEffect, useState, useRef } from 'react';

interface CounterProps {
  /** Target value */
  to: number;
  /** Suffix rendered after the number (e.g. "%", "+") */
  suffix?: string;
  /** Prefix rendered before the number (e.g. "₹") */
  prefix?: string;
  duration?: number;
  className?: string;
  /** Start counting only when the element scrolls into view */
  animateOnView?: boolean;
}

/**
 * Animated number counter with easing.
 */
export default function Counter({
  to,
  suffix = '',
  prefix = '',
  duration = 1800,
  className = '',
  animateOnView = true,
}: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!animateOnView) {
      setValue(to);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (started.current) return;
      started.current = true;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValue(to);
        return;
      }

      const steps = 60;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const p = step / steps;
        // easeOutExpo
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(Math.floor(to * eased));
        if (step >= steps) {
          setValue(to);
          clearInterval(timer);
        }
      }, interval);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration, animateOnView]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
