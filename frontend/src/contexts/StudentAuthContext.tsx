import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export interface StudentUser {
  id: string;
  studentId: string;
  name: string;
  email: string;
  mobile: string;
}

interface StudentAuthContextType {
  student: StudentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const saved = localStorage.getItem('student_user');
    if (token && saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post('/student-portal/login', { email, password });
    const { accessToken, student: studentData } = response.data;
    localStorage.setItem('student_token', accessToken);
    localStorage.setItem('student_user', JSON.stringify(studentData));
    setStudent(studentData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    setStudent(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiClient.post('/student-portal/change-password', { currentPassword, newPassword });
  }, []);

  return (
    <StudentAuthContext.Provider value={{ student, loading, login, logout, changePassword }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
