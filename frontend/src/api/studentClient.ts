import apiClient from './client';

const STUDENT_TOKEN_KEY = 'student_token';

/**
 * Axios instance for the student portal.
 * Uses a separate localStorage key from the staff/admin token so the two
 * sessions never collide.
 */
const studentClient = apiClient.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

studentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STUDENT_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

studentClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STUDENT_TOKEN_KEY);
      localStorage.removeItem('student_user');
      if (!window.location.pathname.startsWith('/student/login')) {
        window.location.href = '/student/login';
      }
    }
    return Promise.reject(error);
  },
);

export default studentClient;
