import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Expand, MapPin, Phone } from 'lucide-react';

interface GalleryImage {
  src: string;
  title: string;
  description: string;
}

const images: GalleryImage[] = [
  {
    src: '/images/office-front.jpg',
    title: 'Our Office',
    description: 'Sai Prasad Enterprise, Shop 23, Kolhapur — reception and consultation point',
  },
  {
    src: '/images/classroom.jpg',
    title: 'Classroom Sessions',
    description: 'Theory and road-signal training before practical lessons begin',
  },
  {
    src: '/images/lecture-hall.jpg',
    title: 'Lecture Hall',
    description: 'Dedicated hall with arm signals and traffic-signal training charts',
  },
  {
    src: '/images/vehicle-front.jpg',
    title: 'Training Vehicle',
    description: 'Maruti Suzuki training car — fully serviced and safety checked',
  },
  {
    src: '/images/vehicle-rear.jpg',
    title: 'Well-Maintained Fleet',
    description: 'Every vehicle inspected daily with clear signage for safety awareness',
  },
];

export default function OfficeGallery() {
  const [selected, setSelected] = useState<number | null>(null);

  const goNext = () => setSelected((p) => (p === null ? null : (p + 1) % images.length));
  const goPrev = () =>
    setSelected((p) => (p === null ? null : (p - 1 + images.length) % images.length));

  useEffect(() => {
    if (selected === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`group relative overflow-hidden rounded-2xl bg-navy-100 shadow-sm hover:shadow-premium transition-all duration-500 ease-premium hover:-translate-y-1 ${
              i === 0 ? 'col-span-2 row-span-2' : ''
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-110"
              style={{ aspectRatio: i === 0 ? '16 / 10' : '4 / 3' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.onerror = null;
                el.src =
                  'data:image/svg+xml;base64,' +
                  btoa(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="1200" height="900" fill="#0e1f2f"/><text x="600" y="460" fill="#6a8cad" font-family="Arial" font-size="40" text-anchor="middle">${image.title}</text></svg>`,
                  );
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-premium text-left">
              <p className="font-display font-bold text-white text-base sm:text-lg mb-1 tracking-[-0.015em]">
                {image.title}
              </p>
              <p className="text-navy-200 text-[0.8125rem] leading-relaxed">{image.description}</p>
            </div>

            {/* Expand icon */}
            <div className="absolute top-4 right-4 w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/15">
              <Expand size={16} className="text-white" />
            </div>
          </button>
        ))}
      </div>

      {/* ---------- Lightbox ---------- */}
      {selected !== null && (
        <div className="fixed inset-0 bg-navy-950/97 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10 border border-white/10"
            aria-label="Close"
          >
            <X size={24} className="text-white" />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10 border border-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft size={26} className="text-white" />
          </button>

          <button
            onClick={goNext}
            className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10 border border-white/10"
            aria-label="Next image"
          >
            <ChevronRight size={26} className="text-white" />
          </button>

          <div className="max-w-5xl w-full animate-scale-in">
            <img
              src={images[selected].src}
              alt={images[selected].title}
              className="w-full max-h-[72vh] object-contain rounded-2xl shadow-premium"
            />
            <div className="text-center mt-7">
              <h3 className="font-display text-2xl font-extrabold text-white mb-2 tracking-[-0.02em]">
                {images[selected].title}
              </h3>
              <p className="text-navy-300 max-w-lg mx-auto">{images[selected].description}</p>
              <div className="flex items-center justify-center gap-6 mt-5 text-navy-400 text-[0.8125rem]">
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-accent-500" /> Shop 23, Kolhapur
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={15} className="text-accent-500" /> +91 8600740507
                </span>
              </div>
              <p className="text-navy-500 text-xs mt-3 tracking-wider">
                {selected + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
