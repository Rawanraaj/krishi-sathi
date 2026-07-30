import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-700)', fontWeight: 600 }}>Loading Krishi Sathi...</p>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
