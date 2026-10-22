import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CheckCircle,
  Car,
  Clock,
  Phone,
  Calendar,
  User,
  MessageSquare,
  ArrowRight,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useEffect } from 'react';
import { getPublicSettings } from '../../api/settings';
import type { BusinessSettings } from '../../api/settings';
import HeroVideo from '../../components/HeroVideo';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';
import MagneticButton from '../../components/MagneticButton';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  course: z.string().optional(),
  experience: z.enum(['beginner', 'some_experience', 'experienced']),
  contactMethod: z.enum(['phone', 'whatsapp', 'email']),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, 'You must consent to the privacy policy'),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { experience: 'beginner', contactMethod: 'phone', consent: false },
  });

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
    apiClient.get('/courses?active=true').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: BookingForm) => {
    setLoading(true);
    try {
      await apiClient.post('/demo-bookings', data);
      setSubmitted(true);
      reset();
      toast.success('Booking submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Success state ---------- */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 px-5 py-20">
        <div className="w-full max-w-lg">
          <div className="card p-10 text-center shadow-premium">
            <div className="w-20 h-20 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-7 shadow-accent">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-navy-900 mb-4 tracking-[-0.025em]">
              Booking Confirmed!
            </h2>
            <p className="text-navy-600 leading-[1.75] mb-9">
              Thank you for your interest! We have received your demo booking request. Our team will contact
              you shortly to confirm your slot.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-primary w-full !py-4">
              Book Another Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden text-white">
        <HeroVideo
          sources={[
            { src: '/video/demo-booking.mp4', type: 'video/mp4' },
            { src: '/video/hero-driving.mp4', type: 'video/mp4' },
          ]}
          poster="/images/classroom.jpg"
        />

        {/* Overlays — tuned so the video stays clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/60 via-navy-900/45 to-navy-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/75 via-navy-950/30 to-transparent" />
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute top-16 left-[10%] w-72 h-72 bg-accent-500/12 rounded-full blur-3xl animate-float" />

        <div className="container-premium relative py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 pill-glass mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400" />
              </span>
              <span className="text-[0.8125rem] font-semibold tracking-wide">
                Free Demo Lesson &mdash; No Commitment Required
              </span>
            </div>

            <h1 className="headline-hero mb-6">
              Book Your <span className="text-gradient-accent">Free Demo</span>
            </h1>

            <p className="lede-inverse mb-10 max-w-2xl">
              Experience our teaching approach with a free demo lesson. Watch our training in action and
              book your slot in seconds.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { icon: Car, label: 'Zero cost' },
                { icon: Clock, label: '30–45 minutes' },
                { icon: User, label: 'One-to-one' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                    <item.icon size={19} className="text-accent-400" />
                  </div>
                  <span className="text-navy-100 font-semibold text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <a href="#demo-form" className="btn-primary !px-8 !py-4 text-base">
              Fill the Form Below
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Form section ---------- */}
      <section className="section-y bg-gradient-to-br from-navy-50 to-white min-h-screen">
        <div className="container-premium">
          {/* Feature strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-16 scene">
            {[
              { icon: Car, title: 'Free Demo', desc: 'No charges at all' },
              { icon: Clock, title: '30–45 mins', desc: 'Typical duration' },
              { icon: Calendar, title: 'Flexible', desc: 'Pick your slot' },
              { icon: ShieldCheck, title: 'Expert Instructor', desc: 'One-to-one session' },
            ].map((item, i) => (
              <Reveal key={item.title} from="up" delay={i * 100}>
                <TiltCard max={11} scale={1.04} className="h-full">
                  <div className="group card card-hover p-6 text-center h-full">
                    <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 ease-premium group-hover:bg-accent-gradient group-hover:shadow-accent group-hover:-translate-y-1">
                      <item.icon
                        size={25}
                        className="text-accent-600 group-hover:text-white transition-colors duration-500"
                      />
                    </div>
                    <p className="font-display font-bold text-navy-900 text-[0.9375rem] mb-1 tracking-[-0.01em]">
                      {item.title}
                    </p>
                    <p className="text-[0.8125rem] text-navy-500">{item.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="demo-form">
            {/* Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="card p-8 md:p-10 shadow-premium"
              >
                <span className="eyebrow">Request Form</span>
                <h2 className="font-display text-2xl font-extrabold text-navy-900 mt-3 mb-8 tracking-[-0.02em]">
                  Request a Demo Lesson
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                      <input {...register('name')} className="input-field !pl-11" placeholder="Your full name" />
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
                    <label className="label">Email (Optional)</label>
                    <div className="relative">
                      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                      <input {...register('email')} className="input-field !pl-11" placeholder="your@email.com" />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Preferred Date</label>
                    <input type="date" {...register('preferredDate')} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label">Preferred Time</label>
                    <select {...register('preferredTime')} className="select-field">
                      <option value="">Select a time slot</option>
                      {timeSlots.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Preferred Course</label>
                    <select {...register('course')} className="select-field">
                      <option value="">Select a course</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label">Driving Experience *</label>
                    <select {...register('experience')} className="select-field">
                      <option value="beginner">Beginner (No experience)</option>
                      <option value="some_experience">Some Experience</option>
                      <option value="experienced">Experienced</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Preferred Contact Method *</label>
                    <select {...register('contactMethod')} className="select-field">
                      <option value="phone">Phone Call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="label">Additional Message</label>
                  <div className="relative">
                    <MessageSquare
                      size={17}
                      className="absolute left-3.5 top-3.5 text-navy-400 pointer-events-none"
                    />
                    <textarea
                      {...register('message')}
                      className="input-field !pl-11 min-h-[110px]"
                      placeholder="Any specific requirements or questions..."
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consent')}
                      className="mt-1 w-[18px] h-[18px] text-accent-600 rounded border-navy-300 focus:ring-accent-500 cursor-pointer"
                    />
                    <span className="text-sm text-navy-600 leading-relaxed">
                      I consent to the collection and processing of my personal data as described in the{' '}
                      <a href="/privacy" className="text-accent-600 font-semibold underline" target="_blank">
                        Privacy Policy
                      </a>
                      . *
                    </span>
                  </label>
                  {errors.consent && <p className="form-error">{errors.consent.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-base">
                  {loading ? 'Submitting…' : 'Submit Booking Request'}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <p className="text-[0.8125rem] text-navy-500 text-center mt-6">
                  Your request will be reviewed by our team. We will contact you to confirm your demo slot.
                </p>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="card-dark p-8">
                <h3 className="font-display text-lg font-bold mb-6 tracking-[-0.015em]">
                  What to Expect
                </h3>
                <ul className="space-y-4">
                  {[
                    'Meet your instructor',
                    'Vehicle familiarisation',
                    'Basic controls introduction',
                    'Q&A about courses & fees',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-navy-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-8">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-6 tracking-[-0.015em]">
                  Prefer to talk?
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${settings?.phone || ''}`}
                    className="flex items-center gap-3 p-3.5 bg-navy-50 rounded-xl hover:bg-accent-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={17} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.6875rem] text-navy-500 uppercase tracking-wide mb-0.5">Phone</p>
                      <p className="text-sm font-semibold text-navy-900 truncate">
                        {settings?.phone || '+91 8600740507'}
                      </p>
                    </div>
                  </a>
                  <a
                    href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '') || '918600740507'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 bg-navy-50 rounded-xl hover:bg-green-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare size={17} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.6875rem] text-navy-500 uppercase tracking-wide mb-0.5">
                        WhatsApp
                      </p>
                      <p className="text-sm font-semibold text-navy-900 truncate">
                        {settings?.whatsapp || '+91 8600740507'}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
