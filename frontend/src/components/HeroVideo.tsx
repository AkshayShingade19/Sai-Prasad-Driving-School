import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface HeroVideoProps {
  sources: { src: string; type?: string }[];
  poster?: string;
  className?: string;
}

/**
 * Background video that cycles through a list of sources.
 * If a source fails to load, it automatically falls back to the next one.
 */
export default function HeroVideo({ sources, poster, className = '' }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Advance to the next source when one errors out
  const handleError = () => {
    if (index < sources.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  // Attempt autoplay; browsers may block it, so fall back to paused
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        setPaused(true);
      });
    }
  }, [index]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  if (failed) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        key={sources[index].src}
        ref={videoRef}
        className="w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0 }}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        poster={poster}
        onCanPlay={() => setReady(true)}
        onError={handleError}
        onLoadedData={() => setReady(true)}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type || 'video/mp4'} />
        ))}
      </video>

      {/* Controls */}
      <div className="absolute bottom-24 right-4 md:right-8 z-20 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label={paused ? 'Play video' : 'Pause video'}
        >
          {paused ? <Play size={16} className="text-white ml-0.5" /> : <Pause size={16} className="text-white" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
