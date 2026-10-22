interface AuroraProps {
  className?: string;
  /** Number of drifting blobs */
  count?: number;
  /** Slower = calmer movement */
  speed?: number;
}

/**
 * Animated aurora background made of drifting, blurred colour blobs.
 */
export default function Aurora({ className = '', count = 3, speed = 18 }: AuroraProps) {
  const colors = ['#10b981', '#3b82f6', '#d99f36', '#8b5cf6', '#06b6d4'];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        const color = colors[i % colors.length];
        const size = 24 + i * 12;
        const top = 8 + ((i * 29) % 60);
        const left = 6 + ((i * 37) % 70);
        const delay = i * 3.5;
        const dur = speed + i * 5;

        return (
          <div
            key={i}
            className="aurora absolute rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              top: `${top}%`,
              left: `${left}%`,
              background: `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 70%)`,
              animation: `auroraDrift ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
