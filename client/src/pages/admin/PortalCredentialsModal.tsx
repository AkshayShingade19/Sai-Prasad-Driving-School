import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  X,
  KeyRound,
  Mail,
  Save,
  Printer,
  RefreshCw,
  Eye,
  EyeOff,
  UserRound,
  CheckCircle,
  Copy,
} from 'lucide-react';
import apiClient from '../../api/client';

interface Credentials {
  studentId: string;
  name: string;
  mobile: string;
  email: string;
  hasPassword: boolean;
  isActive: boolean;
  suggestedPassword: string;
}

interface SavedCredentials {
  studentId: string;
  name: string;
  mobile: string;
  email: string;
  portalPassword: string;
}

interface Props {
  studentId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function PortalCredentialsModal({ studentId, onClose, onSaved }: Props) {
  const [data, setData] = useState<Credentials | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedCredentials | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get(`/students/${studentId}/portal-credentials`);
        if (!active) return;
        setData(res.data);
        setEmail(res.data.email || '');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load credentials');
        onClose();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studentId, onClose]);

  const handleSave = async () => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.post(`/students/${studentId}/portal-credentials`, {
        email,
        password: password || undefined,
      });
      setSaved(res.data);
      setPassword('');
      toast.success('Portal credentials saved');
      onSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = () => {
    if (!data) return;
    setPassword(data.suggestedPassword);
  };

  const copyValue = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handlePrint = () => {
    const c = saved || data;
    if (!c) return;
    const printPassword = saved?.portalPassword || password || data?.suggestedPassword;

    const win = window.open('', '_blank', 'width=680,height=820');
    if (!win) {
      toast.error('Please allow pop-ups to print');
      return;
    }

    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Portal Credentials — ${c.name}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 40px;
              color: #0e1f2f;
              background: #fff;
            }
            .wrap { max-width: 560px; margin: 0 auto; }
            .brand { text-align: center; border-bottom: 2px solid #0e1f2f; padding-bottom: 20px; margin-bottom: 28px; }
            .brand h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.5px; }
            .brand p { margin: 0; color: #4a6e92; font-size: 13px; }
            .slip { border: 1px solid #c7d6e4; border-radius: 12px; overflow: hidden; }
            .slip-head { background: #071320; color: #fff; padding: 14px 20px; }
            .slip-head span { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6ee7b7; }
            .slip-head h2 { margin: 4px 0 0; font-size: 18px; }
            .rows { padding: 8px 20px 16px; }
            .row { display: flex; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px dashed #e6edf4; }
            .row:last-child { border-bottom: 0; }
            .row .k { color: #6a8cad; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; }
            .row .v { font-weight: 700; font-size: 14px; text-align: right; word-break: break-all; }
            .creds { margin-top: 20px; border: 2px dashed #10b981; border-radius: 12px; padding: 18px 20px; background: #ecfdf5; }
            .creds h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.6px; color: #047857; }
            .cred { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 8px 0; }
            .cred .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #047857; }
            .cred .val { font-family: 'Consolas', monospace; font-size: 15px; font-weight: 700; color: #065f46; }
            .note { margin-top: 20px; font-size: 12px; color: #4a6e92; line-height: 1.7; }
            .note strong { color: #0e1f2f; }
            .foot { margin-top: 28px; text-align: center; font-size: 11px; color: #9bb3cc; border-top: 1px solid #e6edf4; padding-top: 16px; }
            @media print { body { padding: 16px; } .noprint { display: none; } }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="brand">
              <h1>Sai Prasad Driving School</h1>
              <p>Shop 23, Near SAIPRASAD ENTERPRISE, Kolhapur &mdash; +91 8600740507</p>
            </div>

            <div class="slip">
              <div class="slip-head">
                <span>Student Portal Credentials</span>
                <h2>${c.name}</h2>
              </div>
              <div class="rows">
                <div class="row"><span class="k">Student ID</span><span class="v">${c.studentId}</span></div>
                <div class="row"><span class="k">Name</span><span class="v">${c.name}</span></div>
                <div class="row"><span class="k">Mobile</span><span class="v">${c.mobile || '-'}</span></div>
              </div>
            </div>

            <div class="creds">
              <h3>Login Details &mdash; keep confidential</h3>
              <div class="cred"><span class="lbl">Username (Email)</span><span class="val">${c.email || '(not set)'}</span></div>
              <div class="cred"><span class="lbl">Password</span><span class="val">${printPassword}</span></div>
            </div>

            <div class="note">
              <strong>How to use:</strong> Go to the website &rarr; <strong>Student Login</strong>, enter the username and
              password above, and you can view your attendance record, lesson schedule and fee payment history.
              <br /><br />
              <strong>Security:</strong> Please change the password after first login. Do not share these details
              with anyone else.
            </div>

            <div class="foot">Issued by Sai Prasad Driving School &middot; ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-premium">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-accent-50 rounded-xl flex items-center justify-center">
              <KeyRound size={20} className="text-accent-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900 tracking-[-0.02em]">
                Portal Credentials
              </h2>
              <p className="text-[0.8125rem] text-navy-500">
                {data ? `${data.name} · ${data.studentId}` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-navy-400 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-[3px] border-accent-600"></div>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-accent-50 rounded-xl border border-accent-100">
                <UserRound size={18} className="text-accent-600 mt-0.5 shrink-0" />
                <p className="text-[0.8125rem] text-navy-700 leading-relaxed">
                  Set a username (email) and password for this student, then print the slip to hand over.
                  Students can change their own password after logging in.
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="label">Username (Email Address)</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field !pl-11"
                    placeholder="student@example.com"
                  />
                </div>
                <p className="text-[0.75rem] text-navy-500 mt-1.5">
                  A student without an email address cannot use the portal.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field !pl-11 !pr-20"
                    placeholder="Leave blank to auto-generate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-accent-600 hover:text-accent-800 transition-colors"
                    title="Use suggested password"
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>
                <p className="text-[0.75rem] text-navy-500 mt-1.5">
                  Suggested:{' '}
                  <span className="font-mono font-semibold text-navy-700">
                    {data?.suggestedPassword}
                  </span>{' '}
                  (auto-generated from the mobile number)
                </p>
              </div>

              {/* Saved credentials display */}
              {saved && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={17} className="text-green-600" />
                    <p className="text-[0.8125rem] font-semibold text-green-800">
                      Credentials saved &mdash; print or copy them for the student
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.75rem] text-green-700 font-semibold">Username</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.8125rem] font-bold text-green-900">
                          {saved.email || '(not set)'}
                        </span>
                        <button
                          onClick={() => copyValue(saved.email, 'Username')}
                          className="text-green-600 hover:text-green-800"
                          title="Copy"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.75rem] text-green-700 font-semibold">Password</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.8125rem] font-bold text-green-900">
                          {saved.portalPassword}
                        </span>
                        <button
                          onClick={() => copyValue(saved.portalPassword, 'Password')}
                          className="text-green-600 hover:text-green-800"
                          title="Copy"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Credentials'}
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!email && !saved}
                  className="btn-outline flex-1"
                  title={!email && !saved ? 'Set a username and save first' : undefined}
                >
                  <Printer size={16} />
                  Print Slip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
