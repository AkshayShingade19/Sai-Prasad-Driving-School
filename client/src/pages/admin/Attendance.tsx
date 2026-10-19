import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Save,
  ClipboardCheck,
  CalendarDays,
  KeyRound,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { todayLocal } from '../../utils/date';
import PortalCredentialsModal from './PortalCredentialsModal';

interface ScheduledStudent {
  studentId: string;
  studentName: string;
  studentMobile: string;
  studentDbId: string;
  course: string;
  courseId: string;
  instructorId: string;
  instructorName: string;
  scheduledTime: string;
  duration: number;
  lessonId: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  status: string;
  checkInTime: string;
  checkOutTime: string;
  duration: number;
  remarks: string;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  present: { label: 'Present', cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  absent: { label: 'Absent', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  late: { label: 'Late', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  excused: { label: 'Excused', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
  rescheduled: { label: 'Rescheduled', cls: 'bg-purple-50 text-purple-700 border-purple-200', icon: RefreshCw },
};

export default function Attendance() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayLocal());
  const [instructorId, setInstructorId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [search, setSearch] = useState('');
  const [scheduledStudents, setScheduledStudents] = useState<ScheduledStudent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [instructors, setInstructors] = useState<{ _id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentialStudent, setCredentialStudent] = useState<ScheduledStudent | null>(null);

  useEffect(() => {
    apiClient.get('/instructors').then((res) => setInstructors(res.data)).catch(() => {});
    apiClient.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  const fetchScheduledStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (instructorId) params.append('instructorId', instructorId);
      if (courseId) params.append('courseId', courseId);
      const res = await apiClient.get(`/students/scheduled?${params}`);
      setScheduledStudents(res.data);

      const attendanceRes = await apiClient.get(
        `/attendance/daily?date=${date}${instructorId ? `&instructorId=${instructorId}` : ''}${
          courseId ? `&courseId=${courseId}` : ''
        }`,
      );
      const records: Record<string, AttendanceRecord> = {};
      attendanceRes.data.forEach((record: any) => {
        records[record.lesson] = {
          _id: record._id,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          duration: record.duration,
          remarks: record.remarks,
        };
      });
      setAttendanceRecords(records);
    } catch (error) {
      toast.error('Failed to load scheduled students');
    } finally {
      setLoading(false);
    }
  }, [date, instructorId, courseId]);

  useEffect(() => {
    fetchScheduledStudents();
  }, [fetchScheduledStudents]);

  const markAttendance = async (lessonId: string, status: string) => {
    try {
      await apiClient.post('/attendance/mark', {
        lessonId,
        status,
        checkInTime: status === 'present' || status === 'late' ? new Date().toISOString() : undefined,
        duration: status === 'present' || status === 'late' ? 60 : 0,
      });
      toast.success(`Attendance marked as ${status}`);
      fetchScheduledStudents();
    } catch (error: any) {
      if (error.response?.status === 409) {
        const existing = attendanceRecords[lessonId];
        if (existing) {
          try {
            await apiClient.patch(`/attendance/${existing._id}`, { status });
            toast.success(`Attendance updated to ${status}`);
            fetchScheduledStudents();
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update attendance');
          }
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
      }
    }
  };

  const filteredStudents = scheduledStudents.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentMobile.includes(search),
  );

  const summary = (['present', 'absent', 'late', 'excused', 'rescheduled'] as const).map((status) => ({
    status,
    count: Object.values(attendanceRecords).filter((r) => r.status === status).length,
  }));

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">
            Daily Attendance
          </h1>
          <p className="text-[0.8125rem] text-navy-500 mt-1">
            Mark and manage student attendance for scheduled lessons
          </p>
        </div>
        <Link to="/admin/attendance/reports" className="btn-secondary btn-sm">
          <ClipboardCheck size={15} />
          Reports & Export
        </Link>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Instructor</label>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="select-field"
            >
              <option value="">All Instructors</option>
              {instructors.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="select-field"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Search Student</label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-11"
                placeholder="Name or mobile..."
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={fetchScheduledStudents} className="btn-primary btn-sm">
            <RefreshCw size={15} />
            Load Schedule
          </button>
        </div>
      </div>

      {/* ---------- Sheet ---------- */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-navy-500">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={28} className="text-navy-400" />
            </div>
            <p className="font-semibold text-navy-700">No students scheduled for this date</p>
            <p className="text-sm mt-1">Select a different date or adjust the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Duration</th>
                  <th>Remarks</th>
                  <th className="text-right">Portal</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const record = attendanceRecords[student.lessonId];
                  const status = record?.status || '';
                  return (
                    <tr key={student.lessonId}>
                      <td className="font-mono text-[0.75rem] text-navy-500">{student.studentDbId}</td>
                      <td>
                        <p className="font-semibold text-navy-900 text-[0.875rem]">
                          {student.studentName}
                        </p>
                        <p className="text-[0.75rem] text-navy-500 mt-0.5">{student.studentMobile}</p>
                      </td>
                      <td className="text-[0.8125rem]">{student.course}</td>
                      <td className="text-[0.8125rem] font-medium">{student.scheduledTime}</td>
                      <td>
                        <select
                          value={status}
                          onChange={(e) => markAttendance(student.lessonId, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                            status ? STATUS_META[status]?.cls : 'bg-navy-50 text-navy-600 border-navy-200'
                          }`}
                        >
                          <option value="">Select</option>
                          {Object.entries(STATUS_META).map(([key, meta]) => (
                            <option key={key} value={key}>
                              {meta.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-[0.8125rem]">
                        {record?.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '—'}
                      </td>
                      <td className="text-[0.8125rem]">
                        {record?.duration ? `${record.duration} min` : '—'}
                      </td>
                      <td className="text-[0.8125rem] text-navy-500 max-w-[180px] truncate">
                        {record?.remarks || '—'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setCredentialStudent(student)}
                          className="p-1.5 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                          title="Set portal username & password for this student"
                        >
                          <KeyRound size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- Portal credentials modal ---------- */}
      {credentialStudent && (
        <PortalCredentialsModal
          studentId={credentialStudent.studentId}
          onClose={() => setCredentialStudent(null)}
          onSaved={fetchScheduledStudents}
        />
      )}

      {/* ---------- Summary ---------- */}
      {filteredStudents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {summary.map((s) => {
            const meta = STATUS_META[s.status];
            const Icon = meta.icon;
            return (
              <div key={s.status} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    size={20}
                    className={
                      s.status === 'present'
                        ? 'text-green-600'
                        : s.status === 'absent'
                          ? 'text-red-600'
                          : s.status === 'late'
                            ? 'text-yellow-600'
                            : s.status === 'excused'
                              ? 'text-blue-600'
                              : 'text-purple-600'
                    }
                  />
                  <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.025em]">
                    {s.count}
                  </p>
                </div>
                <p className="text-[0.8125rem] text-navy-500 font-medium capitalize">{meta.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
