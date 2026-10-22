import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Shield,
  Clock,
  Users,
  Award,
  ArrowRight,
  Phone,
  Star,
  MapPin,
  ChevronRight,
  Play,
  Car,
  FileText,
  Wrench,
} from 'lucide-react';
import { getPublicSettings } from '../../api/settings';
import type { BusinessSettings } from '../../api/settings';
import HeroVideo from '../../components/HeroVideo';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';
import Counter from '../../components/Counter';
import MagneticButton from '../../components/MagneticButton';
import Parallax from '../../components/Parallax';

const highlights = [
  {
    icon: Shield,
    title: 'Certified Instructors',
    desc: 'Learn from experienced, government-certified instructors with over 10 years of training expertise.',
  },
  {
    icon: Clock,
    title: 'Flexible Timings',
    desc: 'Morning, evening and weekend batches designed to fit around your schedule.',
  },
  {
    icon: Users,
    title: 'Personal Attention',
    desc: 'One-on-one lessons tailored to your learning pace and individual requirements.',
  },
  {
    icon: Award,
    title: '95% Success Rate',
    desc: 'Our students consistently pass their driving tests on the first attempt.',
  },
];

const stats = [
  { key: 'students', value: 5000, suffix: '+', label: 'Students Trained' },
  { key: 'years', value: 10, suffix: '+', label: 'Years Experience' },
  { key: 'pass', value: 95, suffix: '%', label: 'First-Time Pass Rate' },
  { key: 'instructors', value: 50, suffix: '+', label: 'Expert Instructors' },
];

const services = [
  {
    icon: Car,
    title: 'Driving Lessons',
    desc: 'Beginner to advanced driving courses with certified instructors.',
    link: '/courses',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: FileText,
    title: 'Licence Assistance',
    desc: 'Learning licence and driving licence application support.',
    link: '/services',
    gradient: 'from-navy-600 to-navy-800',
  },
  {
    icon: Wrench,
    title: 'Vehicle Services',
    desc: 'RC transfer, insurance, PUC and other documentation assistance.',
    link: '/services',
    gradient: 'from-gold-500 to-gold-600',
  },
];

const testimonials = [
  {
    name: 'Rahul M.',
    text: 'Excellent training! The instructors are patient and professional. I passed my driving test on the first attempt.',
  },
  {
    name: 'Priya S.',
    text: 'Very flexible timings and personal attention. The refresher course helped me gain confidence after years of not driving.',
  },
  {
    name: 'Amit K.',
    text: 'Great experience learning from scratch. The instructors make you feel comfortable and build your skills step by step.',
  },
];

export default function HomePage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background */}
        <HeroVideo
          sources={[
            { src: '/video/demo-booking.mp4', type: 'video/mp4' },
            { src: '/video/hero-driving.mp4', type: 'video/mp4' },
            { src: '/video/hero-driving-school.mp4', type: 'video/mp4' },
          ]}
          poster="/images/vehicle-front.jpg"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/65 via-navy-900/50 to-navy-950/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-950/55 via-navy-950/15 to-transparent" />
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Aurora blobs */}
        <Aurora count={3} speed={20} className="opacity-60" />

        {/* 3D floating rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/[0.07]"
              style={{
                width: `${22 + i * 16}%`,
                aspectRatio: '1',
                top: `${-14 + i * 28}%`,
                left: `${58 + i * 12}%`,
                animation: `float3d ${13 + i * 5}s ease-in-out ${i * 2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Ambient glows */}
        <div className="absolute top-16 left-[8%] w-72 h-72 bg-accent-500/12 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 right-[6%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float [animation-delay:2s]" />

        <Parallax speed={0.12} className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 text-center">
            {/* Badge */}
            <Reveal from="down" delay={0}>
              <div className="inline-flex items-center gap-2.5 pill-glass mb-9">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400" />
                </span>
                <span className="text-[0.8125rem] font-semibold tracking-wide">
                  Trusted by 5,000+ Students in Kolhapur
                </span>
              </div>
            </Reveal>

            {/* Headline with 3D depth */}
            <div className="scene">
              <Reveal from="scale" delay={80}>
                <h1 className="headline-hero max-w-5xl mx-auto mb-7" style={{ transform: 'translateZ(0)' }}>
                  Learn to Drive with{' '}
                  <span className="text-gradient-accent inline-block animate-[floatY_4s_ease-in-out_infinite]">
                    Confidence
                  </span>
                </h1>
              </Reveal>
            </div>

            <Reveal delay={160}>
              <p className="lede-inverse max-w-2xl mx-auto mb-10 text-center !max-w-2xl font-medium">
                {settings?.aboutUs?.slice(0, 190) ||
                  'Professional driving lessons with certified instructors. From beginner courses to advanced techniques, we help you become a safe, confident driver.'}
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={240}>
              <div className="flex flex-wrap justify-center gap-4 mb-16">
                <MagneticButton className="btn-primary !px-8 !py-4 text-base">
                  <Link to="/book-demo" className="inline-flex items-center gap-2">
                    Book a Free Demo
                    <ArrowRight size={18} />
                  </Link>
                </MagneticButton>
                <MagneticButton
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                  strength={7}
                >
                  <Link to="/courses" className="inline-flex items-center gap-2.5">
                    <Play size={17} />
                    Explore Courses
                  </Link>
                </MagneticButton>
              </div>
            </Reveal>

            {/* Stats with 3D tilt */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto scene">
              {stats.map((s, i) => (
                <Reveal key={s.key} from="scale" delay={320 + i * 90}>
                  <TiltCard max={11} scale={1.04} className="h-full">
                    <div className="card-glass px-5 py-6 h-full text-center">
                      <p className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.03em] mb-1.5">
                        <Counter to={s.value} suffix={s.suffix} />
                      </p>
                      <p className="text-[0.8125rem] text-navy-200 font-medium">{s.label}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Parallax>

        {/* Scroll cue */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-navy-400">
            Scroll
          </span>
          <div className="w-6 h-10 border border-white/25 rounded-full flex justify-center pt-2 overflow-hidden">
            <div
              className="w-1 h-2.5 bg-accent-400/80 rounded-full"
              style={{ animation: 'scrollDot 1.8s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="section-y bg-white relative">
        <div className="container-premium relative">
          <Reveal from="down">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow">Why Choose Us</span>
              <h2 className="headline-section mt-4 mb-5">The Difference is Clear</h2>
              <div className="divider-gold mx-auto mb-5" />
              <p className="lede mx-auto text-center">
                We provide comprehensive driving education focused on safety, confidence, and real-world skill
                development.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scene">
            {highlights.map((item, i) => (
              <Reveal key={i} from="up" delay={i * 110}>
                <TiltCard max={12} scale={1.03} className="h-full">
                  <article className="card card-hover p-7 h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-0 bg-accent-gradient group-hover:w-full transition-all duration-500 ease-premium" />
                    <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ease-premium group-hover:bg-accent-gradient group-hover:shadow-accent">
                      <item.icon
                        size={26}
                        className="text-accent-600 group-hover:text-white transition-colors duration-500"
                      />
                    </div>
                    <h3 className="font-display text-lg font-bold text-navy-900 mb-2.5 tracking-[-0.015em]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-navy-600 leading-[1.7]">{item.desc}</p>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICES (3D FLIP) ================= */}
      <section className="section-y bg-navy-50 relative overflow-hidden">
        <Aurora count={2} speed={22} className="opacity-40" />

        <div className="container-premium relative">
          <Reveal from="down">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow">Our Services</span>
              <h2 className="headline-section mt-4 mb-5">Complete Driving Solutions</h2>
              <div className="divider-gold mx-auto mb-5" />
              <p className="lede mx-auto text-center">
                From professional driving lessons to vehicle documentation, we cover the complete journey.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scene-soft">
            {services.map((service, i) => (
              <Reveal key={i} from="up" delay={i * 130}>
                <div className="flip-scene h-full">
                  <div className="flip-inner h-full">
                    {/* Front */}
                    <Link
                      to={service.link}
                      className="flip-face card card-hover p-8 h-full relative overflow-hidden block"
                    >
                      <div
                        className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-[0.08] rounded-full transition-transform duration-700 group-hover:scale-150`}
                      />
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <service.icon size={25} className="text-white" strokeWidth={2.1} />
                      </div>
                      <h3 className="font-display text-xl font-bold text-navy-900 mb-2.5 tracking-[-0.015em] group-hover:text-accent-700 transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-sm text-navy-600 leading-[1.7] mb-5">{service.desc}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 group-hover:gap-2.5 transition-all duration-300">
                        Learn More
                        <ChevronRight size={15} />
                      </span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS (3D CAROUSEL) ================= */}
      <section className="section-y bg-premium-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-25" />
        <Aurora count={2} speed={24} className="opacity-30" />

        <div className="container-premium relative">
          <Reveal from="down">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="eyebrow !text-accent-400">Testimonials</span>
              <h2 className="headline-section mt-4 !text-white mb-5">What Our Students Say</h2>
              <div className="divider-gold mx-auto" />
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto scene">
            <Reveal from="scale">
              <TiltCard max={6} scale={1.01} lift={3}>
                <figure className="card-glass p-8 md:p-12 text-center">
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={20}
                        className="text-gold-400 fill-gold-400"
                        style={{ animation: `floatY ${3 + j * 0.25}s ease-in-out ${j * 0.12}s infinite` }}
                      />
                    ))}
                  </div>
                  <blockquote
                    key={current}
                    className="font-display text-xl md:text-2xl text-white leading-[1.55] font-medium tracking-[-0.01em] mb-8 animate-fade-up"
                  >
                    &ldquo;{testimonials[current].text}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center font-display font-bold text-white text-lg float-3d">
                      {testimonials[current].name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-[0.9375rem]">
                        {testimonials[current].name}
                      </p>
                      <p className="text-navy-400 text-[0.8125rem]">Verified Student</p>
                    </div>
                  </figcaption>
                </figure>
              </TiltCard>
            </Reveal>
          </div>

          <div className="flex justify-center gap-2.5 mt-8">
            {testimonials.map((t, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Show testimonial from ${t.name}`}
                className={`h-1.5 rounded-full transition-all duration-500 ease-premium ${
                  i === current ? 'w-9 bg-accent-500' : 'w-1.5 bg-white/25 hover:bg-white/45'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section-y bg-accent-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-20 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />

        <div className="container-premium relative text-center max-w-3xl mx-auto">
          <Reveal from="scale">
            <span className="eyebrow !text-white/80">Get Started Today</span>
            <h2 className="headline-section mt-4 !text-white mb-5">Ready to Start Learning?</h2>
            <p className="text-accent-50/90 text-lg leading-relaxed mb-10">
              Book a free demo lesson and take the first step towards becoming a confident driver.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="btn-light !px-8 !py-4 text-base">
                <Link to="/book-demo" className="inline-flex items-center gap-2">
                  Book a Free Demo
                  <ArrowRight size={18} />
                </Link>
              </MagneticButton>
              <MagneticButton
                className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                strength={7}
              >
                <a href={`tel:${settings?.phone || ''}`} className="inline-flex items-center gap-2.5">
                  <Phone size={18} />
                  Call {settings?.phone || '+91 8600740507'}
                </a>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CONTACT STRIP (3D TILT) ================= */}
      <section className="section-y bg-white">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scene">
            {[
              {
                icon: Phone,
                title: 'Call Us',
                value: settings?.phone || '+91 8600740507',
                href: `tel:${settings?.phone || ''}`,
                gradient: 'from-accent-500 to-accent-600',
              },
              {
                icon: MapPin,
                title: 'Visit Us',
                value: `${settings?.address || 'Shop 23, Near SAIPRASAD ENTERPRISE'}, ${
                  settings?.city || 'Kolhapur'
                }`,
                href: '/contact',
                gradient: 'from-navy-600 to-navy-800',
              },
              {
                icon: Clock,
                title: 'Working Hours',
                value: 'Mon – Sat: 9:00 AM – 6:00 PM',
                href: '/contact',
                gradient: 'from-gold-500 to-gold-600',
              },
            ].map((item, i) => (
              <Reveal key={i} from="up" delay={i * 120}>
                <TiltCard max={10} scale={1.03} className="h-full">
                  <Link
                    to={item.href.startsWith('/') ? item.href : '#'}
                    onClick={(e) => {
                      if (!item.href.startsWith('/')) {
                        e.preventDefault();
                        window.location.href = item.href;
                      }
                    }}
                    className="group text-center bg-navy-50/60 rounded-2xl p-8 h-full hover:bg-navy-50 transition-colors duration-500 block"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg transition-transform duration-500 ease-premium group-hover:scale-110 group-hover:-translate-y-1`}
                    >
                      <item.icon size={27} className="text-white" strokeWidth={2.1} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-navy-900 mb-2 tracking-[-0.015em]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{item.value}</p>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
