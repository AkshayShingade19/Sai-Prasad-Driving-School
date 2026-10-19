import { Link } from 'react-router-dom';
import {
  Car,
  FileText,
  Shield,
  RefreshCw,
  Award,
  Wrench,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';

const services = [
  {
    icon: Car,
    title: 'Driving School & Practical Lessons',
    description:
      'Comprehensive driving lessons for beginners and experienced drivers. Learn with certified instructors in well-maintained vehicles.',
    requirements: ['Valid learning licence (for practical lessons)', 'Comfortable clothing and footwear'],
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: FileText,
    title: 'Learning Licence Assistance',
    description:
      'We assist with the learning licence application process — form filling, document preparation and test preparation.',
    requirements: ['Age proof (18+ years)', 'Address proof', 'Medical certificate (Form 1A)', 'Passport size photographs'],
    gradient: 'from-navy-600 to-navy-800',
  },
  {
    icon: Award,
    title: 'Driving Licence Assistance & Renewal',
    description:
      'Complete assistance with driving licence applications, renewals and duplicate licence requests.',
    requirements: ['Valid learning licence', 'Age proof', 'Address proof', 'Medical certificate', 'Passport size photographs'],
    gradient: 'from-gold-500 to-gold-600',
  },
  {
    icon: RefreshCw,
    title: 'Vehicle RC Transfer Assistance',
    description:
      'Assistance with vehicle Registration Certificate (RC) transfer when buying or selling a vehicle.',
    requirements: ['Original RC book', 'Insurance copy', 'ID proof of buyer and seller', 'Address proof', 'Sale agreement'],
    gradient: 'from-accent-600 to-accent-800',
  },
  {
    icon: Shield,
    title: 'Vehicle Insurance Assistance & Renewal',
    description:
      'Help with vehicle insurance applications, renewals and claims assistance.',
    requirements: ['RC book', 'Previous insurance copy (if renewal)', 'ID proof', 'Vehicle photos (for claims)'],
    gradient: 'from-gold-600 to-gold-800',
  },
  {
    icon: Wrench,
    title: 'PUC (Pollution Under Control) Assistance',
    description: 'Assistance with PUC certificate testing and renewal for your vehicle.',
    requirements: ['Vehicle registration number', 'Vehicle available for testing'],
    gradient: 'from-navy-500 to-navy-700',
  },
  {
    icon: FileText,
    title: 'Other Vehicle Documentation',
    description:
      'Assistance with NOC, hypothecation, RC address change and other vehicle-related documentation.',
    requirements: ['RC book', 'ID proof', 'Address proof', 'Supporting documents as required'],
    gradient: 'from-navy-700 to-navy-900',
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-28 right-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">Our Services</span>
          <h1 className="headline-hero mt-5 mb-6">Vehicle Services</h1>
          <p className="lede-inverse max-w-2xl">
            Comprehensive vehicle-related assistance covering documentation, transfer, insurance and compliance.
          </p>
        </div>
      </section>

      {/* ---------- Disclaimer ---------- */}
      <div className="bg-gold-50 border-b border-gold-200">
        <div className="container-premium py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-gold-600 mt-0.5 shrink-0" />
            <p className="text-[0.8125rem] text-gold-900 leading-relaxed">
              <strong>Disclaimer:</strong> We provide assistance with documentation and application processes.
              We do not issue government documents or certificates. All documents are issued by the relevant
              government authorities.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Services ---------- */}
      <section className="section-y bg-gradient-to-br from-navy-50 to-white min-h-screen">
        <Aurora count={2} speed={24} className="opacity-30" />

        <div className="container-premium relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">What We Offer</span>
            <h2 className="headline-section mt-4 mb-5">Complete Vehicle Solutions</h2>
            <div className="divider-gold mx-auto mb-5" />
            <p className="lede mx-auto text-center">
              From driving lessons to vehicle documentation, we handle it all under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scene-soft">
            {services.map((service, i) => (
              <Reveal key={service.title} from="up" delay={i * 95}>
                <TiltCard max={8} scale={1.015} className="h-full">
                  <article className="card card-hover overflow-hidden flex flex-col h-full">
                    <div className={`h-1 bg-gradient-to-r ${service.gradient}`} />
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-start gap-5 mb-6">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 ease-premium group-hover:scale-110 group-hover:rotate-6`}
                        >
                          <service.icon size={26} className="text-white" strokeWidth={2.1} />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-navy-900 mb-2 tracking-[-0.015em] group-hover:text-accent-700 transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-sm text-navy-600 leading-[1.7]">{service.description}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-[0.6875rem] font-bold text-navy-500 uppercase tracking-[0.1em] mb-3">
                          Requirements
                        </p>
                        <ul className="space-y-2">
                          {service.requirements.map((r) => (
                            <li
                              key={r}
                              className="flex items-center gap-2.5 text-sm text-navy-600 transition-transform duration-300 hover:translate-x-1"
                            >
                              <CheckCircle size={15} className="text-accent-600 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:gap-2.5 transition-all duration-300 mt-auto"
                      >
                        Enquire Now
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* ---------- CTA ---------- */}
          <div className="mt-20 card-dark p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-20" />
            <div className="absolute -bottom-24 -left-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <span className="eyebrow !text-accent-400">Get Started</span>
              <h2 className="headline-section mt-4 mb-5 !text-white">Need Assistance?</h2>
              <p className="lede-inverse mx-auto text-center mb-9">
                Contact us for any vehicle-related documentation assistance. Our team will guide you through
                the entire process.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary !px-8 !py-4">
                  Contact Us
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/book-demo"
                  className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 ease-premium"
                >
                  Book a Demo Lesson
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
