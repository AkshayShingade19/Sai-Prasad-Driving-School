import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  FileText,
  Shield,
  RefreshCw,
  Award,
  Wrench,
} from 'lucide-react';
import apiClient from '../../api/client';

interface ServiceRequest {
  _id: string;
  requestId: string;
  customerName: string;
  contactNumber: string;
  serviceType: string;
  vehicleRegNumber: string;
  description: string;
  status: string;
  documentsRequired: string[];
  documentsProvided: string[];
  assignedTo: { name: string };
  estimatedFee: number;
  actualFee: number;
  notes: string;
  completionDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  documents_pending: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-blue-100 text-blue-700',
  awaiting_third_party: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const serviceTypeLabels: Record<string, string> = {
  rc_transfer: 'RC Transfer',
  insurance: 'Insurance',
  puc: 'PUC',
  learning_licence: 'Learning Licence',
  driving_licence: 'Driving Licence',
  other: 'Other',
};

const serviceTypeIcons: Record<string, any> = {
  rc_transfer: Car,
  insurance: Shield,
  puc: RefreshCw,
  learning_licence: FileText,
  driving_licence: Award,
  other: Wrench,
};

export default function ServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetail, setShowDetail] = useState<ServiceRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('serviceType', typeFilter);
      params.append('page', page.toString());
      params.append('limit', '15');
      const res = await apiClient.get(`/service-requests?${params}`);
      setRequests(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/service-requests/${id}`, { status });
      toast.success('Status updated');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Service Requests</h1>
        <p className="text-[0.8125rem] text-navy-500">Manage vehicle-related service requests (RC Transfer, Insurance, PUC, etc.)</p>
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
              placeholder="Search by name, vehicle number, or request ID..."
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field md:w-48">
            <option value="">All Status</option>
            <option value="new">New Request</option>
            <option value="documents_pending">Documents Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_third_party">Awaiting Third Party</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field md:w-48">
            <option value="">All Types</option>
            {Object.entries(serviceTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button onClick={fetchRequests} className="btn-secondary md:w-auto">Search</button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-navy-500">
            <Wrench size={48} className="mx-auto mb-4 text-navy-300" />
            <p>No service requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50/80 border-b border-navy-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Request ID</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Customer</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Service</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Vehicle</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Fee</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((request) => {
                  const Icon = serviceTypeIcons[request.serviceType] || Wrench;
                  return (
                    <tr key={request._id} className="hover:bg-navy-50">
                      <td className="px-5 py-4 text-sm font-mono text-navy-600">{request.requestId}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900 text-sm">{request.customerName}</p>
                        <p className="text-xs text-navy-500">{request.contactNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-accent-600" />
                          <span className="text-sm text-navy-600">{serviceTypeLabels[request.serviceType] || request.serviceType}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-navy-600">{request.vehicleRegNumber || '-'}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">
                        {request.estimatedFee > 0 ? `₹${request.estimatedFee.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={request.status}
                          onChange={(e) => updateStatus(request._id, e.target.value)}
                          className={`badge border-0 ${statusColors[request.status]}`}
                        >
                          {Object.entries({
                            new: 'New',
                            documents_pending: 'Docs Pending',
                            in_progress: 'In Progress',
                            awaiting_third_party: 'Awaiting 3rd Party',
                            completed: 'Completed',
                            cancelled: 'Cancelled',
                          }).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowDetail(request)}
                          className="p-1.5 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
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
              <h2 className="text-xl font-semibold text-navy-900">Request Details</h2>
              <button onClick={() => setShowDetail(null)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-navy-500">Request ID</p>
                  <p className="font-medium text-navy-900">{showDetail.requestId}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Service Type</p>
                  <p className="font-medium text-navy-900">{serviceTypeLabels[showDetail.serviceType]}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Customer Name</p>
                  <p className="font-medium text-navy-900">{showDetail.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Contact Number</p>
                  <p className="font-medium text-navy-900">{showDetail.contactNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Vehicle Reg. Number</p>
                  <p className="font-medium text-navy-900">{showDetail.vehicleRegNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Status</p>
                  <span className={`badge ${statusColors[showDetail.status]}`}>
                    {showDetail.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Estimated Fee</p>
                  <p className="font-medium text-navy-900">{showDetail.estimatedFee > 0 ? `₹${showDetail.estimatedFee.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Completion Date</p>
                  <p className="font-medium text-navy-900">{showDetail.completionDate ? new Date(showDetail.completionDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
              {showDetail.description && (
                <div>
                  <p className="text-xs text-navy-500">Description</p>
                  <p className="text-sm text-navy-700 mt-1">{showDetail.description}</p>
                </div>
              )}
              {showDetail.documentsRequired && showDetail.documentsRequired.length > 0 && (
                <div>
                  <p className="text-xs text-navy-500 mb-2">Required Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.documentsRequired.map((doc, i) => (
                      <span key={i} className="px-2 py-1 bg-navy-100 text-navy-700 rounded text-xs">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {showDetail.documentsProvided && showDetail.documentsProvided.length > 0 && (
                <div>
                  <p className="text-xs text-navy-500 mb-2">Documents Provided</p>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.documentsProvided.map((doc, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {showDetail.notes && (
                <div>
                  <p className="text-xs text-navy-500">Notes</p>
                  <p className="text-sm text-navy-700 mt-1">{showDetail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
