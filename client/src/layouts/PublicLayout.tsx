import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, Clock, Car, ChevronRight, ArrowUpRight, UserRound, ShieldCheck } from 'lucide-react';
import { getPublicSettings } from '../api/settings';
import type { BusinessSettings } from '../api/settings';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/courses', label: 'Courses' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ---------- Top bar ---------- */}
      <div className="bg-navy-950 text-white text-[0.8125rem] relative z-50 border-b border-white/5">
        <div className="container-premium flex flex-wrap items-center justify-between gap-x-6 gap-y-1 h-10">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${settings?.phone || ''}`}
              className="flex items-center gap-2 text-navy-300 hover:text-accent-400 transition-colors duration-200"
            >
              <Phone size={13} className="text-accent-500" />
              <span className="font-medium">{settings?.phone || '+91 8600740507'}</span>
            </a>
            <a
              href={`mailto:${settings?.email || ''}`}
              className="hidden sm:flex items-center gap-2 text-navy-300 hover:text-accent-400 transition-colors duration-200"
            >
              <Mail size={13} className="text-accent-500" />
              <span className="font-medium">{settings?.email || 'info@drivingschool.com'}</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-navy-400">
            <Clock size={13} className="text-accent-500" />
            <span className="font-medium">Mon – Sat: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </div>

      {/* ---------- Header ---------- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-premium ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-md border-b border-navy-100/80'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="container-premium">
          <div className="flex items-center justify-between h-[4.5rem] md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-accent-gradient rounded-xl flex items-center justify-center shadow-accent group-hover:scale-105 group-hover:shadow-accent-lg transition-all duration-300 ease-premium">
                <Car size={26} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="leading-none">
                <span className="font-display font-extrabold text-[1.0625rem] md:text-xl text-navy-900 tracking-[-0.02em] block">
                  Sai Prasad
                </span>
                <span className="text-[0.6875rem] md:text-xs text-navy-500 font-semibold tracking-[0.14em] uppercase block mt-1">
                  Driving School
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-premium ${
                      active
                        ? 'text-accent-700 bg-accent-50'
                        : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {/* Student portal + admin links */}
              <Link
                to="/student/login"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-navy-600 hover:text-accent-700 hover:bg-accent-50 rounded-xl transition-all duration-300 ease-premium"
              >
                <UserRound size={15} className="text-accent-600" />
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-navy-600 hover:text-accent-700 hover:bg-accent-50 rounded-xl transition-all duration-300 ease-premium"
              >
                <ShieldCheck size={15} className="text-accent-600" />
                Admin
              </Link>

              <a
                href={`tel:${settings?.phone || ''}`}
                className="hidden 2xl:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:text-accent-700 hover:bg-accent-50 rounded-xl transition-all duration-300 ease-premium"
              >
                <Phone size={15} className="text-accent-600" />
                Call Now
              </a>
              <Link to="/book-demo" className="btn-primary btn-sm !px-5 !py-2.5 text-sm hidden sm:inline-flex">
                Book Free Demo
                <ArrowUpRight size={16} />
              </Link>
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden p-2.5 text-navy-800 hover:bg-navy-50 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-navy-100 bg-white shadow-lg">
            <div className="container-premium py-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === link.to
                      ? 'bg-accent-50 text-accent-700'
                      : 'text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/book-demo" className="btn-primary w-full mt-4">
                Book Free Demo
                <ArrowUpRight size={16} />
              </Link>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <Link
                  to="/student/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-accent-50 text-accent-700 font-semibold text-sm rounded-xl hover:bg-accent-100 transition-colors"
                >
                  <UserRound size={16} />
                  Student
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-navy-50 text-navy-700 font-semibold text-sm rounded-xl hover:bg-navy-100 transition-colors"
                >
                  <ShieldCheck size={16} />
                  Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Content ---------- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-[0.35]" />
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-accent-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gold-500/[0.05] blur-3xl" />

        <div className="container-premium relative py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
            {/* Brand */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center shadow-accent group-hover:scale-105 transition-transform duration-300 ease-premium">
                  <Car size={26} className="text-white" strokeWidth={2.2} />
                </div>
                <div className="leading-none">
                  <span className="font-display font-extrabold text-xl tracking-[-0.02em] block">
                    Sai Prasad
                  </span>
                  <span className="text-[0.6875rem] text-navy-400 font-semibold tracking-[0.14em] uppercase block mt-1.5">
                    Driving School
                  </span>
                </div>
              </Link>
              <p className="text-navy-300 text-sm leading-[1.75] mb-7 max-w-sm">
                {settings?.aboutUs?.slice(0, 170) ||
                  'Learn to drive with confidence. Professional driving lessons, licence assistance, and vehicle services.'}
              </p>
              <div className="flex gap-2.5">
                {['FB', 'IG', 'YT'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    aria-label={s}
                    className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[0.6875rem] font-bold text-navy-300 hover:bg-accent-600 hover:border-accent-600 hover:text-white transition-all duration-300 ease-premium"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-2">
              <h3 className="font-display font-bold text-[0.9375rem] mb-5 text-white">Explore</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-accent-400 transition-colors duration-200"
                    >
                      <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-display font-bold text-[0.9375rem] mb-5 text-white">Services</h3>
              <ul className="space-y-3">
                {['Driving Lessons', 'Licence Assistance', 'RC Transfer', 'Insurance', 'PUC Services'].map((s) => (
                  <li key={s}>
                    <Link
                      to="/services"
                      className="group inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-accent-400 transition-colors duration-200"
                    >
                      <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h3 className="font-display font-bold text-[0.9375rem] mb-5 text-white">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                    <MapPin size={17} className="text-accent-400" />
                  </div>
                  <p className="text-sm text-navy-400 leading-relaxed">
                    {settings?.address || 'Shop 23, Near SAIPRASAD ENTERPRISE'}
                    <br />
                    {settings?.city || 'Kolhapur'}, {settings?.state || 'Maharashtra'}{' '}
                    {settings?.pincode || '416001'}
                  </p>
                </div>
                <a href={`tel:${settings?.phone || ''}`} className="flex items-center gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-accent-600 group-hover:border-accent-600 transition-colors duration-300">
                    <Phone size={17} className="text-accent-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-navy-400 group-hover:text-accent-400 transition-colors font-medium">
                    {settings?.phone || '+91 8600740507'}
                  </span>
                </a>
                <a href={`mailto:${settings?.email || ''}`} className="flex items-center gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-accent-600 group-hover:border-accent-600 transition-colors duration-300">
                    <Mail size={17} className="text-accent-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-navy-400 group-hover:text-accent-400 transition-colors font-medium break-all">
                    {settings?.email || 'info@drivingschool.com'}
                  </span>
                </a>
              </div>
              <Link to="/book-demo" className="btn-light btn-sm !px-5 !py-2.5 text-sm mt-6">
                Book a Free Demo
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-navy-500 text-[0.8125rem]">
              &copy; {new Date().getFullYear()} Sai Prasad Driving School. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/student/login" className="text-navy-500 hover:text-accent-400 text-[0.8125rem] transition-colors">
                Student Portal
              </Link>
              <Link to="/admin/login" className="text-navy-500 hover:text-accent-400 text-[0.8125rem] transition-colors">
                Admin Login
              </Link>
              <Link to="/privacy" className="text-navy-500 hover:text-accent-400 text-[0.8125rem] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-navy-500 hover:text-accent-400 text-[0.8125rem] transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------- WhatsApp FAB ---------- */}
      <a
        href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '') || '918600740507'}?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20driving%20lessons`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-6px_rgba(37,211,102,0.55)] hover:scale-110 hover:shadow-[0_14px_38px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 ease-premium z-50"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
