import { Database, Eye, UserCheck, Shield, Lock, AlertTriangle } from 'lucide-react';
import Reveal from '../../components/Reveal';

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          We collect personal information that you voluntarily provide when you:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Book a demo lesson</li>
          <li>Register as a student</li>
          <li>Submit a service request</li>
          <li>Contact us through our website</li>
        </ul>
        <p className="text-navy-600 leading-[1.8] mt-4">
          This may include your name, mobile number, email address, address, and any other information you
          choose to provide.
        </p>
      </>
    ),
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">We use the information we collect to:</p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Process and manage your bookings and enquiries</li>
          <li>Schedule and manage driving lessons</li>
          <li>Record attendance and track course progress</li>
          <li>Communicate with you about bookings and lessons</li>
          <li>Process payments and maintain financial records</li>
          <li>Improve our services and customer experience</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>
      </>
    ),
  },
  {
    icon: UserCheck,
    title: '3. Attendance Records',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          We maintain attendance records for all students, including dates, times and status of each lesson.
          These records are used for:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Tracking course progress</li>
          <li>Calculating attendance percentages</li>
          <li>Generating reports for students and instructors</li>
          <li>Maintaining training records required by transport authorities</li>
        </ul>
      </>
    ),
  },
  {
    icon: Shield,
    title: '4. Data Sharing',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          We do not sell, trade or rent your personal information to third parties. We may share your
          information only in the following circumstances:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>With government authorities as required by law (e.g. RTO for licence-related matters)</li>
          <li>
            With service providers who assist us in operating our business, under strict confidentiality
            agreements
          </li>
          <li>With your consent or at your direction</li>
        </ul>
      </>
    ),
  },
  {
    icon: Lock,
    title: '5. Data Security',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          We implement appropriate technical and organisational measures to protect your personal information
          against unauthorised access, alteration, disclosure or destruction. These include:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Secure password hashing</li>
          <li>JWT-based authentication for system access</li>
          <li>Role-based access control</li>
          <li>Regular security assessments</li>
          <li>Encrypted data transmission (HTTPS)</li>
        </ul>
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: '6. Data Retention',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          We retain your personal information for as long as necessary to fulfil the purposes for which it
          was collected, including:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Active student records: duration of the course plus 3 years</li>
          <li>Attendance records: as required by transport authorities (minimum 3 years)</li>
          <li>Financial records: as required by tax laws (minimum 7 years)</li>
          <li>Enquiry records: 1 year from last contact</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-28 right-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">Legal</span>
          <h1 className="headline-hero mt-5 mb-6">Privacy Policy</h1>
          <p className="lede-inverse">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="section-y bg-gradient-to-br from-navy-50 to-white min-h-screen">
        <div className="container-premium max-w-4xl">
          <div className="space-y-6">
            {sections.map((s, i) => (
              <Reveal key={s.title} from="up" delay={i * 90}>
              <article className="card p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center shadow-accent shrink-0">
                    <s.icon size={22} className="text-white" strokeWidth={2.1} />
                  </div>
                  <h2 className="font-display text-xl font-extrabold text-navy-900 tracking-[-0.02em]">
                    {s.title}
                  </h2>
                </div>
                <div className="pl-16">{s.body}</div>
              </article>
              </Reveal>
            ))}

            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6">
              <p className="text-[0.8125rem] text-gold-900 leading-relaxed">
                <strong>Note:</strong> Business-specific information marked with [TBD] requires owner
                confirmation and will be updated accordingly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
