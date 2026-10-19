import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, MapPin, Clock, Phone, Mail, Building } from 'lucide-react';
import apiClient from '../../api/client';

const settingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  timezone: z.string().optional(),
  googleMapsEmbedUrl: z.string().optional(),
  aboutUs: z.string().optional(),
  mission: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    apiClient.get('/settings').then((res) => {
      reset(res.data);
    }).catch(() => {});
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true);
    try {
      await apiClient.patch('/settings', data);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 tracking-[-0.02em]">Settings</h1>
        <p className="text-[0.8125rem] text-navy-500">Manage business information and configuration</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Building size={18} />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Business Name *</label>
              <input {...register('businessName')} className="input-field" />
              {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
            </div>
            <div>
              <label className="label">Timezone</label>
              <select {...register('timezone')} className="input-field">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">About Us</label>
            <textarea {...register('aboutUs')} className="input-field" rows={3} />
          </div>
          <div className="mt-4">
            <label className="label">Mission</label>
            <textarea {...register('mission')} className="input-field" rows={2} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Phone size={18} />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input {...register('whatsapp')} className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} className="input-field" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <MapPin size={18} />
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Street Address</label>
              <input {...register('address')} className="input-field" />
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('city')} className="input-field" />
            </div>
            <div>
              <label className="label">State</label>
              <input {...register('state')} className="input-field" />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input {...register('pincode')} className="input-field" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Google Maps Embed URL</label>
            <input {...register('googleMapsEmbedUrl')} className="input-field" placeholder="https://www.google.com/maps/embed?..." />
            <p className="text-xs text-navy-500 mt-1">Paste the iframe embed URL from Google Maps</p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Clock size={18} />
            Working Hours
          </h3>
          <p className="text-sm text-navy-500 mb-4">Default working hours are set to Mon-Sat 9:00 AM - 6:00 PM, Sunday closed. Contact the administrator to modify these settings.</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={18} className="mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
