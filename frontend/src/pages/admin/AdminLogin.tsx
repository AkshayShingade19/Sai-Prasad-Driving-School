import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Car, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear any stale tokens on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      apiClient
        .get('/auth/me')
        .catch(() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-overlay opacity-25" />
      <div className="absolute -top-32 -left-20 w-[32rem] h-[32rem] bg-accent-500/[0.12] rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-20 w-[30rem] h-[30rem] bg-gold-500/[0.08] rounded-full blur-3xl animate-float [animation-delay:3s]" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-9">
          <div className="w-16 h-16 bg-accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-accent-lg">
            <Car size={32} className="text-white" strokeWidth={2.1} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-[-0.025em]">
            Sai Prasad Driving School
          </h1>
          <p className="text-navy-400 text-[0.8125rem] mt-2 font-medium tracking-wide">
            Management Panel
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-premium border border-white/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-accent-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900 tracking-[-0.02em]">
                Sign In
              </h2>
              <p className="text-[0.8125rem] text-navy-500">Enter your credentials to continue</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field !pl-11"
                  placeholder="admin@drivingschool.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                />
                <input
                  {...register('password')}
                  type="password"
                  className="input-field !pl-11"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-8 !py-4">
            {loading ? 'Signing in…' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="mt-7 pt-6 border-t border-navy-100 text-center">
            <p className="text-[0.75rem] text-navy-400 leading-relaxed">
              Default admin:{' '}
              <span className="font-semibold text-navy-600">admin@drivingschool.com</span> /{' '}
              <span className="font-semibold text-navy-600">Admin@123</span>
            </p>
          </div>
        </form>

        <p className="text-center text-navy-500 text-[0.8125rem] mt-7">
          <Link to="/" className="hover:text-accent-400 transition-colors">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
