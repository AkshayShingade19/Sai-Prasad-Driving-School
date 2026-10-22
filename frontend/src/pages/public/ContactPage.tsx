import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, User, Navigation } from 'lucide-react';
import { useEffect } from 'react';
import { getPublicSettings } from '../../api/settings';
import type { BusinessSettings } from '../../api/settings';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.boolean().refine((v) => v === true, 'You must consent'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { consent: false },
  });

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      await fetch('/api/demo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          course: data.subject,
          experience: 'beginner',
          contactMethod: 'phone',
        }),
      });
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-28 left-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">Contact Us</span>
          <h1 className="headline-hero mt-5 mb-6">Get in Touch</h1>
          <p className="lede-inverse max-w-2xl">
            Reach out for any enquiry, feedback, or assistance — we are happy to help.
          </p>
        </div>
      </section>

      <section className="section-y bg-gradient-to-br from-navy-50 to-white min-h-screen">
        <div className="container-premium">
          {/* ---------- Map ---------- */}
          {settings?.googleMapsEmbedUrl && (
            <div className="mb-20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="eyebrow">Find Us</span>
                <h2 className="headline-section mt-4 mb-4">Our Location</h2>
                <div className="divider-gold mx-auto" />
              </div>
              <div className="card overflow-hidden shadow-premium">
                <iframe
                  src={settings.googleMapsEmbedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Sai Prasad Driving School location"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ---------- Contact info ---------- */}
            <div className="space-y-6">
              <Reveal from="right">
                <div className="card p-8">
                  <h3 className="font-display text-lg font-bold text-navy-900 mb-7 tracking-[-0.015em]">
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                  {[
                    {
                      icon: Phone,
                      label: 'Phone',
                      value: settings?.phone || '+91 8600740507',
                      href: `tel:${settings?.phone || ''}`,
                      gradient: 'from-accent-500 to-accent-600',
                    },
                    {
                      icon: MessageCircle,
                      label: 'WhatsApp',
                      value: settings?.whatsapp || '+91 8600740507',
                      href: `https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '') || '918600740507'}`,
                      gradient: 'from-green-500 to-green-600',
                    },
                    {
                      icon: Mail,
                      label: 'Email',
                      value: settings?.email || 'info@drivingschool.com',
                      href: `mailto:${settings?.email || ''}`,
                      gradient: 'from-navy-600 to-navy-800',
                    },
                    {
                      icon: MapPin,
                      label: 'Address',
                      value: `${settings?.address || 'Shop 23, Near SAIPRASAD ENTERPRISE'}, ${
                        settings?.city || 'Kolhapur'
                      }, ${settings?.state || 'Maharashtra'} ${settings?.pincode || '416001'}`,
                      href: '/contact',
                      gradient: 'from-gold-500 to-gold-600',
                    },
                    {
                      icon: Clock,
                      label: 'Working Hours',
                      value: 'Mon – Sat: 9:00 AM – 6:00 PM · Sunday Closed',
                      href: '/contact',
                      gradient: 'from-navy-500 to-navy-700',
                    },
                  ].map((item, i) => {
                    const content = (
                      <>
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500 ease-premium`}
                        >
                          <item.icon size={21} className="text-white" strokeWidth={2.1} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.6875rem] font-bold text-navy-500 uppercase tracking-[0.1em] mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-navy-800 leading-relaxed break-words">
                            {item.value}
                          </p>
                        </div>
                      </>
                    );
                    return item.href.startsWith('http') || item.href.startsWith('tel') || item.href.startsWith('mailto') ? (
                      <a
                        key={i}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group flex items-start gap-4"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={i} className="group flex items-start gap-4">
                        {content}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ---------- Form ---------- */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="card p-8 md:p-10 shadow-premium">
                <span className="eyebrow">Send a Message</span>
                <h3 className="font-display text-2xl font-extrabold text-navy-900 mt-3 mb-8 tracking-[-0.02em]">
                  How can we help?
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                      <input {...register('name')} className="input-field !pl-11" placeholder="Your name" />
                    </div>
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number *</label>
                    <div className="relative">
                      <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                      <input {...register('mobile')} className="input-field !pl-11" placeholder="9876543210" />
                    </div>
                    {errors.mobile && <p className="form-error">{errors.mobile.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email')} className="input-field" placeholder="your@email.com" />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <input {...register('subject')} className="input-field" placeholder="How can we help?" />
                    {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="label">Message *</label>
                  <textarea
                    {...register('message')}
                    className="input-field min-h-[150px]"
                    placeholder="Tell us what you need help with..."
                  />
                  {errors.message && <p className="form-error">{errors.message.message}</p>}
                </div>

                <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consent')}
                      className="mt-1 w-[18px] h-[18px] text-accent-600 rounded border-navy-300 focus:ring-accent-500 cursor-pointer"
                    />
                    <span className="text-sm text-navy-600 leading-relaxed">
                      I consent to the collection and processing of my personal data. *
                    </span>
                  </label>
                  {errors.consent && <p className="form-error">{errors.consent.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-base">
                  <Send size={18} />
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
