import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  X,
  Calendar,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import apiClient from '../../api/client';

const lessonSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  course: z.string().min(1, 'Course is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.coerce.number().min(15, 'Duration must be at least 15 minutes'),
  transmission: z.string().optional(),
  vehicleNumber: z.string().optional(),
  notes: z.string().optional(),
  recurringWeeks: z.coerce.number().optional(),
});

type LessonForm = z.infer<typeof lessonSchema>;

interface Lesson {
  _id: string;
  date: string;
  startTime: string;
  duration: number;
  status: string;
  student: { name: string; studentId: string; _id: string };
  instructor: { name: string; _id: string };
  course: { name: string; _id: string };
  transmission: string;
  notes: string;
}

export default function Lessons() {
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<{ _id: string; name: string; studentId: string }[]>([]);
  const [instructors, setInstructors] = useState<{ _id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { duration: 60, transmission: 'manual' },
  });

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await apiClient.get(`/lessons?${params}`);
      setLessons(res.data);
    } catch (error) {
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    apiClient.get('/students?limit=100').then((res) => setStudents(res.data.data)).catch(() => {});
    apiClient.get('/instructors').then((res) => setInstructors(res.data)).catch(() => {});
    apiClient.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: LessonForm) => {
    try {
      if (editingLesson) {
        await apiClient.patch(`/lessons/${editingLesson._id}`, data);
        toast.success('Lesson updated successfully');
      } else {
        await apiClient.post('/lessons', data);
        toast.success('Lesson scheduled successfully');
      }
      setShowForm(false);
      setEditingLesson(null);
      reset();
      fetchLessons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
    reset({
      student: lesson.student?._id || '',
      instructor: lesson.instructor?._id || '',
      course: lesson.course?._id || '',
      date: lesson.date?.split('T')[0] || '',
      startTime: lesson.startTime,
      duration: lesson.duration,
      transmission: lesson.transmission || 'manual',
      notes: lesson.notes || '',
    });
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this lesson?')) return;
    try {
      await apiClient.post(`/lessons/${id}/cancel`);
      toast.success('Lesson cancelled');
      fetchLessons();
    } catch (error) {
      toast.error('Failed to cancel lesson');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiClient.post(`/lessons/${id}/complete`);
      toast.success('Lesson marked as completed');
      fetchLessons();
    } catch (error) {
      toast.error('Failed to complete lesson');
    }
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rescheduled: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Lesson Scheduling</h1>
          <p className="text-[0.8125rem] text-navy-500">Manage driving lesson schedules</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingLesson(null); reset(); }}
          className="btn-primary"
        >
          <Plus size={18} className="mr-2" />
          Schedule Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchLessons} className="btn-secondary w-full">
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">
                {editingLesson ? 'Edit Lesson' : 'Schedule New Lesson'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingLesson(null); }} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Student *</label>
                  <select {...register('student')} className="input-field">
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                    ))}
                  </select>
                  {errors.student && <p className="text-red-500 text-xs mt-1">{errors.student.message}</p>}
                </div>
                <div>
                  <label className="label">Instructor *</label>
                  <select {...register('instructor')} className="input-field">
                    <option value="">Select Instructor</option>
                    {instructors.map((i) => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                  {errors.instructor && <p className="text-red-500 text-xs mt-1">{errors.instructor.message}</p>}
                </div>
                <div>
                  <label className="label">Course *</label>
                  <select {...register('course')} className="input-field">
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" {...register('date')} className="input-field" />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="label">Start Time *</label>
                  <input type="time" {...register('startTime')} className="input-field" />
                  {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
                </div>
                <div>
                  <label className="label">Duration (minutes) *</label>
                  <input type="number" {...register('duration')} className="input-field" />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <label className="label">Transmission</label>
                  <select {...register('transmission')} className="input-field">
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Vehicle Number</label>
                  <input {...register('vehicleNumber')} className="input-field" placeholder="MH-12-AB-1234" />
                </div>
              </div>

              {!editingLesson && (
                <div className="bg-navy-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-navy-700 mb-2">Recurring Schedule (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Repeat for weeks</label>
                      <input type="number" {...register('recurringWeeks')} className="input-field" placeholder="1 = single lesson" min="1" />
                    </div>
                    <div className="flex items-end">
                      <p className="text-xs text-navy-500">Leave empty for single lesson</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} className="input-field" rows={2} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingLesson ? 'Update Lesson' : 'Schedule Lesson'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingLesson(null); }} className="btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Table */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 text-navy-500">
            <Calendar size={48} className="mx-auto mb-4 text-navy-300" />
            <p>No lessons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50/80 border-b border-navy-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Date</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Time</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Student</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Instructor</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Course</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Duration</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-navy-50">
                    <td className="px-5 py-4 text-sm text-navy-900">{new Date(lesson.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm text-navy-600">{lesson.startTime}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900 text-sm">{lesson.student?.name}</p>
                      <p className="text-xs text-navy-500">{lesson.student?.studentId}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{lesson.instructor?.name}</td>
                    <td className="px-5 py-4 text-sm text-navy-600">{lesson.course?.name}</td>
                    <td className="px-5 py-4 text-sm text-navy-600">{lesson.duration} min</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[lesson.status] || 'bg-navy-100 text-navy-700'}`}>
                        {lesson.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lesson.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleComplete(lesson._id)}
                              className="p-1.5 text-navy-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Mark Complete"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleCancel(lesson._id)}
                              className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Cancel"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-1.5 text-navy-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
