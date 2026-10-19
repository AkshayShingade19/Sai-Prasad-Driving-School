import { Shield, Award, Users, Clock, CheckCircle, Target, Heart, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPublicSettings } from '../../api/settings';
import type { BusinessSettings } from '../../api/settings';
import OfficeGallery from '../../components/OfficeGallery';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';

const values = [
  { icon: Shield, title: 'Safety First', desc: 'Safety is at the core of every lesson we teach' },
  { icon: Heart, title: 'Student-Centered', desc: 'Personalised attention for every single student' },
  { icon: Clock, title: 'Flexibility', desc: 'Schedules that genuinely work for your lifestyle' },
  { icon: Award, title: 'Excellence', desc: 'Certified instructors with a proven track record' },
  { icon: Target, title: 'Real Results', desc: 'Focused on practical, real-world driving skills' },
];

const approach = [
  {
    step: '01',
    icon: Target,
    title: 'Assessment',
    desc: 'We begin by understanding your current skill level and learning goals through a thorough initial evaluation.',
  },
  {
    step: '02',
    icon: Users,
    title: 'Personalised Plan',
    desc: 'A customised lesson plan is created around your needs, availability and learning pace.',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Practice & Feedback',
    desc: 'Hands-on practice with continuous feedback to build skill, confidence and road awareness.',
  },
];

const certifications = [
  'Government-certified driving instructors',
  'Registered with the Regional Transport Office (RTO)',
  'Well-maintained, regularly inspected training vehicles',
  'Comprehensive insurance coverage',
  'Scheduled vehicle safety inspections',
  'First-aid certified staff on premises',
];

export default function AboutPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-32 right-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">About Us</span>
          <h1 className="headline-hero mt-5 mb-6 max-w-3xl">Our Story & Mission</h1>
          <p className="lede-inverse max-w-2xl">
            Learn about our driving school, our mission, and our commitment to creating safe, confident drivers.
          </p>
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section className="section-y bg-white">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <span className="eyebrow">Who We Are</span>
              <h2 className="headline-section mt-4 mb-6">A Decade of Excellence</h2>
              <p className="text-navy-600 leading-[1.8] mb-5 text-[1.0625rem]">
                {settings?.aboutUs ||
                  'Sai Prasad Driving School has been teaching safe driving skills for over 10 years. Our certified instructors provide patient, professional training for beginners and experienced drivers alike.'}
              </p>
              <p className="text-navy-600 leading-[1.8] mb-9">
                We believe learning to drive should be a positive, confidence-building experience. Our instructors
                are trained to work with students of every age and skill level, ensuring personalised attention
                in a supportive, encouraging environment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Government Certified',
                  'Safety-First Approach',
                  '5,000+ Students Trained',
                  'Award-Winning Service',
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 p-3.5 bg-accent-50/70 rounded-xl border border-accent-100/60"
                  >
                    <CheckCircle size={17} className="text-accent-600 shrink-0" />
                    <span className="text-sm font-semibold text-navy-800">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Values card */}
            <div className="bg-navy-50/70 rounded-3xl p-8 md:p-10 border border-navy-100">
              <h3 className="font-display text-xl font-bold text-navy-900 mb-8 tracking-[-0.015em]">
                Our Core Values
              </h3>
              <div className="space-y-6">
                {values.map((v, i) => (
                  <Reveal key={v.title} from="right" delay={i * 90}>
                    <div className="group flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center shrink-0 shadow-accent transition-all duration-500 ease-premium group-hover:scale-110 group-hover:shadow-accent-lg group-hover:rotate-6">
                        <v.icon size={21} className="text-white" strokeWidth={2.1} />
                      </div>
                      <div className="pt-0.5">
                        <h4 className="font-display font-bold text-navy-900 mb-1 tracking-[-0.01em]">
                          {v.title}
                        </h4>
                        <p className="text-sm text-navy-600 leading-[1.65]">{v.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Approach ---------- */}
      <section className="section-y bg-navy-50 relative overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-accent-100/50 rounded-full blur-3xl" />
        <div className="container-premium relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Our Approach</span>
            <h2 className="headline-section mt-4 mb-5">How We Teach</h2>
            <div className="divider-gold mx-auto mb-5" />
            <p className="lede mx-auto text-center">
              A structured, proven approach to building confident, capable drivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scene-soft">
            {approach.map((item, i) => (
              <Reveal key={item.step} from="up" delay={i * 130}>
                <TiltCard max={11} scale={1.03} className="h-full">
                  <article className="card card-hover p-8 h-full relative overflow-hidden">
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center font-display font-bold text-white text-sm shadow-accent">
                      {item.step}
                    </div>
                    <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ease-premium group-hover:bg-accent-gradient group-hover:shadow-accent">
                      <item.icon
                        size={30}
                        className="text-accent-600 group-hover:text-white transition-colors duration-500"
                      />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 mb-3 tracking-[-0.015em]">
                      {item.title}
                    </h3>
                    <p className="text-navy-600 leading-[1.7]">{item.desc}</p>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Video ---------- */}
      <section className="section-y bg-premium-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="container-premium relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow !text-accent-400">See It In Action</span>
            <h2 className="headline-section mt-4 mb-5 !text-white">Learning to Drive, Real Roads</h2>
            <div className="divider-gold mx-auto" />
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-premium border border-white/10">
            <video
              className="w-full aspect-video object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              poster="/images/classroom.jpg"
            >
              <source src="/video/hero-driving-school.mp4" type="video/mp4" />
              <source src="/video/hero-driving.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-navy-950/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section className="section-y bg-gradient-to-br from-navy-50 to-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-100/50 rounded-full blur-3xl" />
        <div className="container-premium relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Gallery</span>
            <h2 className="headline-section mt-4 mb-5">Inside Our Driving School</h2>
            <div className="divider-gold mx-auto mb-5" />
            <p className="lede mx-auto text-center">
              A look inside our office, classroom, lecture hall, and training vehicles.
            </p>
          </div>
          <OfficeGallery />
        </div>
      </section>

      {/* ---------- Certifications ---------- */}
      <section className="section-y bg-white">
        <div className="container-premium">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Credentials</span>
            <h2 className="headline-section mt-4 mb-5">Certifications & Standards</h2>
            <div className="divider-gold mx-auto mb-5" />
            <p className="lede mx-auto text-center">
              We hold ourselves to the highest standards of training and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {certifications.map((c, i) => (
              <Reveal key={c} from="up" delay={i * 70}>
                <div className="flex items-center gap-4 p-5 bg-navy-50/60 rounded-xl border border-navy-100 hover:border-accent-200 hover:bg-accent-50/40 hover:translate-x-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle size={19} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-navy-800 leading-snug">{c}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
