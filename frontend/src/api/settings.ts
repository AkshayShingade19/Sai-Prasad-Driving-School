import apiClient from './client';

export interface BusinessSettings {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  timezone: string;
  workingHours: Record<string, { open: string; close: string; isOpen: boolean }>;
  googleMapsEmbedUrl: string;
  aboutUs: string;
  mission: string;
  testimonials: string[];
}

export async function getPublicSettings(): Promise<BusinessSettings> {
  const response = await apiClient.get('/settings/public');
  return response.data;
}
