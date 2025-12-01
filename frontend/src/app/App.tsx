import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { useGlobalErrorReporter } from '@/logging/useGlobalErrorReporter';
import { AppRouter } from './routes';

export default function App() {
  useGlobalErrorReporter();

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
