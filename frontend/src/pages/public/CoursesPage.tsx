import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, IndianRupee, ArrowRight, Award, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';
import MagneticButton from '../../components/MagneticButton';

interface Course {
  _id: string;
  name: string;
  description: string;
  durationWeeks: number;
  sessions: number;
  price: number;
  transmission: string;
  isActive: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/courses?active=true')
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-premium-gradient text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute -top-28 right-0 w-[30rem] h-[30rem] bg-accent-500/[0.09] rounded-full blur-3xl" />
        <div className="container-premium relative">
          <span className="eyebrow !text-accent-400">Our Courses</span>
          <h1 className="headline-hero mt-5 mb-6">Driving Courses</h1>
          <p className="lede-inverse max-w-2xl">
            Choose from our range of professional driving courses, designed for every skill level.
          </p>
        </div>
      </section>

      {/* ---------- Course list ---------- */}
      <section className="section-y bg-gradient-to-br from-navy-50 to-white min-h-screen">
        <div className="container-premium">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Award size={38} className="text-navy-400" />
              </div>
              <p className="lede mx-auto text-center">
                No courses are available at the moment. Please check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scene-soft">
              {courses.map((course, i) => (
                <Reveal key={course._id} from="up" delay={i * 110}>
                  <TiltCard max={9} scale={1.015} className="h-full">
                    <article className="card card-hover overflow-hidden flex flex-col h-full">
                      <div className="h-1 bg-accent-gradient" />
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <h2 className="font-display text-xl font-bold text-navy-900 tracking-[-0.015em] group-hover:text-accent-700 transition-colors duration-300 leading-snug">
                            {course.name}
                          </h2>
                          <span className="badge bg-accent-50 text-accent-700 capitalize shrink-0 mt-0.5">
                            {course.transmission}
                          </span>
                        </div>

                        <p className="text-sm text-navy-600 leading-[1.7] mb-7">{course.description}</p>

                        <div className="grid grid-cols-3 gap-3 mb-7">
                          {[
                            { icon: Clock, label: 'Duration', value: `${course.durationWeeks} weeks` },
                            { icon: Calendar, label: 'Sessions', value: `${course.sessions}` },
                            {
                              icon: IndianRupee,
                              label: 'Fee',
                              value: `₹${course.price.toLocaleString()}`,
                            },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="text-center p-4 bg-navy-50/70 rounded-xl border border-navy-100 transition-all duration-500 hover:bg-accent-50 hover:border-accent-200"
                            >
                              <s.icon size={19} className="text-accent-600 mx-auto mb-2" />
                              <p className="text-[0.6875rem] text-navy-500 uppercase tracking-wide mb-1">
                                {s.label}
                              </p>
                              <p className="font-display font-bold text-navy-900 text-sm">{s.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                          <Link to="/book-demo" className="btn-primary flex-1">
                            Book Demo
                            <ArrowRight size={16} />
                          </Link>
                          <Link to="/contact" className="btn-outline flex-1">
                            Enquire
                          </Link>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}

          {/* ---------- CTA ---------- */}
          <div className="mt-20 card-dark p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-20" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <span className="eyebrow !text-accent-400">Not Sure Where to Start?</span>
              <h2 className="headline-section mt-4 mb-5 !text-white">
                Not Sure Which Course is Right for You?
              </h2>
              <p className="lede-inverse mx-auto text-center mb-9">
                Book a free demo lesson and our instructors will help you choose the best course for your
                experience and goals.
              </p>
              <Link to="/book-demo" className="btn-primary !px-8 !py-4">
                Book a Free Demo
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
