import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Phone,
  MessageCircle,
  Copy,
  Eye,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import apiClient from '../../api/client';

interface DemoBooking {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  course: string;
  experience: string;
  contactMethod: string;
  message: string;
  status: string;
  assignedTo: { name: string };
  notes: string;
  demoDate: string;
  demoTime: string;
  outcome: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-blue-100 text-blue-700',
  demo_scheduled: 'bg-purple-100 text-purple-700',
  demo_completed: 'bg-teal-100 text-teal-700',
  converted: 'bg-green-100 text-green-700',
  not_interested: 'bg-red-100 text-red-700',
  closed: 'bg-navy-100 text-navy-700',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  demo_scheduled: 'Demo Scheduled',
  demo_completed: 'Demo Completed',
  converted: 'Converted',
  not_interested: 'Not Interested',
  closed: 'Closed',
};

export default function DemoBookings() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetail, setShowDetail] = useState<DemoBooking | null>(null);
  const [showConvertModal, setShowConvertModal] = useState<DemoBooking | null>(null);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);
  const [instructors, setInstructors] = useState<{ _id: string; name: string }[]>([]);
  const [convertData, setConvertData] = useState({ course: '', instructor: '', plannedLessons: 10, courseFee: 3000, amountPaid: 0 });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '15');
      const res = await apiClient.get(`/demo-bookings?${params}`);
      setBookings(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    apiClient.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    apiClient.get('/instructors').then((res) => setInstructors(res.data)).catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/demo-bookings/${id}`, { status });
      toast.success('Status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const convertToStudent = async () => {
    if (!showConvertModal) return;
    try {
      await apiClient.post(`/demo-bookings/${showConvertModal._id}/convert`, convertData);
      toast.success('Enquiry converted to student');
      setShowConvertModal(null);
      setConvertData({ course: '', instructor: '', plannedLessons: 10, courseFee: 3000, amountPaid: 0 });
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to convert');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getWhatsAppLink = (mobile: string, name: string) => {
    const message = `Hi ${name}, thank you for your enquiry at Sai Prasad Driving School. We would like to discuss driving lesson options with you.`;
    return `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Demo Bookings & Enquiries</h1>
        <p className="text-[0.8125rem] text-navy-500">Manage demo booking requests and customer enquiries</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10"
              placeholder="Search by name, mobile, or email..."
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field md:w-48">
            <option value="">All Status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button onClick={fetchBookings} className="btn-secondary md:w-auto">Search</button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-navy-500">
            <Phone size={48} className="mx-auto mb-4 text-navy-300" />
            <p>No enquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50/80 border-b border-navy-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Name</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Contact</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Course</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Preferred</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Assigned</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-navy-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900 text-sm">{booking.name}</p>
                      <p className="text-xs text-navy-500 capitalize">{booking.experience.replace('_', ' ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${booking.mobile}`} className="text-sm text-navy-600 hover:text-accent-600">{booking.mobile}</a>
                        <button onClick={() => copyToClipboard(booking.mobile)} className="text-navy-400 hover:text-navy-600">
                          <Copy size={14} />
                        </button>
                      </div>
                      {booking.email && <p className="text-xs text-navy-500">{booking.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{booking.course || '-'}</td>
                    <td className="px-5 py-4 text-sm text-navy-600">
                      {booking.preferredDate || 'TBD'} {booking.preferredTime}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking._id, e.target.value)}
                        className={`badge border-0 ${statusColors[booking.status]}`}
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{booking.assignedTo?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowDetail(booking)}
                          className="p-1.5 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={getWhatsAppLink(booking.mobile, booking.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-navy-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                        {booking.status !== 'converted' && (
                          <button
                            onClick={() => setShowConvertModal(booking)}
                            className="p-1.5 text-navy-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Convert to Student"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-navy-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border disabled:opacity-50">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">Enquiry Details</h2>
              <button onClick={() => setShowDetail(null)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-navy-500">Name</p>
                  <p className="font-medium text-navy-900">{showDetail.name}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Mobile</p>
                  <p className="font-medium text-navy-900">{showDetail.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Email</p>
                  <p className="font-medium text-navy-900">{showDetail.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Experience</p>
                  <p className="font-medium text-navy-900 capitalize">{showDetail.experience.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Preferred Date</p>
                  <p className="font-medium text-navy-900">{showDetail.preferredDate || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Preferred Time</p>
                  <p className="font-medium text-navy-900">{showDetail.preferredTime || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Contact Method</p>
                  <p className="font-medium text-navy-900 capitalize">{showDetail.contactMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Status</p>
                  <span className={`badge ${statusColors[showDetail.status]}`}>
                    {statusLabels[showDetail.status]}
                  </span>
                </div>
              </div>
              {showDetail.message && (
                <div>
                  <p className="text-xs text-navy-500">Message</p>
                  <p className="text-sm text-navy-700 mt-1">{showDetail.message}</p>
                </div>
              )}
              {showDetail.notes && (
                <div>
                  <p className="text-xs text-navy-500">Notes</p>
                  <p className="text-sm text-navy-700 mt-1">{showDetail.notes}</p>
                </div>
              )}
              {showDetail.outcome && (
                <div>
                  <p className="text-xs text-navy-500">Outcome</p>
                  <p className="text-sm text-navy-700 mt-1">{showDetail.outcome}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Student Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">Convert to Student</h2>
              <button onClick={() => setShowConvertModal(null)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Course *</label>
                <select
                  value={convertData.course}
                  onChange={(e) => setConvertData({ ...convertData, course: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Instructor *</label>
                <select
                  value={convertData.instructor}
                  onChange={(e) => setConvertData({ ...convertData, instructor: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((i) => (
                    <option key={i._id} value={i._id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Planned Lessons</label>
                <input
                  type="number"
                  value={convertData.plannedLessons}
                  onChange={(e) => setConvertData({ ...convertData, plannedLessons: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Course Fee (&#8377;)</label>
                <input
                  type="number"
                  value={convertData.courseFee}
                  onChange={(e) => setConvertData({ ...convertData, courseFee: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Initial Payment (&#8377;)</label>
                <input
                  type="number"
                  value={convertData.amountPaid}
                  onChange={(e) => setConvertData({ ...convertData, amountPaid: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={convertToStudent}
                  disabled={!convertData.course || !convertData.instructor}
                  className="btn-primary flex-1"
                >
                  Convert to Student
                </button>
                <button onClick={() => setShowConvertModal(null)} className="btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
