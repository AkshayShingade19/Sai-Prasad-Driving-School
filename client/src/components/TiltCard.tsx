import React from 'react';
import { useTilt, type TiltOptions } from '../hooks/useTilt';

interface TiltCardProps extends TiltOptions {
  children: React.ReactNode;
  className?: string;
  /** Adds the moving glare highlight layer */
  glare?: boolean;
  style?: React.CSSProperties;
}

/**
 * A card that tilts in 3D following the cursor, with an optional glare highlight.
 */
export default function TiltCard({
  children,
  className = '',
  max = 9,
  scale = 1.02,
  lift = 6,
  glare = true,
  style,
}: TiltCardProps) {
  const { ref, handlers } = useTilt<HTMLDivElement>({ max, scale, lift, glare });

  return (
    <div
      ref={ref}
      {...handlers}
      className={`tilt-card relative ${className}`}
      style={style}
    >
      {glare && <div className="tilt-glare" aria-hidden="true" />}
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
