import React from 'react';
import { useReveal, type RevealOptions } from '../hooks/useReveal';

interface RevealProps extends RevealOptions {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
  style?: React.CSSProperties;
}

// Only translate is used (never scale) so the element's hit area stays
// constant while it animates — scaling would make click targets drift.
const FROM_TRANSFORMS: Record<string, string> = {
  up: 'translateY(38px)',
  down: 'translateY(-38px)',
  left: 'translateX(-52px)',
  right: 'translateX(52px)',
  scale: 'translateY(24px)',
  none: 'translateY(0)',
};

/**
 * Wraps children in a scroll-triggered reveal animation.
 */
export default function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  delay = 0,
  from = 'up',
  threshold = 0.15,
  style,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>({ delay, from, threshold });

  return (
    <Tag
      ref={ref as any}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDelay: visible ? `${delay}ms` : '0ms',
        transform: visible ? undefined : FROM_TRANSFORMS[from],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
