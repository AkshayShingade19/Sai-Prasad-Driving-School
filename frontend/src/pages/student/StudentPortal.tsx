import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Car,
  LogOut,
  Calendar,
  ClipboardCheck,
  BookOpen,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  KeyRound,
  TrendingUp,
  UserRound,
  Phone,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import studentClient from '../../api/studentClient';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Counter from '../../components/Counter';
import Aurora from '../../components/Aurora';
import { formatDisplayDate, formatDisplayTime, isToday, businessDate } from '../../utils/date';

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  present: { label: 'Present', cls: 'bg-green-50 text-green-700', icon: CheckCircle },
  absent: { label: 'Absent', cls: 'bg-red-50 text-red-700', icon: XCircle },
  late: { label: 'Late', cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
  excused: { label: 'Excused', cls: 'bg-blue-50 text-blue-700', icon: AlertCircle },
  rescheduled: { label: 'Rescheduled', cls: 'bg-purple-50 text-purple-700', icon: RefreshCw },
};

export default function StudentPortal() {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'attendance' | 'lessons' | 'payments' | 'password'>('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dash, att, les, pay] = await Promise.all([
        studentClient.get('/student-portal/dashboard'),
        studentClient.get('/student-portal/attendance'),
        studentClient.get('/student-portal/lessons'),
        studentClient.get('/student-portal/payments'),
      ]);
      setDashboard(dash.data);
      setAttendance(att.data);
      setLessons(les.data);
      setPayments(pay.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to load your data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await studentClient.post('/student-portal/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
      </div>
    );
  }

  const profile = dashboard?.profile;
  const summary = dashboard?.summary;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'password', label: 'Password', icon: KeyRound },
  ] as const;

  return (
    <div className="min-h-screen bg-navy-50">
      {/* ---------- Header ---------- */}
      <header className="bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-25" />
        <Aurora count={2} speed={26} className="opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-accent-gradient rounded-lg flex items-center justify-center shadow-accent group-hover:scale-105 transition-transform">
                <Car size={19} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="leading-none hidden sm:block">
                <span className="font-display font-extrabold text-[0.9375rem] tracking-[-0.02em] block">
                  Sai Prasad
                </span>
                <span className="text-[0.5625rem] text-navy-400 font-bold tracking-[0.16em] uppercase block mt-1">
                  Student Portal
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-[0.8125rem] font-semibold text-navy-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ---------- Profile card ---------- */}
        <Reveal from="down">
          <div className="card p-6 md:p-7 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-gradient rounded-2xl flex items-center justify-center shrink-0 shadow-accent">
                  <UserRound size={26} className="text-white" strokeWidth={2.1} />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">
                    {profile?.name}
                  </h1>
                  <p className="text-[0.8125rem] text-navy-500 mt-1">
                    {profile?.studentId}
                    {profile?.course?.name ? ` · ${profile.course.name}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfile((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-navy-50 rounded-xl text-[0.8125rem] font-semibold text-navy-700 hover:bg-navy-100 transition-colors"
              >
                My Details
                {showProfile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showProfile && (
              <div className="mt-6 pt-6 border-t border-navy-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Email', value: profile?.email || '—' },
                  { label: 'Mobile', value: profile?.mobile || '—' },
                  { label: 'Instructor', value: profile?.instructor?.name || '—' },
                  {
                    label: 'Course Start',
                    value: profile?.startDate
                      ? formatDisplayDate(profile.startDate)
                      : '—',
                  },
                  {
                    label: 'Planned End',
                    value: profile?.plannedEndDate
                      ? formatDisplayDate(profile.plannedEndDate)
                      : '—',
                  },
                  { label: 'Transmission', value: profile?.transmission || 'manual' },
                  { label: 'Status', value: profile?.status || 'active' },
                  {
                    label: 'Course Fee',
                    value: `₹${(profile?.courseFee || 0).toLocaleString()}`,
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[0.6875rem] font-bold text-navy-500 uppercase tracking-[0.1em] mb-1">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold text-navy-900 capitalize">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* ---------- Tabs ---------- */}
        <div className="border-b border-navy-200 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
                  tab === t.id
                    ? 'border-accent-600 text-accent-700'
                    : 'border-transparent text-navy-500 hover:text-navy-800'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- OVERVIEW ---------- */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 scene">
              {[
                {
                  label: 'Attendance',
                  value: summary?.attendancePercentage || 0,
                  suffix: '%',
                  icon: ClipboardCheck,
                  gradient: 'from-accent-500 to-accent-600',
                },
                {
                  label: 'Lessons Attended',
                  value: (summary?.present || 0) + (summary?.late || 0),
                  suffix: '',
                  icon: CheckCircle,
                  gradient: 'from-green-500 to-green-600',
                },
                {
                  label: 'Lessons Remaining',
                  value: summary?.lessonsRemaining || 0,
                  suffix: '',
                  icon: BookOpen,
                  gradient: 'from-navy-600 to-navy-800',
                },
                {
                  label: 'Absences',
                  value: summary?.absent || 0,
                  suffix: '',
                  icon: XCircle,
                  gradient: 'from-red-500 to-red-600',
                },
              ].map((c, i) => (
                <Reveal key={c.label} from="up" delay={i * 80}>
                  <TiltCard max={9} scale={1.03} className="h-full">
                    <div className="card card-hover p-5 h-full">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md`}
                      >
                        <c.icon size={19} className="text-white" strokeWidth={2.1} />
                      </div>
                      <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.025em]">
                        <Counter to={c.value} suffix={c.suffix} />
                      </p>
                      <p className="text-[0.75rem] text-navy-500 mt-1 font-medium">{c.label}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            {/* Upcoming lessons */}
            <Reveal from="up" delay={120}>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em] mb-6">
                  Upcoming Lessons
                </h3>
                {dashboard?.upcomingLessons?.length ? (
                  <div className="space-y-2.5">
                    {dashboard.upcomingLessons.map((l: any) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-3.5 p-3.5 bg-navy-50/70 rounded-xl hover:bg-accent-50/60 transition-colors"
                      >
                        <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shrink-0">
                          <Calendar size={17} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-900 text-[0.875rem]">
                            {'businessDate(l.date)'}
                            {l.startTime ? ` · ${l.startTime}` : ''}
                          </p>
                          <p className="text-[0.75rem] text-navy-500 mt-0.5">
                            {l.course}
                            {l.instructor ? ` · ${l.instructor}` : ''}
                          </p>
                        </div>
                        <span className="badge bg-blue-50 text-blue-700 shrink-0 capitalize">
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-navy-500">
                    <Calendar size={32} className="mx-auto mb-3 text-navy-300" />
                    <p className="text-sm">No upcoming lessons scheduled</p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}

        {/* ---------- ATTENDANCE ---------- */}
        {tab === 'attendance' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'totalScheduled', label: 'Scheduled', cls: 'text-navy-900' },
                { key: 'present', label: 'Present', cls: 'text-green-600' },
                { key: 'late', label: 'Late', cls: 'text-yellow-600' },
                { key: 'absent', label: 'Absent', cls: 'text-red-600' },
                { key: 'excused', label: 'Excused', cls: 'text-blue-600' },
                { key: 'attendancePercentage', label: 'Attendance %', cls: 'text-accent-600' },
              ].map((s, i) => (
                <Reveal key={s.key} from="scale" delay={i * 60}>
                  <div className="card p-5 text-center">
                    <p className={`font-display text-2xl font-extrabold ${s.cls} tracking-[-0.025em]`}>
                      {summary?.[s.key] ?? 0}
                      {s.key === 'attendancePercentage' ? '%' : ''}
                    </p>
                    <p className="text-[0.75rem] text-navy-500 mt-1 font-medium">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* History table */}
            <Reveal from="up" delay={100}>
              <div className="card !p-0 overflow-hidden shadow-md">
                <div className="px-6 py-4 border-b border-navy-100">
                  <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
                    My Attendance History
                  </h3>
                </div>
                {attendance?.records?.length ? (
                  <div className="overflow-x-auto">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Instructor</th>
                          <th>Status</th>
                          <th>Check-in</th>
                          <th>Duration</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.records.map((r: any) => {
                          const meta = STATUS_META[r.status];
                          const Icon = meta?.icon || AlertCircle;
                          return (
                            <tr key={r.id}>
                              <td className="text-[0.8125rem]">
                                {formatDisplayDate(r.date)}
                              </td>
                              <td className="text-[0.8125rem]">{r.scheduledTime}</td>
                              <td className="text-[0.8125rem]">{r.instructor || '—'}</td>
                              <td>
                                <span className={`badge ${meta?.cls || 'bg-navy-100 text-navy-700'}`}>
                                  <Icon size={12} />
                                  {meta?.label || r.status}
                                </span>
                              </td>
                              <td className="text-[0.8125rem]">
                                {r.checkInTime
                                  ? formatDisplayTime(r.checkInTime)
                                  : '—'}
                              </td>
                              <td className="text-[0.8125rem]">
                                {r.duration ? `${r.duration} min` : '—'}
                              </td>
                              <td className="text-[0.8125rem] text-navy-500 max-w-[200px] truncate">
                                {r.remarks || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-14 text-navy-500">
                    <ClipboardCheck size={40} className="mx-auto mb-3 text-navy-300" />
                    <p className="font-semibold text-navy-700">No attendance records yet</p>
                    <p className="text-sm mt-1">Records appear once your instructor marks them</p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}

        {/* ---------- LESSONS ---------- */}
        {tab === 'lessons' && (
          <Reveal from="up">
            <div className="card !p-0 overflow-hidden shadow-md">
              <div className="px-6 py-4 border-b border-navy-100">
                <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
                  My Lessons
                </h3>
              </div>
              {lessons.length ? (
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Course</th>
                        <th>Instructor</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((l: any) => (
                        <tr key={l.id}>
                          <td className="text-[0.8125rem]">
                            {formatDisplayDate(l.date)}
                          </td>
                          <td className="text-[0.8125rem]">{l.startTime}</td>
                          <td className="text-[0.8125rem]">{l.course || '—'}</td>
                          <td className="text-[0.8125rem]">{l.instructor || '—'}</td>
                          <td className="text-[0.8125rem]">{l.duration} min</td>
                          <td>
                            <span
                              className={`badge capitalize ${
                                l.status === 'completed'
                                  ? 'bg-green-50 text-green-700'
                                  : l.status === 'cancelled'
                                    ? 'bg-red-50 text-red-700'
                                    : l.status === 'rescheduled'
                                      ? 'bg-purple-50 text-purple-700'
                                      : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {l.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-14 text-navy-500">
                  <BookOpen size={40} className="mx-auto mb-3 text-navy-300" />
                  <p className="font-semibold text-navy-700">No lessons scheduled yet</p>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ---------- PAYMENTS ---------- */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 scene">
              {[
                { label: 'Course Fee', value: payments?.courseFee || 0, cls: 'text-navy-900' },
                { label: 'Total Paid', value: payments?.totalPaid || 0, cls: 'text-green-600' },
                {
                  label: 'Balance Due',
                  value: Math.max(0, payments?.balance || 0),
                  cls: (payments?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600',
                },
              ].map((c, i) => (
                <Reveal key={c.label} from="up" delay={i * 80}>
                  <TiltCard max={8} scale={1.02} className="h-full">
                    <div className="card card-hover p-6 h-full">
                      <p className="text-[0.6875rem] font-bold text-navy-500 uppercase tracking-[0.1em] mb-2">
                        {c.label}
                      </p>
                      <p className={`font-display text-3xl font-extrabold ${c.cls} tracking-[-0.025em]`}>
                        <Counter to={c.value} prefix="₹" />
                      </p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            <Reveal from="up" delay={140}>
              <div className="card !p-0 overflow-hidden shadow-md">
                <div className="px-6 py-4 border-b border-navy-100">
                  <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em]">
                    Payment History
                  </h3>
                </div>
                {payments?.payments?.length ? (
                  <div className="overflow-x-auto">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.payments.map((p: any) => (
                          <tr key={p.id}>
                            <td className="text-[0.8125rem]">
                              {formatDisplayDate(p.paymentDate)}
                            </td>
                            <td className="text-[0.8125rem] font-semibold text-green-600">
                              ₹{p.amount.toLocaleString()}
                            </td>
                            <td className="text-[0.8125rem] capitalize">
                              {String(p.method).replace('_', ' ')}
                            </td>
                            <td className="text-[0.8125rem]">{p.transactionRef || '—'}</td>
                            <td className="text-[0.8125rem] text-navy-500">{p.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-14 text-navy-500">
                    <CreditCard size={40} className="mx-auto mb-3 text-navy-300" />
                    <p className="font-semibold text-navy-700">No payments recorded</p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}

        {/* ---------- PASSWORD ---------- */}
        {tab === 'password' && (
          <Reveal from="up">
            <div className="card p-6 md:p-8 max-w-lg">
              <h3 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em] mb-2">
                Change Password
              </h3>
              <p className="text-[0.8125rem] text-navy-500 mb-7">
                Use a strong password you do not use anywhere else.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    className="input-field"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="input-field"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" disabled={pwLoading} className="btn-primary w-full">
                  {pwLoading ? 'Updating…' : 'Update Password'}
                  {!pwLoading && <ArrowRight size={17} />}
                </button>
              </form>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
