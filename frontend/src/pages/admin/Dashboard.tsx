import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  CreditCard,
  Clock,
  Plus,
  ArrowRight,
  CalendarDays,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../api/client';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Counter from '../../components/Counter';

interface Stats {
  totalStudents: number;
  activeStudents: number;
  todaysLessons: number;
  attendanceToday: { total: number; present: number; absent: number; late: number };
  pendingDemos: number;
  paymentsToday: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todaysLessons, setTodaysLessons] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [upcomingDemos, setUpcomingDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentStats, lessons, attendance, demoStats, upcoming, payments, enquiries] =
          await Promise.all([
            apiClient.get('/students/stats'),
            apiClient.get('/lessons/today'),
            apiClient.get('/attendance/today-summary'),
            apiClient.get('/demo-bookings/stats'),
            apiClient.get('/demo-bookings/upcoming'),
            apiClient.get('/payments/stats'),
            apiClient.get('/demo-bookings?limit=5&status=new'),
          ]);

        setStats({
          totalStudents: studentStats.data.totalStudents,
          activeStudents: studentStats.data.activeStudents,
          todaysLessons: lessons.data.length,
          attendanceToday: attendance.data,
          pendingDemos: demoStats.data.pending,
          paymentsToday: payments.data.today,
        });
        setTodaysLessons(lessons.data);
        setUpcomingDemos(upcoming.data);
        setRecentEnquiries(enquiries.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      gradient: 'from-navy-600 to-navy-800',
      link: '/admin/students',
    },
    {
      label: 'Active Students',
      value: stats?.activeStudents || 0,
      icon: UserCheck,
      gradient: 'from-accent-500 to-accent-600',
      link: '/admin/students?status=active',
    },
    {
      label: "Today's Lessons",
      value: stats?.todaysLessons || 0,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-700',
      link: '/admin/lessons',
    },
    {
      label: 'Present Today',
      value: stats?.attendanceToday?.present || 0,
      icon: ClipboardCheck,
      gradient: 'from-green-500 to-green-600',
      link: '/admin/attendance',
    },
    {
      label: 'Pending Demos',
      value: stats?.pendingDemos || 0,
      icon: MessageSquare,
      gradient: 'from-gold-500 to-gold-600',
      link: '/admin/demo-bookings',
    },
    {
      label: 'Revenue Today',
      value: `₹${(stats?.paymentsToday || 0).toLocaleString()}`,
      icon: CreditCard,
      gradient: 'from-teal-500 to-teal-600',
      link: '/admin/payments',
    },
  ];

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-7">
      {/* ---------- Welcome banner ---------- */}
      <div className="card-dark p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-accent-500/12 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={15} className="text-accent-400" />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-accent-400">
                Today at a Glance
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white tracking-[-0.02em]">
              {stats?.todaysLessons || 0} lessons scheduled today
            </h2>
            <p className="text-navy-300 text-[0.875rem] mt-1.5">
              {stats?.attendanceToday?.present || 0} students marked present ·{' '}
              {stats?.attendanceToday?.absent || 0} absent · {stats?.pendingDemos || 0} demos to follow up
            </p>
          </div>
          <Link to="/admin/attendance" className="btn-light btn-sm shrink-0">
            Mark Attendance
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ---------- Stat cards ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 scene">
        {cards.map((card, i) => (
          <Reveal key={i} from="up" delay={i * 60}>
            <TiltCard max={9} scale={1.03} lift={4} className="h-full">
              <Link to={card.link} className="group card card-hover p-5 h-full relative overflow-hidden block">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md transition-transform duration-500 ease-premium group-hover:scale-110 group-hover:-translate-y-0.5`}
                >
                  <card.icon size={19} className="text-white" strokeWidth={2.1} />
                </div>
                <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.025em]">
                  {typeof card.value === 'number' ? (
                    <Counter to={card.value} />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-[0.75rem] text-navy-500 mt-1 font-medium">{card.label}</p>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* ---------- Panels ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's schedule */}
        <Reveal from="up" delay={80}>
          <div className="card p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
              Today's Lesson Schedule
            </h3>
            <Link
              to="/admin/lessons"
              className="text-[0.8125rem] font-semibold text-accent-600 hover:text-accent-700 hover:gap-2 inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {todaysLessons.length === 0 ? (
            <div className="text-center py-10 text-navy-500">
              <CalendarDays size={34} className="mx-auto mb-3 text-navy-300" />
              <p className="text-sm">No lessons scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysLessons.slice(0, 5).map((lesson: any) => (
                <div
                  key={lesson._id}
                  className="flex items-center gap-3.5 p-3.5 bg-navy-50/70 rounded-xl hover:bg-accent-50/60 transition-colors"
                >
                  <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-[0.875rem] truncate">
                      {lesson.student?.name || 'Unknown'}
                    </p>
                    <p className="text-[0.75rem] text-navy-500 mt-0.5">
                      {lesson.startTime} · {lesson.course?.name || ''}
                    </p>
                  </div>
                  <span
                    className={`badge shrink-0 ${
                      statusStyles[lesson.status] || 'bg-navy-100 text-navy-700'
                    }`}
                  >
                    {lesson.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
          </div>
        </Reveal>

        {/* Recent enquiries */}
        <Reveal from="up" delay={160}>
          <div className="card p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
              Recent Enquiries
            </h3>
            <Link
              to="/admin/demo-bookings"
              className="text-[0.8125rem] font-semibold text-accent-600 hover:text-accent-700 hover:gap-2 inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="text-center py-10 text-navy-500">
              <MessageSquare size={34} className="mx-auto mb-3 text-navy-300" />
              <p className="text-sm">No new enquiries</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentEnquiries.map((enquiry: any) => (
                <div
                  key={enquiry._id}
                  className="flex items-center gap-3.5 p-3.5 bg-navy-50/70 rounded-xl hover:bg-gold-50/60 transition-colors"
                >
                  <div className="w-10 h-10 bg-gold-gradient rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-[0.875rem] truncate">
                      {enquiry.name}
                    </p>
                    <p className="text-[0.75rem] text-navy-500 mt-0.5">
                      {enquiry.mobile} · {enquiry.course}
                    </p>
                  </div>
                  <span className="badge bg-gold-50 text-gold-700 shrink-0">New</span>
                </div>
              ))}
            </div>
          )}
          </div>
        </Reveal>

        {/* Upcoming demos */}
        <Reveal from="up" delay={240}>
          <div className="card p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
              Upcoming Demo Sessions
            </h3>
            <Link
              to="/admin/demo-bookings"
              className="text-[0.8125rem] font-semibold text-accent-600 hover:text-accent-700 hover:gap-2 inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingDemos.length === 0 ? (
            <div className="text-center py-10 text-navy-500">
              <CalendarDays size={34} className="mx-auto mb-3 text-navy-300" />
              <p className="text-sm">No upcoming demos</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingDemos.slice(0, 5).map((demo: any) => (
                <div
                  key={demo._id}
                  className="flex items-center gap-3.5 p-3.5 bg-navy-50/70 rounded-xl hover:bg-accent-50/60 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarDays size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-[0.875rem] truncate">{demo.name}</p>
                    <p className="text-[0.75rem] text-navy-500 mt-0.5">
                      {demo.demoDate ? new Date(demo.demoDate).toLocaleDateString() : 'TBD'} ·{' '}
                      {demo.demoTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </Reveal>

        {/* Quick actions */}
        <Reveal from="up" delay={320}>
          <div className="card p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
              Quick Actions
            </h3>
            <TrendingUp size={17} className="text-navy-300" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Add Student', to: '/admin/students?new=true', icon: Users, tone: 'accent' },
              { label: 'Schedule Lesson', to: '/admin/lessons?new=true', icon: Calendar, tone: 'navy' },
              { label: 'Mark Attendance', to: '/admin/attendance', icon: ClipboardCheck, tone: 'purple' },
              { label: 'New Enquiry', to: '/admin/demo-bookings?new=true', icon: MessageSquare, tone: 'gold' },
            ].map((action) => {
              const tones: Record<string, string> = {
                accent: 'bg-accent-50 text-accent-700 hover:bg-accent-gradient hover:text-white',
                navy: 'bg-navy-50 text-navy-700 hover:bg-navy-900 hover:text-white',
                purple: 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white',
                gold: 'bg-gold-50 text-gold-700 hover:bg-gold-gradient hover:text-white',
              };
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex items-center gap-3 p-4 rounded-xl font-semibold text-[0.875rem] transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md ${tones[action.tone]}`}
                >
                  <action.icon size={18} className="shrink-0" />
                  {action.label}
                </Link>
              );
            })}
          </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
