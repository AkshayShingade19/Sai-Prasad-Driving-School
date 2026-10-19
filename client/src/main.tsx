import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { StudentAuthProvider } from './contexts/StudentAuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StudentAuthProvider>
          <App />
          <Toaster position="top-right" richColors />
        </StudentAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
