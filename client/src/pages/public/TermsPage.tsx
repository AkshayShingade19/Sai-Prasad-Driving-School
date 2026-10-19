import { BookOpen, FileText, CreditCard, Users, AlertTriangle, Phone } from 'lucide-react';
import Reveal from '../../components/Reveal';

const sections = [
  {
    icon: BookOpen,
    title: '1. Services',
    body: (
      <>
        <p className="text-navy-600 leading-[1.8] mb-4">
          Sai Prasad Driving School provides driving lessons, licence assistance and vehicle-related
          documentation assistance. Our services include:
        </p>
        <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
          <li>Practical driving training with certified instructors</li>
          <li>Learning licence and driving licence application assistance</li>
          <li>Vehicle RC transfer, insurance and PUC assistance</li>
          <li>Other vehicle-related documentation services</li>
        </ul>
        <p className="text-navy-600 leading-[1.8] mt-4">
          We provide assistance with documentation and application processes. We do not issue government
          documents or certificates. All documents are issued by the respective government authorities.
        </p>
      </>
    ),
  },
  {
    icon: FileText,
    title: '2. Bookings & Scheduling',
    body: (
      <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
        <li>Demo bookings are subject to availability and confirmation by our team</li>
        <li>Lessons are scheduled based on instructor and vehicle availability</li>
        <li>Students must arrive on time for scheduled lessons</li>
        <li>Lessons may be rescheduled or cancelled with prior notice</li>
        <li>Recurring lessons follow the agreed schedule unless modified</li>
      </ul>
    ),
  },
  {
    icon: CreditCard,
    title: '3. Fees & Payments',
    body: (
      <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
        <li>Course fees are as agreed at the time of enrolment</li>
        <li>Payments can be made via cash, UPI, bank transfer or other accepted methods</li>
        <li>
          Fees are non-refundable once the course has commenced, except as required by law
        </li>
        <li>Outstanding balances must be cleared before course completion certificates are issued</li>
        <li>Receipts will be provided for all payments recorded in our system</li>
      </ul>
    ),
  },
  {
    icon: Users,
    title: '4. Attendance',
    body: (
      <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
        <li>Regular attendance is required for course completion</li>
        <li>Attendance is recorded for every scheduled lesson</li>
        <li>Excessive absences may affect course completion timelines</li>
        <li>Students should inform instructors in advance if unable to attend</li>
        <li>Cancelled or rescheduled lessons are not counted as absences</li>
      </ul>
    ),
  },
  {
    icon: AlertTriangle,
    title: '5. Student Responsibilities',
    body: (
      <ul className="space-y-2.5 text-navy-600 list-disc pl-5 marker:text-accent-500">
        <li>Provide accurate information during registration</li>
        <li>Follow instructor guidance and safety instructions</li>
        <li>A valid learning licence is required for practical lessons</li>
        <li>Respect instructors, staff and other students</li>
        <li>Do not use training vehicles for unauthorised purposes</li>
      </ul>
    ),
  },
  {
    icon: FileText,
    title: '6. Limitation of Liability',
    body: (
      <div className="space-y-4 text-navy-600 leading-[1.8]">
        <p>
          While we strive to provide the highest quality training, we cannot guarantee specific outcomes
          including passing driving tests. Test outcomes depend on various factors including individual
          performance and examiner assessment.
        </p>
        <p>
          We are not liable for incidents occurring outside of scheduled lessons or unauthorised use of
          training vehicles.
        </p>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-28 left-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">Legal</span>
          <h1 className="headline-hero mt-5 mb-6">Terms & Conditions</h1>
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
                  <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center shadow-md shrink-0">
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

            <div className="card-dark p-8 md:p-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center shadow-accent shrink-0">
                  <Phone size={22} className="text-white" />
                </div>
                <h2 className="font-display text-xl font-extrabold tracking-[-0.02em]">Contact Us</h2>
              </div>
              <p className="text-navy-200 mb-5">
                For any questions regarding these terms, please contact us:
              </p>
              <div className="space-y-2 text-navy-200 text-sm">
                <p>
                  <strong className="text-white">Email:</strong> info@saiprasaddrivingschool.com
                </p>
                <p>
                  <strong className="text-white">Phone:</strong> +91 8600740507
                </p>
                <p>
                  <strong className="text-white">Address:</strong> Shop 23, Near SAIPRASAD ENTERPRISE,
                  Kolhapur, Maharashtra 416001
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
