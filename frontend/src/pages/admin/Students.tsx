import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Archive,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UserRound,
  KeyRound,
} from 'lucide-react';
import apiClient from '../../api/client';
import PortalCredentialsModal from './PortalCredentialsModal';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  course: z.string().min(1, 'Course is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  startDate: z.string().optional(),
  plannedLessons: z.coerce.number().min(0),
  courseFee: z.coerce.number().min(0),
  amountPaid: z.coerce.number().min(0),
  transmission: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  notes: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

interface Student {
  _id: string;
  studentId: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  status: string;
  course: { name: string; _id: string };
  instructor: { name: string; _id: string };
  plannedLessons: number;
  completedLessons: number;
  courseFee: number;
  amountPaid: number;
  startDate: string;
  plannedEndDate?: string;
  transmission?: string;
  notes?: string;
}

interface Course {
  _id: string;
  name: string;
}
interface Instructor {
  _id: string;
  name: string;
}

const STATUS_META: Record<string, { cls: string; label: string }> = {
  active: { cls: 'bg-green-50 text-green-700', label: 'Active' },
  completed: { cls: 'bg-blue-50 text-blue-700', label: 'Completed' },
  paused: { cls: 'bg-yellow-50 text-yellow-700', label: 'Paused' },
  cancelled: { cls: 'bg-red-50 text-red-700', label: 'Cancelled' },
};

export default function Students() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showCredentials, setShowCredentials] = useState<Student | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [courseFilter, setCourseFilter] = useState(searchParams.get('course') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'active',
      transmission: 'manual',
      plannedLessons: 0,
      courseFee: 0,
      amountPaid: 0,
    },
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (courseFilter) params.append('course', courseFilter);
      params.append('page', page.toString());
      params.append('limit', '15');
      const res = await apiClient.get(`/students?${params}`);
      setStudents(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, courseFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    apiClient.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    apiClient.get('/instructors').then((res) => setInstructors(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: StudentForm) => {
    try {
      if (editingStudent) {
        await apiClient.patch(`/students/${editingStudent._id}`, data);
        toast.success('Student updated successfully');
      } else {
        const res = await apiClient.post('/students', data);
        const generated = res.data.portalPassword;
        if (generated) {
          toast.success(
            `Student registered. Portal login — email: ${data.email || '(not set)'}, password: ${generated}`,
            { duration: 12000 },
          );
        } else {
          toast.success('Student registered successfully');
        }
      }
      setShowModal(false);
      setEditingStudent(null);
      reset();
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowModal(true);
    reset({
      name: student.name,
      mobile: student.mobile,
      email: student.email || '',
      address: student.address || '',
      emergencyContact: student.emergencyContact || '',
      course: student.course?._id || '',
      instructor: student.instructor?._id || '',
      startDate: student.startDate ? student.startDate.split('T')[0] : '',
      plannedLessons: student.plannedLessons,
      courseFee: student.courseFee,
      amountPaid: student.amountPaid,
      transmission: student.transmission || 'manual',
      status: student.status as any,
      notes: student.notes || '',
    });
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this student?')) return;
    try {
      await apiClient.delete(`/students/${id}`);
      toast.success('Student archived');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to archive student');
    }
  };

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Reset portal password for ${student.name}?`)) return;
    try {
      const res = await apiClient.post(`/students/${student._id}/reset-password`, {});
      toast.success(`New password: ${res.data.portalPassword}`, {
        duration: 12000,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">
            Students
          </h1>
          <p className="text-[0.8125rem] text-navy-500 mt-1">Manage registered students</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (students.length === 0) {
                toast.error('No students to set up yet');
                return;
              }
              setShowCredentials(students[0]);
            }}
            className="btn-outline btn-sm"
            title="Set a student's portal username and password"
          >
            <KeyRound size={15} />
            Portal Credentials
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingStudent(null);
              reset();
            }}
            className="btn-primary btn-sm"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="card p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchStudents();
          }}
          className="flex flex-col lg:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-11"
              placeholder="Search by name or mobile..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="select-field lg:w-44"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="select-field lg:w-52"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary btn-sm lg:w-auto">
            Search
          </button>
        </form>
      </div>

      {/* ---------- Form modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-premium">
            <div className="flex items-center justify-between p-6 border-b border-navy-100 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl font-extrabold text-navy-900 tracking-[-0.02em]">
                {editingStudent ? 'Edit Student' : 'Register New Student'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStudent(null);
                }}
                className="p-2 text-navy-400 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Full Name *</label>
                  <input {...register('name')} className="input-field" />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Mobile *</label>
                  <input {...register('mobile')} className="input-field" />
                  {errors.mobile && <p className="form-error">{errors.mobile.message}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input {...register('email')} className="input-field" />
                </div>
                <div>
                  <label className="label">Emergency Contact</label>
                  <input {...register('emergencyContact')} className="input-field" />
                </div>
                <div>
                  <label className="label">Course *</label>
                  <select {...register('course')} className="select-field">
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.course && <p className="form-error">{errors.course.message}</p>}
                </div>
                <div>
                  <label className="label">Instructor *</label>
                  <select {...register('instructor')} className="select-field">
                    <option value="">Select Instructor</option>
                    {instructors.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  {errors.instructor && <p className="form-error">{errors.instructor.message}</p>}
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" {...register('startDate')} className="input-field" />
                </div>
                <div>
                  <label className="label">Planned Lessons</label>
                  <input type="number" {...register('plannedLessons')} className="input-field" />
                </div>
                <div>
                  <label className="label">Course Fee (&#8377;)</label>
                  <input type="number" {...register('courseFee')} className="input-field" />
                </div>
                <div>
                  <label className="label">Amount Paid (&#8377;)</label>
                  <input type="number" {...register('amountPaid')} className="input-field" />
                </div>
                <div>
                  <label className="label">Transmission</label>
                  <select {...register('transmission')} className="select-field">
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select {...register('status')} className="select-field">
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input {...register('address')} className="input-field" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} className="input-field" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingStudent ? 'Update Student' : 'Register Student'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Table ---------- */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-navy-500">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-navy-400" />
            </div>
            <p className="font-semibold text-navy-700">No students found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const progress =
                    student.plannedLessons > 0
                      ? (student.completedLessons / student.plannedLessons) * 100
                      : 0;
                  return (
                    <tr key={student._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-accent-gradient rounded-lg flex items-center justify-center shrink-0">
                            <UserRound size={16} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-900 text-[0.875rem] truncate">
                              {student.name}
                            </p>
                            <p className="text-[0.75rem] text-navy-500 mt-0.5">
                              {student.studentId} · {student.mobile}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[0.8125rem]">{student.course?.name || '—'}</td>
                      <td className="text-[0.8125rem]">{student.instructor?.name || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-gradient rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-[0.75rem] text-navy-500 font-medium whitespace-nowrap">
                            {student.completedLessons}/{student.plannedLessons}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            STATUS_META[student.status]?.cls || 'bg-navy-100 text-navy-700'
                          }`}
                        >
                          {STATUS_META[student.status]?.label || student.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          <Link
                            to={`/admin/students/${student._id}`}
                            className="p-2 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-navy-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setShowCredentials(student)}
                            className="p-2 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                            title="Set portal username & password"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(student._id)}
                            className="p-2 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
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
      {showCredentials && (
        <PortalCredentialsModal
          studentId={showCredentials._id}
          onClose={() => setShowCredentials(null)}
          onSaved={fetchStudents}
        />
      )}

      {/* ---------- Pagination ---------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-navy-200 bg-white text-navy-600 hover:bg-navy-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[0.8125rem] text-navy-600 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-navy-200 bg-white text-navy-600 hover:bg-navy-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
