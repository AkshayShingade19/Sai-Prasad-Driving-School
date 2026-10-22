import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, X, Edit, Shield, UserCheck, UserX } from 'lucide-react';
import apiClient from '../../api/client';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'instructor', 'receptionist']),
});

const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'instructor', 'receptionist']).optional(),
  isActive: z.boolean().optional(),
});

type StaffForm = z.infer<typeof staffSchema>;
type UpdateStaffForm = z.infer<typeof updateStaffSchema>;

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'receptionist' },
  });

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, reset: resetUpdate, formState: { errors: updateErrors } } = useForm<UpdateStaffForm>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: { role: 'receptionist' as const },
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/staff');
      setStaff(res.data);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onSubmit = async (data: StaffForm) => {
    try {
      await apiClient.post('/staff', data);
      toast.success('Staff member created successfully');
      setShowForm(false);
      reset();
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create staff member');
    }
  };

  const onUpdate = async (data: UpdateStaffForm) => {
    if (!editingStaff) return;
    try {
      await apiClient.patch(`/staff/${editingStaff._id}`, data);
      toast.success('Staff member updated successfully');
      setEditingStaff(null);
      resetUpdate();
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/staff/${id}`, { isActive: !isActive });
      toast.success(`Staff member ${!isActive ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    instructor: 'bg-blue-100 text-blue-700',
    receptionist: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Staff Management</h1>
          <p className="text-[0.8125rem] text-navy-500">Manage admin users, instructors, and receptionists</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingStaff(null); reset(); }} className="btn-primary">
          <Plus size={18} className="mr-2" />
          Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="card !p-0 overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-navy-500">
            <Shield size={48} className="mx-auto mb-4 text-navy-300" />
            <p>No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50/80 border-b border-navy-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Name</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Email</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Role</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Last Login</th>
                  <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => (
                  <tr key={member._id} className="hover:bg-navy-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900 text-sm">{member.name}</p>
                      {member.phone && <p className="text-xs text-navy-500">{member.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColors[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-600">
                      {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingStaff(member); resetUpdate({ ...member, role: member.role as 'admin' | 'instructor' | 'receptionist' }); }}
                          className="p-1.5 text-navy-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleActive(member._id, member.isActive)}
                          className={`p-1.5 rounded-lg ${member.isActive ? 'text-navy-400 hover:text-red-600 hover:bg-red-50' : 'text-navy-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={member.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {member.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
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

      {/* Create Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">Add Staff Member</h2>
              <button onClick={() => setShowForm(false)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('name')} className="input-field" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...register('email')} className="input-field" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" {...register('password')} className="input-field" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className="input-field" />
              </div>
              <div>
                <label className="label">Role</label>
                <select {...register('role')} className="input-field">
                  <option value="receptionist">Receptionist</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Create Staff</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">Edit Staff Member</h2>
              <button onClick={() => setEditingStaff(null)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate(onUpdate)} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input {...registerUpdate('name')} className="input-field" />
              </div>
              <div>
                <label className="label">Email</label>
                <input {...registerUpdate('email')} className="input-field" />
              </div>
              <div>
                <label className="label">New Password (leave blank to keep current)</label>
                <input type="password" {...registerUpdate('password')} className="input-field" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...registerUpdate('phone')} className="input-field" />
              </div>
              <div>
                <label className="label">Role</label>
                <select {...registerUpdate('role')} className="input-field">
                  <option value="receptionist">Receptionist</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Update Staff</button>
                <button type="button" onClick={() => setEditingStaff(null)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
