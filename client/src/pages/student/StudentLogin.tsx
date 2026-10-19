import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Car, Lock, Mail, ArrowRight, UserRound, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import Reveal from '../../components/Reveal';
import TiltCard from '../../components/TiltCard';
import Aurora from '../../components/Aurora';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, student } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (student) navigate('/student/portal', { replace: true });
  }, [student, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/student/portal');
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
      <Aurora count={3} speed={22} className="opacity-70" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <Reveal from="down">
          <div className="text-center mb-9">
            <div className="w-16 h-16 bg-accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-accent-lg">
              <UserRound size={30} className="text-white" strokeWidth={2.1} />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white tracking-[-0.025em]">
              Student Portal
            </h1>
            <p className="text-navy-400 text-[0.8125rem] mt-2 font-medium tracking-wide">
              Sai Prasad Driving School
            </p>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal from="up" delay={100}>
          <TiltCard max={6} scale={1.01} lift={4}>
            <form
              onSubmit={onSubmit}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-premium border border-white/10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                  <KeyRound size={20} className="text-accent-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-900 tracking-[-0.02em]">
                    Sign In
                  </h2>
                  <p className="text-[0.8125rem] text-navy-500">Track your attendance & progress</p>
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
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field !pl-11"
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field !pl-11 !pr-11"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-8 !py-4">
                {loading ? 'Signing in…' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="mt-7 pt-6 border-t border-navy-100 text-center">
                <p className="text-[0.8125rem] text-navy-500 leading-relaxed">
                  Don&apos;t have portal access?{' '}
                  <span className="text-navy-600 font-semibold">Ask at the office</span> to get your
                  email registered and a password.
                </p>
              </div>
            </form>
          </TiltCard>
        </Reveal>

        <div className="flex items-center justify-center gap-5 mt-7 text-[0.8125rem]">
          <Link to="/" className="text-navy-400 hover:text-accent-400 transition-colors">
            ← Back to website
          </Link>
          <span className="text-navy-700">|</span>
          <Link to="/admin/login" className="text-navy-400 hover:text-accent-400 transition-colors">
            Staff login
          </Link>
        </div>
      </div>
    </div>
  );
}
