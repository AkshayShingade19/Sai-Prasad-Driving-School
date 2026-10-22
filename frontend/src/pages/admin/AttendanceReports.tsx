import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Filter, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/client';
import { todayLocal } from '../../utils/date';

export default function AttendanceReports() {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(todayLocal());
  const [endDate, setEndDate] = useState(todayLocal());
  const [instructorId, setInstructorId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [instructors, setInstructors] = useState<{ _id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ _id: string; name: string; studentId: string }[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [frequentAbsences, setFrequentAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/instructors').then((res) => setInstructors(res.data)).catch(() => {});
    apiClient.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    apiClient.get('/students?limit=100').then((res) => setStudents(res.data.data)).catch(() => {});
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (instructorId) params.append('instructor', instructorId);
      if (courseId) params.append('course', courseId);
      if (studentId) params.append('student', studentId);

      const res = await apiClient.get(`/attendance?${params}`);
      setRecords(res.data);

      // Calculate summary
      const total = res.data.length;
      const present = res.data.filter((r: any) => r.status === 'present').length;
      const late = res.data.filter((r: any) => r.status === 'late').length;
      const absent = res.data.filter((r: any) => r.status === 'absent').length;
      const excused = res.data.filter((r: any) => r.status === 'excused').length;
      const rescheduled = res.data.filter((r: any) => r.status === 'rescheduled').length;
      const eligible = present + late + absent;
      const percentage = eligible > 0 ? Math.round(((present + late) / eligible) * 100) : 0;

      setSummary({ total, present, late, absent, excused, rescheduled, percentage });
    } catch (error) {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const fetchFrequentAbsences = async () => {
    try {
      const res = await apiClient.get('/attendance/frequent-absences?threshold=2');
      setFrequentAbsences(res.data);
    } catch (error) {
      toast.error('Failed to fetch frequent absences');
    }
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (instructorId) params.append('instructor', instructorId);
      if (courseId) params.append('course', courseId);
      if (studentId) params.append('student', studentId);

      const response = await apiClient.get(`/attendance/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Attendance Reports</h1>
        <p className="text-[0.8125rem] text-navy-500">Generate and export attendance reports</p>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <Filter size={18} />
          Report Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Instructor</label>
            <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className="input-field">
              <option value="">All</option>
              {instructors.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input-field">
              <option value="">All</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field">
              <option value="">All</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchReport} disabled={loading} className="btn-primary w-full">
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="card !p-4 text-center">
            <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">{summary.total}</p>
            <p className="text-xs text-navy-500">Total Records</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            <p className="text-xs text-navy-500">Present</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
            <p className="text-xs text-navy-500">Late</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-navy-500">Absent</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
            <p className="text-xs text-navy-500">Excused</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{summary.rescheduled}</p>
            <p className="text-xs text-navy-500">Rescheduled</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-accent-600">{summary.percentage}%</p>
            <p className="text-xs text-navy-500">Attendance %</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {records.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCSV} className="btn-primary">
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <button onClick={printReport} className="btn-secondary">
            Print Report
          </button>
          <button onClick={fetchFrequentAbsences} className="btn-outline">
            <AlertTriangle size={18} className="mr-2" />
            Frequent Absences
          </button>
        </div>
      )}

      {/* Records Table */}
      {records.length > 0 && (
        <div className="card !p-0 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50/80 border-b border-navy-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Date</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Student</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Course</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Instructor</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Check-in</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-navy-50">
                    <td className="px-5 py-4 text-sm text-navy-900">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900 text-sm">{record.student?.name}</p>
                      <p className="text-xs text-navy-500">{record.student?.studentId}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{record.course?.name}</td>
                    <td className="px-5 py-4 text-sm text-navy-600">{record.instructor?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        record.status === 'excused' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{record.duration} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frequent Absences */}
      {frequentAbsences.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Students with Frequent Absences (2+ in last 30 days)
          </h3>
          <div className="space-y-3">
            {frequentAbsences.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900 text-sm">{item.name}</p>
                  <p className="text-xs text-navy-500">{item.studentId} • {item.mobile}</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {item.absenceCount} absences
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
