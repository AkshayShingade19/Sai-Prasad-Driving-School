import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  X,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import apiClient from '../../api/client';

const paymentSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(),
  method: z.enum(['cash', 'upi', 'bank_transfer', 'other']),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface Payment {
  _id: string;
  amount: number;
  paymentDate: string;
  method: string;
  transactionRef: string;
  notes: string;
  student: { name: string; studentId: string; _id: string };
  receivedBy: { name: string };
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  mobile: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'cash' },
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/payments?page=${page}&limit=15`);
      setPayments(res.data);
      setTotalPages(Math.ceil(res.data.length / 15));
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
    apiClient.get('/payments/stats').then((res) => setStats(res.data)).catch(() => {});
    apiClient.get('/payments/pending').then((res) => setPendingPayments(res.data)).catch(() => {});
    apiClient.get('/students?limit=100').then((res) => setStudents(res.data.data)).catch(() => {});
  }, [fetchPayments]);

  const onSubmit = async (data: PaymentForm) => {
    try {
      await apiClient.post('/payments', data);
      toast.success('Payment recorded successfully');
      setShowForm(false);
      reset();
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const printReceipt = (payment: Payment) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    receiptWindow.document.write(`
      <html>
        <head><title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
        </head>
        <body>
          <div class="header">
            <h1>Sai Prasad Driving School</h1>
            <p>Payment Receipt</p>
          </div>
          <div class="row"><span class="label">Receipt No:</span><span>${payment._id.slice(-8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Date:</span><span>${new Date(payment.paymentDate).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Student:</span><span>${payment.student?.name} (${payment.student?.studentId})</span></div>
          <div class="row"><span class="label">Amount:</span><span>₹${payment.amount.toLocaleString()}</span></div>
          <div class="row"><span class="label">Method:</span><span>${payment.method.replace('_', ' ').toUpperCase()}</span></div>
          ${payment.transactionRef ? `<div class="row"><span class="label">Reference:</span><span>${payment.transactionRef}</span></div>` : ''}
          ${payment.notes ? `<div class="row"><span class="label">Notes:</span><span>${payment.notes}</span></div>` : ''}
          <div class="footer">
            <p>This is a computer-generated receipt.</p>
            <p>Thank you for your payment!</p>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Payments</h1>
          <p className="text-[0.8125rem] text-navy-500">Track course fee payments and balances</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} className="mr-2" />
          Record Payment
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">₹{stats.today.toLocaleString()}</p>
                <p className="text-xs text-navy-500">Today's Collection</p>
              </div>
            </div>
          </div>
          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">₹{stats.thisMonth.toLocaleString()}</p>
                <p className="text-xs text-navy-500">This Month</p>
              </div>
            </div>
          </div>
          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">₹{stats.total.toLocaleString()}</p>
                <p className="text-xs text-navy-500">Total Collected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-navy-200">
        <div className="flex gap-6">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'pending', label: 'Pending Balances' },
          ].map((tab) => (
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

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-navy-900">Record Payment</h2>
              <button onClick={() => setShowForm(false)} className="text-navy-400 hover:text-navy-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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
                <label className="label">Amount (&#8377;) *</label>
                <input type="number" {...register('amount')} className="input-field" />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input type="date" {...register('paymentDate')} className="input-field" />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select {...register('method')} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Transaction Reference</label>
                <input {...register('transactionRef')} className="input-field" placeholder="UPI ID / Transaction No." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} className="input-field" rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Record Payment</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Payments Tab */}
      {activeTab === 'all' && (
        <div className="card !p-0 overflow-hidden shadow-md">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          ) : payments.length === 0 ? (
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
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Student</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Amount</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Method</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Reference</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Received By</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-navy-50">
                      <td className="px-5 py-4 text-sm text-navy-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900 text-sm">{payment.student?.name}</p>
                        <p className="text-xs text-navy-500">{payment.student?.studentId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-green-600">₹{payment.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-navy-600 capitalize">{payment.method.replace('_', ' ')}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{payment.transactionRef || '-'}</td>
                      <td className="px-5 py-4 text-sm text-navy-600">{payment.receivedBy?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="p-1.5 text-navy-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg"
                          title="Print Receipt"
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pending Balances Tab */}
      {activeTab === 'pending' && (
        <div className="card !p-0 overflow-hidden shadow-md">
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12 text-navy-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-navy-300" />
              <p>No pending balances</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50/80 border-b border-navy-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Student</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Course Fee</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Paid</th>
                    <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-navy-500 whitespace-nowrap">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingPayments.map((item) => (
                    <tr key={item.studentId} className="hover:bg-navy-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900 text-sm">{item.name}</p>
                        <p className="text-xs text-navy-500">{item.studentId} • {item.mobile}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-navy-600">₹{item.courseFee.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-green-600">₹{item.totalPaid.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-red-600">₹{item.balance.toLocaleString()}</td>
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
