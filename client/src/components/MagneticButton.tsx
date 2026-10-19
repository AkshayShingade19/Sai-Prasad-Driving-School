import React, { useRef, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  /** How far the button is pulled toward the cursor (px) */
  strength?: number;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Button that is magnetically pulled toward the cursor.
 */
export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  strength = 10,
  type = 'button',
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate3d(${(x * (strength / 100)).toFixed(2)}px, ${(y * (strength / 100)).toFixed(
        2,
      )}px, 0)`;
    },
    [strength],
  );

  const reset = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  const content = (
    <span className="inline-flex items-center justify-center gap-2">{children}</span>
  );

  return (
    <div
      ref={ref}
      className="magnetic inline-flex"
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
    >
      {href ? (
        <a href={href} className={className} aria-label={ariaLabel} onClick={onClick}>
          {content}
        </a>
      ) : (
        <button
          type={type}
          onClick={onClick}
          className={className}
          disabled={disabled}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      )}
    </div>
  );
}
