import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  CreditCard,
  ClipboardCheck,
} from 'lucide-react';
import apiClient from '../../api/client';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  emergencyContact: string;
  status: string;
  course: { name: string; price: number; sessions: number };
  instructor: { name: string; phone: string };
  startDate: string;
  plannedEndDate: string;
  plannedLessons: number;
  completedLessons: number;
  courseFee: number;
  amountPaid: number;
  transmission: string;
  notes: string;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  scheduledTime: string;
  status: string;
  checkInTime: string;
  duration: number;
  remarks: string;
  instructor: { name: string };
  course: { name: string };
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, attendanceRes, paymentsRes, balanceRes, lessonsRes] = await Promise.all([
          apiClient.get(`/students/${id}`),
          apiClient.get(`/attendance/student/${id}`),
          apiClient.get(`/payments/student/${id}`),
          apiClient.get(`/payments/student/${id}/balance`),
          apiClient.get(`/lessons/student/${id}`),
        ]);
        setStudent(studentRes.data);
        setAttendance(attendanceRes.data.records || []);
        setAttendanceSummary(attendanceRes.data.summary || null);
        setPayments(paymentsRes.data.payments || []);
        setBalance(balanceRes.data);
        setLessons(lessonsRes.data || []);
      } catch (error) {
        console.error('Failed to load student data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-navy-500">Student not found</p>
        <Link to="/admin/students" className="btn-primary mt-4 inline-block">Back to Students</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    paused: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const attendanceStatusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    excused: 'bg-blue-100 text-blue-700',
    rescheduled: 'bg-purple-100 text-purple-700',
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'payments', label: 'Payments' },
    { id: 'lessons', label: 'Lessons' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/admin/students" className="inline-flex items-center gap-2 text-navy-600 hover:text-accent-600 text-sm font-medium">
        <ArrowLeft size={16} />
        Back to Students
      </Link>

      {/* Student Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-accent-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">{student.name}</h1>
              <p className="text-[0.8125rem] text-navy-500">{student.studentId} • {student.mobile}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[student.status]}`}>
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-navy-500 hover:text-navy-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Mobile</p>
                    <p className="text-sm font-medium text-navy-900">{student.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Email</p>
                    <p className="text-sm font-medium text-navy-900">{student.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Address</p>
                    <p className="text-sm font-medium text-navy-900">{student.address || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Emergency Contact</p>
                    <p className="text-sm font-medium text-navy-900">{student.emergencyContact || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Course</p>
                    <p className="text-sm font-medium text-navy-900">{student.course?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Instructor</p>
                    <p className="text-sm font-medium text-navy-900">{student.instructor?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Start Date</p>
                    <p className="text-sm font-medium text-navy-900">{new Date(student.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-navy-400" />
                  <div>
                    <p className="text-xs text-navy-500">Planned End Date</p>
                    <p className="text-sm font-medium text-navy-900">{student.plannedEndDate ? new Date(student.plannedEndDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress Card */}
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Course Progress</h3>
              <div className="text-center mb-4">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="#22c55e"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(student.completedLessons / Math.max(student.plannedLessons, 1)) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">{student.completedLessons}</p>
                      <p className="text-xs text-navy-500">of {student.plannedLessons} lessons</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Remaining</span>
                  <span className="font-medium text-navy-900">{student.plannedLessons - student.completedLessons} lessons</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Course Fee</span>
                  <span className="font-medium text-navy-900">&#8377;{student.courseFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Amount Paid</span>
                  <span className="font-medium text-green-600">&#8377;{student.amountPaid.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-navy-500 font-medium">Balance</span>
                  <span className={`font-bold ${(balance?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    &#8377;{(balance?.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            {attendanceSummary && (
              <div className="card">
                <h3 className="font-semibold text-navy-900 mb-4">Attendance Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Total Scheduled</span>
                    <span className="font-medium text-navy-900">{attendanceSummary.totalScheduled}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Attended</span>
                    <span className="font-medium text-green-600">{attendanceSummary.present + attendanceSummary.late}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Absent</span>
                    <span className="font-medium text-red-600">{attendanceSummary.absent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Excused</span>
                    <span className="font-medium text-blue-600">{attendanceSummary.excused}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span className="text-navy-500 font-medium">Attendance %</span>
                    <span className="font-bold text-accent-600">{attendanceSummary.attendancePercentage}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="card !p-0 overflow-hidden shadow-md">
          {attendance.length === 0 ? (
            <div className="text-center py-12 text-navy-500">
              <ClipboardCheck size={48} className="mx-auto mb-4 text-navy-300" />
              <p>No attendance records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50/80 border-b border-navy-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Date</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Time</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Instructor</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Check-in</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Duration</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-navy-50">
                      <td className="px-5 py-4 text-sm text-navy-900">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{record.scheduledTime}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{record.instructor?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${attendanceStatusColors[record.status] || 'bg-navy-100 text-navy-700'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-navy-600">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-5 py-4 text-sm text-navy-600">{record.duration} min</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{record.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card !p-0 overflow-hidden shadow-md">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-navy-500">
              <CreditCard size={48} className="mx-auto mb-4 text-navy-300" />
              <p>No payment records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50/80 border-b border-navy-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Date</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Amount</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Method</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Reference</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-navy-50">
                      <td className="px-5 py-4 text-sm text-navy-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-green-600">&#8377;{payment.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-navy-600 capitalize">{payment.method.replace('_', ' ')}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{payment.transactionRef || '-'}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{payment.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="card !p-0 overflow-hidden shadow-md">
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-navy-500">
              <Calendar size={48} className="mx-auto mb-4 text-navy-300" />
              <p>No lessons scheduled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50/80 border-b border-navy-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Date</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Time</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Instructor</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Duration</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lessons.map((lesson) => (
                    <tr key={lesson._id} className="hover:bg-navy-50">
                      <td className="px-5 py-4 text-sm text-navy-900">{new Date(lesson.date).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{lesson.startTime}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{lesson.instructor?.name || '-'}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{lesson.duration} min</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          lesson.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          lesson.status === 'completed' ? 'bg-green-100 text-green-700' :
                          lesson.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-navy-100 text-navy-700'
                        }`}>
                          {lesson.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
